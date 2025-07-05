import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import Chat from '../components/Chat'
import LocationSelector from '../components/LocationSelector'
import WeatherSelector from '../components/WeatherSelector'
import MoodSelector from '../components/MoodSelector'
import SituationSelector from '../components/SituationSelector'
import songRecommendationAgent from '../Agents/songsrecommnedation.js'

const featureList = [
  {
    title: 'Geolocation',
    desc: 'Instantly fetches your location to personalize your vibe.',
    icon: (
      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0v8m0-8c-4.418 0-8 1.79-8 4v2a2 2 0 002 2h12a2 2 0 002-2v-2c0-2.21-3.582-4-8-4z"/></svg>
    )
  },
  {
    title: 'Weather Detection',
    desc: 'Real-time weather from OpenWeatherMap API.',
    icon: (
      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
    )
  },
  {
    title: 'Mood AI',
    desc: 'LLM interprets your mood from your environment.',
    icon: (
      <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0-16C7.03 4 2 7.03 2 12c0 4.97 5.03 8 10 8s10-3.03 10-8c0-4.97-5.03-8-10-8z"/></svg>
    )
  },
  {
    title: 'Spotify Playlist',
    desc: 'Curated playlist plays instantly via Spotify Web API.',
    icon: (
      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15c1.333-.667 4-.667 5.333 0M8 11c2-.667 6-.667 8 0"/></svg>
    )
  },
]

