import React from "react"
import { Menu, Search, Filter, Bell, Settings, ChevronDown, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Img from '../assets/img.jpg'
import { Download } from "lucide-react"


export default function Header({ title, subtitle }) {

  const navigate = useNavigate()

  // ── Données dynamiques depuis localStorage ─────────
  const nom  = localStorage.getItem('nom')  || 'Agent'
  const role = localStorage.getItem('role') || 'AGENT'

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4 flex items-center justify-between">

      {/* GAUCHE */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Menu className="w-5 h-5"/>
        </button>
        <div className="hidden md:block">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">
            {title || 'Dashboard'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {subtitle || `Bienvenue ${nom} !`}
          </p>
        </div>
      </div>

      {/* CENTRE */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input
            type="text"
            placeholder="Rechercher une réclamation..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm outline-none"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400">
            <Filter className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* DROITE */}
      <div className="flex items-center space-x-3">

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5"/>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
        </button>

        {/* Settings */}
        <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Settings className="w-5 h-5"/>
        </button>

        {/* User */}
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        <Download className="w-4 h-4" />
        Exporter
        </button>
                {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl text-red-400 hover:bg-red-50 transition-colors"
          title="Déconnexion"
        >
          <LogOut className="w-5 h-5"/>
        </button>

      </div>
    </div>
  )
}