// src/Dashboards/DashboardAgent.jsx
import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useNavigate } from 'react-router-dom'


export default function Dash_Agent({ title }) {
  // ↑ seule différence = le titre
  const navigate = useNavigate()
  const [reclamations, setReclamations] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('http://localhost:8000/api/agent/reclamations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { setReclamations(data); setLoading(false) })
    .catch(() => setLoading(false))
  }, [])

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'NOUVELLE'   : return 'bg-blue-100 text-blue-700'
      case 'EN_ANALYSE' : return 'bg-yellow-100 text-yellow-700'
      case 'CLOTURED'   : return 'bg-green-100 text-green-700'
      default           : return 'bg-gray-100 text-gray-700'
    }
  }
  // Ajoute cette fonction après getStatutColor
  const getPrioriteColor = (priorite) => {
    switch(priorite) {
      case 'ELEVEE'  : return 'bg-red-100 text-red-700'
      case 'MOYENNE' : return 'bg-orange-100 text-orange-700'
      case 'NORMALE' : return 'bg-green-100 text-green-700'
      default        : return 'bg-gray-100 text-gray-700'
    }
}

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900'>
      <div className='flex h-screen overflow-hidden'>
        <Sidebar />
        <div className='flex-1 flex flex-col overflow-hidden'>
          <Header title={title} />
          <main className='flex-1 overflow-y-auto p-6'>

            <div className='mb-6'>
              <h2 className='text-2xl font-bold text-slate-800 dark:text-white'>Réclamations</h2>
              <p className='text-slate-500 text-sm mt-1'>{reclamations.length} réclamation(s)</p>
            </div>

            {loading && <div className='text-center py-20 text-slate-400'>⏳ Chargement...</div>}

            {!loading && (
              <div className='space-y-4'>
                {reclamations.length === 0 ? (
                  <div className='text-center py-20 text-slate-400'>Aucune réclamation</div>
                ) : (
                  reclamations.map((rec) => (
                    <div key={rec.id} 
                        onClick={() => navigate(`/reclamation/${rec.id}`)}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer"
                       >
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <span className='text-xs text-slate-400 font-mono'>#{rec.id}</span>
                          <h3 className='font-semibold text-slate-800 dark:text-white mt-0.5'>{rec.category}</h3>
                        </div>
                         {/* ← Statut + Priorité côte à côte */}
                        <div className='flex items-center gap-2'>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getPrioriteColor(rec.priorite)}`}>
                            {rec.priorite}
                          </span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatutColor(rec.statut)}`}>
                          {rec.statut}
                        </span>
                      </div>
                    </div>
                      <p className='text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2'>{rec.description}</p>
                      <div className='flex items-center justify-between text-xs text-slate-400'>
                        <span>👤 {rec.passager?.prenom} {rec.passager?.nom}</span>
                        <span>📅 {new Date(rec.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}