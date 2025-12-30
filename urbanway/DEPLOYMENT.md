# 📋 UrbanWay Maps - Guida Setup e Deployment

## 🚀 Quick Start con Docker

### Prerequisiti
- Docker (v20+)
- Docker Compose (v2+)

### Avvio

```bash
cd /Users/biagio2828-macbook/urbanway
docker-compose up --build
```

L'app sarà disponibile su: **http://localhost:3000**
API disponibile su: **http://localhost:5000/api**

### Logs

```bash
# Tutti i servizi
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo database
docker-compose logs -f postgres
```

### Stop

```bash
docker-compose down
```

## 🛠️ Sviluppo Locale (senza Docker)

### Prerequisiti
- Node.js 18+
- PostgreSQL 14+ (con PostGIS)

### Setup Database

```bash
psql -U postgres -c "CREATE DATABASE urbanway_db;"
psql -d urbanway_db -f docker/init-db.sql
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Server avviato su `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App avviata su `http://localhost:3000`

## 📦 Struttura Cartelle

```
urbanway/
├── frontend/                 # React + Leaflet
│   ├── src/
│   │   ├── components/      # Componenti React
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                  # Express API
│   ├── src/
│   │   └── server.js        # Server principale
│   └── package.json
│
├── docker/                   # Configurazioni Docker
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   ├── nginx.conf
│   └── init-db.sql
│
├── docker-compose.yml       # Orchestrazione servizi
└── README.md
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```
Verifica lo stato del server.

### Database Check
```
GET /api/db-check
```
Verifica connessione al database.

### Filter Roads (WIP)
```
POST /api/map/filter-roads
Body: { roads: [...] }
```
Filtra strade per piccoli veicoli.

## 🗄️ Database Schema

### Tabella `roads`
- `id` - Primary key
- `osm_id` - OpenStreetMap ID
- `name` - Nome strada
- `highway_type` - Tipo di strada (motorway, residential, ecc.)
- `width` - Larghezza in metri
- `max_speed` - Limite velocità
- `is_accessible` - Accessibile per piccoli veicoli
- `geom` - Geometry (PostGIS LineString)

### View `accessible_roads`
Strade filtrate automaticamente per piccoli veicoli.

## 🐳 Comandi Docker Utili

```bash
# Riavvia servizio
docker-compose restart backend

# Rebuild immagine
docker-compose build --no-cache frontend

# Accedi a postgres
docker-compose exec postgres psql -U urbanway_user -d urbanway_db

# Backup database
docker-compose exec postgres pg_dump -U urbanway_user urbanway_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U urbanway_user urbanway_db < backup.sql
```

## 🌐 Deployment Produzione

### Su Server VPS

1. **Clone repo**
   ```bash
   git clone <your-repo> /opt/urbanway
   cd /opt/urbanway
   ```

2. **Setup environment**
   ```bash
   cp backend/.env.example backend/.env
   # Modifica backend/.env con credenziali sicure
   ```

3. **Avvia con systemd** (opzionale)
   Crea `/etc/systemd/system/urbanway.service`:
   ```ini
   [Unit]
   Description=UrbanWay Web App
   After=network.target

   [Service]
   Type=simple
   WorkingDirectory=/opt/urbanway
   ExecStart=/usr/bin/docker-compose up
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

4. **Start**
   ```bash
   sudo systemctl start urbanway
   sudo systemctl enable urbanway
   ```

5. **Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name urbanway.example.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 🔐 Considerazioni Sicurezza

- [ ] Usare variabili d'ambiente per credenziali
- [ ] Abilitare HTTPS con Let's Encrypt
- [ ] Rate limiting su API
- [ ] CORS configurato correttamente
- [ ] SQL injection protection (ORM o prepared statements)
- [ ] Input validation su tutti gli endpoint

## 📊 Monitoraggio

Aggiungi container per monitoraggio (optional):
- **Prometheus** per metriche
- **Grafana** per visualizzazione
- **ELK Stack** per logs

## 🐛 Troubleshooting

### Backend non connette al DB
```bash
docker-compose logs postgres
# Verifica che postgres sia healthy
docker-compose ps
```

### Frontend non carica API
- Verifica che backend sia running: `docker-compose ps`
- Controlla logs: `docker-compose logs backend`
- Verifica proxy in `docker/nginx.conf`

### Porta già in uso
```bash
# Cambia in docker-compose.yml
# Esempio: porta 8000 invece di 3000
ports:
  - "8000:3000"
```

## 📞 Support

Per domande o problemi, apri un issue su GitHub.

---

**Ultimo aggiornamento:** 30 dicembre 2025
