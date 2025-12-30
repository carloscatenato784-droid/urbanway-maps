#!/usr/bin/env node

/**
 * Script per importare dati OpenStreetMap in UrbanWay Maps
 * 
 * Uso: node import-osm-data.js [lat] [lon] [radius_km]
 * Esempio: node import-osm-data.js 41.9028 12.4964 10
 * 
 * Questo scarica strade da Overpass API e le importa nel database
 */

import axios from 'axios'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Parametri
const lat = parseFloat(process.argv[2]) || 41.9028 // Roma
const lon = parseFloat(process.argv[3]) || 12.4964
const radiusKm = parseFloat(process.argv[4]) || 5

console.log(`🗺️  Importazione dati OSM`)
console.log(`📍 Posizione: ${lat}, ${lon}`)
console.log(`📏 Raggio: ${radiusKm}km\n`)

// Query Overpass API per strade
async function fetchRoadsFromOSM() {
  const radius = radiusKm * 1000 // Converti a metri
  
  // Query Overpass: prende tutte le strade
  const overpassQuery = `
    [bbox:${lat - (radiusKm / 111)},${lon - (radiusKm / 111)},${lat + (radiusKm / 111)},${lon + (radiusKm / 111)}];
    (
      way["highway"~"motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street|pedestrian|cycleway|track|path|footway"];
    );
    out geom;
  `

  try {
    console.log('⏳ Scaricamento dati da Overpass API...')
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      overpassQuery,
      { timeout: 60000 }
    )
    
    return response.data.elements || []
  } catch (err) {
    console.error('❌ Errore Overpass API:', err.message)
    return []
  }
}

// Determina se strada è percorribile da piccoli veicoli
function isAccessible(tags) {
  const EXCLUDED_TYPES = ['motorway', 'trunk', 'motorway_link', 'trunk_link']
  const highway = tags.highway || ''
  
  if (EXCLUDED_TYPES.includes(highway)) return false
  if (tags.access === 'private' || tags.access === 'no') return false
  if (tags.oneway === 'yes' && tags['oneway:bicycle'] !== 'no') return true
  
  return true
}

// Converti coordinate OSM a GeoJSON LineString
function coordsToLineString(coords) {
  return {
    type: 'LineString',
    coordinates: coords.map(c => [c.lon, c.lat])
  }
}

// Importa strade nel database
async function importRoads(ways) {
  let imported = 0
  let skipped = 0
  
  for (const way of ways) {
    if (way.type !== 'way' || !way.tags || !way.tags.highway) {
      skipped++
      continue
    }

    const tags = way.tags
    const coords = way.geometry || []
    
    if (coords.length < 2) {
      skipped++
      continue
    }

    const geometry = coordsToLineString(coords)
    const isAccessibleRoad = isAccessible(tags)
    
    // Extract max speed (parse values like "50", "50 mph", etc.)
    let maxSpeed = null
    if (tags.maxspeed) {
      const match = tags.maxspeed.match(/(\d+)/)
      if (match) maxSpeed = parseInt(match[1])
    }
    
    try {
      const query = `
        INSERT INTO roads (osm_id, name, highway_type, width, max_speed, is_accessible, geom)
        VALUES ($1, $2, $3, $4, $5, $6, ST_GeomFromGeoJSON($7))
        ON CONFLICT (osm_id) DO UPDATE SET
          name = EXCLUDED.name,
          highway_type = EXCLUDED.highway_type,
          width = EXCLUDED.width,
          max_speed = EXCLUDED.max_speed,
          is_accessible = EXCLUDED.is_accessible,
          updated_at = NOW()
      `
      
      await pool.query(query, [
        way.id,
        tags.name || null,
        tags.highway,
        parseFloat(tags.width) || null,
        maxSpeed,
        isAccessibleRoad,
        JSON.stringify(geometry)
      ])
      
      imported++
    } catch (err) {
      console.error(`Errore importazione way ${way.id}:`, err.message)
      skipped++
    }
  }
  
  return { imported, skipped }
}

// Main
async function main() {
  try {
    // Test connessione DB
    await pool.query('SELECT NOW()')
    console.log('✅ Connessione database OK\n')
    
    // Scarica dati
    const ways = await fetchRoadsFromOSM()
    console.log(`✅ Scaricate ${ways.length} strade da OSM\n`)
    
    if (ways.length === 0) {
      console.log('⚠️  Nessuna strada trovata per questa area')
      process.exit(0)
    }
    
    // Importa
    console.log('⏳ Importazione nel database...')
    const { imported, skipped } = await importRoads(ways)
    
    console.log(`\n✅ Importazione completata!`)
    console.log(`   📍 Importate: ${imported} strade`)
    console.log(`   ⏭️  Saltate: ${skipped} strade`)
    
    // Statistiche
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_accessible THEN 1 ELSE 0 END) as accessible
      FROM roads
    `)
    
    const { total, accessible } = statsResult.rows[0]
    console.log(`\n📊 Database totale:`)
    console.log(`   📍 Strade totali: ${total}`)
    console.log(`   ✅ Percorribili: ${accessible}`)
    console.log(`   ❌ Escluse: ${total - accessible}`)
    
  } catch (err) {
    console.error('❌ Errore:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
