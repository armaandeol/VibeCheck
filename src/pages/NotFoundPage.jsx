import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import SpotifyCard from '../components/SpotifyCard'
import SpotifyButton from '../components/SpotifyButton'

function NotFoundPage() {
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const [volume, setVolume] = useState(0.5)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const userInteracted = useRef(false)

  // Preload media and attempt autoplay
  useEffect(() => {
    const playMedia = async () => {
      try {
        if (videoRef.current) {
          videoRef.current.preload = 'auto'
          await videoRef.current.play()
        }
        
        if (audioRef.current) {
          audioRef.current.preload = 'auto'
          audioRef.current.volume = volume
          
          // Add event listeners for audio state changes
          const handleAudioPlay = () => setIsAudioPlaying(true)
          const handleAudioPause = () => setIsAudioPlaying(false)
          const handleAudioEnded = () => setIsAudioPlaying(false)
          
          audioRef.current.addEventListener('play', handleAudioPlay)
          audioRef.current.addEventListener('pause', handleAudioPause)
          audioRef.current.addEventListener('ended', handleAudioEnded)
          
          // Try to play audio immediately
          try {
            await audioRef.current.play()
            userInteracted.current = true // Mark as successfully started
          } catch (error) {
            console.log('Initial audio play failed, will retry on interaction:', error.message)
          }
        }
      } catch (error) {
        console.log('Media autoplay error:', error)
      }
    }

    playMedia()

    // Set up interaction listeners for audio autoplay
    const handleInteraction = async () => {
      if (!userInteracted.current && audioRef.current) {
        try {
          if (audioRef.current.paused) {
            await audioRef.current.play()
            userInteracted.current = true
            console.log('Audio started after user interaction')
          }
        } catch (error) {
          console.log('Interaction play failed:', error.message)
        }
      }
    }

    // Add multiple event types to catch any user interaction
    const events = ['click', 'touchstart', 'keydown', 'scroll', 'mousemove']
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction)
      })
      
      // Clean up audio event listeners
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', () => setIsAudioPlaying(true))
        audioRef.current.removeEventListener('pause', () => setIsAudioPlaying(false))
        audioRef.current.removeEventListener('ended', () => setIsAudioPlaying(false))
      }
    }
  }, [])

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      
      // Try to play if paused (mobile browsers require this)
      if (audioRef.current.paused) {
        audioRef.current.play().then(() => {
          userInteracted.current = true
        }).catch(e => console.log('Volume change play failed:', e))
      }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black pt-16">
      {/* Background Video (optimized) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/assets/videos/404-video.webm" type="video/webm" />
        <source src="/assets/videos/404-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Background Audio */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        <source src="/assets/audio/404-song.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <SpotifyCard className="text-center max-w-lg mx-auto">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 drop-shadow-lg">Track Not Found</h1>
          <p className="text-lg sm:text-xl mb-8 drop-shadow-md max-w-md mx-auto">
            🎵 Looks like this page skipped a beat!
          </p>
          
          
          {/* Minimalist Volume Control */}
          <div className="mb-6 flex items-center justify-center space-x-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-24 sm:w-32 h-1 bg-gray-500 rounded-full appearance-none cursor-pointer focus:outline-none"
              style={{
                background: `linear-gradient(to right, #fff 0%, #fff ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%, rgba(255,255,255,0.3) 100%)`
              }}
              aria-label="Volume control"
            />
            <span className="text-white text-xs sm:text-sm font-light">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <SpotifyButton as={Link} to="/" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              🏠 Home
            </SpotifyButton>
            <SpotifyButton as={Link} to="/about" className="bg-white bg-opacity-20 text-white hover:bg-opacity-30 backdrop-blur-sm">
              🎵 Discover
            </SpotifyButton>
          </div>
        </SpotifyCard>
      </div>

      {/* Performance optimization - preload critical resources */}
      <link rel="preload" href="/assets/videos/404-video.webm" as="video" />
      <link rel="preload" href="/assets/audio/404-song.mp3" as="audio" />
    </div>
  )
}

export default NotFoundPage