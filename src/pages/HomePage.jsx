import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Navbar from '../components/Navbar.jsx'
import LocationSelector from '../components/LocationSelector.jsx'

const HomePage = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <Navbar />

      {/* Location Selector Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Discover Music by <span className="text-purple-600">Location</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pin your location on the map and explore music from around the world
            </p>
          </div>
          <LocationSelector />
        </div>
      </div>
    </div>
  )
}

export default HomePage
