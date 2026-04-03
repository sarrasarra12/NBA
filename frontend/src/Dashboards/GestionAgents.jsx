// src/Dashboards/GestionAgents.jsx
import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { Plus, Trash2, UserX } from 'lucide-react'

export default function GestionAgents() {

  const [agents, setAgents]             = useState([])
  const [departements, setDepartements] = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [popup, setPopup]               = useState({ show: false, type: '', message: '' })
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null })
  const [agentForm, setAgentForm]       = useState({
    nom: '', prenom: '', email: '', password: '', departement: ''
  })

  const token = localStorage.getItem('token')

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message })
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3000)
  }

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ show: true, message, onConfirm })
  }

  const fetchAgents = () => {
    fetch('http://localhost:8000/api/admin/agents', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { setAgents(Array.isArray(data) ? data : []); setLoading(false) })
  }

  const fetchDepartements = () => {
    fetch('http://localhost:8000/api/admin/departements', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setDepartements(Array.isArray(data) ? data : []))
  }

  useEffect(() => {
    fetchAgents()
    fetchDepartements()
  }, [])

  const handleCreateAgent = async () => {
    const res = await fetch('http://localhost:8000/api/admin/agents', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(agentForm)
    })
    if (res.ok) {
      setShowForm(false)
      setAgentForm({ nom: '', prenom: '', email: '', password: '', departement: '' })
      fetchAgents()
      showPopup('success', 'Agent créé avec succès !')
    } else {
      const err = await res.json()
      showPopup('error', err.detail || 'Erreur création agent')
    }
  }

  const handleDesactiver = (id) => {
    showConfirm('Désactiver cet agent ?', async () => {
      await fetch(`http://localhost:8000/api/admin/agents/${id}/desactiver`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchAgents()
      showPopup('warning', 'Agent désactivé')
    })
  }

  const handleSupprimer = (id) => {
    showConfirm('Supprimer cet agent définitivement ?', async () => {
      await fetch(`http://localhost:8000/api/admin/agents/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchAgents()
      showPopup('success', 'Agent supprimé')
    })
  }

  const getDeptColor = (nom) => {
    switch(nom) {
      case 'BAGAGE'        : return 'bg-blue-100 text-blue-700'
      case 'CALL_CENTRE'   : return 'bg-purple-100 text-purple-700'
      case 'SERVICE_CLIENT': return 'bg-green-100 text-green-700'
      default              : return 'bg-orange-100 text-orange-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="👥 Gestion Agents" />

          {/* POPUP */}
          {popup.show && (
            <div className={`fixed bottom-6 right-6 z-50 max-w-sm w-full shadow-xl rounded-2xl p-4 flex items-start gap-3
              ${popup.type === 'success' ? 'bg-green-50 border-2 border-green-300' : ''}
              ${popup.type === 'error'   ? 'bg-red-50 border-2 border-red-300'     : ''}
              ${popup.type === 'warning' ? 'bg-yellow-50 border-2 border-yellow-300': ''}
            `}>
              <span className="text-2xl">
                {popup.type === 'success' && '✅'}
                {popup.type === 'error'   && '❌'}
                {popup.type === 'warning' && '⚠️'}
              </span>
              <p className={`text-sm font-medium flex-1
                ${popup.type === 'success' ? 'text-green-800' : ''}
                ${popup.type === 'error'   ? 'text-red-800'   : ''}
                ${popup.type === 'warning' ? 'text-yellow-800': ''}
              `}>{popup.message}</p>
              <button onClick={() => setPopup({ show: false, type: '', message: '' })} className="text-gray-400 font-bold">×</button>
            </div>
          )}

          {/* CONFIRM */}
          {confirmDialog.show && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
                <p className="font-semibold text-slate-800 mb-6 text-center">{confirmDialog.message}</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl">Annuler</button>
                  <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({ show: false, message: '', onConfirm: null }) }} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl">Confirmer</button>
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-6">

            {/* TITRE + BOUTON */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Agents</h2>
                <p className="text-slate-500 text-sm mt-1">{agents.length} agent(s)</p>
              </div>
              <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
                <Plus className="w-4 h-4"/> Nouvel agent
              </button>
            </div>

            {/* FORMULAIRE */}
            {showForm && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <h3 className="font-bold text-slate-800 mb-4">Créer un agent</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Nom" value={agentForm.nom} onChange={e => setAgentForm({...agentForm, nom: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"/>
                  <input placeholder="Prénom" value={agentForm.prenom} onChange={e => setAgentForm({...agentForm, prenom: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"/>
                  <input placeholder="Email" type="email" value={agentForm.email} onChange={e => setAgentForm({...agentForm, email: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"/>
                  <input placeholder="Mot de passe" type="password" value={agentForm.password} onChange={e => setAgentForm({...agentForm, password: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"/>
                  <select value={agentForm.departement} onChange={e => setAgentForm({...agentForm, departement: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 col-span-2">
                    <option value="">Choisir un département</option>
                    {departements.map(dept => (
                      <option key={dept.id} value={dept.nom}>{dept.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleCreateAgent} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl">Créer</button>
                  <button onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl">Annuler</button>
                </div>
              </div>
            )}

            {/* LOADING */}
            {loading && <div className="text-center py-20 text-slate-400">⏳ Chargement...</div>}

            {/* LISTE */}
            {!loading && (
              <div className="space-y-3">
                {agents.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">Aucun agent</div>
                ) : agents.map(agent => (
                  <div key={agent.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{agent.prenom?.[0]}{agent.nom?.[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{agent.prenom} {agent.nom}</p>
                        <p className="text-xs text-slate-500">{agent.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {agent.departement && (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getDeptColor(agent.departement.nom)}`}>
                          {agent.departement.nom}
                        </span>
                      )}
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">{agent.role}</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${agent.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {agent.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      <button onClick={() => handleDesactiver(agent.id)} className="p-2 text-orange-400 hover:bg-orange-50 rounded-lg transition-colors" title="Désactiver">
                        <UserX className="w-4 h-4"/>
                      </button>
                      <button onClick={() => handleSupprimer(agent.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}