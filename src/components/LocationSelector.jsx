import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng)
    },
  })
  return null
}

const LocationSelector = () => {
  const [showMap, setShowMap] = useState(false)
  const [position, setPosition] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]) // Default to NYC

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setMapCenter([latitude, longitude])
        },
        (error) => {
          console.log('Error getting location:', error)
          // Keep default location if geolocation fails
        }
      )
    }
  }, [])

  const handleLocationSelect = (latlng) => {
    setPosition(latlng)
    console.log(`Selected location: Latitude ${latlng.lat}, Longitude ${latlng.lng}`)
  }

  const handleRandomLocation = () => {
    const lat = mapCenter[0] + (Math.random() - 0.5) * 0.1
    const lng = mapCenter[1] + (Math.random() - 0.5) * 0.1
    setPosition({ lat, lng })
    console.log(`Selected location: Latitude ${lat}, Longitude ${lng}`)
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🌍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Location Selector</h3>
        <p className="text-gray-600 mb-4">
          Click on the map to select your location and see the coordinates
        </p>
        <button
          onClick={() => setShowMap(!showMap)}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
      </div>

      {showMap && (
        <div className="mt-6">
          <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationSelect={handleLocationSelect} />
              
              {/* User's current location marker */}
              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>
                    <div className="text-center">
                      <div className="text-2xl mb-2">�</div>
                      <p className="font-semibold">Your Current Location</p>
                      <p className="text-sm text-gray-600">
                        Lat: {userLocation[0].toFixed(6)}<br/>
                        Lng: {userLocation[1].toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Selected location marker */}
              {position && (
                <Marker position={[position.lat, position.lng]}>
                  <Popup>
                    <div className="text-center">
                      <div className="text-2xl mb-2">📌</div>
                      <p className="font-semibold">Selected Location</p>
                      <p className="text-sm text-gray-600">
                        Lat: {position.lat.toFixed(6)}<br/>
                        Lng: {position.lng.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
          
          <div className="mt-4 flex gap-2 justify-center">
            <button
              onClick={handleRandomLocation}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              📍 Pin Random Location
            </button>
            {position && (
              <button
                onClick={() => setPosition(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                🗑️ Clear Selection
              </button>
            )}
          </div>
          
          {position && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Selected Coordinates:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Latitude:</span> {position.lat.toFixed(6)}
                </div>
                <div>
                  <span className="font-medium">Longitude:</span> {position.lng.toFixed(6)}
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                <p>💡 <strong>Tip:</strong> Click anywhere on the map to select a new location</p>
                <p>🎯 <strong>Current Location:</strong> {userLocation ? 'Blue marker shows your location' : 'Location access not available'}</p>
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              ✨ Interactive map with click-to-select functionality and geolocation
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationSelector