import { useState, useEffect } from "react"
import Sidebar from "../Dashboards/Sidebar"
import Header from "../Dashboards/Header"
import { Send, Inbox, RefreshCw, Trash2, Users } from "lucide-react"

export default function MessagesPage() {
  const token = localStorage.getItem('token')

  const [agents,           setAgents]           = useState([])
  const [messages,         setMessages]         = useState([])
  const [envoyes,          setEnvoyes]          = useState([])
  const [onglet,           setOnglet]           = useState('inbox')
  const [destinataire,     setDestinataire]     = useState('')
  const [contenu,          setContenu]          = useState('')
  const [broadcast,        setBroadcast]        = useState(false)
  const [loading,          setLoading]          = useState(false)
  const [loadingEnvoyes,   setLoadingEnvoyes]   = useState(false)
  const [sending,          setSending]          = useState(false)
  const [success,          setSuccess]          = useState(false)
  const [transfertId,      setTransfertId]      = useState(null)
  const [transfertAgent,   setTransfertAgent]   = useState('')
  const [transfertLoading, setTransfertLoading] = useState(false)
  const [transfertSuccess, setTransfertSuccess] = useState(false)
  const [confirmDelete,    setConfirmDelete]    = useState(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/messages/agents', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => setAgents(Array.isArray(data) ? data : []))
    .catch(() => {})
  }, [])

  useEffect(() => {
    chargerMessages()
    chargerEnvoyes()
  }, [])

  const chargerMessages = () => {
    setLoading(true)
    fetch('http://localhost:8000/api/messages/inbox', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => { setMessages(Array.isArray(data) ? data : []); setLoading(false) })
    .catch(() => setLoading(false))
  }

  const chargerEnvoyes = () => {
    setLoadingEnvoyes(true)
    fetch('http://localhost:8000/api/messages/sent', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => { setEnvoyes(Array.isArray(data) ? data : []); setLoadingEnvoyes(false) })
    .catch(() => setLoadingEnvoyes(false))
  }

  const marquerLu = (id) => {
    fetch(`http://localhost:8000/api/messages/${id}/lu`, {
      method : 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => setMessages(prev => prev.map(m => m.id === id ? { ...m, lu: true } : m)))
    .catch(() => {})
  }

  // ── Supprimer message ──────────────────────
  const supprimerMessage = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/messages/${id}`, {
        method : 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setEnvoyes(prev => prev.filter(m => m.id !== id))
        setConfirmDelete(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // ── Transférer message ─────────────────────
  const transfererMessage = async (message) => {
    if (!transfertAgent) return
    setTransfertLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/messages', {
        method : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          destinataire_id: parseInt(transfertAgent),
          contenu: `[Transféré] ${message.expediteur.prenom} ${message.expediteur.nom} : ${message.contenu}`
        })
      })
      if (res.ok) {
        setTransfertId(null)
        setTransfertAgent('')
        setTransfertSuccess(true)
        setTimeout(() => setTransfertSuccess(false), 3000)
        chargerEnvoyes()
      }
    } catch (e) { console.error(e) }
    finally { setTransfertLoading(false) }
  }

  // ── Envoyer message normal ou broadcast ────
  const envoyerMessage = async () => {
    if (!contenu.trim()) return
    if (!broadcast && !destinataire) return
    setSending(true)

    try {
      const url = broadcast
        ? 'http://localhost:8000/api/messages/broadcast'
        : 'http://localhost:8000/api/messages'

      const body = broadcast
        ? { contenu }
        : { destinataire_id: parseInt(destinataire), contenu }

      const res = await fetch(url, {
        method : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body   : JSON.stringify(body)
      })

      if (res.ok) {
        setContenu("")
        setDestinataire("")
        setBroadcast(false)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        chargerMessages()
        chargerEnvoyes()
      }
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Messagerie interne" />

          {/* ── CONFIRM SUPPRESSION ── */}
          {confirmDelete && (
            <div style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 50, display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                background: '#fff', borderRadius: 20,
                padding: '28px 24px', maxWidth: 360,
                width: '100%', margin: '0 16px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.2)'
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: '#FEE2E2', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', fontSize: 22
                }}>🗑️</div>
                <p style={{ fontWeight: 700, color: '#0F172A', textAlign: 'center', marginBottom: 8 }}>
                  Supprimer ce message ?
                </p>
                <p style={{ color: '#64748B', textAlign: 'center', fontSize: 13, marginBottom: 24 }}>
                  Cette action est irréversible.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    style={{
                      flex: 1, padding: '11px', background: '#F1F5F9',
                      border: 'none', borderRadius: 12, fontSize: 14,
                      fontWeight: 600, cursor: 'pointer', color: '#475569'
                    }}>
                    Annuler
                  </button>
                  <button
                    onClick={() => supprimerMessage(confirmDelete)}
                    style={{
                      flex: 1, padding: '11px', background: '#DC2626',
                      border: 'none', borderRadius: 12, fontSize: 14,
                      fontWeight: 600, cursor: 'pointer', color: '#fff'
                    }}>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">

              {/* ── ONGLETS ── */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setOnglet('inbox')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${onglet === 'inbox' ? 'bg-[#0A1628] text-white' : 'bg-white text-slate-600 border border-gray-200'}`}
                >
                  <Inbox className="w-4 h-4"/>
                  Réception
                  {messages.filter(m => !m.lu).length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {messages.filter(m => !m.lu).length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setOnglet('envoyes'); chargerEnvoyes() }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${onglet === 'envoyes' ? 'bg-[#0A1628] text-white' : 'bg-white text-slate-600 border border-gray-200'}`}
                >
                  <Send className="w-4 h-4"/>
                  Envoyés
                  {envoyes.length > 0 && (
                    <span className="bg-slate-400 text-white text-xs px-2 py-0.5 rounded-full">
                      {envoyes.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setOnglet('nouveau')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${onglet === 'nouveau' ? 'bg-[#0A1628] text-white' : 'bg-white text-slate-600 border border-gray-200'}`}
                >
                  <Send className="w-4 h-4"/>
                  Nouveau message
                </button>

                <button
                  onClick={() => { chargerMessages(); chargerEnvoyes() }}
                  className="ml-auto p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500"/>
                </button>
              </div>

              {/* ── INBOX ── */}
              {onglet === 'inbox' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {transfertSuccess && (
                    <div className="px-5 py-3 bg-green-50 border-b border-green-100">
                      <p className="text-green-600 text-sm font-medium">✅ Message transféré !</p>
                    </div>
                  )}
                  {loading ? (
                    <div className="text-center py-20 text-slate-400">Chargement...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30"/>
                      <p>Aucun message reçu</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {messages.map(m => (
                        <div key={m.id}>
                          <div
                            onClick={() => !m.lu && marquerLu(m.id)}
                            className={`p-5 cursor-pointer hover:bg-slate-50 transition-all ${!m.lu ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#0A1628] flex items-center justify-center text-white text-sm font-bold">
                                  {m.expediteur.prenom[0]}{m.expediteur.nom[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {m.expediteur.prenom} {m.expediteur.nom}
                                  </p>
                                  <p className="text-xs text-slate-400">{m.expediteur.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!m.lu && <span className="w-2 h-2 bg-blue-500 rounded-full"/>}
                                <span className="text-xs text-slate-400">
                                  {new Date(m.created_at).toLocaleDateString('fr-FR', {
                                    day: '2-digit', month: '2-digit',
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            <p className={`text-sm ml-12 mb-3 ${!m.lu ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                              {m.contenu}
                            </p>
                            <div className="ml-12">
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  setTransfertId(transfertId === m.id ? null : m.id)
                                  setTransfertAgent('')
                                }}
                                className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                              >
                                ↪ Transférer
                              </button>
                            </div>
                          </div>

                          {transfertId === m.id && (
                            <div className="px-5 pb-4 bg-blue-50 border-t border-blue-100">
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 pt-3">
                                Transférer à :
                              </p>
                              <div className="flex gap-2">
                                <select
                                  value={transfertAgent}
                                  onChange={e => setTransfertAgent(e.target.value)}
                                  className="flex-1 border-2 border-gray-100 rounded-xl px-3 py-2 text-sm focus:border-[#0A1628] focus:outline-none"
                                >
                                  <option value="">Choisir un agent...</option>
                                  {agents.map(a => (
                                    <option key={a.id} value={a.id}>
                                      {a.prenom} {a.nom} — {a.role}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => transfererMessage(m)}
                                  disabled={!transfertAgent || transfertLoading}
                                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                                  style={{
                                    background: transfertAgent ? '#0A1628' : '#f0f0f0',
                                    color: transfertAgent ? 'white' : '#bbb',
                                    cursor: transfertAgent ? 'pointer' : 'not-allowed',
                                    border: 'none'
                                  }}
                                >
                                  {transfertLoading ? 'Envoi...' : 'Envoyer'}
                                </button>
                                <button
                                  onClick={() => setTransfertId(null)}
                                  className="px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-gray-100"
                                  style={{ border: 'none', background: 'white', cursor: 'pointer' }}
                                >
                                  Annuler
                                </button>
                              </div>
                              <div className="mt-2 bg-white rounded-lg p-3 border border-blue-200">
                                <p className="text-xs text-slate-400 mb-1">Aperçu :</p>
                                <p className="text-xs text-slate-600">
                                  [Transféré] {m.expediteur.prenom} {m.expediteur.nom} : {m.contenu}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── ENVOYÉS ── */}
              {onglet === 'envoyes' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {loadingEnvoyes ? (
                    <div className="text-center py-20 text-slate-400">Chargement...</div>
                  ) : envoyes.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      <Send className="w-12 h-12 mx-auto mb-3 opacity-30"/>
                      <p>Aucun message envoyé</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {envoyes.map(m => (
                        <div key={m.id} className="p-5 hover:bg-slate-50 transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold">
                                {m.destinataire.prenom[0]}{m.destinataire.nom[0]}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  À : {m.destinataire.prenom} {m.destinataire.nom}
                                </p>
                                <p className="text-xs text-slate-400">{m.destinataire.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-400">
                                {new Date(m.created_at).toLocaleDateString('fr-FR', {
                                  day: '2-digit', month: '2-digit',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                              {/* Bouton supprimer */}
                              <button
                                onClick={() => setConfirmDelete(m.id)}
                                style={{
                                  width: 30, height: 30,
                                  background: '#FEF2F2', border: 'none',
                                  borderRadius: 8, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Supprimer"
                              >
                                <Trash2 style={{ width: 14, height: 14, color: '#EF4444' }}/>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 ml-12">{m.contenu}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── NOUVEAU MESSAGE ── */}
              {onglet === 'nouveau' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-6">Nouveau message</h3>

                  {/* Toggle broadcast */}
                  <div className="flex items-center gap-3 mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Users className="w-5 h-5 text-slate-500"/>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">Envoyer à tous les agents</p>
                      <p className="text-xs text-slate-400">Le message sera envoyé à tous les agents actifs</p>
                    </div>
                    <button
                      onClick={() => { setBroadcast(!broadcast); setDestinataire('') }}
                      style={{
                        width: 44, height: 24,
                        background: broadcast ? '#0A1628' : '#D1D5DB',
                        border: 'none', borderRadius: 12,
                        cursor: 'pointer', position: 'relative',
                        transition: 'background 0.2s'
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: 2, left: broadcast ? 22 : 2,
                        width: 20, height: 20,
                        background: 'white', borderRadius: '50%',
                        transition: 'left 0.2s'
                      }}/>
                    </button>
                  </div>

                  {/* Select destinataire — caché si broadcast */}
                  {!broadcast && (
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                        Destinataire
                      </label>
                      <select
                        value={destinataire}
                        onChange={e => setDestinataire(e.target.value)}
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[#0A1628] focus:outline-none transition-all"
                      >
                        <option value="">Choisir un destinataire...</option>
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.prenom} {a.nom} — {a.role}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Message */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                      Message
                    </label>
                    <textarea
                      value={contenu}
                      onChange={e => setContenu(e.target.value)}
                      placeholder={broadcast ? "Écrivez votre message à tous les agents..." : "Écrivez votre message..."}
                      rows={5}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[#0A1628] focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                      <p className="text-green-600 text-sm font-medium">✅ Message envoyé avec succès !</p>
                    </div>
                  )}

                  <button
                    onClick={envoyerMessage}
                    disabled={(!broadcast && !destinataire) || !contenu.trim() || sending}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{
                      background: (broadcast || destinataire) && contenu.trim() ? '#0A1628' : '#f0f0f0',
                      color     : (broadcast || destinataire) && contenu.trim() ? 'white'   : '#bbb',
                      cursor    : (broadcast || destinataire) && contenu.trim() ? 'pointer' : 'not-allowed',
                      border    : 'none'
                    }}
                  >
                    {sending ? (
                      <>
                        <span style={{
                          width: 14, height: 14,
                          border: '2px solid white', borderTop: '2px solid transparent',
                          borderRadius: '50%', display: 'inline-block',
                          animation: 'spin 0.8s linear infinite'
                        }}/>
                        Envoi...
                      </>
                    ) : (
                      <>
                        {broadcast ? <Users className="w-4 h-4"/> : <Send className="w-4 h-4"/>}
                        {broadcast ? 'Envoyer à tous' : 'Envoyer'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}