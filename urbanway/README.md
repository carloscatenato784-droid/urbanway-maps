# 🛵 UrbanWay Maps

Una webapp simile a Google Maps che visualizza solo le strade percorribili da automobili, moto e scooter 50cc.

## 🎯 Caratteristiche

- 🗺️ Mappa interattiva basata su OpenStreetMap (Leaflet)
- 🚗 Filtro intelligente per escludere strade non percorribili da piccoli veicoli
- 📍 Geolocalizzazione e ricerca indirizzi
- 🎨 Design minimalista moderno con tema italiano
- 🐳 Containerizzato con Docker per deployment facile
- ⚡ Stack moderno: React + Node.js + PostgreSQL + PostGIS

## 🏗️ Struttura del progetto

```
urbanway/
├── frontend/          # App React con Leaflet
├── backend/           # Server Express + API
├── docker/            # Dockerfile e configurazioni
├── docker-compose.yml # Orchestrazione servizi
└── README.md
```

## 🚀 Quick Start

### Con Docker (consigliato)

```bash
docker-compose up --build
```

L'app sarà disponibile su `http://localhost:3000`

### Sviluppo locale

```bash
# Installa dipendenze
npm install

# Avvia dev server
npm run dev
```

## 🔧 Requisiti

- Node.js 18+
- Docker & Docker Compose (per deployment)
- PostgreSQL 14+ (incluso in docker-compose)

## 📦 Stack Tecnologico

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React 18 + Vite |
| Mappa | Leaflet + OpenStreetMap |
| Backend | Express.js |
| Database | PostgreSQL + PostGIS |
| Containerizzazione | Docker Compose |

## 🎨 Palette Colori

- **Verde Primario**: `#2D9757` (sostenibilità)
- **Blu Secondario**: `#1E88E5` (affidabilità)
- **Grigio Neutro**: `#F5F5F5` (sfondo)
- **Accenti**: `#FF6B6B` (avvisi/strade escluse)

## 📝 Licenza

MIT
