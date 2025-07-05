import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import Chat from '../components/Chat'
import LocationSelector from '../components/LocationSelector'
import WeatherSelector from '../components/WeatherSelector'
import MoodSelector from '../components/MoodSelector'
import SituationSelector from '../components/SituationSelector'

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

  const handleVibeCheck = () => {
    setVibeActive(true)
    setVibeStep(1)
    // Simulate each step with a delay
    setTimeout(() => setVibeStep(2), 1000)
    setTimeout(() => setVibeStep(3), 2000)
    setTimeout(() => setVibeStep(4), 3000)
    setTimeout(() => setVibeStep(5), 4000)
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
