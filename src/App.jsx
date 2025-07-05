import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import Navbar from './components/Navbar'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import RootRoute from './components/RootRoute'
import SpotifyCallback from './components/SpotifyCallback'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <div className="pt-16">
                  <RootRoute />
                </div>
              </>
            } />
            <Route 
              path="/login" 
              element={
                <>
                  <Navbar />
                  <div className="pt-16">
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  </div>
                </>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <>
                  <Navbar />
                  <div className="pt-16">
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  </div>
                </>
              } 
            />
            <Route 
              path="/callback" 
              element={
                <>
                  <Navbar />
                  <div className="pt-16">
                    <ProtectedRoute>
                      <SpotifyCallback />
                    </ProtectedRoute>
                  </div>
                </>
              } 
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
