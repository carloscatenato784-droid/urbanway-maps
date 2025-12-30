import React, { useEffect, useState } from 'react'
import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import './RoadsLayer.css'

function RoadsLayer({ map, bounds }) {
  const [roads, setRoads] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  // Carica strade quando cambia la mappa
  useEffect(() => {
    if (!map || !bounds) return

    const fetchRoads = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { _northEast: ne, _southWest: sw } = map.getBounds()
        
        const response = await axios.get('/api/map/roads', {
          params: {
            north: ne.lat,
            south: sw.lat,
            east: ne.lng,
            west: sw.lng
          }
        })
        
        setRoads(response.data)
      } catch (err) {
        console.error('Errore caricamento strade:', err)
        setError('Errore nel caricamento delle strade')
      } finally {
        setLoading(false)
      }
    }

    // Carica strade con delay (evita troppe richieste)
    const timer = setTimeout(fetchRoads, 500)
    return () => clearTimeout(timer)
  }, [map, bounds])

  // Carica statistiche
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/map/stats')
        setStats(response.data)
      } catch (err) {
        console.error('Errore statistiche:', err)
      }
    }

    fetchStats()
  }, [])

  // Stile per le strade
  const onEachFeature = (feature, layer) => {
    const props = feature.properties
    let color = '#2D9757' // Verde = percorribile
    
    if (!props.is_accessible) {
      color = '#FF6B6B' // Rosso = esclusa
    }

    layer.setStyle({
      color: color,
      weight: 3,
      opacity: 0.7,
      dashArray: props.is_accessible ? '' : '5, 5'
    })

    // Popup con info strada
    const popup = `
      <div class="road-popup">
        <strong>${props.name || 'Strada senza nome'}</strong>
        <br/>
        <small>Tipo: ${props.highway_type}</small>
        <br/>
        ${props.width ? `<small>Larghezza: ${props.width}m</small><br/>` : ''}
        ${props.max_speed ? `<small>Velocità max: ${props.max_speed} km/h</small><br/>` : ''}
        <small style="color: ${props.is_accessible ? '#2D9757' : '#FF6B6B'}">
          ${props.is_accessible ? '✅ Percorribile' : '❌ Non percorribile'}
        </small>
      </div>
    `
    
    layer.bindPopup(popup)
  }

  return (
    <>
      {roads && roads.features.length > 0 && (
        <GeoJSON 
          data={roads}
          onEachFeature={onEachFeature}
        />
      )}
      
      {stats && (
        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-label">Strade totali:</span>
            <span className="stat-value">{stats.total_roads}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Percorribili:</span>
            <span className="stat-value" style={{ color: '#2D9757' }}>
              {stats.accessible_roads}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Larghezza media:</span>
            <span className="stat-value">
              {stats.avg_width ? stats.avg_width.toFixed(1) : '0'}m
            </span>
          </div>
        </div>
      )}

      {loading && <div className="loading-indicator">⏳ Caricamento strade...</div>}
      {error && <div className="error-indicator">⚠️ {error}</div>}
    </>
  )
}

export default RoadsLayer
