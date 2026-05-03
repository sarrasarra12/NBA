// src/Dashboards/GestionAgents.jsx
import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { Plus, Trash2, UserX, UserCheck, Search, X, Users } from 'lucide-react'

export default function GestionAgents() {

  // ══════════════════════════════════════════════════
  // ÉTATS
  // ══════════════════════════════════════════════════

  // ── Liste des données ──────────────────────────
  const [agents,       setAgents]       = useState([])       // liste agents depuis API
  const [departements, setDepartements] = useState([])       // liste départements depuis API
  const [loading,      setLoading]      = useState(true)     // spinner chargement initial

  // ── Filtres et recherche ───────────────────────
  const [search,       setSearch]       = useState('')       // texte recherche
  const [filterDept,   setFilterDept]   = useState('')       // filtre département
  const [filterStatus, setFilterStatus] = useState('')       // filtre actif/inactif

  // ── Formulaire création agent ──────────────────
  const [showForm,  setShowForm]  = useState(false)          // afficher/cacher formulaire
  const [agentForm, setAgentForm] = useState({               // données formulaire
    nom: '', prenom: '', email: '', password: '', departement: ''
  })

  // ── Notifications et confirmations ────────────
  const [popup,         setPopup]         = useState({ show: false, type: '', message: '' })
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null })

  // ── Modal détails agent ────────────────────────
  // selectedAgent  : l'agent sur lequel on a cliqué
  // showDetail     : afficher/cacher le modal
  // newPassword    : valeur champ nouveau mot de passe
  // confirmPassword: valeur champ confirmation
  // showPassword   : basculer affichage/masquage mot de passe
  // loadingPassword: spinner pendant l'appel API changement mdp
  const [selectedAgent,    setSelectedAgent]    = useState(null)
  const [showDetail,       setShowDetail]       = useState(false)
  const [newPassword,      setNewPassword]      = useState('')
  const [confirmPassword,  setConfirmPassword]  = useState('')
  const [showPassword,     setShowPassword]     = useState(false)
  const [loadingPassword,  setLoadingPassword]  = useState(false)

  const token = localStorage.getItem('token')

  // ══════════════════════════════════════════════════
  // POPUP NOTIFICATION
  // Affiche un message en bas à droite pendant 3 sec
  // type : 'success' | 'error' | 'warning'
  // ══════════════════════════════════════════════════
  const showPopup = (type, message) => {
    setPopup({ show: true, type, message })
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3000)
  }

  // ══════════════════════════════════════════════════
  // DIALOG DE CONFIRMATION
  // Affiche une boîte de dialogue avant action critique
  // onConfirm : fonction exécutée si l'admin confirme
  // ══════════════════════════════════════════════════
  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ show: true, message, onConfirm })
  }

  // ══════════════════════════════════════════════════
  // CHARGEMENT DES AGENTS
  // Récupère tous les agents depuis l'API
  // ══════════════════════════════════════════════════
  const fetchAgents = () => {
    fetch('http://localhost:8000/api/admin/agents', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setAgents(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }

  // ══════════════════════════════════════════════════
  // CHARGEMENT DES DÉPARTEMENTS
  // Récupère la liste des départements pour le select
  // ══════════════════════════════════════════════════
  const fetchDepartements = () => {
    fetch('http://localhost:8000/api/admin/departements', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setDepartements(Array.isArray(data) ? data : []))
  }

  // ── Chargement initial au montage du composant ──
  useEffect(() => {
    fetchAgents()
    fetchDepartements()
  }, [])

  // ══════════════════════════════════════════════════
  // CRÉER UN AGENT
  // Envoie les données du formulaire au backend
  // Réinitialise le formulaire après succès
  // ══════════════════════════════════════════════════
  const handleCreateAgent = async () => {
    const res = await fetch('http://localhost:8000/api/admin/agents', {
      method : 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body   : JSON.stringify(agentForm)
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

  // ══════════════════════════════════════════════════
  // DÉSACTIVER UN AGENT
  // Passe is_active à false en DB
  // L'agent ne peut plus se connecter
  // Demande confirmation avant d'exécuter
  // ══════════════════════════════════════════════════
  const handleDesactiver = (id) => {
    showConfirm('Désactiver cet agent ?', async () => {
      await fetch(`http://localhost:8000/api/admin/agents/${id}/desactiver`, {
        method : 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchAgents()
      showPopup('warning', 'Agent désactivé')
    })
  }

  // ══════════════════════════════════════════════════
  // RÉACTIVER UN AGENT
  // Passe is_active à true en DB
  // L'agent peut à nouveau se connecter
  // Demande confirmation avant d'exécuter
  // ══════════════════════════════════════════════════
  const handleActiver = (id) => {
    showConfirm('Réactiver cet agent ?', async () => {
      await fetch(`http://localhost:8000/api/admin/agents/${id}/activer`, {
        method : 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchAgents()
      showPopup('success', 'Agent réactivé ✅')
    })
  }

  // ══════════════════════════════════════════════════
  // SUPPRIMER UN AGENT
  // Suppression définitive en DB
  // Action irréversible → demande confirmation
  // ══════════════════════════════════════════════════
  const handleSupprimer = (id) => {
    showConfirm('Supprimer cet agent définitivement ?', async () => {
      await fetch(`http://localhost:8000/api/admin/agents/${id}`, {
        method : 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchAgents()
      showPopup('success', 'Agent supprimé')
    })
  }

  // ══════════════════════════════════════════════════
  // CHANGER MOT DE PASSE — NOUVELLE FONCTION
  // Appelle PUT /api/admin/agents/{id}/password
  // Validations : longueur min + correspondance
  // selectedAgent.id : l'agent dont on change le mdp
  // ══════════════════════════════════════════════════
  const handleChangePassword = async () => {
    // Validation longueur minimale
    if (!newPassword || newPassword.length < 6) {
      showPopup('error', 'Mot de passe trop court (6 caractères min)')
      return
    }
    // Validation correspondance
    if (newPassword !== confirmPassword) {
      showPopup('error', 'Les mots de passe ne correspondent pas')
      return
    }

    setLoadingPassword(true)

    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/agents/${selectedAgent.id}/password`,
        {
          method : 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify({ new_password: newPassword })
        }
      )

      if (res.ok) {
        showPopup('success', 'Mot de passe modifié avec succès !')
        // Réinitialiser les champs après succès
        setNewPassword('')
        setConfirmPassword('')
      } else {
        showPopup('error', 'Erreur lors du changement de mot de passe')
      }
    } catch (e) {
      showPopup('error', 'Erreur réseau')
    } finally {
      setLoadingPassword(false)
    }
  }

  // ══════════════════════════════════════════════════
  // FERMER LE MODAL DÉTAILS
  // Remet à zéro tous les états du modal
  // ══════════════════════════════════════════════════
  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedAgent(null)
    setNewPassword('')
    setConfirmPassword('')
    setShowPassword(false)
  }

  // ══════════════════════════════════════════════════
  // COULEUR DU DÉPARTEMENT
  // Retourne bg, couleur texte et couleur du point
  // selon le nom du département
  // ══════════════════════════════════════════════════
  const getDeptColor = (nom) => {
    switch(nom) {
      case 'BAGAGE'        : return { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' }
      case 'CALL_CENTRE'   : return { bg: '#F5F3FF', color: '#6D28D9', dot: '#8B5CF6' }
      case 'SERVICE_CLIENT': return { bg: '#ECFDF5', color: '#065F46', dot: '#10B981' }
      default              : return { bg: '#FFF7ED', color: '#92400E', dot: '#F59E0B' }
    }
  }

  // ══════════════════════════════════════════════════
  // FILTRAGE DES AGENTS
  // Combine 3 filtres : recherche texte, département,
  // et statut actif/inactif
  // ══════════════════════════════════════════════════
  const agentsFiltres = agents.filter(a => {
    const matchSearch = search === '' ||
      `${a.prenom} ${a.nom} ${a.email}`.toLowerCase().includes(search.toLowerCase())
    const matchDept   = filterDept   === '' || a.departement?.nom === filterDept
    const matchStatus = filterStatus === '' ||
      (filterStatus === 'actif'   &&  a.is_active) ||
      (filterStatus === 'inactif' && !a.is_active)
    return matchSearch && matchDept && matchStatus
  })

  // ── Statistiques rapides ───────────────────────
  const nbActifs   = agents.filter(a =>  a.is_active).length
  const nbInactifs = agents.filter(a => !a.is_active).length

  // ══════════════════════════════════════════════════
  // RENDU JSX
  // ══════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Gestion Agents" />

          {/* ── POPUP NOTIFICATION ─────────────────── */}
          {popup.show && (
            <div style={{
              position    : 'fixed', bottom: 24, right: 24, zIndex: 100,
              maxWidth    : 360, width: '100%',
              background  : popup.type === 'success' ? '#F0FDF4'
                          : popup.type === 'error'   ? '#FEF2F2' : '#FFFBEB',
              border      : `1.5px solid ${
                popup.type === 'success' ? '#86EFAC'
                : popup.type === 'error' ? '#FCA5A5' : '#FCD34D'}`,
              borderRadius: 16, padding: '14px 16px',
              display     : 'flex', alignItems: 'center', gap: 12,
              boxShadow   : '0 8px 32px rgba(0,0,0,0.12)',
              animation   : 'slideIn 0.3s ease',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: popup.type === 'success' ? '#DCFCE7'
                          : popup.type === 'error'   ? '#FEE2E2' : '#FEF3C7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>
                {popup.type === 'success' ? '✅' : popup.type === 'error' ? '❌' : '⚠️'}
              </div>
              <p style={{
                flex: 1, fontSize: 14, fontWeight: 500,
                color: popup.type === 'success' ? '#166534'
                     : popup.type === 'error'   ? '#991B1B' : '#92400E'
              }}>{popup.message}</p>
              <button
                onClick={() => setPopup({ show: false, type: '', message: '' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 18 }}
              >×</button>
            </div>
          )}

          {/* ── DIALOG DE CONFIRMATION ─────────────── */}
          {confirmDialog.show && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                background: '#fff', borderRadius: 20, padding: '28px 24px',
                maxWidth: 380, width: '100%', margin: '0 16px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: '#FEE2E2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', fontSize: 22,
                }}>⚠️</div>
                <p style={{ fontWeight: 700, color: '#0F172A', textAlign: 'center', marginBottom: 8, fontSize: 16 }}>
                  Confirmation
                </p>
                <p style={{ color: '#64748B', textAlign: 'center', fontSize: 14, marginBottom: 24 }}>
                  {confirmDialog.message}
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })}
                    style={{
                      flex: 1, padding: '11px', background: '#F1F5F9',
                      border: 'none', borderRadius: 12, fontSize: 14,
                      fontWeight: 600, cursor: 'pointer', color: '#475569'
                    }}
                  >Annuler</button>
                  <button
                    onClick={() => {
                      confirmDialog.onConfirm()
                      setConfirmDialog({ show: false, message: '', onConfirm: null })
                    }}
                    style={{
                      flex: 1, padding: '11px', background: '#DC2626',
                      border: 'none', borderRadius: 12, fontSize: 14,
                      fontWeight: 600, cursor: 'pointer', color: '#fff'
                    }}
                  >Confirmer</button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              MODAL DÉTAILS AGENT
              S'affiche quand on clique sur un agent
              Contient : infos + changement mot de passe
              zIndex 99 pour être sous les popups (100)
          ══════════════════════════════════════════ */}
          {showDetail && selectedAgent && (
            <div style={{
              position      : 'fixed', inset: 0,
              background    : 'rgba(0,0,0,0.45)',
              zIndex        : 99, display: 'flex',
              alignItems    : 'center', justifyContent: 'center'
            }}>
              <div style={{
                background   : '#fff', borderRadius: 24,
                padding      : '32px 28px', maxWidth: 480,
                width        : '100%', margin: '0 16px',
                boxShadow    : '0 24px 64px rgba(0,0,0,0.2)',
                animation    : 'fadeIn 0.3s ease',
                maxHeight    : '90vh', overflowY: 'auto',
              }}>

                {/* ── Header modal ── */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: 24
                }}>
                  <h3 style={{ fontWeight: 700, color: '#0F172A', margin: 0, fontSize: 18 }}>
                    Détails du compte
                  </h3>
                  <button
                    onClick={handleCloseDetail}
                    style={{
                      background: '#F1F5F9', border: 'none',
                      borderRadius: 8, padding: '6px 10px', cursor: 'pointer'
                    }}
                  >
                    <X style={{ width: 16, height: 16, color: '#64748B' }}/>
                  </button>
                </div>

                {/* ── Avatar + Nom + Email ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width      : 64, height: 64, borderRadius: '50%',
                    background : selectedAgent.is_active ? '#DBEAFE' : '#F1F5F9',
                    display    : 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight : 800, fontSize: 22,
                    color      : selectedAgent.is_active ? '#1D4ED8' : '#94A3B8',
                    flexShrink : 0,
                  }}>
                    {selectedAgent.prenom?.[0]}{selectedAgent.nom?.[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#0F172A', margin: 0, fontSize: 17 }}>
                      {selectedAgent.prenom} {selectedAgent.nom}
                    </p>
                    <p style={{ color: '#64748B', fontSize: 13, margin: '3px 0 0' }}>
                      {selectedAgent.email}
                    </p>
                  </div>
                </div>

                {/* ── Infos détaillées en grille 2x2 ── */}
                <div style={{
                  background  : '#F8FAFC', borderRadius: 14,
                  padding     : '16px 18px', marginBottom: 24,
                  display     : 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
                }}>
                  {[
                    { label: 'Département', value: selectedAgent.departement?.nom || '—' },
                    { label: 'Rôle',        value: selectedAgent.role               },
                    { label: 'Statut',      value: selectedAgent.is_active ? '✅ Actif' : '🚫 Inactif' },
                    { label: 'ID',          value: `#${selectedAgent.id}`           },
                  ].map((info, i) => (
                    <div key={i}>
                      <p style={{
                        fontSize: 11, color: '#94A3B8', fontWeight: 600,
                        textTransform: 'uppercase', margin: '0 0 3px', letterSpacing: '0.05em'
                      }}>
                        {info.label}
                      </p>
                      <p style={{ fontSize: 14, color: '#0F172A', fontWeight: 600, margin: 0 }}>
                        {info.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── Section changer mot de passe ── */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 20 }}>
                  <p style={{ fontWeight: 700, color: '#0F172A', margin: '0 0 14px', fontSize: 15 }}>
                    🔐 Changer le mot de passe
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                    {/* Champ nouveau mot de passe avec bouton afficher/masquer */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type        = {showPassword ? 'text' : 'password'}
                        placeholder = "Nouveau mot de passe (min. 6 caractères)"
                        value       = {newPassword}
                        onChange    = {e => setNewPassword(e.target.value)}
                        style={{
                          width       : '100%', padding: '11px 44px 11px 14px',
                          border      : '1.5px solid #E2E8F0', borderRadius: 10,
                          fontSize    : 14, outline: 'none', fontFamily: 'inherit',
                          color       : '#0F172A', boxSizing: 'border-box',
                        }}
                      />
                      {/* Bouton afficher/masquer le mot de passe */}
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position : 'absolute', right: 12, top: '50%',
                          transform: 'translateY(-50%)', background: 'none',
                          border   : 'none', cursor: 'pointer', fontSize: 16,
                        }}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>

                    {/* Champ confirmation — bordure rouge si pas identique */}
                    <input
                      type        = {showPassword ? 'text' : 'password'}
                      placeholder = "Confirmer le mot de passe"
                      value       = {confirmPassword}
                      onChange    = {e => setConfirmPassword(e.target.value)}
                      style={{
                        width       : '100%', padding: '11px 14px',
                        border      : `1.5px solid ${
                          confirmPassword && confirmPassword !== newPassword
                            ? '#FCA5A5' : '#E2E8F0'
                        }`,
                        borderRadius: 10, fontSize: 14, outline: 'none',
                        fontFamily  : 'inherit', color: '#0F172A', boxSizing: 'border-box',
                      }}
                    />

                    {/* Message d'erreur si mots de passe différents */}
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p style={{ color: '#EF4444', fontSize: 12, margin: 0 }}>
                        ⚠️ Les mots de passe ne correspondent pas
                      </p>
                    )}

                    {/* Bouton sauvegarder */}
                    <button
                      onClick  = {handleChangePassword}
                      disabled = {loadingPassword}
                      style    = {{
                        padding   : '11px', background: '#1E40AF',
                        color     : '#fff', border: 'none', borderRadius: 10,
                        fontSize  : 14, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'inherit', opacity: loadingPassword ? 0.7 : 1,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {loadingPassword ? '⏳ Modification en cours...' : '💾 Sauvegarder le mot de passe'}
                    </button>

                  </div>
                </div>

              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-6">
            <style>{`
              @keyframes slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
              @keyframes fadeIn  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            {/* ── CARTES STATISTIQUES ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total agents', value: agents.length, color: '#3B82F6', bg: '#EFF6FF', icon: '👥' },
                { label: 'Actifs',       value: nbActifs,      color: '#10B981', bg: '#ECFDF5', icon: '✅' },
                { label: 'Inactifs',     value: nbInactifs,    color: '#EF4444', bg: '#FEF2F2', icon: '🚫' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 16,
                  border: '1px solid #E2E8F0', padding: '20px 24px',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: stat.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>{stat.icon}</div>
                  <div>
                    <p style={{ fontSize: 28, fontWeight: 800, color: stat.color, margin: 0 }}>{stat.value}</p>
                    <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── BARRE D'OUTILS ── */}
            <div style={{
              background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0',
              padding: '16px 20px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', width: 16, height: 16, color: '#94A3B8'
                }}/>
                <input
                  type        = "text"
                  placeholder = "Rechercher un agent..."
                  value       = {search}
                  onChange    = {e => setSearch(e.target.value)}
                  style={{
                    width: '100%', paddingLeft: 36, paddingRight: 16,
                    paddingTop: 9, paddingBottom: 9,
                    border: '1.5px solid #E2E8F0', borderRadius: 10,
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit', color: '#0F172A',
                  }}
                />
              </div>

              <select
                value={filterDept} onChange={e => setFilterDept(e.target.value)}
                style={{
                  padding: '9px 14px', border: '1.5px solid #E2E8F0',
                  borderRadius: 10, fontSize: 14, outline: 'none',
                  fontFamily: 'inherit', color: '#475569', background: '#fff',
                }}
              >
                <option value="">Tous les départements</option>
                {departements.map(d => (
                  <option key={d.id} value={d.nom}>{d.nom}</option>
                ))}
              </select>

              <select
                value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{
                  padding: '9px 14px', border: '1.5px solid #E2E8F0',
                  borderRadius: 10, fontSize: 14, outline: 'none',
                  fontFamily: 'inherit', color: '#475569', background: '#fff',
                }}
              >
                <option value="">Tous les statuts</option>
                <option value="actif">Actifs</option>
                <option value="inactif">Inactifs</option>
              </select>

              <button
                onClick={() => setShowForm(!showForm)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 18px', background: '#1E40AF',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}
              >
                <Plus style={{ width: 16, height: 16 }}/>
                Nouvel agent
              </button>
            </div>

            {/* ── FORMULAIRE CRÉATION AGENT ── */}
            {showForm && (
              <div style={{
                background: '#fff', borderRadius: 16,
                border: '1.5px solid #BFDBFE', padding: '24px',
                marginBottom: 20, animation: 'fadeIn 0.3s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, color: '#0F172A', margin: 0, fontSize: 16 }}>Créer un agent</h3>
                    <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>
                      Remplissez les informations du nouvel agent
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                  >
                    <X style={{ width: 16, height: 16, color: '#64748B' }}/>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { placeholder: 'Nom',         key: 'nom',      type: 'text'     },
                    { placeholder: 'Prénom',       key: 'prenom',   type: 'text'     },
                    { placeholder: 'Email',        key: 'email',    type: 'email'    },
                    { placeholder: 'Mot de passe', key: 'password', type: 'password' },
                  ].map(field => (
                    <input
                      key         = {field.key}
                      type        = {field.type}
                      placeholder = {field.placeholder}
                      value       = {agentForm[field.key]}
                      onChange    = {e => setAgentForm({ ...agentForm, [field.key]: e.target.value })}
                      style={{
                        padding: '11px 14px', border: '1.5px solid #E2E8F0',
                        borderRadius: 10, fontSize: 14, outline: 'none',
                        fontFamily: 'inherit', color: '#0F172A',
                        boxSizing: 'border-box', width: '100%',
                      }}
                    />
                  ))}
                  <select
                    value={agentForm.departement}
                    onChange={e => setAgentForm({ ...agentForm, departement: e.target.value })}
                    style={{
                      gridColumn: '1 / -1', padding: '11px 14px',
                      border: '1.5px solid #E2E8F0', borderRadius: 10,
                      fontSize: 14, outline: 'none', fontFamily: 'inherit',
                      color: '#475569', background: '#fff',
                      boxSizing: 'border-box', width: '100%',
                    }}
                  >
                    <option value="">Choisir un département</option>
                    {departements.map(dept => (
                      <option key={dept.id} value={dept.nom}>{dept.nom}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button
                    onClick={handleCreateAgent}
                    style={{
                      padding: '11px 24px', background: '#1E40AF', color: '#fff',
                      border: 'none', borderRadius: 10, fontSize: 14,
                      fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >Créer l'agent</button>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{
                      padding: '11px 24px', background: '#F1F5F9', color: '#475569',
                      border: 'none', borderRadius: 10, fontSize: 14,
                      fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >Annuler</button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                LISTE DES AGENTS
                Chaque carte est cliquable → ouvre le modal
                onClick sur la div entière de l'agent
                e.stopPropagation() sur les boutons action
                pour éviter d'ouvrir le modal en même temps
            ══════════════════════════════════════════ */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8', fontSize: 14 }}>
                Chargement...
              </div>
            ) : agentsFiltres.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '80px 0',
                background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0',
              }}>
                <Users style={{ width: 40, height: 40, color: '#CBD5E1', margin: '0 auto 12px' }}/>
                <p style={{ color: '#94A3B8', fontSize: 15 }}>Aucun agent trouvé</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {agentsFiltres.map(agent => {
                  const deptStyle = agent.departement
                    ? getDeptColor(agent.departement.nom)
                    : getDeptColor('')

                  return (
                    <div
                      key     = {agent.id}
                      onClick = {() => {
                        // Clic sur la carte → ouvrir modal détails
                        setSelectedAgent(agent)
                        setShowDetail(true)
                      }}
                      style={{
                        background : '#fff', borderRadius: 16,
                        border     : '1px solid #E2E8F0', padding: '16px 20px',
                        display    : 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition : 'box-shadow 0.2s, transform 0.1s',
                        opacity    : agent.is_active ? 1 : 0.65,
                        cursor     : 'pointer',  // ← curseur pointer pour indiquer le clic
                      }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >

                      {/* Avatar + Nom + Email */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width     : 44, height: 44, borderRadius: '50%',
                          background: agent.is_active ? '#DBEAFE' : '#F1F5F9',
                          display   : 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 15,
                          color     : agent.is_active ? '#1D4ED8' : '#94A3B8', flexShrink: 0,
                        }}>
                          {agent.prenom?.[0]}{agent.nom?.[0]}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: '#0F172A', margin: 0, fontSize: 15 }}>
                            {agent.prenom} {agent.nom}
                          </p>
                          <p style={{ color: '#94A3B8', fontSize: 13, margin: '2px 0 0' }}>
                            {agent.email}
                          </p>
                        </div>
                      </div>

                      {/* Badges + Boutons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                        {agent.departement && (
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: deptStyle.bg, color: deptStyle.color,
                            fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20,
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: deptStyle.dot, flexShrink: 0 }}/>
                            {agent.departement.nom}
                          </span>
                        )}

                        <span style={{
                          background: '#F1F5F9', color: '#475569',
                          fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20,
                        }}>
                          {agent.role}
                        </span>

                        <span style={{
                          background: agent.is_active ? '#ECFDF5' : '#FEF2F2',
                          color     : agent.is_active ? '#065F46' : '#991B1B',
                          fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20,
                          display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: agent.is_active ? '#10B981' : '#EF4444',
                          }}/>
                          {agent.is_active ? 'Actif' : 'Inactif'}
                        </span>

                        <div style={{ width: 1, height: 28, background: '#E2E8F0', margin: '0 4px' }}/>

                        {/* ── BOUTONS ACTION ──────────────────────
                            e.stopPropagation() OBLIGATOIRE sur chaque bouton
                            pour empêcher le clic de remonter à la div parent
                            et d'ouvrir le modal en même temps qu'on désactive
                        ── */}
                        {agent.is_active && (
                          <button
                            onClick={e => { e.stopPropagation(); handleDesactiver(agent.id) }}
                            title="Désactiver"
                            style={{
                              width: 34, height: 34, border: 'none',
                              background: '#FFF7ED', borderRadius: 8,
                              cursor: 'pointer', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <UserX style={{ width: 16, height: 16, color: '#F97316' }}/>
                          </button>
                        )}

                        {!agent.is_active && (
                          <button
                            onClick={e => { e.stopPropagation(); handleActiver(agent.id) }}
                            title="Réactiver"
                            style={{
                              width: 34, height: 34, border: 'none',
                              background: '#ECFDF5', borderRadius: 8,
                              cursor: 'pointer', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <UserCheck style={{ width: 16, height: 16, color: '#10B981' }}/>
                          </button>
                        )}

                        <button
                          onClick={e => { e.stopPropagation(); handleSupprimer(agent.id) }}
                          title="Supprimer définitivement"
                          style={{
                            width: 34, height: 34, border: 'none',
                            background: '#FEF2F2', borderRadius: 8,
                            cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Trash2 style={{ width: 16, height: 16, color: '#EF4444' }}/>
                        </button>

                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Compteur résultats */}
            {!loading && agentsFiltres.length > 0 && (
              <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, marginTop: 16 }}>
                {agentsFiltres.length} agent(s) affiché(s) sur {agents.length}
              </p>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}
