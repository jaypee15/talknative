import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import RequireAuth from './components/RequireAuth'
import MapDashboard from './pages/MapDashboard'
import WisdomDeckPage from './pages/WisdomDeckPage'

// Keep the old App as LegacyChat for backward compatibility
import LegacyChat from './LegacyChat'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <MapDashboard />
          </RequireAuth>
        }
      />
      <Route
      path='=/wisdom'
      element={
        <RequireAuth>
          <WisdomDeckPage />
        </RequireAuth>
      }
      />
      <Route
        path="/chat/:id"
        element={
          <RequireAuth>
            <ChatPage />
          </RequireAuth>
        }
      />
      
      {/* Legacy POC route - keep for testing */}
      <Route path="/legacy" element={<LegacyChat />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
