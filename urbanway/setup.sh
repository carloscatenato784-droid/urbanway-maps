#!/bin/bash

# Script di setup per UrbanWay - Development
# Esecuzione: bash setup.sh

set -e

echo "🛵 Benvenuto in UrbanWay Setup!"
echo "================================"

# Verifica Node.js
echo "✓ Verifica Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non trovato. Installa da https://nodejs.org/"
    exit 1
fi
echo "  Node.js: $(node -v)"
echo "  npm: $(npm -v)"

# Verifica Docker (optional)
if command -v docker &> /dev/null; then
    echo "✓ Docker trovato: $(docker -v)"
    if command -v docker-compose &> /dev/null; then
        echo "✓ Docker Compose trovato: $(docker-compose -v)"
        USE_DOCKER=true
    fi
else
    echo "⚠️  Docker non trovato - usa le istruzioni di setup locale"
    USE_DOCKER=false
fi

echo ""
echo "📦 Installazione dipendenze..."

# Backend
echo "  → Backend..."
cd backend
npm install
cd ..

# Frontend
echo "  → Frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup completato!"
echo ""
echo "🚀 Per avviare l'app:"
echo ""

if [ "$USE_DOCKER" = true ]; then
    echo "  Con Docker (consigliato):"
    echo "  $ docker-compose up --build"
    echo ""
    echo "  Accedi su: http://localhost:3000"
    echo ""
fi

echo "  Sviluppo locale:"
echo "  $ npm run dev"
echo ""
echo "📖 Per maggiori info: cat DEPLOYMENT.md"
