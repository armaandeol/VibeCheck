import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const handleHomeClick = () => {
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Left - VibeCheck Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🎵</span>
            </div>
            <span className="text-gray-900 text-xl font-bold">VibeCheck</span>
          </div>

          {/* Center - Home Link */}
          <button
            onClick={handleHomeClick}
            className="text-lg font-semibold text-gray-700 hover:text-purple-600 transition-colors"
          >
            Home
          </button>

          {/* Right - Navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={handleProfileClick}
                className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm">👤</span>
                )}
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
