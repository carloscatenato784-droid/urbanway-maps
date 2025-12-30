# 🚀 Guida Completamento UrbanWay Maps

Congratulazioni! Ora hai tutto per far funzionare il sito **completo con mappe vere**! 🗺️

## 📋 Cosa è stato aggiunto

### Backend
- ✅ **`/api/map/roads`** - Endpoint per ottenere strade filtrate per bbox
- ✅ **`/api/map/search`** - Ricerca indirizzi/strade per nome
- ✅ **`/api/map/stats`** - Statistiche strade nel database
- ✅ **`import-osm-data.js`** - Script per importare dati OpenStreetMap

### Frontend
- ✅ **`RoadsLayer.jsx`** - Componente visualizzazione strade
- ✅ Strade in **verde** (percorribili) e **rosso tratteggiato** (escluse)
- ✅ Popup con dettagli strada (tipo, larghezza, velocità)
- ✅ Panel statistiche live (numero strade, media larghezza)
- ✅ Caricamento automatico strade al movimento mappa

---

## 🚀 **Quick Start**

### Step 1: Installa dipendenze (backend)

```bash
cd backend
npm install axios
```

### Step 2: Importa dati OpenStreetMap

**Opzione A: Roma (default)**
```bash
node import-osm-data.js
```

**Opzione B: Altra città**
```bash
# node import-osm-data.js [lat] [lon] [radius_km]
node import-osm-data.js 45.4642 9.1900 10  # Milano
node import-osm-data.js 48.8566 2.3522 10  # Parigi
```

**Opzione C: Via Docker**
```bash
docker-compose exec backend node import-osm-data.js 41.9028 12.4964 10
```

### Step 3: Riavvia l'app

```bash
docker-compose restart backend frontend
```

Ora apri **http://localhost:3002** 🎉

---

## 🗺️ **Come funziona**

1. **Scarichiamo strade** da Overpass API (OpenStreetMap)
2. **Importiamo nel database** con i filtri di UrbanWay
3. **Frontend richiede strade** quando la mappa si muove
4. **Mostriamo strade colorate**: 
   - 🟢 Verde = percorribili
   - 🔴 Rosso tratteggiato = escluse (autostrade, troppo strette, ecc.)

---

## 📊 **Filtri Applicati Automaticamente**

```javascript
❌ Escluse:
- Autostrade (motorway, trunk)
- Strade private (access=private)
- Larghezza < 2.5m (da tag OSM)

✅ Incluse:
- Strade residenziali
- Strade locali
- Strade di servizio
- Piste ciclabili (se percorribili)
- Tutto con limite ≤ 90 km/h
```

---

## 📝 **API Disponibili**

### Get strade per bbox
```bash
GET /api/map/roads?north=41.95&south=41.85&east=12.55&west=12.35
```

Risposta: GeoJSON FeatureCollection con strade

### Cerca indirizzo
```bash
GET /api/map/search?q=via%20roma
```

### Statistiche
```bash
GET /api/map/stats
```

---

## ⚡ **Performance Notes**

- Query limitata a **1000 strade per richiesta** (evita sovraccarico)
- **Debounce di 500ms** sul movimento mappa (evita troppe richieste)
- **Indici PostGIS** per ricerche veloci
- Cache del browser per tile (1 anno)

---

## 🐛 **Troubleshooting**

### "Errore connessione Overpass API"
- Overpass potrebbe essere saturata
- Aspetta 5-10 minuti e riprova
- O usa un bounding box più piccolo

### "Nessuna strada trovata"
- Aumenta il raggio: `node import-osm-data.js 41.9 12.4 20`
- Controlla coordinate lat/lon

### "Strade non visibili sulla mappa"
```bash
# Verifica dati nel database
docker-compose exec postgres psql -U urbanway_user -d urbanway_db
SELECT COUNT(*) FROM roads WHERE is_accessible = true;
```

---

## 🔄 **Aggiornare dati OSM**

```bash
# Ogni volta che vuoi aggiornare strade per una città
node import-osm-data.js [lat] [lon] [radius]

# Pulire vecchi dati (se necessario)
docker-compose exec postgres psql -U urbanway_user -d urbanway_db
DELETE FROM roads;
```

---

## 🎨 **Personalizzare Colori**

Modifica in `frontend/src/components/RoadsLayer.jsx`:

```javascript
// Cambio colore strade percorribili
if (props.is_accessible) {
  color = '#2D9757'  // Cambia qui
}
```

---

## 📱 **Prossimi Passi Opzionali**

- [ ] **Routing**: Aggiungi OSRM per calcolare percorsi
- [ ] **Ricerca avanzata**: Filtri per tipo strada, velocità, larghezza
- [ ] **Salvataggio percorsi**: Autenticazione + DB
- [ ] **Mobile app**: React Native o PWA
- [ ] **Alternativa strade**: Suggerisci percorsi alternativi

---

## 💡 **Tips**

1. **Import dati prima di andare live** sul server
2. **Monitora performance** con Chrome DevTools
3. **Testa con diverse zone geografiche**
4. **Aggiorna dati mensili** da Overpass

---

**Congratulazioni! 🎉 UrbanWay Maps è ora completo e pronto per l'uso!**

Per domande o miglioramenti, apri un issue su GitHub.

---

**Ultimo aggiornamento**: 30 dicembre 2025
