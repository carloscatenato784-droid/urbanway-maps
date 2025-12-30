# 🛵 UrbanWay Maps

Una webapp simile a Google Maps che visualizza solo le strade percorribili da automobili, moto e scooter 50cc.

## 🎯 Caratteristiche

- 🗺️ Mappa interattiva basata su OpenStreetMap (Leaflet)
- 🚗 Filtro intelligente per escludere strade non percorribili da piccoli veicoli
- 📍 Geolocalizzazione e ricerca indirizzi
- 🎨 Design minimalista moderno con tema italiano
- 🐳 Containerizzato con Docker per deployment facile
- ⚡ Stack moderno: React + Node.js + PostgreSQL + PostGIS
- 📊 Importazione dati da OpenStreetMap
- 🟢 Strade percorribili in verde
- 🔴 Strade escluse in rosso tratteggiato

## 🚀 Quick Start

### Con Docker (consigliato)

```bash
docker-compose up --build
```

**Importa dati OpenStreetMap:**
```bash
docker-compose exec backend node import-osm-data.js 41.9028 12.4964 10
```

L'app sarà disponibile su `http://localhost:3002`

### Sviluppo locale

```bash
# Installa dipendenze
npm install

# Avvia dev server
npm run dev
```

## 📊 Dati e Filtri

L'app **esclude automaticamente**:
- ❌ Autostrade e superstrade (motorway, trunk)
- ❌ Strade larghezza < 2.5m
- ❌ Strade con limite velocità > 90 km/h
- ❌ Strade private (access=private)

**Incluse**: Strade residenziali, locali, ciclovie, sentieri percorribili

## 🔄 Importare Dati da OpenStreetMap

```bash
# Roma (default)
docker-compose exec backend node import-osm-data.js

# Altra città - node import-osm-data.js [lat] [lon] [radius_km]
docker-compose exec backend node import-osm-data.js 45.4642 9.1900 10  # Milano
docker-compose exec backend node import-osm-data.js 48.8566 2.3522 10  # Parigi
```

## 🏗️ Struttura

```
urbanway-maps/
├── frontend/               React + Leaflet + Vite
│   └── src/components/
│       ├── RoadsLayer.jsx       ← Visualizzazione strade
│       ├── MapControls.jsx
│       └── Legend.jsx
├── backend/                Express.js API
│   ├── src/server.js            ← API endpoints
│   └── import-osm-data.js       ← Script importazione
├── docker/                 Dockerfile + config
└── docker-compose.yml
```

## 🔌 API Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/map/roads` | GET | Strade per bbox (north, south, east, west) |
| `/api/map/search` | GET | Cerca strada per nome (q=...) |
| `/api/map/stats` | GET | Statistiche strade (totali, percorribili, ecc.) |

## 🎨 Palette Colori

- **Verde Primario**: `#2D9757` (strade percorribili)
- **Blu Secondario**: `#1E88E5` (UI)
- **Rosso Accento**: `#FF6B6B` (strade escluse)
- **Grigio Neutro**: `#F5F5F5` (sfondo)

## 📚 Documentazione Completa

- **[COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)** - Guida con istruzioni dettagliate
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy su server
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Panoramica progetto

## �️ Requisiti

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ con PostGIS (incluso in docker-compose)
- ~500MB spazio per dati OSM (dipende da area geografica)

## 📦 Stack Tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18 + Leaflet + Vite |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + PostGIS |
| Maps | OpenStreetMap + Overpass API |
| Container | Docker + Docker Compose |

## 🚢 Deployment

Per deployare su server VPS con Fedora:

```bash
# 1. SSH al server
ssh user@vps-ip

# 2. Clone progetto
cd /opt && git clone https://github.com/username/urbanway-maps.git
cd urbanway-maps

# 3. Importa dati
docker-compose exec backend node import-osm-data.js

# 4. L'app gira su http://vps-ip:3002
```

Per dominio custom + SSL, vedi [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📝 Licenza

MIT - Vedi [LICENSE](./LICENSE)

## 💡 Roadmap

- [x] Mappa base con Leaflet
- [x] Backend Express con API
- [x] Database schema PostgreSQL/PostGIS
- [x] Importazione dati OpenStreetMap
- [x] Visualizzazione strade filtrate
- [ ] Ricerca avanzata e routing
- [ ] Autenticazione utenti
- [ ] Salvataggio percorsi preferiti
- [ ] Mobile app (React Native)
- [ ] Analytics e monitoraggio

## 🤝 Contribuisci

Le pull request sono benvenute! Per cambiamenti importanti, apri prima un issue.

## 📞 Supporto

Per problemi o domande:
1. Controlla [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)
2. Apri un issue su GitHub
3. Verifica i log: `docker-compose logs`

---

**Creato**: 30 dicembre 2025  
**Versione**: 1.0.0  
**Stato**: ✅ Completo e pronto per deployment
