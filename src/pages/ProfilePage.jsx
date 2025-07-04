import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Navbar from '../components/Navbar.jsx'

const ProfilePage = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
      <Navbar />
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl">👤</span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.user_metadata?.full_name || 'Music Lover'}
                </h1>
                <p className="text-gray-600 text-lg">{user?.email}</p>
                <p className="text-gray-500 text-sm">
                  Member since {new Date(user?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Vibe Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Vibe Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Songs Analyzed</span>
                  <span className="font-semibold text-purple-600">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Playlists Created</span>
                  <span className="font-semibold text-purple-600">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vibe Score</span>
                  <span className="font-semibold text-purple-600">--</span>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-500 text-sm">Full Name</label>
                  <p className="text-gray-900">{user?.user_metadata?.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm">Provider</label>
                  <p className="text-gray-900 capitalize">{user?.app_metadata?.provider || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Music Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Music Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Songs Discovered</span>
                  <span className="font-semibold text-purple-600">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Listening Hours</span>
                  <span className="font-semibold text-purple-600">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Favorite Genre</span>
                  <span className="font-semibold text-purple-600">--</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors text-center">
                <div className="text-2xl mb-2">🎵</div>
                <span className="font-medium">Analyze New Song</span>
              </button>
              <button className="bg-indigo-500 text-white p-4 rounded-lg hover:bg-indigo-600 transition-colors text-center">
                <div className="text-2xl mb-2">📝</div>
                <span className="font-medium">Create Playlist</span>
              </button>
              <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors text-center">
                <div className="text-2xl mb-2">🔍</div>
                <span className="font-medium">Discover Music</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <p className="text-gray-500 text-lg">No recent activity</p>
              <p className="text-gray-400 text-sm mt-2">Start analyzing songs to see your activity here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
