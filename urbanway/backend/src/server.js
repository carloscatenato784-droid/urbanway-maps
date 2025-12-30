import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createAuthRoutes } from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Errore connessione DB:', err);
});

// Auth routes
const authRoutes = createAuthRoutes(pool);
app.use('/api', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test connessione database
app.get('/api/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      message: 'Database connesso',
      timestamp: result.rows[0].now 
    });
  } catch (err) {
    console.error('Errore DB:', err);
    res.status(500).json({ 
      status: 'error', 
      message: err.message 
    });
  }
});

// API: Get strade filtrate per bbox (bounding box)
app.get('/api/map/roads', async (req, res) => {
  const { north, south, east, west } = req.query;
  
  try {
    // Query strade accessibili da PostGIS
    const query = `
      SELECT 
        id,
        osm_id,
        name,
        highway_type,
        width,
        max_speed,
        ST_AsGeoJSON(geom) as geometry,
        is_accessible
      FROM roads
      WHERE ST_Intersects(
        geom,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
      AND is_accessible = true
      LIMIT 1000;
    `;
    
    const result = await pool.query(query, [west, south, east, north]);
    
    // Converti in GeoJSON
    const geojson = {
      type: 'FeatureCollection',
      features: result.rows.map(row => ({
        type: 'Feature',
        id: row.id,
        properties: {
          osm_id: row.osm_id,
          name: row.name || 'Strada senza nome',
          highway_type: row.highway_type,
          width: row.width,
          max_speed: row.max_speed,
          is_accessible: row.is_accessible
        },
        geometry: JSON.parse(row.geometry)
      }))
    };
    
    res.json(geojson);
  } catch (err) {
    console.error('Errore query strade:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Cerca indirizzo (geocoding inverso)
app.get('/api/map/search', async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query required' });
  }
  
  try {
    // Cerca strade per nome
    const query = `
      SELECT DISTINCT
        id,
        name,
        highway_type,
        ST_AsGeoJSON(ST_Centroid(geom)) as center
      FROM roads
      WHERE name ILIKE $1
      AND is_accessible = true
      LIMIT 10;
    `;
    
    const result = await pool.query(query, [`%${q}%`]);
    
    const results = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.highway_type,
      center: JSON.parse(row.center)
    }));
    
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Statistiche strade
app.get('/api/map/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_roads,
        SUM(CASE WHEN is_accessible THEN 1 ELSE 0 END) as accessible_roads,
        AVG(width) as avg_width,
        MAX(max_speed) as max_speed_limit
      FROM roads;
    `);
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Filtra strade per piccoli veicoli
app.post('/api/map/filter-roads', async (req, res) => {
  const { roads } = req.body;
  
  // Criteri filtro: esclude strade non percorribili
  const EXCLUDED_HIGHWAY_TYPES = ['motorway', 'trunk', 'motorway_link', 'trunk_link'];
  const MIN_WIDTH = 2.5; // metri
  const MAX_SPEED_LIMIT = 90; // km/h
  
  const filteredRoads = roads.filter(road => {
    const type = road.tags?.highway;
    const width = parseFloat(road.tags?.width) || Infinity;
    const maxSpeed = parseInt(road.tags?.maxspeed) || 50;
    
    const isExcluded = EXCLUDED_HIGHWAY_TYPES.includes(type);
    const isTooNarrow = width < MIN_WIDTH;
    const isTooFast = maxSpeed > MAX_SPEED_LIMIT;
    
    return !isExcluded && !isTooNarrow && !isTooFast;
  });
  
  res.json({ 
    total: roads.length,
    filtered: filteredRoads.length,
    roads: filteredRoads 
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    error: 'Errore interno server',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
