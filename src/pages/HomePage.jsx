import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import Chat from '../components/Chat'
import LocationSelector from '../components/LocationSelector'
import WeatherSelector from '../components/WeatherSelector'
import MoodSelector from '../components/MoodSelector'
import SituationSelector from '../components/SituationSelector'
import WeatherAnimation from '../components/WeatherAnimation'
import songRecommendationAgent from '../Agents/songsrecommnedation.js'
import spotifyService from '../lib/spotify.js'
import SpotifyCard from '../components/SpotifyCard'
import SpotifyButton from '../components/SpotifyButton'
import SpotifySection from '../components/SpotifySection'
import { AnimatedList } from '../components/Animatedlist'
import { motion, AnimatePresence } from 'framer-motion';

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

const LoadingPlaylist = ({ songs }) => {
  if (!songs || !songs.length) return null;
  
  const containerVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4,
        ease: "easeIn"
      }
    }
  };
  
  // Take only the first 5 songs
  const displaySongs = songs.slice(0, 5);
  
  return (
    <motion.div
      className="w-full max-w-md mx-auto mt-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-700/30">
        <h3 className="text-xl font-semibold text-center mb-6 text-purple-400/90">
          Generating Your Playlist... 🎵
        </h3>
        <AnimatedList delay={800}>
          {displaySongs.map((song, index) => (
            <motion.div
              key={`${song.title}-${index}`}
              className="bg-gray-800/30 p-4 rounded-lg shadow-md border border-gray-700/30 w-full relative group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 relative">
                <div className="text-2xl">🎵</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-200/90">{song.title}</p>
                  <p className="text-sm text-gray-400/80">{song.artist}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-purple-400/60">#{index + 1}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatedList>
      </div>
    </motion.div>
  );
};

const HomePage = () => {
  const { user } = useAuth()
  const [showChat, setShowChat] = useState(false)
  const [vibeStep, setVibeStep] = useState(0)
  const [vibeActive, setVibeActive] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState({ lat: null, lng: null })
  const [selectedMood, setSelectedMood] = useState(null)
  const [selectedSituation, setSelectedSituation] = useState(null)
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false)
  const [playlist, setPlaylist] = useState(null)
  const [error, setError] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  
  // Spotify integration states
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false)
  const [isCreatingSpotifyPlaylist, setIsCreatingSpotifyPlaylist] = useState(false)
  const [spotifyPlaylistResult, setSpotifyPlaylistResult] = useState(null)
  const [spotifyError, setSpotifyError] = useState(null)
  const [lastRequestTime, setLastRequestTime] = useState(0)

  const handleVibeCheck = async () => {
    // Prevent multiple requests within 2 seconds
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      console.log('Debouncing request - too soon after last request');
      return;
    }
    setLastRequestTime(now);

    // Check if already loading
    if (isLoadingPlaylist) {
      return;
    }

    // Check if required fields are selected
    if (!selectedLocation.lat || !selectedLocation.lng || !selectedMood) {
      setError('Please select your location and mood first');
      return;
    }

    // Check if weather data is available
    if (!weatherData) {
      setError('Please wait for weather data to load');
      return;
    }

    // Check if user is connected to Spotify
    if (!checkSpotifyConnection()) {
      setSpotifyError('Please connect to Spotify first to create your playlist');
      return;
    }

    // Reset states
    setError(null);
    setSpotifyError(null);
    setIsLoadingPlaylist(true);
    setPlaylist(null);
    setSpotifyPlaylistResult(null);
    
    try {
      // Start the vibe check animation
      setVibeActive(true);
      setVibeStep(1);
      
      // Prepare data for song recommendation agent
      const requestData = {
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        mood: selectedMood.name.toLowerCase(),
        situationalMood: selectedSituation?.name || null,
        weatherData: weatherData
      };
      
      console.log('Sending request to song agent:', requestData);
      
      // Call the song recommendation agent with timeout
      let playlistResult;
      try {
        console.log('🎵 [PLAYLIST] Starting playlist generation process...');
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            console.log('⏰ [PLAYLIST] Timeout reached - playlist generation taking too long');
            reject(new Error('Playlist generation timed out'));
          }, 30000);
        });
        
        console.log('🤖 [PLAYLIST] Calling song recommendation agent...');
        const songPromise = songRecommendationAgent(requestData);
        playlistResult = await Promise.race([songPromise, timeoutPromise]);
        
        console.log('⌛ [PLAYLIST] Adding delay to ensure complete processing...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('📝 [PLAYLIST] Received playlist result:', playlistResult);
        
        if (!playlistResult || !playlistResult.playlist) {
          console.error('🚨 [PLAYLIST] Invalid playlist response:', playlistResult);
          throw new Error('Invalid playlist response');
        }

        console.log('✅ [PLAYLIST] Playlist data validated successfully');
      } catch (error) {
        console.error('🚨 [PLAYLIST] Error during playlist generation:', error);
        if (error.message === 'Playlist generation timed out') {
          throw new Error('Playlist generation is taking longer than expected. Please try again.');
        }
        throw error;
      }
      
      // Store the playlist result
      console.log('💾 [PLAYLIST] Storing playlist result...');
      setPlaylist(playlistResult);
      
      // Update vibe steps
      console.log('🎨 [PLAYLIST] Updating vibe animation steps...');
      setVibeStep(2);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVibeStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVibeStep(4);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVibeStep(5);
      
      // Create Spotify playlist using the result directly
      console.log('🎵 [PLAYLIST] Starting Spotify playlist creation...');
      await createSpotifyPlaylist(playlistResult);
      
    } catch (error) {
      console.error('🚨 ERROR generating playlist:', error);
      setError(error.message || 'Failed to generate playlist');
      setVibeActive(false);
      setVibeStep(0);
    } finally {
      setIsLoadingPlaylist(false);
    }
  }

  const handleLocationChange = (lat, lng) => {
    console.log('Location changed:', { lat, lng });
    setSelectedLocation({ lat, lng });
    // Clear weather data when location changes to force re-fetch
    setWeatherData(null);
  }

  const handleMoodChange = (mood) => {
    setSelectedMood(mood)
  }

  const handleSituationChange = (situation) => {
    setSelectedSituation(situation)
  }

  // Handle weather data updates
  const handleWeatherData = (data) => {
    console.log('Weather data updated:', data ? 'received' : 'cleared');
    setWeatherData(data);
  };

  // Check if weather is rainy
  const isRainyWeather = () => {
    if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
      return false;
    }
    
    const weatherId = weatherData.weather[0].id;
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    const weatherDescription = weatherData.weather[0].description.toLowerCase();
    
    // Check for rain-related weather conditions
    return (
      weatherId >= 200 && weatherId < 600 || // Thunderstorm, Drizzle, Rain
      weatherMain.includes('rain') ||
      weatherMain.includes('drizzle') ||
      weatherMain.includes('thunderstorm') ||
      weatherDescription.includes('rain') ||
      weatherDescription.includes('drizzle') ||
      weatherDescription.includes('shower')
    );
  };

  // Check if user is connected to Spotify
  const checkSpotifyConnection = () => {
    const isConnected = spotifyService.isTokenValid()
    setIsSpotifyConnected(isConnected)
    return isConnected
  }

  // Connect to Spotify
  const connectToSpotify = () => {
    const authUrl = spotifyService.getAuthUrl()
    window.location.href = authUrl
  }

  // Create Spotify playlist from generated songs
  const createSpotifyPlaylist = async (playlistData) => {
    console.log('🎵 [SPOTIFY] Starting playlist creation process...');
    
    if (!playlistData || !playlistData.playlist) {
      console.error('🚨 [SPOTIFY] No playlist data available:', playlistData);
      setSpotifyError('No playlist available to create')
      return
    }

    if (!checkSpotifyConnection()) {
      console.error('🚨 [SPOTIFY] Not connected to Spotify');
      setSpotifyError('Please connect to Spotify first')
      return
    }

    setIsCreatingSpotifyPlaylist(true)
    setSpotifyError(null)

    try {
      console.log('🔑 [SPOTIFY] Getting access token...');
      const tokens = spotifyService.getStoredTokens()
      const accessToken = tokens.access_token

      // Create playlist name based on mood and situation
      const playlistName = `VibeCheck: ${selectedMood?.name || 'Mood'} ${selectedSituation ? `- ${selectedSituation.name}` : ''}`
      const description = `Generated by VibeCheck for ${selectedMood?.name || 'your mood'} ${selectedSituation ? `while ${selectedSituation.name}` : ''}`

      console.log('📝 [SPOTIFY] Creating playlist with details:', {
        playlistName,
        description,
        songCount: playlistData.playlist.length
      });

      const result = await spotifyService.createPlaylistFromSongs(
        accessToken,
        playlistData.playlist,
        playlistName,
        description
      )

      console.log('✅ [SPOTIFY] Playlist created successfully:', {
        playlistId: result.playlistId,
        totalSongs: result.totalSongs,
        foundSongs: result.foundSongs,
        notFoundSongs: result.notFoundSongs
      });

      setSpotifyPlaylistResult(result)
      
      // Automatically open the playlist in Spotify after a short delay
      setTimeout(() => {
        if (result.playlistUrl) {
          console.log('🌐 [SPOTIFY] Opening playlist URL:', result.playlistUrl);
          window.open(result.playlistUrl, '_blank')
        }
      }, 1000)
      
    } catch (error) {
      console.error('🚨 [SPOTIFY] Error creating playlist:', error);
      console.error('🚨 [SPOTIFY] Playlist data that failed:', playlistData);
      setSpotifyError(error.message || 'Failed to create Spotify playlist')
    } finally {
      setIsCreatingSpotifyPlaylist(false)
    }
  }

  // Check Spotify connection on component mount
  useEffect(() => {
    checkSpotifyConnection()
  }, [])

  return (
    <div className="min-h-screen spotify-bg-gradient text-white pt-16">
      {/* Professional Weather Animation Background */}
      {weatherData && <WeatherAnimation weatherData={weatherData} />}
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Spotify Connection Status */}
        <div className="spotify-card-large mb-12">
          {!isSpotifyConnected ? (
            <div className="flex items-center gap-8 flex-col lg:flex-row">
              <div className="w-20 h-20 bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl">🎵</span>
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl font-bold mb-2 spotify-text-primary">Connect to Spotify</h2>
                <p className="text-lg spotify-text-secondary mb-6">Link your account to create personalized playlists</p>
                <SpotifyButton onClick={connectToSpotify}>
                  Connect Spotify Account
                </SpotifyButton>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-col lg:flex-row gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-4xl">✓</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2 spotify-text-primary">Connected to Spotify</h2>
                  <p className="text-lg spotify-text-secondary">Ready to create amazing playlists</p>
                </div>
              </div>
              <SpotifyButton onClick={() => setShowChat(true)} className="spotify-button-secondary flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat & Friends
              </SpotifyButton>
            </div>
          )}
        </div>

        {/* Vibe Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <SpotifyCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">📍</span>
              </div>
              <h3 className="text-xl font-bold spotify-text-primary">Location</h3>
            </div>
            <LocationSelector onLocationChange={handleLocationChange} />
          </SpotifyCard>
          
          <SpotifyCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">🌤️</span>
              </div>
              <h3 className="text-xl font-bold spotify-text-primary">Weather</h3>
            </div>
            <WeatherSelector 
              latitude={selectedLocation.lat} 
              longitude={selectedLocation.lng}
              onWeatherData={handleWeatherData}
            />
          </SpotifyCard>
          
          <SpotifyCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎭</span>
              </div>
              <h3 className="text-xl font-bold spotify-text-primary">Mood</h3>
            </div>
            <MoodSelector onMoodChange={handleMoodChange} />
          </SpotifyCard>
          
          <SpotifyCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎬</span>
              </div>
              <h3 className="text-xl font-bold spotify-text-primary">Situation</h3>
            </div>
            <SituationSelector onSituationChange={handleSituationChange} />
          </SpotifyCard>
        </div>

        {/* Create Playlist Button */}
        <div className="text-center">
          <div className="spotify-card-large mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">🎵</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold spotify-text-primary">Ready to Create Your Playlist?</h2>
                <p className="spotify-text-secondary">Your perfect vibe is waiting</p>
              </div>
            </div>
            
            <SpotifyButton
              onClick={handleVibeCheck}
              disabled={isLoadingPlaylist || !isSpotifyConnected || !selectedLocation.lat || !selectedLocation.lng || !selectedMood || !weatherData}
              className="text-xl font-bold px-12 py-5"
            >
              {isLoadingPlaylist ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Creating Playlist...
                </div>
              ) : !isSpotifyConnected ? (
                'Connect Spotify First'
              ) : !selectedLocation.lat || !selectedLocation.lng || !selectedMood || !weatherData ? (
                'Complete Your Vibe'
              ) : (
                'Create Spotify Playlist'
              )}
            </SpotifyButton>
          </div>

          {/* Loading Animation with AnimatePresence */}
          <AnimatePresence mode="wait">
            {isLoadingPlaylist && playlist?.playlist && !spotifyPlaylistResult && (
              <LoadingPlaylist songs={playlist.playlist} />
            )}
          </AnimatePresence>

          {/* Success Message with AnimatePresence */}
          <AnimatePresence mode="wait">
            {spotifyPlaylistResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <SpotifyCard className="mt-8 spotify-card-gradient border-[#1DB954]">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-3xl">✓</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold spotify-text-primary">Playlist Created!</h3>
                      <p className="text-lg spotify-text-secondary">{spotifyPlaylistResult.playlistName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <div className="spotify-badge-secondary mb-2">Total Songs</div>
                      <div className="text-2xl font-bold spotify-text-primary">{spotifyPlaylistResult.totalSongs}</div>
                    </div>
                    <div className="text-center">
                      <div className="spotify-badge-secondary mb-2">Found on Spotify</div>
                      <div className="text-2xl font-bold text-[#1DB954]">{spotifyPlaylistResult.foundSongs}</div>
                    </div>
                    {spotifyPlaylistResult.notFoundSongs > 0 && (
                      <div className="text-center">
                        <div className="spotify-badge-secondary mb-2">Not Found</div>
                        <div className="text-2xl font-bold text-yellow-400">{spotifyPlaylistResult.notFoundSongs}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <a
                      href={spotifyPlaylistResult.playlistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="spotify-button inline-flex items-center gap-3"
                    >
                      <span>🎵</span>
                      Open in Spotify
                    </a>
                  </div>
                </SpotifyCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Messages */}
        {error && (
          <SpotifyCard className="mt-8 bg-red-900/20 border-red-500">
            <div className="flex items-center gap-4 text-red-400">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-400">Error</h3>
                <p className="spotify-text-secondary">{error}</p>
              </div>
            </div>
          </SpotifyCard>
        )}
        {spotifyError && (
          <SpotifyCard className="mt-8 bg-red-900/20 border-red-500">
            <div className="flex items-center gap-4 text-red-400">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-400">Spotify Error</h3>
                <p className="spotify-text-secondary">{spotifyError}</p>
              </div>
            </div>
          </SpotifyCard>
        )}
      </div>
      
      {/* Floating Chat Button - Always visible when user is logged in */}
      {user && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowChat(true)}
            className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            title="Chat with Friends"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      )}

      {/* Keep the chat popup outside the main content */}
      {showChat && (
        <Chat
          selectedFriend={null}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}

export default HomePage
