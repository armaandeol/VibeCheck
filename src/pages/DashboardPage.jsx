import { Link } from 'react-router-dom'

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-hero relative overflow-hidden">
      {/* Floating Elements */}
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 animate-fade-in">
            <span className="text-gradient">Vibe</span>Check
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in">
            Discover music that matches your mood, weather, and location. 
            Connect with friends, share playlists, and create collaborative blends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/login" className="btn-primary text-lg px-8 py-4">
              Get Started
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="card-gradient p-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Discover Your Perfect Vibe?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of music lovers who are already creating amazing playlists and connecting through music.
            </p>
            <Link to="/login" className="btn-primary text-xl px-10 py-4">
              Start Your Musical Journey
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
