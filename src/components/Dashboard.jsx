import Navbar from './Navbar.jsx'

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to VibeCheck</h1>
          <p className="text-gray-600 text-lg">Your music analysis journey starts here</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
