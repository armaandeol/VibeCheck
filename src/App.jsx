import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import RootRoute from './components/RootRoute'
import SpotifyCallback from './components/SpotifyCallback'
import AuthCallback from './components/AuthCallback'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-black text-white flex flex-col">
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <main className="pt-16 flex-grow">
                  <RootRoute />
                </main>
                <Footer />
              </>
            } />
            <Route 
              path="/login" 
              element={
                <>
                  <Navbar />
                  <main className="pt-16 flex-grow">
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  </main>
                  <Footer />
                </>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <>
                  <Navbar />
                  <main className="pt-16 flex-grow">
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </>
              } 
            />
            <Route 
              path="/callback" 
              element={
                <>
                  <Navbar />
                  <main className="pt-16 flex-grow">
                    <ProtectedRoute>
                      <SpotifyCallback />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </>
              } 
            />
            <Route 
              path="/auth/callback" 
              element={<AuthCallback />} 
            />
            <Route path="*" element={
              <>
                <NotFoundPage />
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