const HomePage = () => {
  const { user } = useAuth()
  const [showChat, setShowChat] = useState(false)
  const [vibeStep, setVibeStep] = useState(0)
  const [vibeActive, setVibeActive] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState({ lat: null, lng: null })
  const [selectedMood, setSelectedMood] = useState(null)
  const [selectedSituation, setSelectedSituation] = useState(null)
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false)
  const [playlist, setPlaylist] = useState(null)
  const [error, setError] = useState(null)

  const handleVibeCheck = async () => {
    // Check if required fields are selected
    if (!selectedLocation.lat || !selectedLocation.lng || !selectedMood) {
      console.log('Missing required fields for Vibe Check')
      return
    }

    // Collect all selected data
    const vibeData = {
      location: {
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      },
      mood: selectedMood,
      situation: selectedSituation, // Optional field
      timestamp: new Date().toISOString(),
      user: user?.email || 'anonymous'
    }

    console.log('🎵 VIBE CHECK DATA:', vibeData)
    
    // Reset error state
    setError(null)
    setIsLoadingPlaylist(true)
    
    try {
      // Prepare data for song recommendation agent
      const requestData = {
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        mood: selectedMood.name.toLowerCase(), // Convert mood to lowercase
        situationalMood: selectedSituation?.name || null // Use situation name if available
      }
      
      console.log('🎵 SENDING TO SONG AGENT:', requestData)
      
      // Call the song recommendation agent
      const playlistResult = await songRecommendationAgent(requestData)
      
      console.log('🎵 PLAYLIST RESULT:', playlistResult)
      
      // Store the playlist result
      setPlaylist(playlistResult)
      
      // Start the vibe check animation
      setVibeActive(true)
      setVibeStep(1)
      // Simulate each step with a delay
      setTimeout(() => setVibeStep(2), 1000)
      setTimeout(() => setVibeStep(3), 2000)
      setTimeout(() => setVibeStep(4), 3000)
      setTimeout(() => setVibeStep(5), 4000)
      
    } catch (error) {
      console.error('🚨 ERROR generating playlist:', error)
      setError(error.message || 'Failed to generate playlist')
    } finally {
      setIsLoadingPlaylist(false)
    }
  }

  const handleLocationChange = (lat, lng) => {
    setSelectedLocation({ lat, lng })
  }

  const handleMoodChange = (mood) => {
    setSelectedMood(mood)
  }

  const handleSituationChange = (situation) => {
    setSelectedSituation(situation)
  }

  return (
    <div className="min-h-screen bg-dashboard relative overflow-hidden">

      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center">
        {/* Location Selector Section */}
        <div className="w-full max-w-4xl mx-auto mb-16">
          <LocationSelector onLocationChange={handleLocationChange} />
        </div>

        {/* Weather Selector Section */}
        <div className="w-full max-w-4xl mx-auto mb-16">
          <WeatherSelector latitude={selectedLocation.lat} longitude={selectedLocation.lng} />
        </div>

        {/* Mood Selector Section */}
        <div className="w-full max-w-4xl mx-auto mb-16">
          <MoodSelector onMoodChange={handleMoodChange} />
        </div>

        {/* Situation Selector Section */}
        <div className="w-full max-w-4xl mx-auto mb-16">
          <SituationSelector onSituationChange={handleSituationChange} />
        </div>

        {/* Vibe Check Button Section */}
        <div className="w-full max-w-4xl mx-auto mb-16 text-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200">
            <div className="text-4xl mb-4">🎵</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready for Your Vibe Check?</h3>
            
            {/* Required Fields Check */}
            {(!selectedLocation.lat || !selectedLocation.lng || !selectedMood) ? (
              <div className="mb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium">Required fields missing</span>
                  </div>
                  <div className="mt-2 text-sm text-amber-600">
                    Please complete the following before your vibe check:
                    <ul className="mt-2 space-y-1">
                      {(!selectedLocation.lat || !selectedLocation.lng) && (
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                          Select a location on the map
                        </li>
                      )}
                      {!selectedMood && (
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                          Choose your current mood
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                <button
                  disabled
                  className="bg-gray-300 text-gray-500 px-8 py-4 rounded-xl text-lg font-semibold cursor-not-allowed"
                >
                  Complete Required Fields First
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="text-xl">✅</span>
                    <span className="font-medium">All set!</span>
                  </div>
                  <div className="mt-2 text-sm text-green-600">
                    Location and mood selected. Ready to generate your personalized vibe!
                  </div>
                </div>
                <button
                  onClick={handleVibeCheck}
                  disabled={isLoadingPlaylist}
                  className={`${
                    isLoadingPlaylist 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                  } text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200`}
                >
                  {isLoadingPlaylist ? (
                    <>
                      <span className="inline-block animate-spin mr-2">🎵</span>
                      Generating Playlist...
                    </>
                  ) : (
                    '🎵 Start Vibe Check'
                  )}
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <span className="text-xl">❌</span>
                    <span className="font-medium">Error generating playlist</span>
                  </div>
                  <div className="mt-2 text-sm text-red-600">
                    {error}
                  </div>
                </div>
              </div>
            )}

            {/* Playlist Results */}
            {playlist && (
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 mb-4">
                    <span className="text-xl">🎵</span>
                    <span className="font-medium">Your Personalized Playlist</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {playlist.playlist.map((song, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="font-medium text-gray-800">{song.title}</div>
                        <div className="text-gray-600">by {song.artist}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Summary of Selected Data */}
            <div className="text-left">
              <h4 className="font-semibold text-gray-800 mb-3">Your Selections:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-700">📍 Location</div>
                  <div className="text-gray-600">
                    {selectedLocation.lat && selectedLocation.lng 
                      ? `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
                      : 'Not selected'
                    }
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-700">🎭 Mood</div>
                  <div className="text-gray-600">
                    {selectedMood 
                      ? `${selectedMood.emoji} ${selectedMood.name}`
                      : 'Not selected'
                    }
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-700">🎬 Situation</div>
                  <div className="text-gray-600">
                    {selectedSituation 
                      ? `${selectedSituation.emoji} ${selectedSituation.name}`
                      : 'Not specified (optional)'
                    }
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-700">👤 User</div>
                  <div className="text-gray-600">
                    {user?.email || 'Anonymous'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        

        {/* Chat Button Floating */}
        <button
          className="fixed bottom-6 right-6 btn-primary px-6 py-3 text-lg shadow-xl z-50"
          onClick={() => setShowChat(true)}
        >
          Chat & Friends
        </button>

        {/* Floating Chat Popup */}
        {showChat && (
          <Chat
            selectedFriend={null}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>
    </div>
  )
}

export default HomePage
