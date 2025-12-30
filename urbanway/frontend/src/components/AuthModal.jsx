import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import './AuthModal.css'

function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { login, signup, error, loading } = useContext(AuthContext)
  const [tab, setTab] = useState(initialTab)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')

  // Login form
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })

  // Signup form
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    fullName: ''
  })

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSignupChange = (e) => {
    const { name, value } = e.target
    setSignupForm(prev => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccess('')

    if (!loginForm.username || !loginForm.password) {
      setFormError('Username e password obbligatori')
      return
    }

    const result = await login(loginForm.username, loginForm.password)
    if (result.success) {
      setSuccess('Login avvenuto con successo!')
      setTimeout(() => onClose(), 1000)
    } else {
      setFormError(result.error)
    }
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccess('')

    // Validazione
    if (!signupForm.username || !signupForm.email || !signupForm.password) {
      setFormError('Compila tutti i campi')
      return
    }

    if (signupForm.password !== signupForm.passwordConfirm) {
      setFormError('Le password non coincidono')
      return
    }

    if (signupForm.password.length < 6) {
      setFormError('Password minimo 6 caratteri')
      return
    }

    const result = await signup(
      signupForm.username,
      signupForm.email,
      signupForm.password,
      signupForm.fullName
    )

    if (result.success) {
      setSuccess('Registrazione avvenuta! Effettua il login...')
      setTimeout(() => {
        setTab('login')
        setSignupForm({ username: '', email: '', password: '', passwordConfirm: '', fullName: '' })
      }, 1500)
    } else {
      setFormError(result.error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>✕</button>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login')
              setFormError('')
              setSuccess('')
            }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setTab('signup')
              setFormError('')
              setSuccess('')
            }}
          >
            Registrati
          </button>
        </div>

        {formError && <div className="auth-error">{formError}</div>}
        {success && <div className="auth-success">{success}</div>}
        {error && <div className="auth-error">{error}</div>}

        {tab === 'login' && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Il tuo username"
                value={loginForm.username}
                onChange={handleLoginChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="La tua password"
                value={loginForm.password}
                onChange={handleLoginChange}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>
        )}

        {tab === 'signup' && (
          <form className="auth-form" onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Scegli un username"
                value={signupForm.username}
                onChange={handleSignupChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="La tua email"
                value={signupForm.email}
                onChange={handleSignupChange}
              />
            </div>

            <div className="form-group">
              <label>Nome completo (opzionale)</label>
              <input
                type="text"
                name="fullName"
                placeholder="Il tuo nome"
                value={signupForm.fullName}
                onChange={handleSignupChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Almeno 6 caratteri"
                value={signupForm.password}
                onChange={handleSignupChange}
              />
            </div>

            <div className="form-group">
              <label>Conferma Password</label>
              <input
                type="password"
                name="passwordConfirm"
                placeholder="Ripeti password"
                value={signupForm.passwordConfirm}
                onChange={handleSignupChange}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Registrazione in corso...' : 'Registrati'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          🔐 I tuoi dati sono al sicuro e crittografati
        </p>
      </div>
    </div>
  )
}

export default AuthModal
