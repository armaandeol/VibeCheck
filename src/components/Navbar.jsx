import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useState } from 'react'

const mockNotifications = [
  { id: 1, type: 'friend', message: 'Alex sent you a friend request.' },
  { id: 2, type: 'blend', message: 'Sarah invited you to a blend.' },
]

const Navbar = () => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-slate-700/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white">
              <span className="text-gradient">Vibe</span>Check
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  to="/" 
                  className={`text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-green-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/profile" 
                  className={`text-sm font-medium transition-colors ${
                    isActive('/profile') ? 'text-green-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Profile
                </Link>
              </>
            ) : (
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-green-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* User Menu + Notifications */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative">
                <button
                  className="focus:outline-none"
                  onClick={() => setShowNotifications((v) => !v)}
                >
                  <svg className="w-7 h-7 text-white hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {mockNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-bounce">
                      {mockNotifications.length}
                    </span>
                  )}
                </button>
                {/* Notifications Popup */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 p-4">
                    <h4 className="text-white font-bold mb-2">Notifications</h4>
                    {mockNotifications.length === 0 ? (
                      <div className="text-gray-400 text-sm">No new notifications</div>
                    ) : (
                      <ul className="space-y-2">
                        {mockNotifications.map((notif) => (
                          <li key={notif.id} className="bg-slate-800 rounded-lg px-3 py-2 text-white text-sm flex items-center">
                            {notif.type === 'friend' ? (
                              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            ) : (
                              <svg className="w-5 h-5 text-pink-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" /></svg>
                            )}
                            {notif.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn-primary text-sm px-4 py-2">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
