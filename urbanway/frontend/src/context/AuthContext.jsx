import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carica token e utente da localStorage al mount
  useEffect(() => {
    const savedToken = localStorage.getItem('urbanway-token')
    if (savedToken) {
      setToken(savedToken)
      verifyToken(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  // Verifica validità token
  const verifyToken = async (t) => {
    try {
      const response = await axios.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${t}` }
      })
      setUser(response.data.user)
      setToken(t)
    } catch (err) {
      localStorage.removeItem('urbanway-token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Signup
  const signup = async (username, email, password, fullName) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post('/api/auth/signup', {
        username,
        email,
        password,
        fullName
      })
      const { token: newToken, user: newUser } = response.data
      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('urbanway-token', newToken)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || 'Errore registrazione'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  // Login
  const login = async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      })
      const { token: newToken, user: newUser } = response.data
      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('urbanway-token', newToken)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || 'Errore login'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('urbanway-token')
  }

  // Aggiorna profilo
  const updateProfile = async (fullName, avatarUrl) => {
    setError(null)
    try {
      const response = await axios.put(
        '/api/auth/profile',
        { fullName, avatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUser(response.data.user)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || 'Errore aggiornamento'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Cambia password
  const changePassword = async (currentPassword, newPassword) => {
    setError(null)
    try {
      await axios.post(
        '/api/auth/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || 'Errore modifica password'
      setError(message)
      return { success: false, error: message }
    }
  }

  const isAuthenticated = !!user && !!token

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        signup,
        login,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
