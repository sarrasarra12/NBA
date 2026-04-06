// src/Dashboards/Parametres.jsx
import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { Plus, Trash2, Building2, Tag } from 'lucide-react'

export default function Parametres() {
  const [activeTab, setActiveTab]         = useState('departements')
  const [departements, setDepartements]   = useState([])
  const [categories, setCategories]       = useState([])
  const [showForm, setShowForm]           = useState(false)
  const [popup, setPopup]                 = useState({ show: false, type: '', message: '' })
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null })

  // ← departement n'a plus category_id !
  const [deptForm, setDeptForm] = useState({ nom: '', responsable: '', email: '' })

  // ← catégorie choisit son département !
  const [catForm, setCatForm]   = useState({ nom: '', description: '', departement_id: '' })

  const token = localStorage.getItem('token')

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message })
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3000)
  }

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ show: true, message, onConfirm })
  }

  const fetchDepartements = () => {
    fetch('http://localhost:8000/api/admin/departements', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setDepartements(Array.isArray(data) ? data : []))
  }

  const fetchCategories = () => {
    fetch('http://localhost:8000/api/admin/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setCategories(Array.isArray(data) ? data : []))
  }

  useEffect(() => {
    fetchDepartements()
    fetchCategories()
  }, [])

  // ── CRUD Département ───────────────────────────
  const handleCreateDept = async () => {
    const res = await fetch('http://localhost:8000/api/admin/departements', {
      method : 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        nom        : deptForm.nom,
        responsable: deptForm.responsable,
        email      : deptForm.email
        // ← plus de category_id !
      })
    })
    if (res.ok) {
      setShowForm(false)
      setDeptForm({ nom: '', responsable: '', email: '' })
      fetchDepartements()
      showPopup('success', 'Département créé !')
    } else {
      showPopup('error', 'Erreur création département')
    }
  }

  const handleSupprimerDept = (id) => {
    showConfirm('Supprimer ce département ?', async () => {
      const res = await fetch(`http://localhost:8000/api/admin/departements/${id}`, {
        method : 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        fetchDepartements()
        showPopup('success', 'Département supprimé')
      } else {
        const err = await res.json()
        showPopup('error', err.detail || 'Erreur suppression')
      }
    })
  }

  // ── CRUD Catégorie ─────────────────────────────
  const handleCreateCat = async () => {
    const res = await fetch('http://localhost:8000/api/admin/categories', {
      method : 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        nom           : catForm.nom,
        description   : catForm.description,
        departement_id: catForm.departement_id ? parseInt(catForm.departement_id) : null
        // ← catégorie choisit son département !
      })
    })
    if (res.ok) {
      setShowForm(false)
      setCatForm({ nom: '', description: '', departement_id: '' })
      fetchCategories()
      showPopup('success', 'Catégorie créée !')
    } else {
      const err = await res.json()
      showPopup('error', err.detail || 'Erreur')
    }
  }

  const handleSupprimerCat = (id) => {
    showConfirm('Supprimer cette catégorie ?', async () => {
      const res = await fetch(`http://localhost:8000/api/admin/categories/${id}`, {
        method : 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        fetchCategories()
        showPopup('success', 'Catégorie supprimée')
      } else {
        const err = await res.json()
        showPopup('error', err.detail || 'Erreur suppression')
      }
    })
  }

  const tabs = [
    { id: 'departements', label: 'Départements', icon: Building2, count: departements.length },
    { id: 'categories',   label: 'Catégories',   icon: Tag,       count: categories.length },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="⚙️ Paramètres" />

          {/* POPUP */}
          {popup.show && (
            <div className={`fixed bottom-6 right-6 z-50 max-w-sm w-full shadow-xl rounded-2xl p-4 flex items-start gap-3
              ${popup.type === 'success' ? 'bg-green-50 border-2 border-green-300' : ''}
              ${popup.type === 'error'   ? 'bg-red-50 border-2 border-red-300'     : ''}
            `}>
              <span className="text-2xl">{popup.type === 'success' ? '✅' : '❌'}</span>
              <p className={`text-sm font-medium flex-1 ${popup.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {popup.message}
              </p>
              <button onClick={() => setPopup({ show: false, type: '', message: '' })} className="text-gray-400 font-bold">×</button>
            </div>
          )}

          {/* CONFIRM */}
          {confirmDialog.show && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
                <p className="font-semibold text-slate-800 mb-6 text-center">{confirmDialog.message}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl"
                  >Annuler</button>
                  <button
                    onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({ show: false, message: '', onConfirm: null }) }}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl"
                  >Confirmer</button>
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-6">

            {/* ONGLETS */}
            <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 border border-gray-200 shadow-sm w-fit">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowForm(false) }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                      ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Icon className="w-4 h-4"/>
                    {tab.label}
                    <span className={`text-xs px-2 py-0.5 rounded-full
                      ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* ══ DÉPARTEMENTS ══════════════════════════ */}
            {activeTab === 'departements' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Départements ({departements.length})</h2>
                  <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl">
                    <Plus className="w-4 h-4"/> Nouveau département
                  </button>
                </div>

                {showForm && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="font-bold text-slate-800 mb-4">Créer un département</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        placeholder="Nom (ex: OVERBOOKING_DEPT)"
                        value={deptForm.nom}
                        onChange={e => setDeptForm({...deptForm, nom: e.target.value.toUpperCase()})}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                      <input
                        placeholder="Responsable"
                        value={deptForm.responsable}
                        onChange={e => setDeptForm({...deptForm, responsable: e.target.value})}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                      <input
                        placeholder="Email département"
                        type="email"
                        value={deptForm.email}
                        onChange={e => setDeptForm({...deptForm, email: e.target.value})}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 col-span-2"
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={handleCreateDept} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl">Créer</button>
                      <button onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl">Annuler</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departements.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 col-span-3">Aucun département</div>
                  ) : departements.map(dept => (
                    <div key={dept.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600"/>
                        </div>
                        <button onClick={() => handleSupprimerDept(dept.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                      <h3 className="font-bold text-slate-800 mb-1">{dept.nom}</h3>
                      {dept.responsable && <p className="text-xs text-slate-500 mb-1">👤 {dept.responsable}</p>}
                      {dept.email && <p className="text-xs text-slate-500 mb-2">✉️ {dept.email}</p>}

                      {/* Catégories liées à ce département */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {categories
                          .filter(c => c.departement_id === dept.id)
                          .map(c => (
                            <span key={c.id} className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                              {c.nom}
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ══ CATÉGORIES ════════════════════════════ */}
            {activeTab === 'categories' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Catégories ({categories.length})</h2>
                  <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl">
                    <Plus className="w-4 h-4"/> Nouvelle catégorie
                  </button>
                </div>

                {showForm && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="font-bold text-slate-800 mb-4">Créer une catégorie</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        placeholder="Nom (ex: OVERBOOKING)"
                        value={catForm.nom}
                        onChange={e => setCatForm({...catForm, nom: e.target.value.toUpperCase()})}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                      <input
                        placeholder="Description"
                        value={catForm.description}
                        onChange={e => setCatForm({...catForm, description: e.target.value})}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                      {/* ← Catégorie choisit son département ! */}
                      <select
                        value={catForm.departement_id}
                        onChange={e => setCatForm({...catForm, departement_id: e.target.value})}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 col-span-2"
                      >
                        <option value="">Choisir un département</option>
                        {departements.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.nom}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={handleCreateCat} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl">Créer</button>
                      <button onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl">Annuler</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 col-span-3">Aucune catégorie</div>
                  ) : categories.map(cat => (
                    <div key={cat.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Tag className="w-5 h-5 text-purple-600"/>
                        </div>
                        <button onClick={() => handleSupprimerCat(cat.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                      <h3 className="font-bold text-slate-800 mb-1">{cat.nom}</h3>
                      {cat.description && <p className="text-xs text-slate-500 mb-2">{cat.description}</p>}

                      {/* Département lié */}
                      {cat.departement_id && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          🏢 {departements.find(d => d.id === cat.departement_id)?.nom || 'Département'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}






/*Formulaire département :
✅ supprimé select catégorie
✅ juste nom + responsable + email

Formulaire catégorie :
✅ ajouté select département
✅ catégorie choisit son département

Carte département :
✅ affiche les catégories liées

Carte catégorie :
✅ affiche le département lié*/