import { useState } from 'react'

const getRandomLatLng = () => {
  // Random lat/lng within plausible world bounds
  const lat = (Math.random() * 180 - 90).toFixed(6)
  const lng = (Math.random() * 360 - 180).toFixed(6)
  return { lat: parseFloat(lat), lng: parseFloat(lng) }
}

const LocationSelector = ({ onLocationChange }) => {
  const [position, setPosition] = useState(null)
  const [latInput, setLatInput] = useState('')
  const [lngInput, setLngInput] = useState('')
  const [error, setError] = useState('')

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPosition({ lat: latitude, lng: longitude })
        setLatInput(latitude.toFixed(6))
        setLngInput(longitude.toFixed(6))
        if (onLocationChange) onLocationChange(latitude, longitude)
      },
      () => setError('Unable to retrieve your location.')
    )
  }

  const handleRandomLocation = () => {
    const { lat, lng } = getRandomLatLng()
    setPosition({ lat, lng })
    setLatInput(lat)
    setLngInput(lng)
    setError('')
    if (onLocationChange) onLocationChange(lat, lng)
  }

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value)
    setError('')
  }

  const handleSetLocation = () => {
    const lat = parseFloat(latInput)
    const lng = parseFloat(lngInput)
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Please enter valid latitude and longitude values.')
      return
    }
    setPosition({ lat, lng })
    setError('')
    if (onLocationChange) onLocationChange(lat, lng)
  }

  const handleClear = () => {
    setPosition(null)
    setLatInput('')
    setLngInput('')
    setError('')
    if (onLocationChange) onLocationChange(null, null)
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🌍</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Location Selector</h3>
        <p className="text-gray-600 mb-4">
          Enter your coordinates, use your current location, or pick a random spot!
        </p>
        <div className="flex flex-col gap-2 items-center">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.000001"
              placeholder="Latitude (-90 to 90)"
              value={latInput}
              onChange={handleInputChange(setLatInput)}
              className="border rounded px-3 py-2 w-36 text-sm"
            />
            <input
              type="number"
              step="0.000001"
              placeholder="Longitude (-180 to 180)"
              value={lngInput}
              onChange={handleInputChange(setLngInput)}
              className="border rounded px-3 py-2 w-36 text-sm"
            />
            <button
              onClick={handleSetLocation}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              Set
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleUseMyLocation}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              📍 Use My Location
            </button>
            <button
              onClick={handleRandomLocation}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              🎲 Random Location
            </button>
            {position && (
              <button
                onClick={handleClear}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                🗑️ Clear
              </button>
            )}
          </div>
        </div>
        {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
      </div>
      {position && (
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">Selected Coordinates:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Latitude:</span> {position.lat}
            </div>
            <div>
              <span className="font-medium">Longitude:</span> {position.lng}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationSelector