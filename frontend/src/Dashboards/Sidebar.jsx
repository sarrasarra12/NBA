// src/Dashboards/Sidebar.jsx

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logoImg from '../assets/images.png'

import AdminImg   from '../assets/img.jpg'
import BagageImg  from '../assets/10777569.png'
import CallImg    from '../assets/w.webp'
import ServiceImg from '../assets/n.jpg'
import { MessageSquare } from "lucide-react"
import {
  LayoutDashboard, FileText, Users,
  Settings, AlertTriangle, LogOut, ChevronDown
} from "lucide-react"

const allMenuItems = [
  {
    id   : "dashboard",
    icon : LayoutDashboard,
    label: "Dashboard",
    roles: ["ADMIN", "AGENT"],
    path : null,
  },
  {
    id     : "reclamations",
    icon   : FileText,
    label  : "Réclamations",
    roles  : ["ADMIN", "AGENT"],
    path   : null,
    submenu: [
      { id: "nouvelle",   label: "Nouvelles",  statut: "NOUVELLE",   color: "bg-blue-500" , roles: ["AGENT"] },
      { id: "en_analyse", label: "En analyse", statut: "EN_ANALYSE", color: "bg-yellow-500" , roles: ["AGENT"] },
      { id: "cloturee",   label: "Clôturées",  statut: "CLOTURED",   color: "bg-green-500"  , roles: ["AGENT"] },
    ]
  },
  {
    id   : "urgent",
    icon : AlertTriangle,
    label: "Urgentes",
    roles: ["AGENT"],
    path : null,
  },
  {
    id   : "agents",
    icon : Users,
    label: "Agents",
    roles: ["ADMIN"],
    path : "/admin/agents"
  },
  {
    id   : "parametres",
    icon : Settings,
    label: "Paramètres",
    roles: ["ADMIN"],
    path : "/admin/parametres"
  },
  {
  id   : "messages",
  icon : MessageSquare,
  label: "Messages",
  roles: ["ADMIN", "AGENT"],
  path : null,
  badge: null  // ← dynamique
},
]

export default function Sidebar() {

  const navigate              = useNavigate()
  const [openSub, setOpenSub] = useState(null)
  const [nom,     setNom]     = useState(localStorage.getItem('nom')         || 'Agent')
  const [role,    setRole]    = useState(localStorage.getItem('role')        || 'AGENT')
  const [dept,    setDept]    = useState(localStorage.getItem('departement') || '')
  const [nbUrgentes, setNbUrgentes] = useState(0)
  const [nbMessages, setNbMessages] = useState(0)
  useEffect(() => {
  const token = localStorage.getItem('token')
  if (!token) return

  fetch('http://localhost:8000/api/messages/non-lus', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => setNbMessages(data.count))
  .catch(() => {})
}, [])
  // ── Charger infos utilisateur ──────────────────
  useEffect(() => {
    setNom(localStorage.getItem('nom')          || 'Agent')
    setRole(localStorage.getItem('role')        || 'AGENT')
    setDept(localStorage.getItem('departement') || '')
  }, [])

  // ── Compter réclamations urgentes ──────────────
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch('http://localhost:8000/api/agent/reclamations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        const urgentes = data.filter(
          r => r.priorite === 'ELEVEE' && r.statut === 'NOUVELLE'
        )
        setNbUrgentes(urgentes.length)
      }
    })
    .catch(() => {})
  }, [])

  const getPanelLabel = () => {
    switch(dept) {
      case 'BAGAGE'        : return '🧳 Bagage'
      case 'CALL_CENTRE'   : return '📞 Call Centre'
      case 'SERVICE_CLIENT': return '✈️ Service Client'
      default              : return role === 'ADMIN' ? '⚙️ Admin Panel' : 'Agent Panel'
    }
  }

  const getUserImg = () => {
    if (role === 'ADMIN') return AdminImg
    switch(dept) {
      case 'BAGAGE'        : return BagageImg
      case 'CALL_CENTRE'   : return CallImg
      case 'SERVICE_CLIENT': return ServiceImg
      default              : return AdminImg
    }
  }

  const getRoute = () => {
    if (role === 'ADMIN') return '/admin'
    if (dept === 'BAGAGE') return '/agent/bagage'
    if (dept === 'CALL_CENTRE') return '/agent/callcenter'
    return '/agent/service'
  }

  const menuItems = allMenuItems.filter(item => item.roles.includes(role))

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const handleSubClick = (sub) => {
    navigate(`${getRoute()}?statut=${sub.statut}`)
  }

  const handleClick = (item) => {
    if (item.submenu) {
      setOpenSub(openSub === item.id ? null : item.id)
      return
    }
    if (item.id === 'messages') {
      navigate('/messages')
      return 
}
    if (item.path) {
      navigate(item.path)
      return
    }
    if (item.id === 'dashboard')    navigate(getRoute())
    if (item.id === 'reclamations') navigate(getRoute())
    if (item.id === 'urgent')       navigate(`${getRoute()}?priorite=ELEVEE`)
  }

  return (
    <div className="h-screen w-64 bg-blue-200/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col relative z-10">

      {/* ── LOGO ──────────────────────────────────── */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-3">
          <img src={logoImg} alt="logo" className="w-10 h-10 rounded-xl"/>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">NouvelAir</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{getPanelLabel()}</p>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION ────────────────────────────── */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => handleClick(item)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800 transition-all duration-200 text-slate-700 dark:text-slate-300"
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5"/>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Badge urgentes dynamique */}
                {item.id === 'urgent' && nbUrgentes > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {nbUrgentes}
                  </span>
                )}
                {item.id === 'messages' && nbMessages > 0 && (
                <span className="bg-blue-500 text-white
                                text-xs px-2 py-0.5 rounded-full">
                  {nbMessages}
                </span>
              )}
                {item.submenu && (
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSub === item.id ? 'rotate-180' : ''}`}/>
                )}
              </div>
            </button>

            {/* ── Sous-menu ── */}
            {item.submenu && openSub === item.id && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200/50 pl-4">
                {item.submenu.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSubClick(sub)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.color}`}/>
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ── LOGOUT ────────────────────────────────── */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50">
          <img src={getUserImg()} alt="user" className="w-10 h-10 rounded-full ring-2 ring-blue-500"/>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{nom}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{getPanelLabel()}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4"/>
          </button>
        </div>
      </div>

    </div>
  )
}