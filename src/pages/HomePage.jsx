import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import Chat from '../components/Chat'

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

  const handleVibeCheck = () => {
    setVibeActive(true)
    setVibeStep(1)
    // Simulate each step with a delay
    setTimeout(() => setVibeStep(2), 1000)
    setTimeout(() => setVibeStep(3), 2000)
    setTimeout(() => setVibeStep(4), 3000)
    setTimeout(() => setVibeStep(5), 4000)
  }

  return (
    <div className="min-h-screen bg-dashboard relative overflow-hidden">
      {/* Floating Elements */}
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>

      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in">
            <span className="text-gradient">Vibe</span>Check
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in">
            Turn your surroundings into music — instantly.
          </p>
          <button
            className="btn-primary text-2xl px-12 py-5 shadow-xl animate-fade-in"
            onClick={handleVibeCheck}
            disabled={vibeActive}
          >
            VIBE CHECK
          </button>
        </div>

        {/* Animated Vibe Flow */}
        {vibeActive && (
          <div className="w-full max-w-2xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {featureList.map((feature, idx) => (
                <div
                  key={feature.title}
                  className={`flex flex-col items-center transition-all duration-500 ${vibeStep > idx ? 'opacity-100 scale-110' : 'opacity-40 scale-95'}`}
                >
                  <div className="mb-2">{feature.icon}</div>
                  <div className="text-white font-bold text-lg mb-1">{feature.title}</div>
                  <div className="text-gray-400 text-sm text-center max-w-[120px]">{feature.desc}</div>
                  {vibeStep === idx + 1 && (
                    <div className="mt-2 animate-bounce text-green-400 font-bold">Now</div>
                  )}
                </div>
              ))}
            </div>
            {vibeStep === 5 && (
              <div className="mt-8 text-center animate-fade-in">
                <div className="text-2xl text-green-400 font-bold mb-2">Your playlist is ready!</div>
                <button className="btn-accent px-8 py-3 text-lg">Play on Spotify</button>
              </div>
            )}
          </div>
        )}

        {/* Main Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 w-full max-w-5xl">
          <div className="card-glass text-center p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Recommendations</h3>
            <p className="text-gray-300">
              Our advanced AI analyzes your mood, weather, and location to create the perfect playlist for any moment.
            </p>
          </div>
          <div className="card-glass text-center p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Social Music Experience</h3>
            <p className="text-gray-300">
              Connect with friends, share playlists, chat about music, and create collaborative blends together.
            </p>
          </div>
          <div className="card-glass text-center p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Weather & Location Aware</h3>
            <p className="text-gray-300">
              Get music recommendations based on your current weather conditions and location for the perfect vibe.
            </p>
          </div>
          <div className="card-glass text-center p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Collaborative Blends</h3>
            <p className="text-gray-300">
              Create and manage collaborative playlists with friends.
            </p>
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
