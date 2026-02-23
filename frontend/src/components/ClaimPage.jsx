import Navbar from "./Navbar";
import heroImg from '../assets/avion.jpg'


export default function ClaimPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
<div className="bg-gradient-to-r from-[#0A1628] via-[#1E3A8A] to-[#1B4FD8] px-10 py-14 flex flex-row items-center justify-between">
  
  {/* TEXTE GAUCHE */}
  <div className="max-w-lg">
    <span className="inline-block bg-white/10 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
      ✈ Réclamations en ligne
    </span>
    <h1 className="text-4xl font-extrabold text-white mb-3">
      Déposer une <span className="text-blue-400">réclamation</span>
    </h1>
    <p className="text-gray-400 text-sm">
      Bénéficier d'un pré-remplissage automatique de votre formulaire en utilisant votre carte d'embarquement.
    </p>
  </div>

 
  <div className="w-110 h-5 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0"></div>
    <img src={heroImg} alt="Avion" className="w-full h-full object-cover" />
  </div>

</div>
  )
}