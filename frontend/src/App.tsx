import { useState } from 'react'
import './App.css'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ProjectPage from './pages/ProjectPage.tsx'
import SurveyPage from './pages/SurveyPage.tsx'
import TokenPage from './pages/TokenPage.tsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Link } from 'lucide-react'

function App() {


  return (
  <Router>
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">MyGov DAO Frontend</h1>
      <ConnectButton />
      {/* Add your DAO components here */}
      <nav className="mb-4 space-x-4">
        <Link to="/" className="text-blue-500 hover:underline">Home</Link>
        <Link to="/projects" className="text-blue-500 hover:underline">Projects</Link>
        <Link to="/surveys" className="text-blue-500 hover:underline">Surveys</Link>
        <Link to="/tokens" className="text-blue-500 hover:underline">Tokens</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ProjectPage />} />
        <Route path="/projects" element={<ProjectPage />} />
        <Route path="/surveys" element={<SurveyPage />} />
        <Route path="/tokens" element={<TokenPage />} />
      </Routes>
    </div>
  </Router>
  )
}

export default App
