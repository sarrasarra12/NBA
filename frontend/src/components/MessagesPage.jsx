import { useState, useEffect } from "react"
import Sidebar from "../Dashboards/Sidebar"
import Header from "../Dashboards/Header"
import { Send, Inbox, RefreshCw } from "lucide-react"

export default function MessagesPage() {

  // ── Token JWT pour authentification ────────────
  const token = localStorage.getItem('token')

  // ── États de la page ───────────────────────────
  const [agents,           setAgents]           = useState([])    // liste des agents disponibles
  const [messages,         setMessages]         = useState([])    // messages reçus (inbox)
  const [onglet,           setOnglet]           = useState('inbox') // onglet actif : inbox ou nouveau
  const [destinataire,     setDestinataire]     = useState('')    // agent destinataire sélectionné
  const [contenu,          setContenu]          = useState('')    // contenu du message à envoyer
  const [loading,          setLoading]          = useState(false) // chargement inbox
  const [sending,          setSending]          = useState(false) // envoi en cours
  const [success,          setSuccess]          = useState(false) // message envoyé avec succès
  const [transfertId,      setTransfertId]      = useState(null)  // id du message en cours de transfert
  const [transfertAgent,   setTransfertAgent]   = useState('')    // agent destinataire du transfert
  const [transfertLoading, setTransfertLoading] = useState(false) // transfert en cours
  const [transfertSuccess, setTransfertSuccess] = useState(false) // transfert réussi

  // ══════════════════════════════════════════════
  // FONCTION TRANSFERT
  // Transfère un message reçu vers un autre agent
  // ══════════════════════════════════════════════
  const transfererMessage = async (message) => {

    // Sécurité : sortir si aucun agent sélectionné
    if (!transfertAgent) return

    // Activer le spinner sur le bouton
    setTransfertLoading(true)

    try {
      // Appel API → même endpoint que envoyer message
      // On crée un nouveau message avec le contenu original
      const res = await fetch('http://localhost:8000/api/messages', {
        method : 'POST',
        headers: {
          Authorization : `Bearer ${token}`, // authentification
          'Content-Type': 'application/json' // format JSON
        },
        body: JSON.stringify({
          // parseInt car le select retourne une String
          destinataire_id: parseInt(transfertAgent),

          // Contenu préfixé [Transféré] pour identifier
          // que c'est un message transféré et non original
          // Ex: [Transféré] Mohamed Ali : "Mon vol BJ502..."
          contenu: `[Transféré] ${message.expediteur.prenom} ${message.expediteur.nom} : ${message.contenu}`
        })
      })

      // Si succès → réinitialiser et afficher confirmation
      if (res.ok) {
        setTransfertId(null)    // fermer le panel de transfert
        setTransfertAgent('')   // réinitialiser le select
        setTransfertSuccess(true)
        // Masquer le message de succès après 3 secondes
        setTimeout(() => setTransfertSuccess(false), 3000)
      }

    } catch (e) {
      // Erreur réseau ou serveur → afficher dans console
      console.error(e)

    } finally {
      // S'exécute TOUJOURS (succès ou échec)
      // Désactiver le spinner
      setTransfertLoading(false)
    }
  }

  // ══════════════════════════════════════════════
  // CHARGER LISTE DES AGENTS
  // Pour les selects destinataire et transfert
  // ══════════════════════════════════════════════
  useEffect(() => {
    fetch('http://localhost:8000/api/messages/agents', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => setAgents(Array.isArray(data) ? data : []))
    .catch(() => {})
  }, []) // [] = une seule fois au chargement

  // ══════════════════════════════════════════════
  // CHARGER INBOX AU DÉMARRAGE
  // ══════════════════════════════════════════════
  useEffect(() => {
    chargerMessages()
  }, []) // [] = une seule fois au chargement

  // ══════════════════════════════════════════════
  // FONCTION CHARGER MESSAGES
  // Récupère tous les messages reçus par l'agent
  // ══════════════════════════════════════════════
  const chargerMessages = () => {
    setLoading(true)
    fetch('http://localhost:8000/api/messages/inbox', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      setMessages(Array.isArray(data) ? data : [])
      setLoading(false)
    })
    .catch(() => setLoading(false))
  }

  // ══════════════════════════════════════════════
  // FONCTION MARQUER LU
  // Appelée quand l'agent clique sur un message non lu
  // Met à jour en DB et localement (sans recharger)
  // ══════════════════════════════════════════════
  const marquerLu = (id) => {
    // Appel API pour mettre lu=true en DB
    fetch(`http://localhost:8000/api/messages/${id}/lu`, {
      method : 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      // Mise à jour locale sans rechargement complet
      // prev = état actuel des messages
      setMessages(prev =>
        prev.map(m => m.id === id ? { ...m, lu: true } : m)
      )
    })
    .catch(() => {})
  }

  // ══════════════════════════════════════════════
  // FONCTION ENVOYER MESSAGE
  // Envoie un nouveau message à un agent
  // ══════════════════════════════════════════════
  const envoyerMessage = async () => {
    // Sécurité : vérifier destinataire et contenu
    if (!destinataire || !contenu.trim()) return

    setSending(true) // activer spinner
    try {
      const res = await fetch('http://localhost:8000/api/messages', {
        method : 'POST',
        headers: {
          Authorization : `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          destinataire_id: parseInt(destinataire),
          contenu        : contenu
        })
      })

      if (res.ok) {
        // Réinitialiser le formulaire
        setContenu("")
        setDestinataire("")
        // Afficher confirmation 3 secondes
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        // Recharger inbox pour voir le nouveau message
        chargerMessages()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false) // désactiver spinner
    }
  }

  // ══════════════════════════════════════════════
  // RENDU JSX
  // ══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Messagerie interne" />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">

              {/* ── ONGLETS ───────────────────────────────── */}
              <div className="flex gap-3 mb-6">

                {/* Onglet Réception */}
                <button
                  onClick={() => setOnglet('inbox')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${onglet === 'inbox' ? 'bg-[#0A1628] text-white' : 'bg-white text-slate-600 border border-gray-200'}`}
                >
                  <Inbox className="w-4 h-4"/>
                  Réception
                  {/* Badge nombre de messages non lus */}
                  {messages.filter(m => !m.lu).length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {messages.filter(m => !m.lu).length}
                    </span>
                  )}
                </button>

                {/* Onglet Nouveau message */}
                <button
                  onClick={() => setOnglet('nouveau')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${onglet === 'nouveau' ? 'bg-[#0A1628] text-white' : 'bg-white text-slate-600 border border-gray-200'}`}
                >
                  <Send className="w-4 h-4"/>
                  Nouveau message
                </button>

                {/* Bouton rafraîchir inbox */}
                <button
                  onClick={chargerMessages}
                  className="ml-auto p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500"/>
                </button>
              </div>

              {/* ── INBOX ─────────────────────────────────── */}
              {onglet === 'inbox' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                  {/* Message succès transfert — affiché en haut */}
                  {transfertSuccess && (
                    <div className="px-5 py-3 bg-green-50 border-b border-green-100">
                      <p className="text-green-600 text-sm font-medium">
                        ✅ Message transféré avec succès !
                      </p>
                    </div>
                  )}

                  {/* État chargement */}
                  {loading ? (
                    <div className="text-center py-20 text-slate-400">
                      Chargement...
                    </div>

                  /* Inbox vide */
                  ) : messages.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30"/>
                      <p>Aucun message reçu</p>
                    </div>

                  /* Liste des messages */
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {messages.map(m => (
                        <div key={m.id}>

                          {/* ── Contenu du message ── */}
                          <div
                            onClick={() => !m.lu && marquerLu(m.id)}
                            className={`p-5 cursor-pointer hover:bg-slate-50 transition-all ${!m.lu ? 'bg-blue-50' : ''}`}
                          >
                            {/* En-tête : avatar + nom + date */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {/* Avatar avec initiales de l'expéditeur */}
                                <div className="w-9 h-9 rounded-full bg-[#0A1628] flex items-center justify-center text-white text-sm font-bold">
                                  {m.expediteur.prenom[0]}{m.expediteur.nom[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {m.expediteur.prenom} {m.expediteur.nom}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {m.expediteur.role}
                                  </p>
                                </div>
                              </div>

                              {/* Date + indicateur non lu (point bleu) */}
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

                            {/* Contenu du message — gras si non lu */}
                            <p className={`text-sm ml-12 mb-3 ${!m.lu ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                              {m.contenu}
                            </p>

                            {/* Bouton Transférer */}
                            <div className="ml-12">
                              <button
                                onClick={e => {
                                  e.stopPropagation() // évite de déclencher marquerLu
                                  // Toggle panel : ouvre si fermé, ferme si ouvert
                                  setTransfertId(transfertId === m.id ? null : m.id)
                                  setTransfertAgent('') // réinitialiser le select
                                }}
                                className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                              >
                                ↪ Transférer
                              </button>
                            </div>
                          </div>

                          {/* ── Panel transfert ── */}
                          {/* Affiché uniquement si ce message est sélectionné */}
                          {transfertId === m.id && (
                            <div className="px-5 pb-4 bg-blue-50 border-t border-blue-100">
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 pt-3">
                                Transférer à :
                              </p>

                              <div className="flex gap-2">
                                {/* Select agent destinataire */}
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

                                {/* Bouton confirmer transfert */}
                                <button
                                  onClick={() => transfererMessage(m)}
                                  disabled={!transfertAgent || transfertLoading}
                                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                  style={{
                                    background: transfertAgent ? '#0A1628' : '#f0f0f0',
                                    color     : transfertAgent ? 'white'   : '#bbb',
                                    cursor    : transfertAgent ? 'pointer' : 'not-allowed'
                                  }}
                                >
                                  {transfertLoading ? 'Envoi...' : 'Envoyer'}
                                </button>

                                {/* Bouton annuler transfert */}
                                <button
                                  onClick={() => setTransfertId(null)}
                                  className="px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-gray-100 transition-all"
                                >
                                  Annuler
                                </button>
                              </div>

                              {/* Aperçu du message qui sera transféré */}
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

              {/* ── NOUVEAU MESSAGE ───────────────────────── */}
              {onglet === 'nouveau' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-6">
                    Nouveau message
                  </h3>

                  {/* Select destinataire */}
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

                  {/* Zone de texte message */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                      Message
                    </label>
                    <textarea
                      value={contenu}
                      onChange={e => setContenu(e.target.value)}
                      placeholder="Écrivez votre message..."
                      rows={5}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[#0A1628] focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Message succès envoi */}
                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                      <p className="text-green-600 text-sm font-medium">
                        ✅ Message envoyé avec succès !
                      </p>
                    </div>
                  )}

                  {/* Bouton envoyer — désactivé si champs vides */}
                  <button
                    onClick={envoyerMessage}
                    disabled={!destinataire || !contenu.trim() || sending}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{
                      background: destinataire && contenu.trim() ? '#0A1628' : '#f0f0f0',
                      color     : destinataire && contenu.trim() ? 'white'   : '#bbb',
                      cursor    : destinataire && contenu.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {sending ? (
                      <>
                        {/* Spinner pendant envoi */}
                        <span style={{
                          width       : "14px",
                          height      : "14px",
                          border      : "2px solid white",
                          borderTop   : "2px solid transparent",
                          borderRadius: "50%",
                          display     : "inline-block",
                          animation   : "spin 0.8s linear infinite"
                        }}/>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4"/>
                        Envoyer
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>

      {/* Animation spinner */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}