import React, { useState } from 'react'
import './MapControls.css'

function MapControls({ mapRef, onLocationFound, status }) {
  const [showSearch, setShowSearch] = useState(false)

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          onLocationFound({ lat: latitude, lng: longitude })
        },
        (error) => {
          console.error('Errore geolocalizzazione:', error)
          alert('Impossibile accedere alla tua posizione')
        }
      )
    }
  }

  return (
    <div className="map-controls">
      <div className="controls-group">
        <button 
          className="control-btn locate-btn"
          onClick={handleGeolocation}
          title="Vai alla mia posizione"
          disabled={status !== 'ready'}
        >
          📍
        </button>
        
        <button 
          className="control-btn search-btn"
          onClick={() => setShowSearch(!showSearch)}
          title="Cerca indirizzo"
        >
          🔍
        </button>

        <button 
          className="control-btn filter-btn"
          title="Filtri strade"
        >
          ⚙️
        </button>
      </div>

      {showSearch && (
        <div className="search-panel">
          <input 
            type="text" 
            placeholder="Cerca indirizzo o luogo..." 
            className="search-input"
          />
          <button className="search-submit">Cerca</button>
        </div>
      )}

      <div className="status-indicator">
        {status === 'ready' && <span className="status-dot ready"></span>}
        {status === 'loading' && <span className="status-dot loading"></span>}
        {status === 'error' && <span className="status-dot error"></span>}
        <span className="status-text">{status}</span>
      </div>
    </div>
  )
}

export default MapControls
