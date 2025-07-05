import { useEffect, useState, useRef, useMemo } from 'react'

const WeatherAnimation = ({ weatherData }) => {
  const [particles, setParticles] = useState([])
  const [clouds, setClouds] = useState([])
  const [lightning, setLightning] = useState([])
  const [rainDrops, setRainDrops] = useState([])
  const [snowflakes, setSnowflakes] = useState([])
  const [fogLayers, setFogLayers] = useState([])
  const [windParticles, setWindParticles] = useState([])
  const [sunRays, setSunRays] = useState([])
  const containerRef = useRef(null)

  // Determine weather type and intensity
  const getWeatherType = () => {
    if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
      console.log('WeatherAnimation: No weather data available')
      return { type: 'clear', intensity: 0 }
    }
    
    const weatherId = weatherData.weather[0].id
    const weatherMain = weatherData.weather[0].main
    const weatherDescription = weatherData.weather[0].description
    const windSpeed = weatherData.wind?.speed || 0
    
    console.log('WeatherAnimation Debug:', {
      weatherId,
      weatherMain,
      weatherDescription,
      windSpeed
    })
    
    // Thunderstorm conditions
    if (weatherId >= 200 && weatherId < 300) {
      return { type: 'thunderstorm', intensity: Math.min((weatherId - 200) / 99, 1) }
    }
    // Drizzle conditions
    if (weatherId >= 300 && weatherId < 400) {
      return { type: 'drizzle', intensity: Math.min((weatherId - 300) / 99, 1) }
    }
    // Rain conditions
    if (weatherId >= 500 && weatherId < 600) {
      return { type: 'rain', intensity: Math.min((weatherId - 500) / 99, 1) }
    }
    // Snow conditions
    if (weatherId >= 600 && weatherId < 700) {
      return { type: 'snow', intensity: Math.min((weatherId - 600) / 99, 1) }
    }
    // Atmosphere conditions (fog, mist, etc.)
    if (weatherId >= 700 && weatherId < 800) {
      return { type: 'fog', intensity: 0.8 }
    }
    // Clear conditions
    if (weatherId === 800) {
      return { type: 'clear', intensity: 0 }
    }
    // Cloudy conditions
    if (weatherId >= 801 && weatherId <= 804) {
      return { type: 'cloudy', intensity: Math.min((weatherId - 801) / 3, 1) }
    }
    
    console.log('WeatherAnimation: Unknown weather ID, defaulting to clear:', weatherId)
    return { type: 'clear', intensity: 0 }
  }

  const windSpeed = weatherData?.wind?.speed || 0

  // Calculate weather type whenever weatherData changes
  const currentWeatherType = useMemo(() => getWeatherType(), [weatherData])

  console.log('WeatherAnimation: Detected weather type:', currentWeatherType)
  console.log('WeatherAnimation: Raw weather data:', weatherData)

  useEffect(() => {
    if (!weatherData || !containerRef.current) {
      setParticles([])
      setClouds([])
      setLightning([])
      setRainDrops([])
      setSnowflakes([])
      setFogLayers([])
      setWindParticles([])
      setSunRays([])
      return
    }

    console.log('Weather data changed:', weatherData)
    console.log('Current weather type:', currentWeatherType)

    const container = containerRef.current
    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight

    const createRealisticClouds = () => {
      const newClouds = []
      let cloudCount = 0
      
      // Remove clouds for cloudy weather - will show rain instead
      if (currentWeatherType.type === 'fog') {
        cloudCount = 4
      } else if (currentWeatherType.type === 'thunderstorm') {
        cloudCount = 3
      }

      console.log('Creating animated clouds:', { type: currentWeatherType.type, intensity: currentWeatherType.intensity, count: cloudCount })

      for (let i = 0; i < cloudCount; i++) {
        const cloud = {
          id: i,
          left: Math.random() * containerWidth,
          top: Math.random() * (containerHeight * 0.3),
          size: Math.random() * 300 + 200,
          opacity: Math.random() * 0.4 + 0.3,
          animationDuration: Math.random() * 80 + 120,
          animationDelay: Math.random() * 40,
          cloudType: Math.random() > 0.5 ? 'cumulus' : 'stratus'
        }
        newClouds.push(cloud)
      }
      setClouds(newClouds)
    }

    const createRealisticRain = () => {
      const newRainDrops = []
      // Create rain for rain, drizzle, thunderstorm, and cloudy weather types
      if (currentWeatherType.type === 'rain' || currentWeatherType.type === 'drizzle' || currentWeatherType.type === 'thunderstorm' || currentWeatherType.type === 'cloudy') {
        let dropCount = 0
        
        if (currentWeatherType.type === 'cloudy') {
          // Lighter rain for cloudy weather
          dropCount = Math.floor(100 * currentWeatherType.intensity) + 30
        } else {
          // Normal rain for other weather types
          dropCount = Math.floor(200 * currentWeatherType.intensity) + 50
        }

        for (let i = 0; i < dropCount; i++) {
          const drop = {
            id: i,
            left: Math.random() * containerWidth,
            top: -20,
            length: currentWeatherType.type === 'cloudy' ? Math.random() * 10 + 8 : Math.random() * 15 + 10,
            speed: currentWeatherType.type === 'cloudy' ? Math.random() * 2 + 1.5 : Math.random() * 2.5 + 2,
            opacity: currentWeatherType.type === 'cloudy' ? Math.random() * 0.3 + 0.2 : Math.random() * 0.4 + 0.3,
            windOffset: (Math.random() - 0.5) * windSpeed * 2,
            animationDelay: Math.random() * 3
          }
          newRainDrops.push(drop)
        }
      }
      setRainDrops(newRainDrops)
    }

    const createRealisticSnow = () => {
      const newSnowflakes = []
      // Only create snow for snow weather type
      if (currentWeatherType.type === 'snow') {
        const flakeCount = Math.floor(150 * currentWeatherType.intensity) + 30

        for (let i = 0; i < flakeCount; i++) {
          const flake = {
            id: i,
            left: Math.random() * containerWidth,
            top: -10,
            size: Math.random() * 4 + 2,
            speed: Math.random() * 3 + 2.5,
            opacity: Math.random() * 0.6 + 0.4,
            windInfluence: Math.random() * 0.3 + 0.1,
            rotationSpeed: Math.random() * 2 + 1,
            animationDelay: Math.random() * 5
          }
          newSnowflakes.push(flake)
        }
      }
      setSnowflakes(newSnowflakes)
    }

    const createRealisticLightning = () => {
      const newLightning = []
      if (currentWeatherType.type === 'thunderstorm') {
        const lightningCount = Math.floor(2 * currentWeatherType.intensity) + 1
        for (let i = 0; i < lightningCount; i++) {
          const lightning = {
            id: i,
            left: Math.random() * containerWidth,
            top: Math.random() * (containerHeight * 0.3),
            height: Math.random() * 60 + 40,
            width: Math.random() * 3 + 2,
            animationDelay: Math.random() * 30,
            animationDuration: Math.random() * 0.5 + 0.3,
            intensity: Math.random() * 0.5 + 0.5
          }
          newLightning.push(lightning)
        }
      }
      setLightning(newLightning)
    }

    const createRealisticFog = () => {
      const newFogLayers = []
      if (currentWeatherType.type === 'fog') {
        const layerCount = 3
        for (let i = 0; i < layerCount; i++) {
          const layer = {
            id: i,
            top: Math.random() * containerHeight,
            height: Math.random() * 200 + 100,
            opacity: Math.random() * 0.2 + 0.1,
            animationDuration: Math.random() * 60 + 80,
            animationDelay: Math.random() * 20,
            blur: Math.random() * 3 + 2
          }
          newFogLayers.push(layer)
        }
      }
      setFogLayers(newFogLayers)
    }

    const createRealisticWind = () => {
      const newWindParticles = []
      if (windSpeed > 2) {
        const windCount = Math.floor(windSpeed * 8)
        for (let i = 0; i < windCount; i++) {
          const particle = {
            id: i,
            top: Math.random() * containerHeight,
            size: Math.random() * 4 + 2,
            speed: Math.random() * 4 + 3,
            opacity: Math.random() * 0.2 + 0.1,
            animationDelay: Math.random() * 8
          }
          newWindParticles.push(particle)
        }
      }
      setWindParticles(newWindParticles)
    }

    const createRealisticSun = () => {
      const newSunRays = []
      if (currentWeatherType.type === 'clear') {
        // No rays or light shafts - just natural atmospheric lighting
        // The sunny effect will be created purely through gradients and glows
      }
      setSunRays(newSunRays)
    }

    createRealisticClouds()
    createRealisticRain()
    createRealisticSnow()
    createRealisticLightning()
    createRealisticFog()
    createRealisticWind()
    createRealisticSun()

    const interval = setInterval(() => {
      createRealisticClouds()
      createRealisticRain()
      createRealisticSnow()
      createRealisticLightning()
      createRealisticFog()
      createRealisticWind()
      createRealisticSun()
    }, 8000)

    return () => clearInterval(interval)
  }, [weatherData, currentWeatherType, windSpeed])

  if (!weatherData) return null

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Weather overlay for atmosphere */}
      {currentWeatherType.type !== 'clear' && (
        <div className={`absolute inset-0 ${getAtmosphericOverlay()}`}></div>
      )}
      
      {/* Cloudy weather now shows rain instead of cloud overlays */}
      
      {/* Realistic sun for clear weather */}
      {currentWeatherType.type === 'clear' && (
        <div className="absolute inset-0">
          {/* Natural sunny atmosphere overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 via-white/20 to-yellow-100/25"></div>
          
          {/* Natural sun glow - no obvious sun shape */}
          <div className="absolute top-8 right-8 w-48 h-48">
            <div className="absolute inset-0 bg-gradient-radial from-white/40 via-yellow-100/25 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute inset-0 bg-gradient-radial from-yellow-50/30 via-white/20 to-transparent rounded-full blur-2xl"></div>
          </div>
          
          {/* Additional natural lighting layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/20 via-transparent to-yellow-100/15"></div>
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-white/15 via-transparent to-transparent"></div>
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-yellow-50/10 via-transparent to-transparent"></div>
        </div>
      )}
      
      {/* Realistic fog layers */}
      {fogLayers.map((layer) => (
        <div
          key={`fog-${layer.id}`}
          className="absolute w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{
            top: `${layer.top}px`,
            height: `${layer.height}px`,
            opacity: layer.opacity,
            filter: `blur(${layer.blur}px)`,
            animation: `fog-drift ${layer.animationDuration}s linear ${layer.animationDelay}s infinite`
          }}
        />
      ))}
      
      {/* Animated clouds */}
      {clouds.map((cloud) => (
        <div
          key={`cloud-${cloud.id}`}
          className="absolute"
          style={{
            left: `${cloud.left}px`,
            top: `${cloud.top}px`,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.6}px`,
            opacity: cloud.opacity,
            animation: `cloud-drift ${cloud.animationDuration}s linear ${cloud.animationDelay}s infinite`
          }}
        >
          {/* Animated cloud shape with morphing */}
          <div 
            className={`w-full h-full rounded-full blur-md ${currentWeatherType.type === 'cloudy' ? 'bg-gradient-radial from-white/60 to-white/25' : 'bg-gradient-radial from-white/50 to-white/20'}`}
            style={{
              animation: `cloud-morph ${cloud.animationDuration}s ease-in-out ${cloud.animationDelay}s infinite`
            }}
          ></div>
          
          {/* Additional cloud puffs for realistic shape */}
          <div 
            className="absolute inset-0 rounded-full blur-lg bg-white/30"
            style={{
              animation: `cloud-puff ${cloud.animationDuration * 0.8}s ease-in-out ${cloud.animationDelay + 2}s infinite`
            }}
          ></div>
        </div>
      ))}
      
      {/* Animated cloud formations for overcast */}
      {currentWeatherType.type === 'cloudy' && clouds.length > 0 && (
        <div className="absolute inset-0">
          {clouds.slice(0, Math.floor(clouds.length * 0.6)).map((cloud) => (
            <div
              key={`animated-cloud-${cloud.id}`}
              className="absolute"
              style={{
                left: `${(cloud.left + 60) % containerRef.current?.offsetWidth}px`,
                top: `${(cloud.top + 40) % (containerRef.current?.offsetHeight * 0.4)}px`,
                width: `${cloud.size * 0.8}px`,
                height: `${cloud.size * 0.5}px`,
                opacity: cloud.opacity * 0.7,
                animation: `cloud-drift ${cloud.animationDuration * 1.2}s linear ${cloud.animationDelay + 5}s infinite`
              }}
            >
              <div 
                className="w-full h-full rounded-full blur-lg bg-gradient-radial from-gray-300/50 to-gray-400/25"
                style={{
                  animation: `cloud-morph ${cloud.animationDuration * 1.1}s ease-in-out ${cloud.animationDelay + 3}s infinite`
                }}
              ></div>
            </div>
          ))}
        </div>
      )}
      
      {/* Realistic lightning */}
      {lightning.map((flash) => (
        <div
          key={`lightning-${flash.id}`}
          className="absolute"
          style={{
            left: `${flash.left}px`,
            top: `${flash.top}px`,
            width: `${flash.width}px`,
            height: `${flash.height}px`,
            animation: `lightning-flash ${flash.animationDuration}s linear ${flash.animationDelay}s infinite`
          }}
        >
          <div className="w-full h-full bg-gradient-to-b from-yellow-300 via-yellow-200 to-transparent blur-sm"></div>
        </div>
      ))}
      
      {/* Realistic rain drops */}
      {rainDrops.map((drop) => (
        <div
          key={`rain-${drop.id}`}
          className="absolute"
          style={{
            left: `${drop.left}px`,
            top: `${drop.top}px`,
            width: '1px',
            height: `${drop.length}px`,
            opacity: drop.opacity,
            animation: `rain-fall ${drop.speed}s linear ${drop.animationDelay}s infinite`
          }}
        >
          <div className="w-full h-full bg-gradient-to-b from-blue-300/60 to-blue-500/40 blur-[0.5px]"></div>
        </div>
      ))}
      
      {/* Realistic snowflakes */}
      {snowflakes.map((flake) => (
        <div
          key={`snow-${flake.id}`}
          className="absolute"
          style={{
            left: `${flake.left}px`,
            top: `${flake.top}px`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snow-fall ${flake.speed}s linear ${flake.animationDelay}s infinite`
          }}
        >
          <div className="w-full h-full bg-white rounded-full blur-[0.5px] shadow-sm"></div>
        </div>
      ))}
      
      {/* Realistic wind particles */}
      {windParticles.map((particle) => (
        <div
          key={`wind-${particle.id}`}
          className="absolute"
          style={{
            left: '-10px',
            top: `${particle.top}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animation: `wind-blow ${particle.speed}s linear ${particle.animationDelay}s infinite`
          }}
        >
          <div className="w-full h-full bg-white/30 rounded-full blur-sm"></div>
        </div>
      ))}
    </div>
  )

  function getAtmosphericOverlay() {
    switch (currentWeatherType.type) {
      case 'rain':
        return 'bg-gradient-to-b from-blue-900/5 to-blue-800/10 backdrop-blur-[0.5px]'
      case 'snow':
        return 'bg-gradient-to-b from-white/3 to-gray-100/5 backdrop-blur-[1px]'
      case 'thunderstorm':
        return 'bg-gradient-to-b from-gray-900/15 to-gray-800/20 backdrop-blur-[1px]'
      case 'fog':
        return 'bg-gradient-to-b from-gray-500/8 to-gray-400/12 backdrop-blur-[2px]'
      case 'cloudy':
        return 'bg-gradient-to-b from-gray-400/15 to-gray-300/20 backdrop-blur-[1px]'
      default:
        return ''
    }
  }
}

export default WeatherAnimation