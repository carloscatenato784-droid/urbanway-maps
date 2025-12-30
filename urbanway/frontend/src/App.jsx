import React, { useState, useEffect, useContext } from 'react'
import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import MapControls from './components/MapControls'
import Legend from './components/Legend'
import RoadsLayer from './components/RoadsLayer'
import UserMenu from './components/UserMenu'
import { ThemeContext } from './context/ThemeContext'
import { AuthContext } from './context/AuthContext'
import './App.css'

// Fix icone di default di Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function App() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const [center, setCenter] = useState([41.9028, 12.4964]) // Roma
  const [zoom, setZoom] = useState(13)
  const [mapRef, setMapRef] = useState(null)
  const [bounds, setBounds] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    // Check connessione backend
    const checkBackend = async () => {
      try {
        const response = await axios.get('/api/health')
        setStatus('ready')
      } catch (err) {
        setErrorMessage('Backend non disponibile')
        setStatus('error')
        console.error('Errore connessione backend:', err)
      }
    }

    checkBackend()
  }, [])

  const handleLocationFound = (latlng) => {
    setCenter([latlng.lat, latlng.lng])
    setZoom(15)
  }

  // Aggiorna bounds quando la mappa si muove
  const handleMapMove = () => {
    if (mapRef) {
      setBounds(mapRef.getBounds())
    }
  }

  return (
    <div className="App">
      <div className="header">
        <div className="header-content">
          <h1>🛵 UrbanWay Maps</h1>
          <p>Navigazione per auto, moto e 50cc</p>
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} title="Cambia tema">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <UserMenu />
        </div>
      </div>

      {status === 'error' && (
        <div className="error-banner">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="map-container">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ width: '100%', height: '100%' }}
          whenCreated={setMapRef}
          onMoveEnd={handleMapMove}
          onZoomEnd={handleMapMove}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
          
          {/* Layer strade filtrate */}
          <RoadsLayer map={mapRef} bounds={bounds} />
          
          <Marker position={center}>
            <Popup>📍 Posizione attuale</Popup>
          </Marker>
        </MapContainer>
      </div>

      <MapControls 
        mapRef={mapRef} 
        onLocationFound={handleLocationFound}
        status={status}
      />
      
      <Legend />
    </div>
  )
}

export default App
