import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import Chat from '../components/Chat'
import Profile from '../components/Profile'
import SpotifyService from '../lib/spotify'

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
  const [spotifyData, setSpotifyData] = useState(null)
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false)
  const [recentSpotifyActivity, setRecentSpotifyActivity] = useState([])
  const [loadingSpotifyActivity, setLoadingSpotifyActivity] = useState(false)

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes";
    return Math.floor(seconds) + " seconds";
  };

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

  useEffect(() => {
    const loadSpotifyData = async () => {
      setLoadingSpotifyActivity(true)
      try {
        const connected = SpotifyService.isTokenValid()
        setIsSpotifyConnected(connected)
        console.log("Spotify Connected Status:", connected)
        
        if (connected) {
          const tokens = SpotifyService.getStoredTokens()
          console.log("Spotify Tokens:", tokens)
          
          const [topArtists, topTracks, profile, recentlyPlayed, savedTracks] = await Promise.all([
            SpotifyService.getTopArtists(tokens.access_token, 'medium_term', 5),
            SpotifyService.getTopTracks(tokens.access_token, 'medium_term', 5),
            SpotifyService.getUserProfile(tokens.access_token),
            SpotifyService.getRecentlyPlayed(tokens.access_token, 5),
            SpotifyService.getSavedTracks(tokens.access_token, 5)
          ])
          
          console.log("Fetched Top Artists:", topArtists.items)
          console.log("Fetched Top Tracks:", topTracks.items)
          console.log("Fetched Profile:", profile)
          console.log("Fetched Recently Played:", recentlyPlayed.items)
          console.log("Fetched Saved Tracks:", savedTracks.items)

          setSpotifyData({
            topArtists: topArtists.items || [],
            topTracks: topTracks.items || [],
            profile,
            recentlyPlayed: recentlyPlayed.items || [],
            savedTracks: savedTracks.items || []
          })

          const activity = []
          if (recentlyPlayed.items) {
            recentlyPlayed.items.forEach(item => {
              activity.push({
                id: item.played_at + item.track.id,
                type: 'played',
                text: `Listened to "${item.track.name}" by ${item.track.artists.map(a => a.name).join(', ')}`,
                time: item.played_at,
                icon: '🎧'
              })
            })
          }
          // You can add more activity types here, e.g., created playlists, followed artists
          setRecentSpotifyActivity(activity.sort((a, b) => new Date(b.time) - new Date(a.time)))

        } else {
          setSpotifyData(null)
          setRecentSpotifyActivity([])
        }
      } catch (error) {
        console.error('Error loading Spotify data:', error)
        // Optionally clear tokens if there's an auth error
        if (error.message.includes('Token expired') || error.message.includes('401')) {
          SpotifyService.clearTokens()
          localStorage.removeItem('spotify_profile')
          setIsSpotifyConnected(false)
        }
      } finally {
        setLoadingSpotifyActivity(false)
      }
    }

    loadSpotifyData()
  }, [activeTab, isSpotifyConnected]) // Re-run when activeTab changes or spotify connection status changes

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
                {isSpotifyConnected && spotifyData?.profile?.display_name ? spotifyData.profile.display_name : user?.email || 'Music Lover'}
              </h1>
              <p className="text-gray-300 mb-4 text-lg">
                {isSpotifyConnected ? `Spotify User • ${spotifyData?.profile?.product || 'Premium'}` : 'VibeCheck Member • Premium'}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  Level 8
                </span>
                <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                  {isSpotifyConnected && spotifyData?.profile?.country ? spotifyData.profile.country : musicPersonality.mood}
                </span>
                <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                  {isSpotifyConnected && spotifyData?.profile?.followers?.total ? `${formatNumber(spotifyData.profile.followers.total)} Followers` : musicPersonality.primaryGenre}
                </span>
                {isSpotifyConnected && (
                  <span className="px-4 py-2 bg-green-600/20 text-green-300 rounded-full text-sm font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.481.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Spotify Connected
                  </span>
                )}
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
              {isSpotifyConnected ? (spotifyData?.topArtists?.length || 0) : '—'}
            </div>
            <div className="text-gray-400 text-sm">
              {isSpotifyConnected ? 'Top Artists' : 'Connect Spotify'}
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{ width: isSpotifyConnected ? `${Math.min((spotifyData?.topArtists?.length || 0) * 5, 100)}%` : '0%' }}></div>
            </div>
          </div>
          <div className="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-gradient mb-2">
              {isSpotifyConnected ? (spotifyData?.topTracks?.length || 0) : '—'}
            </div>
            <div className="text-gray-400 text-sm">
              {isSpotifyConnected ? 'Top Tracks' : 'Connect Spotify'}
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: isSpotifyConnected ? `${Math.min((spotifyData?.topTracks?.length || 0) * 5, 100)}%` : '0%' }}></div>
            </div>
          </div>
          <div className="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-gradient mb-2">
              {isSpotifyConnected ? (spotifyData?.profile?.followers?.total || 0) : '—'}
            </div>
            <div className="text-gray-400 text-sm">
              {isSpotifyConnected ? 'Spotify Followers' : 'Connect Spotify'}
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: isSpotifyConnected ? `${Math.min((spotifyData?.profile?.followers?.total || 0) / 100, 100)}%` : '0%' }}></div>
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
              <Profile 
                isSpotifyConnected={isSpotifyConnected} 
                spotifyProfile={spotifyData?.profile} 
                spotifyTopArtists={spotifyData?.topArtists} 
                spotifyTopTracks={spotifyData?.topTracks}
              />
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
                  
                  {!isSpotifyConnected ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.481.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-3">Connect Spotify to See Your Music Personality</h4>
                      <p className="text-gray-300 mb-6 max-w-md mx-auto">
                        To see your personalized music stats, top artists, favorite tracks, and music personality analysis, connect your Spotify account.
                      </p>
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 mx-auto"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.481.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        Go to Profile to Connect
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div className="flex flex-wrap gap-3 mb-6">
                          <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-base font-medium">
                            {spotifyData?.profile?.country || 'Global'}
                          </span>
                          <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-base font-medium">
                            {spotifyData?.profile?.product || 'Spotify User'}
                          </span>
                          <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-base font-medium">
                            {spotifyData?.profile?.followers?.total || 0} Followers
                          </span>
                        </div>
                        <div className="text-gray-300 mb-6 text-lg">
                          Spotify Profile: {spotifyData?.profile?.display_name || 'Connected'}
                        </div>
                        
                        {/* Real Spotify Stats */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-base mb-2">
                              <span className="text-white font-semibold">Top Artists</span>
                              <span className="text-green-400 font-bold">{spotifyData?.topArtists?.length || 0}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3">
                              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full" style={{ width: `${Math.min((spotifyData?.topArtists?.length || 0) * 5, 100)}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-base mb-2">
                              <span className="text-white font-semibold">Top Tracks</span>
                              <span className="text-blue-400 font-bold">{spotifyData?.topTracks?.length || 0}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3">
                              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" style={{ width: `${Math.min((spotifyData?.topTracks?.length || 0) * 5, 100)}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-base mb-2">
                              <span className="text-white font-semibold">Music Variety</span>
                              <span className="text-purple-400 font-bold">
                                {spotifyData?.topArtists ? Math.min(spotifyData.topArtists.length * 20, 100) : 0}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3">
                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: `${spotifyData?.topArtists ? Math.min(spotifyData.topArtists.length * 20, 100) : 0}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="mb-6">
                          <div className="font-bold text-white mb-4 text-xl">Top Artists:</div>
                          <ul className="space-y-2">
                            {spotifyData?.topArtists?.map((artist, i) => (
                              <li key={i} className="text-gray-300 text-base flex items-center">
                                <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3 text-sm flex items-center justify-center text-white font-bold">
                                  {i + 1}
                                </span>
                                {artist.name}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Live from Spotify
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-white mb-4 text-xl">Top Tracks:</div>
                          <ul className="space-y-2">
                            {spotifyData?.topTracks?.map((track, i) => (
                              <li key={i} className="text-gray-300 text-base flex items-center">
                                <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 text-sm flex items-center justify-center text-white font-bold">
                                  {i + 1}
                                </span>
                                {track.name}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Live from Spotify
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                  {isSpotifyConnected && <span className="ml-2 text-sm text-green-400">(Spotify)</span>}
                </h3>
                {loadingSpotifyActivity ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  </div>
                ) : recentSpotifyActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentSpotifyActivity.map((act) => (
                      <div key={act.id} className="flex items-center space-x-4 bg-slate-800/60 rounded-xl p-4 hover:bg-slate-800/80 transition-colors duration-300">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-white text-xl">
                          {act.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{act.text}</div>
                          <div className="text-gray-400 text-sm">{timeAgo(act.time)} ago</div>
                        </div>
                        <div className="text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    {isSpotifyConnected ? (
                      <p>No recent Spotify activity found.</p>
                    ) : (
                      <p>Connect your Spotify account to see your recent listening activity!</p>
                    )}
                  </div>
                )}
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
