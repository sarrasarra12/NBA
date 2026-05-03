// src/Dashboards/DashboardAgent.jsx
import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
 
export default function Dash_Agent({ title }) {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const [reclamations, setReclamations] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filtrePriorite,  setFiltrePriorite]  = useState('Toutes')
  const [filtreCategorie, setFiltreCategorie] = useState('Toutes')
  const [filtreStatut,    setFiltreStatut]    = useState('Tous')
  const [periode,         setPeriode]         = useState('tout')

  const statut   = searchParams.get('statut')
  const priorite = searchParams.get('priorite')

  useEffect(() => {
    fetchReclamations()
  }, [statut, priorite])

  const fetchReclamations = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      let url = 'http://localhost:8000/api/agent/reclamations'
      const params = []
      if (statut) params.push(`statut=${statut}`)
      if (params.length > 0) url += '?' + params.join('&')

      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      let data   = await res.json()
      if (priorite) data = data.filter(r => r.priorite === priorite)
      setReclamations(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // ── Filtre période ──────────────────────────────
  const filtrerParPeriode = (data) => {
    const now = new Date()
    switch(periode) {
      case 'aujourd_hui':
        return data.filter(r => {
          const d = new Date(r.created_at)
          return d.toDateString() === now.toDateString()
        })
      case '7j':
        const il_y_a_7j = new Date(now - 7 * 24 * 60 * 60 * 1000)
        return data.filter(r => new Date(r.created_at) >= il_y_a_7j)
      case '30j':
        const il_y_a_30j = new Date(now - 30 * 24 * 60 * 60 * 1000)
        return data.filter(r => new Date(r.created_at) >= il_y_a_30j)
      default:
        return data
    }
  }

  // ── Filtres locaux ──────────────────────────────
  const reclamationsFiltrees = filtrerParPeriode(reclamations).filter(rec => {
    const matchSearch = search === '' ||
      rec.id.toString().includes(search) ||
      rec.passager?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      rec.passager?.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      rec.carte?.vol?.toLowerCase().includes(search.toLowerCase())

    const matchPriorite  = filtrePriorite  === 'Toutes' || rec.priorite === filtrePriorite
    const matchCategorie = filtreCategorie === 'Toutes' || rec.category?.toLowerCase() === filtreCategorie.toLowerCase()
    const matchStatut    = filtreStatut    === 'Tous'   || rec.statut === filtreStatut

    return matchSearch && matchPriorite && matchCategorie && matchStatut
  })

  // ── Statistiques ────────────────────────────────
  const recPeriode = filtrerParPeriode(reclamations)
  const nbUrgentes = recPeriode.filter(r => r.priorite === 'ELEVEE' && r.statut === 'NOUVELLE').length
  const nbAttente  = recPeriode.filter(r => r.statut === 'NOUVELLE' || r.statut === 'EN_ANALYSE').length
  const nbClotured = recPeriode.filter(r => r.statut === 'CLOTURED').length
  const nbTotal    = recPeriode.length

  // ── Styles ──────────────────────────────────────
  const getPrioriteStyle = (p) => {
    switch(p) {
      case 'ELEVEE' : return { bg: '#FEE2E2', color: '#DC2626', label: '🔴 ÉLEVÉE'  }
      case 'MOYENNE': return { bg: '#FEF3C7', color: '#D97706', label: '🟠 MOYENNE' }
      case 'NORMALE': return { bg: '#D1FAE5', color: '#059669', label: '🟢 NORMALE' }
      default       : return { bg: '#F3F4F6', color: '#6B7280', label: p }
    }
  }

  const getStatutStyle = (s) => {
    switch(s) {
      case 'NOUVELLE'   : return { bg: '#DBEAFE', color: '#1D4ED8', label: 'NOUVELLE'   }
      case 'EN_ANALYSE' : return { bg: '#FEF3C7', color: '#D97706', label: 'EN ANALYSE' }
      case 'CLOTURED'   : return { bg: '#D1FAE5', color: '#059669', label: 'CLÔTURÉE'   }
      default           : return { bg: '#F3F4F6', color: '#6B7280', label: s }
    }
  }

  const getCategorieStyle = (c) => {
    const map = {
      'retard'          : { bg: '#DBEAFE', color: '#1D4ED8', icon: '⏱️' },
      'bagage'          : { bg: '#F3E8FF', color: '#7C3AED', icon: '🧳' },
      'annulation'      : { bg: '#FEE2E2', color: '#DC2626', icon: '❌' },
      'remboursement'   : { bg: '#D1FAE5', color: '#059669', icon: '💰' },
      'service_aeroport': { bg: '#FEF3C7', color: '#D97706', icon: '✈️' },
      'autre'           : { bg: '#F3F4F6', color: '#6B7280', icon: '📋' },
    }
    return map[c?.toLowerCase()] || { bg: '#F3F4F6', color: '#6B7280', icon: '📋' }
  }

  const periodes = [
    { key: 'aujourd_hui', label: "Aujourd'hui" },
    { key: '7j',          label: '7j'           },
    { key: '30j',         label: '30j'          },
    { key: 'tout',        label: 'Tout'         },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={title} />

          <main className="flex-1 overflow-y-auto p-6">

            {/* ── TITRE ────────────────────────────── */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-slate-800">
                📋 Gestion des Réclamations
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Supervision & Validation • Mise à jour temps réel
              </p>
            </div>

            {/* ── FILTRE PÉRIODE ───────────────────── */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-sm text-slate-500 font-medium">Période :</span>
              {periodes.map(p => (
                <button
                  key     = {p.key}
                  onClick = {() => setPeriode(p.key)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    periode === p.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* ── CARTES STATISTIQUES ──────────────── */}
            <div className="grid grid-cols-4 gap-4 mb-5">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔴</span>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">{nbUrgentes}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Urgentes</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">{nbAttente}</p>
                    <p className="text-xs text-slate-400 mt-0.5">En attente</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">{nbClotured}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Traitées</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">{nbTotal}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── FILTRES ──────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
              <div className="flex items-end gap-3 flex-wrap">

                {/* Recherche */}
                <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-xl px-3 py-2">
                  <Search className="w-4 h-4 text-gray-400"/>
                  <input
                    type        = "text"
                    placeholder = "Rechercher par ID, passager, vol..."
                    value       = {search}
                    onChange    = {e => setSearch(e.target.value)}
                    className   = "flex-1 text-sm outline-none bg-transparent"
                  />
                </div>

                {/* Priorité */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Priorité
                  </label>
                  <select
                    value    = {filtrePriorite}
                    onChange = {e => setFiltrePriorite(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    <option>Toutes</option>
                    <option value="ELEVEE">Élevée</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="NORMALE">Normale</option>
                  </select>
                </div>

                {/* Catégorie */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Catégorie
                  </label>
                  <select
                    value    = {filtreCategorie}
                    onChange = {e => setFiltreCategorie(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    <option>Toutes</option>
                    <option value="retard">Retard</option>
                    <option value="bagage">Bagage</option>
                    <option value="annulation">Annulation</option>
                    <option value="remboursement">Remboursement</option>
                    <option value="service_aeroport">Service aéroport</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                {/* Statut */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Statut
                  </label>
                  <select
                    value    = {filtreStatut}
                    onChange = {e => setFiltreStatut(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    <option value="Tous">Tous</option>
                    <option value="NOUVELLE">Nouvelle</option>
                    <option value="EN_ANALYSE">En analyse</option>
                    <option value="CLOTURED">Clôturée</option>
                  </select>
                </div>

                {/* Reset */}
                <button
                  onClick={() => {
                    setSearch('')
                    setFiltrePriorite('Toutes')
                    setFiltreCategorie('Toutes')
                    setFiltreStatut('Tous')
                  }}
                  className="px-4 py-2 text-sm text-slate-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            {/* ── TABLEAU ──────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-slate-800">
                  Liste des Réclamations
                </h3>
                <span className="text-sm text-slate-400">
                  {reclamationsFiltrees.length} réclamation(s)
                </span>
              </div>

              {loading ? (
                <div className="text-center py-20 text-slate-400">
                  Chargement...
                </div>
              ) : reclamationsFiltrees.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <p className="text-4xl mb-3">📭</p>
                  <p>Aucune réclamation trouvée</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          ID Réclamation
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          Passager
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          Vol
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          Catégorie
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          Priorité
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          Statut
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {reclamationsFiltrees.map(rec => {
                        const pStyle = getPrioriteStyle(rec.priorite)
                        const sStyle = getStatutStyle(rec.statut)
                        const cStyle = getCategorieStyle(rec.category)

                        return (
                          <tr
                            key       = {rec.id}
                            onClick   = {() => navigate(`/reclamation/${rec.id}`)}
                            className = "hover:bg-blue-50 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-blue-600 font-semibold text-sm">
                                REC-{String(rec.id).padStart(6, '0')}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                                {rec.passager?.prenom} {rec.passager?.nom}
                              </p>
                              <p className="text-xs text-slate-400">
                                {rec.passager?.email}
                              </p>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap">
                              <p className="text-sm font-bold text-slate-800">
                                {rec.carte?.vol || 'N/A'}
                              </p>
                              <p className="text-xs text-slate-400">
                                {rec.carte?.departure_date
                                  ? new Date(rec.carte.departure_date).toLocaleDateString('fr-FR')
                                  : ''}
                              </p>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className = "text-xs font-semibold px-3 py-1.5 rounded-full"
                                style     = {{ background: cStyle.bg, color: cStyle.color }}
                              >
                                {cStyle.icon} {rec.category?.toUpperCase()}
                              </span>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className = "text-xs font-bold px-3 py-1.5 rounded-full"
                                style     = {{ background: pStyle.bg, color: pStyle.color }}
                              >
                                {pStyle.label}
                              </span>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className = "text-xs font-semibold px-3 py-1.5 rounded-full"
                                style     = {{ background: sStyle.bg, color: sStyle.color }}
                              >
                                {sStyle.label}
                              </span>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-xs text-slate-400">
                                {new Date(rec.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}