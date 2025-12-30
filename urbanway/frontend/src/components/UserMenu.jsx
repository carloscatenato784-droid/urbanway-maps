import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import AuthModal from './AuthModal'
import './UserMenu.css'

function UserMenu() {
  const { user, logout, isAuthenticated } = useContext(AuthContext)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (!isAuthenticated) {
    return (
      <>
        <button className="login-btn" onClick={() => setAuthModalOpen(true)}>
          🔐 Accedi
        </button>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </>
    )
  }

  return (
    <>
      <div className="user-menu">
        <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <span className="user-avatar">👤</span>
          <span className="user-name">{user.username}</span>
          <span className="dropdown-arrow">▼</span>
        </button>

        {dropdownOpen && (
          <div className="user-dropdown">
            <div className="dropdown-header">
              <div className="dropdown-user-info">
                <div className="dropdown-avatar">👤</div>
                <div>
                  <div className="dropdown-username">{user.username}</div>
                  <div className="dropdown-email">{user.email}</div>
                </div>
              </div>
            </div>

            <div className="dropdown-divider"></div>

            <button className="dropdown-item">
              ⚙️ Impostazioni profilo
            </button>
            <button className="dropdown-item">
              📍 I miei percorsi
            </button>
            <button className="dropdown-item">
              🔒 Cambia password
            </button>

            <div className="dropdown-divider"></div>

            <button className="dropdown-item logout" onClick={() => {
              logout()
              setDropdownOpen(false)
            }}>
              🚪 Esci
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {dropdownOpen && (
        <div className="dropdown-overlay" onClick={() => setDropdownOpen(false)} />
      )}
    </>
  )
}

export default UserMenu
