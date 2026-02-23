import ClaimPage from './components/ClaimPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClaimPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App