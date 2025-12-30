import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

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

// API: Get mappa dati (placeholder)
app.get('/api/map/bounds', async (req, res) => {
  const { north, south, east, west } = req.query;
  
  try {
    // TODO: Query PostGIS per ottenere strade filtrate
    res.json({
      bounds: { north, south, east, west },
      roads: [],
      message: 'Endpoint implementato in fase successiva'
    });
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
