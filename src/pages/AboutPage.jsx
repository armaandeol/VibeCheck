import { Link } from 'react-router-dom'

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🎵</span>
              </div>
              <span className="text-white text-xl font-bold">VibeCheck</span>
            </Link>
            <Link
              to="/"
              className="text-white/90 hover:text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">About VibeCheck</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Discover the story behind your personalized music discovery platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
              <p className="text-purple-100 leading-relaxed">
                We believe music is more than just sound – it's a reflection of who you are. 
                VibeCheck helps you discover not just new songs, but new aspects of your 
                musical identity through personalized recommendations and insights.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">What We Do</h2>
              <p className="text-purple-100 leading-relaxed">
                Using advanced algorithms and your listening patterns, we create a unique 
                musical profile that evolves with you. From mood-based playlists to genre 
                exploration, we help you find the perfect soundtrack for every moment.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-medium text-white mb-2">Smart Recommendations</h3>
                <p className="text-purple-100 text-sm">
                  AI-powered suggestions based on your unique listening patterns
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-lg font-medium text-white mb-2">Listening Analytics</h3>
                <p className="text-purple-100 text-sm">
                  Deep insights into your music preferences and trends
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🌟</div>
                <h3 className="text-lg font-medium text-white mb-2">Mood Matching</h3>
                <p className="text-purple-100 text-sm">
                  Find the perfect music for any mood or activity
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-6">Ready to Check Your Vibe?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
