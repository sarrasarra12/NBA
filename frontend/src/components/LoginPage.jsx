// src/pages/LoginPage.jsx

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import logoImg from '../assets/images.png'

export default function LoginPage() {

  const navigate                = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('http://localhost:8000/api/auth/login', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Email ou mot de passe incorrect')
        return
      }
      localStorage.setItem('token',       data.access_token)
      localStorage.setItem('role',        data.role)
      localStorage.setItem('nom',         data.nom)
      localStorage.setItem('departement', data.departement || '')

      if      (data.role === 'ADMIN')              navigate('/admin')
      else if (data.departement === 'BAGAGE')      navigate('/agent/bagage')
      else if (data.departement === 'CALL_CENTRE') navigate('/agent/callcenter')
      else                                         navigate('/agent/service')
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050d1a', fontFamily: "'DM Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(15px)} }
        .login-card { animation: fadeUp 0.5s ease forwards; }
        .nav-link {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
          padding: 6px 12px;
          border-radius: 8px;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.07); }
        .nav-link-active {
          color: #60a5fa;
          background: rgba(96,165,250,0.1);
          border: 1px solid rgba(96,165,250,0.2);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
        }
        .input-login {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 13px 16px;
          color: #fff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.25s;
          box-sizing: border-box;
        }
        .input-login::placeholder { color: rgba(255,255,255,0.2); }
        .input-login:focus {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.08);
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
        }
        .btn-connect {
          width: 100%;
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.25s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-connect:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.35);
        }
        .btn-connect:disabled { opacity: 0.5; cursor: not-allowed; }
        .show-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.35);
          padding: 0;
          transition: color 0.2s;
          display: flex;
        }
        .show-btn:hover { color: rgba(255,255,255,0.7); }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
        }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────── */}
      <nav style={{
        position      : 'sticky',
        top           : 0,
        zIndex        : 50,
        background    : 'rgba(5,13,26,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom  : '1px solid rgba(255,255,255,0.07)',
        padding       : '0 32px',
        height        : 60,
        display       : 'flex',
        alignItems    : 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo → retour page principale */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src={logoImg} alt="NouvelAir" style={{ height: 32, width: 'auto' }}/>
          <span style={{
            fontFamily   : "'Syne', sans-serif",
            fontWeight   : 800,
            fontSize     : 18,
            color        : '#fff',
            letterSpacing: '-0.3px',
          }}>
            Nouvel<span style={{ color: '#60a5fa' }}>Air</span>
          </span>
        </Link>

        {/* Liens de navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link to="/" className="nav-link">Soumettre une réclamation</Link>
          <Link to="/suivi" className="nav-link">Suivre ma réclamation</Link>
          <Link to="/login" className="nav-link-active">Espace employés</Link>
        </div>
      </nav>

      {/* ── FOND DÉCORATIF ─────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="orb" style={{
          width: 400, height: 400,
          background: 'rgba(29,78,216,0.2)',
          top: -100, left: -80,
          animation: 'float1 9s ease-in-out infinite',
        }}/>
        <div className="orb" style={{
          width: 300, height: 300,
          background: 'rgba(99,102,241,0.15)',
          bottom: 0, right: -60,
          animation: 'float2 11s ease-in-out infinite',
        }}/>

        {/* Grille décorative */}
        <div style={{
          position       : 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize : '56px 56px',
          pointerEvents  : 'none',
        }}/>

        {/* ── CONTENU CENTRÉ ── */}
        <div style={{
          minHeight      : 'calc(100vh - 60px)',
          display        : 'flex',
          alignItems     : 'center',
          justifyContent : 'center',
          padding        : '40px 16px',
        }}>
          <div className="login-card" style={{
            width          : '100%',
            maxWidth       : 420,
            background     : 'rgba(255,255,255,0.04)',
            backdropFilter : 'blur(24px)',
            borderRadius   : 24,
            border         : '1px solid rgba(255,255,255,0.1)',
            padding        : '40px 36px',
            boxShadow      : '0 32px 80px rgba(0,0,0,0.5)',
            position       : 'relative',
          }}>

            {/* Ligne bleue en haut */}
            <div style={{
              position  : 'absolute',
              top: -1, left: '25%', right: '25%',
              height    : 2,
              background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
            }}/>

            {/* Accent bleu */}
            <div style={{
              width       : 48,
              height      : 3,
              background  : '#3b82f6',
              borderRadius: 2,
              marginBottom: 20,
            }}/>

            {/* Titre */}
            <h1 style={{
              fontFamily   : "'Syne', sans-serif",
              fontWeight   : 800,
              fontSize     : 26,
              color        : '#fff',
              margin       : '0 0 6px',
              letterSpacing: '-0.5px',
            }}>
              Espace Employés
            </h1>
            <p style={{
              color       : 'rgba(255,255,255,0.4)',
              fontSize    : 13,
              margin      : '0 0 32px',
              fontWeight  : 300,
            }}>
              Connectez-vous pour accéder au dashboard
            </p>

            {/* Formulaire */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* EMAIL */}
              <div>
                <label style={{
                  display      : 'block',
                  color        : 'rgba(255,255,255,0.45)',
                  fontSize     : 11,
                  fontWeight   : 600,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  marginBottom : 8,
                }}>
                  Email
                </label>
                <input
                  className="input-login"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="agent@nouvelair.com"
                  required
                />
              </div>

              {/* MOT DE PASSE */}
              <div>
                <label style={{
                  display      : 'block',
                  color        : 'rgba(255,255,255,0.45)',
                  fontSize     : 11,
                  fontWeight   : 600,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  marginBottom : 8,
                }}>
                  Mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-login"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    className="show-btn"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* ERREUR */}
              {error && (
                <div style={{
                  background  : 'rgba(239,68,68,0.1)',
                  border      : '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10,
                  padding     : '11px 14px',
                  color       : '#fca5a5',
                  fontSize    : 13,
                  display     : 'flex',
                  alignItems  : 'center',
                  gap         : 8,
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* BOUTON */}
              <button type="submit" className="btn-connect" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? (
                  <>
                    <span style={{
                      width: 15, height: 15,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block',
                    }}/>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>

            </form>

            {/* Footer */}
            <p style={{
              textAlign  : 'center',
              color      : 'rgba(255,255,255,0.18)',
              fontSize   : 11,
              marginTop  : 28,
              marginBottom: 0,
            }}>
              NouvelAir © 2026 — Accès réservé aux employés
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}