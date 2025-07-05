import { useState, useEffect, useRef } from 'react'

const WeatherSelector = ({ latitude, longitude, onWeatherData }) => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const lastFetchRef = useRef(0)
  const fetchTimeoutRef = useRef(null)

  // OpenWeatherMap API key - add this to your .env.local file
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY 

  const fetchWeather = async (lat, lon) => {
    // Prevent fetching if coordinates are missing
    if (!lat || !lon) return

    // Only check cache if we're fetching for the same location
    const now = Date.now()
    if (now - lastFetchRef.current < 5 * 60 * 1000 && weather) {
      // Check if coordinates have changed significantly (more than 1km)
      const latDiff = Math.abs(lat - (weather.coord?.lat || 0))
      const lonDiff = Math.abs(lon - (weather.coord?.lon || 0))
      
      // If coordinates haven't changed significantly, use cache
      if (latDiff < 0.01 && lonDiff < 0.01) {
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()
      setWeather(data)
      onWeatherData?.(data)
      lastFetchRef.current = now
    } catch (err) {
      setError(err.message)
      console.error('Error fetching weather:', err)
      setWeather(null)
      onWeatherData?.(null)
    } finally {
      setLoading(false)
    }
  }

  // Fetch weather when coordinates change
  useEffect(() => {
    if (!latitude || !longitude) {
      setWeather(null)
      onWeatherData?.(null)
      return
    }

    // Always fetch when coordinates change, regardless of cache
    fetchWeather(latitude, longitude)

    // No need for cleanup since we're not using timeouts anymore
  }, [latitude, longitude]) // Remove weather from dependencies to prevent loops

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '⛅',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌦️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    }
    return iconMap[iconCode] || '🌤️'
  }

  const formatTemperature = (temp) => {
    return Math.round(temp)
  }

  const formatWindSpeed = (speed) => {
    return (speed * 3.6).toFixed(1) // Convert m/s to km/h
  }

  if (!latitude || !longitude) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200">
        <div className="text-center">
          <div className="text-4xl mb-4">🌤️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Weather Information</h3>
          <p className="text-gray-600">
            Please select a location on the map to see weather information.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Weather Information</h3>
        {weather && (
          <p className="text-gray-600 text-sm">
            Current weather for {weather.name}, {weather.sys.country}
          </p>
        )}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">🌀</div>
          <p className="text-gray-600">Fetching weather data...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-2">Failed to fetch weather data</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => fetchWeather(latitude, longitude)}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors font-semibold shadow-lg"
          >
            🔄 Retry
          </button>
        </div>
      )}

      {weather && !loading && !error && (
        <div className="space-y-6">
          {/* Main weather info */}
          <div className="text-center">
            <div className="text-6xl mb-2">
              {getWeatherIcon(weather.weather[0].icon)}
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-1">
              {formatTemperature(weather.main.temp)}°C
            </h4>
            <p className="text-lg text-gray-700 capitalize mb-2">
              {weather.weather[0].description}
            </p>
            <p className="text-sm text-gray-600">
              in {weather.name}, {weather.sys.country}
            </p>
          </div>

          {/* Weather details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">🌡️</div>
              <p className="text-sm text-gray-600 mb-1">Feels like</p>
              <p className="font-semibold text-gray-900">
                {formatTemperature(weather.main.feels_like)}°C
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">💧</div>
              <p className="text-sm text-gray-600 mb-1">Humidity</p>
              <p className="font-semibold text-gray-900">
                {weather.main.humidity}%
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">💨</div>
              <p className="text-sm text-gray-600 mb-1">Wind Speed</p>
              <p className="font-semibold text-gray-900">
                {formatWindSpeed(weather.wind.speed)} km/h
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm text-gray-600 mb-1">Pressure</p>
              <p className="font-semibold text-gray-900">
                {weather.main.pressure} hPa
              </p>
            </div>
          </div>

          {/* Additional info */}
          {weather.visibility && (
            <div className="text-center text-sm text-gray-600">
              <span className="font-medium">Visibility:</span> {(weather.visibility / 1000).toFixed(1)} km
            </div>
          )}

          {/* Refresh button */}
          <div className="text-center">
            <button
              onClick={() => fetchWeather(latitude, longitude)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg text-sm hover:bg-purple-700 transition-colors font-semibold shadow-lg"
            >
              🔄 Refresh Weather
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WeatherSelector
