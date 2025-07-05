import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useState, useEffect } from 'react'
import AddFriends from './AddFriends'
import { supabase } from '../lib/supabase.js'

const Navbar = () => {
  const { user, signOut, acceptFriendRequest, rejectFriendRequest } = useAuth()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAddFriends, setShowAddFriends] = useState(false)
  const [friendRequests, setFriendRequests] = useState([])
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Subscribe to pending friend requests
  useEffect(() => {
    let subscription
    const fetchRequests = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('friends')
        .select(`id, user_id, status, created_at, user:profiles!friends_user_id_fkey(id, name, email, avatar_url)`)
        .eq('friend_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (!error && data) setFriendRequests(data)
    }
    fetchRequests()
    if (user) {
      subscription = supabase
        .channel('friend_requests')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'friends', filter: `friend_id=eq.${user.id}` }, (payload) => {
          fetchRequests()
        })
        .subscribe()
    }
    return () => {
      if (subscription) supabase.removeChannel(subscription)
    }
  }, [user])

  const handleAccept = async (requestId) => {
    await acceptFriendRequest(requestId)
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId))
  }
  const handleReject = async (requestId) => {
    await rejectFriendRequest(requestId)
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  const isActive = (path) => location.pathname === path

  const handleSignOut = async () => {
    if (isSigningOut) return // Prevent multiple sign out attempts
    
    setIsSigningOut(true)
    try {
      await signOut()
      // Close any open modals/dropdowns
      setShowNotifications(false)
      setShowAddFriends(false)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsSigningOut(false)
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
              <>
                {/* Add Friends Button */}
                <button
                  onClick={() => setShowAddFriends(true)}
                  className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Friends
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    className="focus:outline-none"
                    onClick={() => setShowNotifications((v) => !v)}
                  >
                    <svg className="w-7 h-7 text-white hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {friendRequests.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-bounce">
                        {friendRequests.length}
                      </span>
                    )}
                  </button>
                  {/* Notifications Popup */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 p-4">
                      <h4 className="text-white font-bold mb-2">Friend Requests</h4>
                      {friendRequests.length === 0 ? (
                        <div className="text-gray-400 text-sm">No new friend requests</div>
                      ) : (
                        <ul className="space-y-2">
                          {friendRequests.map((req) => (
                            <li key={req.id} className="bg-slate-800 rounded-lg px-3 py-2 text-white text-sm flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {req.user.avatar_url ? (
                                    <img src={req.user.avatar_url} alt={req.user.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    req.user.name?.charAt(0) || req.user.email?.charAt(0) || 'U'
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold">{req.user.name || req.user.email}</div>
                                  <div className="text-gray-400 text-xs">wants to be your friend</div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleAccept(req.id)}
                                  className="bg-green-500 hover:bg-green-600 text-black px-2 py-1 rounded-full text-xs font-medium"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium"
                                >
                                  Reject
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className={`text-sm transition-colors ${
                    isSigningOut 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
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

      {/* Add Friends Popup */}
      <AddFriends 
        isOpen={showAddFriends} 
        onClose={() => setShowAddFriends(false)} 
      />
    </nav>
  )
}

export default Navbar
