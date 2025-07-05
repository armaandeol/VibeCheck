import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import Chat from '../components/Chat'
import Profile from '../components/Profile'

const musicPersonality = {
  primaryGenre: 'Indie Rock',
  secondaryGenre: 'Electronic',
  mood: 'Energetic',
  listeningTime: '2.5 hours/day',
  topArtists: ['The Weeknd', 'Tame Impala', 'Daft Punk', 'Arctic Monkeys', 'Glass Animals'],
  topTracks: ['Blinding Lights', 'The Less I Know The Better', 'Get Lucky', 'Do I Wanna Know?', 'Heat Waves'],
  vibeScore: 87,
  diversityScore: 92,
  discoveryScore: 78
}

const recentActivity = [
  { id: 1, type: 'playlist', text: 'Created "Late Night Coding" playlist', time: '2 hours ago', icon: '🎵' },
  { id: 2, type: 'blend', text: 'Created blend with Sarah Kim', time: '1 day ago', icon: '🎭' },
  { id: 3, type: 'friend', text: 'Connected with Alex Chen', time: '3 days ago', icon: '👥' },
  { id: 4, type: 'mood', text: 'Mood analysis: Energetic & Focused', time: '1 week ago', icon: '🧠' },
  { id: 5, type: 'weather', text: 'Rainy day playlist generated', time: '1 week ago', icon: '🌧️' },
  { id: 6, type: 'achievement', text: 'Unlocked "Mood Master" achievement', time: '2 weeks ago', icon: '🏆' }
]

const ProfilePage = () => {
  const { user } = useAuth()
  const [showChat, setShowChat] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [animatedStats, setAnimatedStats] = useState({ playlists: 0, tracks: 0, friends: 0 })

  useEffect(() => {
    const animateStats = () => {
      const targetStats = { playlists: 127, tracks: 2400, friends: 23 }
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        const easeOut = 1 - Math.pow(1 - progress, 3)

        setAnimatedStats({
          playlists: Math.floor(targetStats.playlists * easeOut),
          tracks: Math.floor(targetStats.tracks * easeOut),
          friends: Math.floor(targetStats.friends * easeOut)
        })

        if (currentStep >= steps) {
          clearInterval(interval)
          setAnimatedStats(targetStats)
        }
      }, stepDuration)

      return () => clearInterval(interval)
    }

    animateStats()
  }, [])

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-dashboard flex items-center justify-center relative overflow-hidden">
      {/* Enhanced Floating Elements */}
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto p-8">
        {/* Header Section */}
        <div className="card-glass mb-8 p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-6xl font-bold mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20 animate-pulse"></div>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">
                {user?.email || 'Music Lover'}
              </h1>
              <p className="text-gray-300 mb-4 text-lg">VibeCheck Member • Premium</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  Level 8
                </span>
                <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                  {musicPersonality.mood}
                </span>
                <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                  {musicPersonality.primaryGenre}
                </span>
              </div>
            </div>

            {/* Chat Button */}
            <div className="flex flex-col gap-3">
              <button
                className="btn-primary px-6 py-3 text-lg"
                onClick={() => setShowChat(true)}
              >
                💬 Chat
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-gradient mb-2">
              {formatNumber(animatedStats.playlists)}
            </div>
            <div className="text-gray-400 text-sm">Playlists Created</div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div className="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-gradient mb-2">
              {formatNumber(animatedStats.tracks)}
            </div>
            <div className="text-gray-400 text-sm">Tracks Discovered</div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
          <div className="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-gradient mb-2">
              {animatedStats.friends}
            </div>
            <div className="text-gray-400 text-sm">Friends Connected</div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '67%' }}></div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-800/50 rounded-xl p-1">
          {['profile', 'overview', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="lg:col-span-3">
              <Profile />
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Music Personality */}
              <div className="lg:col-span-3">
                <div className="card-glass p-6">
                  <h3 className="text-3xl font-bold text-white mb-8 flex items-center">
                    🎵 Music Personality
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex flex-wrap gap-3 mb-6">
                        <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-base font-medium">{musicPersonality.mood}</span>
                        <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-base font-medium">{musicPersonality.primaryGenre}</span>
                        <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-base font-medium">{musicPersonality.secondaryGenre}</span>
                      </div>
                      <div className="text-gray-300 mb-6 text-lg">Listening: {musicPersonality.listeningTime}</div>
                      
                      {/* Vibe Scores */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-base mb-2">
                            <span className="text-white font-semibold">Vibe Score</span>
                            <span className="text-green-400 font-bold">{musicPersonality.vibeScore}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-3">
                            <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full" style={{ width: `${musicPersonality.vibeScore}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-base mb-2">
                            <span className="text-white font-semibold">Diversity</span>
                            <span className="text-blue-400 font-bold">{musicPersonality.diversityScore}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-3">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" style={{ width: `${musicPersonality.diversityScore}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-base mb-2">
                            <span className="text-white font-semibold">Discovery</span>
                            <span className="text-purple-400 font-bold">{musicPersonality.discoveryScore}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-3">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: `${musicPersonality.discoveryScore}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-6">
                        <div className="font-bold text-white mb-4 text-xl">Top Artists:</div>
                        <ul className="space-y-2">
                          {musicPersonality.topArtists.map((artist, i) => (
                            <li key={i} className="text-gray-300 text-base flex items-center">
                              <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3 text-sm flex items-center justify-center text-white font-bold">
                                {i + 1}
                              </span>
                              {artist}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-bold text-white mb-4 text-xl">Top Tracks:</div>
                        <ul className="space-y-2">
                          {musicPersonality.topTracks.map((track, i) => (
                            <li key={i} className="text-gray-300 text-base flex items-center">
                              <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 text-sm flex items-center justify-center text-white font-bold">
                                {i + 1}
                              </span>
                              {track}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="lg:col-span-3">
              <div className="card-glass p-6">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  📈 Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="flex items-center space-x-4 bg-slate-800/60 rounded-xl p-4 hover:bg-slate-800/80 transition-colors duration-300">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-white text-xl">
                        {act.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{act.text}</div>
                        <div className="text-gray-400 text-sm">{act.time}</div>
                      </div>
                      <div className="text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat Popup */}
      {showChat && (
        <Chat
          selectedFriend={null}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}

export default ProfilePage
