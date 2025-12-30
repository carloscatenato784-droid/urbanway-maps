import React from 'react'
import './Legend.css'

function Legend() {
  return (
    <div className="legend">
      <div className="legend-title">Legenda Strade</div>
      
      <div className="legend-item">
        <div className="legend-color allowed"></div>
        <span>Strade percorribili</span>
      </div>
      
      <div className="legend-item">
        <div className="legend-color excluded"></div>
        <span>Strade escluse</span>
      </div>

      <div className="legend-info">
        <strong>Criteri:</strong>
        <ul>
          <li>❌ Autostrade e superstrade</li>
          <li>❌ Larghezza &lt; 2.5m</li>
          <li>❌ Velocità max &gt; 90 km/h</li>
        </ul>
      </div>
    </div>
  )
}

export default Legend
