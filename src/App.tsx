import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthGuard } from './components/auth/AuthGuard'
import { Dashboard } from './pages/Dashboard'
import { InsightDetailPage } from './pages/InsightDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/insight/:id" element={<InsightDetailPage />} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  )
}
