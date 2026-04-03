// src/Dashboards/Sidebar.jsx

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logoImg from '../assets/images.png'

import AdminImg   from '../assets/img.jpg'
import BagageImg  from '../assets/10777569.png'
import CallImg    from '../assets/w.webp'
import ServiceImg from '../assets/n.jpg'

import {
  LayoutDashboard, FileText, Users,
  Settings, AlertTriangle, LogOut, ChevronDown
} from "lucide-react"

const allMenuItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    roles: ["ADMIN", "AGENT"],
    path: null  // dynamique selon rôle
  },
  {
    id: "reclamations",
    icon: FileText,
    label: "Réclamations",
    roles: ["ADMIN", "AGENT"],
    path: null  // dynamique selon rôle
  },
  {
    id: "urgent",
    icon: AlertTriangle,
    label: "Urgentes",
    roles: ["ADMIN", "AGENT"],
    path: null,
    badge: "2"
  },
  {
    id: "agents",
    icon: Users,
    label: "Agents",
    roles: ["ADMIN"],
    path: "/admin/agents"  // ← gestion agents
  },
  {
    id: "parametres",
    icon: Settings,
    label: "Paramètres",
    roles: ["ADMIN"],
    path: "/admin/parametres"  // ← gestion dept + catégories
  },
]

export default function Sidebar() {

  const navigate              = useNavigate()
  const [openSub, setOpenSub] = useState(null)

  const [nom,  setNom]  = useState(localStorage.getItem('nom')         || 'Agent')
  const [role, setRole] = useState(localStorage.getItem('role')        || 'AGENT')
  const [dept, setDept] = useState(localStorage.getItem('departement') || '')

  useEffect(() => {
    setNom(localStorage.getItem('nom')         || 'Agent')
    setRole(localStorage.getItem('role')       || 'AGENT')
    setDept(localStorage.getItem('departement')|| '')
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

  const handleClick = (item) => {
    if (item.submenu) {
      setOpenSub(openSub === item.id ? null : item.id)
      return
    }

    if (item.path) {
      navigate(item.path)
      return
    }

    // Path null → dynamique
    if (item.id === 'dashboard' || item.id === 'reclamations') {
      navigate(getRoute())
    }
  }

  return (
    <div className="h-screen w-64 transition duration-300 ease-in-out bg-blue-200/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col relative z-10">

      {/* ── LOGO ─────────────────────────────────────── */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            <img src={logoImg} alt="logo" className="w-10 h-10 rounded-xl"/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">NouvelAir</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{getPanelLabel()}</p>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION ───────────────────────────────── */}
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
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.submenu && (
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSub === item.id ? 'rotate-180' : ''}`}/>
                )}
              </div>
            </button>

            {item.submenu && openSub === item.id && (
              <div className="ml-8 mt-1 space-y-1">
                {item.submenu.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => navigate(sub.path)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ── LOGOUT ───────────────────────────────────── */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50">
          <img src={getUserImg()} alt="user" className="w-10 h-10 rounded-full ring-2 ring-blue-500"/>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{nom}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{getPanelLabel()}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Déconnexion">
            <LogOut className="w-4 h-4"/>
          </button>
        </div>
      </div>

    </div>
  )
}
