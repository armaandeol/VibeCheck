import { useState, useEffect } from 'react';
import SpotifyService from '../lib/spotify';
import React from 'react'

const SpotifySection = ({ children, className = '' }) => (
  <section className={`bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-8 ${className}`}>
    {children}
  </section>
)

const SpotifySectionContent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [activeTab, setActiveTab] = useState('artists');

  useEffect(() => {
    checkSpotifyConnection();
  }, []);

  const checkSpotifyConnection = async () => {
    try {
      const isValid = SpotifyService.isTokenValid();
      setIsConnected(isValid);
      
      if (isValid) {
        const storedProfile = localStorage.getItem('spotify_profile');
        if (storedProfile) {
          setSpotifyProfile(JSON.parse(storedProfile));
        }
        await loadSpotifyData();
      }
    } catch (err) {
      console.error('Error checking Spotify connection:', err);
      setError(err.message);
    }
  };

  const loadSpotifyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const tokens = SpotifyService.getStoredTokens();
      
      if (!tokens.access_token) {
        throw new Error('No access token available');
      }

      // Load user profile if not already loaded
      if (!spotifyProfile) {
        const profile = await SpotifyService.getUserProfile(tokens.access_token);
        setSpotifyProfile(profile);
        localStorage.setItem('spotify_profile', JSON.stringify(profile));
      }

      // Load top artists and tracks
      const [artistsData, tracksData] = await Promise.all([
        SpotifyService.getTopArtists(tokens.access_token, timeRange, 10),
        SpotifyService.getTopTracks(tokens.access_token, timeRange, 10)
      ]);

      setTopArtists(artistsData.items || []);
      setTopTracks(tracksData.items || []);
    } catch (err) {
      console.error('Error loading Spotify data:', err);
      setError(err.message);
      
      // If token expired, clear connection
      if (err.message.includes('Token expired')) {
        handleDisconnect();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    const authUrl = SpotifyService.getAuthUrl();
    window.location.href = authUrl;
  };

  const handleDisconnect = () => {
    SpotifyService.clearTokens();
    localStorage.removeItem('spotify_profile');
    setIsConnected(false);
    setSpotifyProfile(null);
    setTopArtists([]);
    setTopTracks([]);
    setError(null);
  };

  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
    // Reload data with new time range
    if (isConnected) {
      loadSpotifyData();
    }
  };

  const formatFollowers = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  const getTimeRangeLabel = (range) => {
    switch (range) {
      case 'short_term': return 'Last 4 weeks';
      case 'medium_term': return 'Last 6 months';
      case 'long_term': return 'All time';
      default: return 'Last 6 months';
    }
  };

  if (!isConnected) {
    return (
      <div className="card-glass p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.481.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Connect Your Spotify</h3>
          <p className="text-gray-300 mb-6">
            Connect your Spotify account to get personalized music recommendations and create mood-based playlists.
          </p>
          <button
            onClick={handleConnect}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.481.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect with Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Spotify Profile Header */}
      <div className="card-glass p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.481.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                🎵 Spotify Connected
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              </h3>
              {spotifyProfile && (
                <p className="text-gray-300">
                  {spotifyProfile.display_name} • {formatFollowers(spotifyProfile.followers?.total || 0)} followers
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Disconnect
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="short_term">Last 4 weeks</option>
            <option value="medium_term">Last 6 months</option>
            <option value="long_term">All time</option>
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 bg-slate-800/50 rounded-lg p-1">
          {['artists', 'tracks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Top {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Artists */}
            {activeTab === 'artists' && (
              <div className="md:col-span-2">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Top Artists - {getTimeRangeLabel(timeRange)}
                </h4>
                <div className="space-y-3">
                  {topArtists.map((artist, index) => (
                    <div key={artist.id} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                      <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full text-sm flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </span>
                      {artist.images?.[0] && (
                        <img
                          src={artist.images[0].url}
                          alt={artist.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-white font-medium">{artist.name}</div>
                        <div className="text-gray-400 text-sm">
                          {formatFollowers(artist.followers?.total || 0)} followers
                        </div>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {artist.genres?.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Tracks */}
            {activeTab === 'tracks' && (
              <div className="md:col-span-2">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Top Tracks - {getTimeRangeLabel(timeRange)}
                </h4>
                <div className="space-y-3">
                  {topTracks.map((track, index) => (
                    <div key={track.id} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                      <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-sm flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </span>
                      {track.album?.images?.[0] && (
                        <img
                          src={track.album.images[0].url}
                          alt={track.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-white font-medium">{track.name}</div>
                        <div className="text-gray-400 text-sm">
                          {track.artists?.map(artist => artist.name).join(', ')}
                        </div>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {track.album?.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifySection; 