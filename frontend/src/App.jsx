import ClaimPage from './components/ClaimPage'
import TrackingPage from './components/TrackingPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<ClaimPage />} />
        <Route path="/suivi" element={<TrackingPage />} />
        <Route path="/" element={<TrackingPage />} />
       
      </Routes>
    </BrowserRouter>
  )
}

export default App