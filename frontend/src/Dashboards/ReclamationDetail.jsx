import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { ArrowLeft, Clock, CheckCircle, Send, Cpu, UserCheck } from 'lucide-react'

export default function ReclamationDetail() {

  const { id }   = useParams()
  const navigate = useNavigate()
  const token    = localStorage.getItem('token')

  const [rec, setRec]                 = useState(null)
  const [loading, setLoading]         = useState(true)
  const [reponse, setReponse]         = useState('')
  const [sending, setSending]         = useState(false)
  const [loadingIA, setLoadingIA]     = useState(false)
  const [typeReponse, setTypeReponse] = useState('humaine')
  const [popup, setPopup]             = useState({ show: false, type: '', message: '' })

  // ── Popup ──────────────────────────────────────
  const showPopup = (type, message) => {
    setPopup({ show: true, type, message })
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 4000)
  }

  // ── Charger réclamation ────────────────────────
  useEffect(() => {
    fetch(`http://localhost:8000/api/agent/reclamations/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { setRec(data); setLoading(false) })
    .catch(() => setLoading(false))
  }, [id])

  // ── Changer statut ─────────────────────────────
  const changerStatut = async (statut) => {
    await fetch(
      `http://localhost:8000/api/agent/reclamations/${id}/statut?statut=${statut}`,
      { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }
    )
    setRec({ ...rec, statut })
    showPopup('success', `Statut changé vers ${statut}`)
  }

  // ── Générer réponse IA ─────────────────────────
  const genererReponseIA = async () => {
    setLoadingIA(true)
    try {
      const res = await fetch(
        `http://localhost:8000/api/agent-ia/analyser/${id}`,
        { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }
      )
      const data = await res.json()
      if (data.reponse_ia) {
        setReponse(data.reponse_ia)
        showPopup('success', 'Réponse IA générée !')
      }
    } catch (e) {
      showPopup('error', 'Erreur génération IA')
    }
    setLoadingIA(false)
  }

  // ── Envoyer réponse ────────────────────────────
  const envoyerReponse = async () => {
    if (!reponse.trim()) return
    setSending(true)
    try {
      const res = await fetch(
        `http://localhost:8000/api/agent/reclamations/${id}/repondre`,
        {
          method : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify({
            reponse     : reponse,
            type_reponse: typeReponse  // "humaine" ou "ia"
          })
        }
      )
      if (res.ok) {
        showPopup('success', '✅ Réponse envoyée au passager !')
        setTimeout(() => navigate(-1), 2000)
      } else {
        const err = await res.json()
        showPopup('error', err.detail || 'Erreur envoi réponse')
      }
    } catch (e) {
      showPopup('error', 'Erreur réseau')
    }
    setSending(false)
  }

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'NOUVELLE'   : return 'bg-blue-100 text-blue-700'
      case 'EN_ANALYSE' : return 'bg-yellow-100 text-yellow-700'
      case 'CLOTURED'   : return 'bg-green-100 text-green-700'
      default           : return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) return <div className="text-center py-20">⏳ Chargement...</div>
  if (!rec)    return <div className="text-center py-20">❌ Introuvable</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Détail réclamation" />

          {/* ── POPUP ───────────────────────────── */}
          {popup.show && (
            <div className={`fixed bottom-6 right-6 z-50 max-w-sm w-full shadow-xl rounded-2xl p-4 flex items-start gap-3
              ${popup.type === 'success' ? 'bg-green-50 border-2 border-green-300' : ''}
              ${popup.type === 'error'   ? 'bg-red-50 border-2 border-red-300'     : ''}
              ${popup.type === 'info'    ? 'bg-blue-50 border-2 border-blue-300'   : ''}
            `}>
              <span className="text-2xl">
                {popup.type === 'success' && '✅'}
                {popup.type === 'error'   && '❌'}
                {popup.type === 'info'    && 'ℹ️'}
              </span>
              <p className={`text-sm font-medium flex-1
                ${popup.type === 'success' ? 'text-green-800' : ''}
                ${popup.type === 'error'   ? 'text-red-800'   : ''}
                ${popup.type === 'info'    ? 'text-blue-800'  : ''}
              `}>{popup.message}</p>
              <button onClick={() => setPopup({ show: false, type: '', message: '' })} className="text-gray-400 font-bold text-lg">×</button>
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-6">

            {/* RETOUR */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4"/> Retour
            </button>

            {/* LAYOUT 2 COLONNES */}
            <div className="grid grid-cols-2 gap-6">

              {/* ═══ COLONNE GAUCHE ═══ */}
              <div className="flex flex-col gap-6">

                {/* INFORMATIONS */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="font-bold text-slate-800 text-lg mb-4">Informations</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-500">Passager</span>
                      <span className="font-medium">{rec.passager?.prenom} {rec.passager?.nom}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-500">Email</span>
                      <span>{rec.passager?.email}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-500">Téléphone</span>
                      <span>{rec.passager?.telephone}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-500">Vol</span>
                      <span className="font-medium">{rec.carte?.vol}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-500">Route</span>
                      <span>{rec.carte?.departure_airport} → {rec.carte?.arrival_airport}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-500">Date vol</span>
                      <span>{rec.carte?.departure_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reçu le</span>
                      <span>{new Date(rec.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="font-bold text-slate-800 text-lg mb-3">Description</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">{rec.description}</p>
                </div>

                {/* PIECES JOINTES */}
                {rec.pieces_jointes?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="font-bold text-slate-800 text-lg mb-3">Pièces jointes</h2>
                    <div className="flex gap-3 flex-wrap">
                      {rec.pieces_jointes.map((pj, i) => (
                        <a key={i} href={pj.url} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">
                          {pj.nom_fichier}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* ═══ COLONNE DROITE ═══ */}
              <div className="flex flex-col gap-6">

                {/* STATUT + ACTIONS */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="font-bold text-slate-800 text-lg mb-4">Statut actuel</h2>
                  <span className={`text-sm font-semibold px-4 py-2 rounded-full ${getStatutColor(rec.statut)}`}>
                    {rec.statut}
                  </span>

                  <h2 className="font-bold text-slate-800 text-lg mt-6 mb-4">Changer le statut</h2>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => changerStatut('EN_ANALYSE')}
                      disabled={rec.statut === 'EN_ANALYSE' || rec.statut === 'CLOTURED'}
                      className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Clock className="w-4 h-4"/> Mettre EN_ANALYSE
                    </button>
                    <button
                      onClick={() => changerStatut('CLOTURED')}
                      disabled={rec.statut === 'CLOTURED'}
                      className="flex items-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4"/> Clôturer la réclamation
                    </button>
                  </div>
                </div>

                {/* BLOC RÉPONSE */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
                  <h2 className="font-bold text-slate-800 text-lg">Répondre au passager</h2>

                  {/* Toggle humain / IA */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTypeReponse('humaine')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        typeReponse === 'humaine' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <UserCheck className="w-4 h-4"/> Manuelle
                    </button>
                    <button
                      onClick={() => setTypeReponse('ia')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        typeReponse === 'ia' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Cpu className="w-4 h-4"/> IA
                    </button>
                  </div>

                  {/* Bouton générer si mode IA */}
                  {typeReponse === 'ia' && (
                    <button
                      onClick={genererReponseIA}
                      disabled={loadingIA}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-all disabled:opacity-40"
                    >
                      <Cpu className="w-4 h-4"/>
                      {loadingIA ? 'Génération en cours...' : 'Générer réponse IA'}
                    </button>
                  )}

                  {/* Zone texte */}
                  <textarea
                    value={reponse}
                    onChange={(e) => setReponse(e.target.value)}
                    placeholder={
                      typeReponse === 'ia'
                        ? 'Cliquez sur "Générer réponse IA" pour générer automatiquement...'
                        : 'Rédigez votre réponse au passager...'
                    }
                    rows={15}
                    style={{ minHeight: '350px' }}
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm text-slate-700 resize-y focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />

                  {/* Bouton envoyer */}
                  <button
                    onClick={envoyerReponse}
                    disabled={sending || !reponse.trim()}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  >
                    <Send className="w-4 h-4"/>
                    {sending ? 'Envoi en cours...' : 'Envoyer la réponse'}
                  </button>
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
