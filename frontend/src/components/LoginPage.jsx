// src/pages/LoginPage.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoImg from '../assets/images.png'
import Navbar from '../components/Navbar'

export default function LoginPage() {

  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  
   

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        // ✅ Convertir en string pour éviter l'erreur React
        setError(
          typeof data.detail === 'string'
          ? data.detail
          : 'Email ou mot de passe incorrect'
        )
        return
      }

      localStorage.setItem('token',       data.access_token)
      localStorage.setItem('role',        data.role)
      localStorage.setItem('nom',         data.nom)
      localStorage.setItem('departement', data.departement || '')

       if (data.role === 'ADMIN') {
        navigate('/admin')
    } else if (data.departement === 'BAGAGE') {
        navigate('/agent/bagage')
    } else if (data.departement === 'CALL_CENTRE') {
        navigate('/agent/callcenter')
    } else {
        navigate('/agent/service')
    }

    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

          {/* LOGO */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src={logoImg} alt="logo" className="h-10 w-auto"/>
            <span className="text-[#0A1628] font-bold text-2xl">
              Nouvel<span className="text-blue-500">Air</span>
            </span>
          </div>

          {/* TITRE */}
          <h1 className="text-xl font-bold text-[#0A1628] text-center mb-2">
            Espace Employées
          </h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            Connectez-vous pour accéder au dashboard
          </p>

          {/* FORMULAIRE */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wide mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@nouvelair.com"
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wide mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* ERREUR */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                ❌ {error}
              </div>
            )}

            {/* BOUTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A1628] text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? '⏳ Connexion...' : 'Se connecter →'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}