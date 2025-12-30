-- Inizializzazione database UrbanWay
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabella strade (OSM data)
CREATE TABLE IF NOT EXISTS roads (
  id BIGSERIAL PRIMARY KEY,
  osm_id BIGINT UNIQUE,
  name VARCHAR(255),
  highway_type VARCHAR(50),
  width DECIMAL(5,2),
  max_speed INTEGER,
  is_accessible BOOLEAN DEFAULT true,
  geom GEOMETRY(LineString, 4326),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_roads_highway_type ON roads(highway_type);
CREATE INDEX idx_roads_is_accessible ON roads(is_accessible);
CREATE INDEX idx_roads_geom ON roads USING GIST(geom);

-- Tabella utenti (autenticazione)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance login
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Tabella sessioni/token
CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Tabella itinerari salvati
CREATE TABLE IF NOT EXISTS saved_routes (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  start_point GEOMETRY(Point, 4326),
  end_point GEOMETRY(Point, 4326),
  route_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_roads_updated_at BEFORE UPDATE ON roads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_routes_updated_at BEFORE UPDATE ON saved_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View per strade accessibili
CREATE OR REPLACE VIEW accessible_roads AS
SELECT 
  id,
  osm_id,
  name,
  highway_type,
  width,
  max_speed,
  geom
FROM roads
WHERE is_accessible = true
  AND highway_type NOT IN ('motorway', 'trunk', 'motorway_link', 'trunk_link')
  AND (width IS NULL OR width >= 2.5)
  AND (max_speed IS NULL OR max_speed <= 90);

GRANT SELECT ON accessible_roads TO urbanway_user;
GRANT USAGE ON SCHEMA public TO urbanway_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO urbanway_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO urbanway_user;
