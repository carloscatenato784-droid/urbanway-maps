import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export function createAuthRoutes(pool) {
  // Middleware per verificare token
  const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'Token mancante' })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.userId = decoded.userId
      next()
    } catch (err) {
      return res.status(401).json({ error: 'Token non valido' })
    }
  }

  // SIGNUP - Registrazione
  router.post('/auth/signup', async (req, res) => {
    const { username, email, password, fullName } = req.body

    // Validazione
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email e password obbligatori' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimo 6 caratteri' })
    }

    try {
      // Controlla se utente esiste già
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      )

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'Username o email già in uso' })
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)

      // Crea utente
      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, full_name)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username, email, full_name, created_at`,
        [username, email, passwordHash, fullName || username]
      )

      const user = result.rows[0]

      // Crea token JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      res.status(201).json({
        message: 'Registrazione avvenuta con successo',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name
        },
        token
      })
    } catch (err) {
      console.error('Errore signup:', err)
      res.status(500).json({ error: 'Errore registrazione' })
    }
  })

  // LOGIN
  router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password obbligatori' })
    }

    try {
      // Trova utente
      const result = await pool.query(
        'SELECT id, username, email, password_hash, full_name FROM users WHERE username = $1 AND is_active = true',
        [username]
      )

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Username o password errata' })
      }

      const user = result.rows[0]

      // Verifica password
      const passwordMatch = await bcrypt.compare(password, user.password_hash)

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Username o password errata' })
      }

      // Aggiorna last_login
      await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      )

      // Crea token JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      res.json({
        message: 'Login avvenuto con successo',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name
        },
        token
      })
    } catch (err) {
      console.error('Errore login:', err)
      res.status(500).json({ error: 'Errore login' })
    }
  })

  // VERIFY TOKEN - Verifica se token è valido
  router.get('/auth/verify', verifyToken, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, username, email, full_name, avatar_url FROM users WHERE id = $1',
        [req.userId]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Utente non trovato' })
      }

      res.json({
        user: result.rows[0]
      })
    } catch (err) {
      res.status(500).json({ error: 'Errore verifica token' })
    }
  })

  // GET PROFILE - Profilo utente
  router.get('/auth/profile', verifyToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, username, email, full_name, avatar_url, created_at, last_login 
         FROM users WHERE id = $1`,
        [req.userId]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Utente non trovato' })
      }

      res.json({ user: result.rows[0] })
    } catch (err) {
      res.status(500).json({ error: 'Errore lettura profilo' })
    }
  })

  // UPDATE PROFILE
  router.put('/auth/profile', verifyToken, async (req, res) => {
    const { fullName, avatarUrl } = req.body

    try {
      const result = await pool.query(
        `UPDATE users 
         SET full_name = COALESCE($1, full_name),
             avatar_url = COALESCE($2, avatar_url)
         WHERE id = $3
         RETURNING id, username, email, full_name, avatar_url`,
        [fullName, avatarUrl, req.userId]
      )

      res.json({ user: result.rows[0] })
    } catch (err) {
      res.status(500).json({ error: 'Errore aggiornamento profilo' })
    }
  })

  // LOGOUT (opzionale - cancella sessione)
  router.post('/auth/logout', verifyToken, async (req, res) => {
    try {
      // Nel frontend basta cancellare il token
      res.json({ message: 'Logout avvenuto con successo' })
    } catch (err) {
      res.status(500).json({ error: 'Errore logout' })
    }
  })

  // CHANGE PASSWORD
  router.post('/auth/change-password', verifyToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Password obbligatoria' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nuova password minimo 6 caratteri' })
    }

    try {
      // Prendi password hash attuale
      const result = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [req.userId]
      )

      const user = result.rows[0]

      // Verifica password attuale
      const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash)
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Password attuale errata' })
      }

      // Hash nuova password
      const newPasswordHash = await bcrypt.hash(newPassword, 10)

      // Aggiorna
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, req.userId]
      )

      res.json({ message: 'Password modificata con successo' })
    } catch (err) {
      console.error('Errore change password:', err)
      res.status(500).json({ error: 'Errore modifica password' })
    }
  })

  return router
}
