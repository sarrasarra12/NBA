import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { VscAccount } from 'react-icons/vsc'
import logoImg from '../assets/images.png'

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className="bg-[#0A1628] px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50">
      
      {/* Logo cliquable */}
      <Link to="/" className="flex items-center gap-3">
        <img src={logoImg} alt="logo nouvelAir" className="h-8 w-auto sm:h-10"/>
        <span className="text-white font-bold text-lg sm:text-xl">
          Nouvel<span className="text-blue-400">Air</span>
        </span>
      </Link>

      {/* Icône compte → vers login */}
      <button onClick={() => navigate("/login")}>
        <VscAccount size={30} color="white" />
      </button>

    </nav>
  )
}
