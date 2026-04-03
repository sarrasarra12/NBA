









import React from "react";
import { Menu, Search, Filter,Plus, Bell,Settings, ChevronDown } from "lucide-react";
import Img  from '../assets/img.jpg'

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Header component, displays the title of the page and quick actions
 * for the user, such as creating a new item or viewing notifications.
 *
 * @returns {React.Component} The header component
 */

/*******  c7fe0679-4162-4398-9a9c-e32ee6a76795  *******/
export default function Header() {
    return (
        <div className="bg-white/-80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Menu className="w-5 h-5"/>
                </button>
                <div className="hidden md:block">
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">Dashboard</h1>
                    <p >Welcome back Sarra ! Here's what happened today!</p>
                </div>
            </div>
            {/*Centre*/}
            <div className="flex-1 max-w-md mx-auto">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></Search>
                    <input type="text" placeholder="Cherchez ce que vous voulais!" className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 rounded-xl text-slate-800" />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <Filter/>
                    </button>
                </div>
            </div>
            {/*Right */}
            <div className="flex items-center space-x-3">
                {/*Quick actions*/}
                <button className="hidden lg:flex items-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-500 to purple-600 text-white rounded-xl hover:shadow-lg transition-all">
                    <Plus className="w-4 h-4" />New
                </button>
            {/*toggle*/}
            {/*Notifications*/ }
        <button className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className ="w-5 h-5"></Bell>
            <span className="absolute -top-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
        </button>
        {/*Settings */}
        <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <Settings className="w-5 h-5"></Settings>
        </button>
        {/**user profile */}
        <div className="flex items-center space-x pl-3 border-l border-slate-200 dark:border-slate-700">
            <img src={Img}
             alt="User"
             className="w-8 h-8 rounded-full ring-2 ring-blue-500" />
             <div className="hidden md:block">
                <p className="text-sm font-meduim text-slate-500 dark:text-slate-400">Sarra ourajini</p>
                <p>Administrateur</p>
             </div>
         {/**chevron down */}
            <ChevronDown className="w-5 h-5" text-slate-400></ChevronDown>

        </div>

            </div>

        </div>
    );
}
