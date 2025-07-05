import { useAuth } from '../hooks/useAuth.jsx'
import HomePage from '../pages/HomePage'
import DashboardPage from '../pages/DashboardPage'

const RootRoute = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 animate-gradient-shift flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="spinner mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-white mb-4 text-gradient">VibeCheck</h1>
          <p className="text-blue-200 text-lg">Loading your vibe...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  // If user is signed in, show HomePage
  if (user) {
    return <HomePage />
  }

  // If user is signed out, show DashboardPage
  return <DashboardPage />
}

export default RootRoute
