import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthGuard } from './components/auth/AuthGuard'
import { Dashboard } from './pages/Dashboard'
import { InsightDetailPage } from './pages/InsightDetailPage'
import { DataInputPage } from './pages/DataInputPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/insight/:id" element={<InsightDetailPage />} />
          <Route path="/data-input" element={<DataInputPage />} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  )
}
