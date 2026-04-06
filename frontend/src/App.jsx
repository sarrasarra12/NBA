import ClaimPage from './components/ClaimPage'
import TrackingPage from './components/TrackingPage'
import LoginPage from './components/LoginPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Admin from './Dashboards/Admin'
import AgBagage from './Dashboards/AgBagage'
import Ag_callcenter   from './Dashboards/Ag_callcenter'
import AgService_client from './Dashboards/AgService_client'
import GestionAgents from './Dashboards/GestionAgents'
import ReclamationDetail from './Dashboards/ReclamationDetail'
import Parametres from './Dashboards/Parametres'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*<Route path="/" element={<Admin />} />*/}
        <Route path="/" element={<ClaimPage />} />
        <Route path="/suivi" element={<TrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/agent/bagage" element={<AgBagage />} />
        <Route path="/agent/callcenter" element={<Ag_callcenter />} />
        <Route path="/agent/service"  element={<AgService_client />} />
        <Route path="/admin/agents" element={<GestionAgents />} />
        <Route path="/reclamation/:id" element={<ReclamationDetail />} />
        <Route path="/admin/stats" element={<Admin />} />
        <Route path="/admin/parametres" element={<Parametres />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App