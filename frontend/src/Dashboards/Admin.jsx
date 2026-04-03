import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts'

const COLORS_CAT  = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
const COLORS_PRIO = ['#EF4444', '#F59E0B', '#10B981']

export default function Admin() {

  const navigate              = useNavigate()
  const token                 = localStorage.getItem('token')
  const [stats, setStats]     = useState(null)
  const [periode, setPeriode] = useState('tout')
  const [loading, setLoading] = useState(true)
  const [reclamations, setReclamations] = useState([])

  // ── Charger stats ──────────────────────────────
  useEffect(() => {
    setLoading(true)
    fetch(`http://localhost:8000/api/admin/stats?periode=${periode}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { setStats(data); setLoading(false) })
    .catch(() => setLoading(false))
  }, [periode])

  // ── Charger réclamations ───────────────────────
  useEffect(() => {
    fetch('http://localhost:8000/api/agent/reclamations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setReclamations(Array.isArray(data) ? data : []))
  }, [])

  // ── Formater données graphiques ────────────────
  const dataCat = stats ? Object.entries(stats.par_categorie).map(([name, value]) => ({
    name, value
  })) : []

  const dataPrio = stats ? Object.entries(stats.par_priorite).map(([name, value]) => ({
    name, value
  })) : []

  const getPrioriteColor = (p) => {
    switch(p) {
      case 'ELEVEE'  : return 'bg-red-100 text-red-700'
      case 'MOYENNE' : return 'bg-orange-100 text-orange-700'
      case 'NORMALE' : return 'bg-green-100 text-green-700'
      default        : return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatutColor = (s) => {
    switch(s) {
      case 'NOUVELLE'   : return 'bg-blue-100 text-blue-700'
      case 'EN_ANALYSE' : return 'bg-yellow-100 text-yellow-700'
      case 'CLOTURED'   : return 'bg-green-100 text-green-700'
      default           : return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Admin Dashboard" />

          <main className="flex-1 overflow-y-auto p-6">

            {/* ── FILTRE PÉRIODE ─────────────────── */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-slate-500 font-medium">Période :</span>
              {['7j', '30j', '12m', 'tout'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriode(p)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    periode === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400">⏳ Chargement...</div>
            ) : (
              <>
                {/* ── CARTES STATS ───────────────── */}
                <div className="grid grid-cols-3 gap-6 mb-6">

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
                      Total réclamations
                    </p>
                    <p className="text-4xl font-bold text-slate-800">{stats?.total}</p>
                    <p className="text-xs text-slate-400 mt-1">période : {periode}</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <p className="text-xs text-red-500 font-medium uppercase tracking-wide mb-1">
                      Priorité élevée
                    </p>
                    <p className="text-4xl font-bold text-red-600">
                      {stats?.par_priorite?.ELEVEE || 0}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">à traiter en urgence</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
                      Agents actifs
                    </p>
                    <p className="text-4xl font-bold text-slate-800">
                      {reclamations.length > 0
                        ? [...new Set(reclamations.map(r => r.passager?.email))].length
                        : 0}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">passagers uniques</p>
                  </div>

                </div>

                {/* ── GRAPHIQUES ─────────────────── */}
                <div className="grid grid-cols-2 gap-6 mb-6">

                  {/* Donut catégories */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Répartition par catégorie</h3>
                    {dataCat.length > 0 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={dataCat}
                            cx="50%" cy="50%"
                            innerRadius={60} outerRadius={100}
                            dataKey="value"
                          >
                            {dataCat.map((_, i) => (
                              <Cell key={i} fill={COLORS_CAT[i % COLORS_CAT.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-slate-400 py-10">Aucune donnée</p>
                    )}
                  </div>

                  {/* Bar priorité */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Répartition par priorité</h3>
                    {dataPrio.length > 0 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={dataPrio}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                          <XAxis dataKey="name" tick={{ fontSize: 12 }}/>
                          <YAxis tick={{ fontSize: 12 }}/>
                          <Tooltip />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {dataPrio.map((_, i) => (
                              <Cell key={i} fill={COLORS_PRIO[i % COLORS_PRIO.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-slate-400 py-10">Aucune donnée</p>
                    )}
                  </div>

                </div>

                {/* ── LISTE RÉCLAMATIONS ─────────── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4">
                    Dernières réclamations
                  </h3>
                  <div className="space-y-3">
                    {reclamations.slice(0, 5).map(rec => (
                      <div
                        key={rec.id}
                        onClick={() => navigate(`/reclamation/${rec.id}`)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-mono w-8">#{rec.id}</span>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{rec.category}</p>
                            <p className="text-xs text-slate-400">{rec.passager?.prenom} {rec.passager?.nom}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPrioriteColor(rec.priorite)}`}>
                            {rec.priorite}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatutColor(rec.statut)}`}>
                            {rec.statut}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(rec.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}