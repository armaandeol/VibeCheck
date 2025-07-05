const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:5173/callback';

const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-read-recently-played'
];

class SpotifyService {
  constructor() {
    this.baseURL = 'https://api.spotify.com/v1';
    this.authURL = 'https://accounts.spotify.com/api/token';
  }

  // Generate Spotify authorization URL
  getAuthUrl() {
    return `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(SPOTIFY_SCOPES.join(" "))}&show_dialog=true`;
  }

  // Exchange authorization code for access token
  async getAccessToken(code) {
    const response = await fetch(this.authURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    return await response.json();
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    const response = await fetch(this.authURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    return await response.json();
  }

  // Make authenticated API calls
  async makeRequest(endpoint, accessToken, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token expired');
      }
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return await response.json();
  }

  // Get user's Spotify profile
  async getUserProfile(accessToken) {
    return await this.makeRequest('/me', accessToken);
  }

  // Get user's top artists
  async getTopArtists(accessToken, timeRange = 'medium_term', limit = 20) {
    return await this.makeRequest(
      `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
      accessToken
    );
  }

  // Get user's top tracks
  async getTopTracks(accessToken, timeRange = 'medium_term', limit = 20) {
    return await this.makeRequest(
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
      accessToken
    );
  }

  // Get user's saved tracks
  async getSavedTracks(accessToken, limit = 50) {
    return await this.makeRequest(
      `/me/tracks?limit=${limit}`,
      accessToken
    );
  }

  // Create a playlist
  async createPlaylist(accessToken, userId, name, description = '', isPublic = true) {
    return await this.makeRequest(
      `/users/${userId}/playlists`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          public: isPublic
        })
      }
    );
  }

  // Add tracks to playlist
  async addTracksToPlaylist(accessToken, playlistId, trackUris) {
    return await this.makeRequest(
      `/playlists/${playlistId}/tracks`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          uris: trackUris
        })
      }
    );
  }

  // Get user's playlists
  async getUserPlaylists(accessToken, limit = 50) {
    return await this.makeRequest(
      `/me/playlists?limit=${limit}`,
      accessToken
    );
  }

  // Get recently played tracks
  async getRecentlyPlayed(accessToken, limit = 50) {
    return await this.makeRequest(
      `/me/player/recently-played?limit=${limit}`,
      accessToken
    );
  }

  // Search for tracks
  async searchTracks(accessToken, query, limit = 20) {
    const encodedQuery = encodeURIComponent(query);
    return await this.makeRequest(
      `/search?q=${encodedQuery}&type=track&limit=${limit}`,
      accessToken
    );
  }

  // Get audio features for tracks
  async getAudioFeatures(accessToken, trackIds) {
    const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds;
    return await this.makeRequest(
      `/audio-features?ids=${ids}`,
      accessToken
    );
  }

  // Get recommendations based on seeds
  async getRecommendations(accessToken, seedArtists = [], seedTracks = [], seedGenres = [], options = {}) {
    const params = new URLSearchParams();
    
    if (seedArtists.length) params.append('seed_artists', seedArtists.join(','));
    if (seedTracks.length) params.append('seed_tracks', seedTracks.join(','));
    if (seedGenres.length) params.append('seed_genres', seedGenres.join(','));
    
    // Add optional parameters
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value);
    });

    return await this.makeRequest(
      `/recommendations?${params.toString()}`,
      accessToken
    );
  }

  // Helper method to format time ranges
  getTimeRangeOptions() {
    return [
      { value: 'short_term', label: 'Last 4 weeks' },
      { value: 'medium_term', label: 'Last 6 months' },
      { value: 'long_term', label: 'All time' }
    ];
  }

  // Helper method to get genre seeds
  async getGenreSeeds(accessToken) {
    return await this.makeRequest('/recommendations/available-genre-seeds', accessToken);
  }

  // Store tokens in localStorage (you might want to use a more secure method)
  storeTokens(tokens) {
    localStorage.setItem('spotify_access_token', tokens.access_token);
    localStorage.setItem('spotify_refresh_token', tokens.refresh_token);
    localStorage.setItem('spotify_token_expires', Date.now() + (tokens.expires_in * 1000));
  }

  // Get stored tokens
  getStoredTokens() {
    return {
      access_token: localStorage.getItem('spotify_access_token'),
      refresh_token: localStorage.getItem('spotify_refresh_token'),
      expires_at: localStorage.getItem('spotify_token_expires')
    };
  }

  // Check if token is valid
  isTokenValid() {
    const tokens = this.getStoredTokens();
    return tokens.access_token && tokens.expires_at && Date.now() < parseInt(tokens.expires_at);
  }

  // Clear stored tokens
  clearTokens() {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expires');
  }

  // Create a playlist from generated songs
  async createPlaylistFromSongs(accessToken, songs, playlistName = 'VibeCheck Playlist', description = 'Generated by VibeCheck') {
    try {
      // Get user profile to get user ID
      const userProfile = await this.getUserProfile(accessToken);
      const userId = userProfile.id;

      // Create the playlist
      const playlist = await this.createPlaylist(accessToken, userId, playlistName, description);
      const playlistId = playlist.id;

      // Search for each song and collect track URIs
      const trackUris = [];
      const foundSongs = [];
      const notFoundSongs = [];

      for (const song of songs) {
        try {
          // Search for the track
          const searchQuery = `${song.title} ${song.artist}`;
          const searchResult = await this.searchTracks(accessToken, searchQuery, 1);
          
          if (searchResult.tracks.items.length > 0) {
            const track = searchResult.tracks.items[0];
            trackUris.push(track.uri);
            foundSongs.push({
              ...song,
              spotifyUri: track.uri,
              spotifyId: track.id,
              spotifyName: track.name,
              spotifyArtist: track.artists[0].name
            });
          } else {
            notFoundSongs.push(song);
          }
        } catch (error) {
          console.error(`Error searching for song: ${song.title} by ${song.artist}`, error);
          notFoundSongs.push(song);
        }
      }

      // Add found tracks to playlist (in batches of 100 due to Spotify API limits)
      if (trackUris.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < trackUris.length; i += batchSize) {
          const batch = trackUris.slice(i, i + batchSize);
          await this.addTracksToPlaylist(accessToken, playlistId, batch);
        }
      }

      return {
        playlistId,
        playlistUrl: playlist.external_urls.spotify,
        playlistName: playlist.name,
        totalSongs: songs.length,
        foundSongs: foundSongs.length,
        notFoundSongs: notFoundSongs.length,
        foundSongsList: foundSongs,
        notFoundSongsList: notFoundSongs
      };
    } catch (error) {
      console.error('Error creating playlist from songs:', error);
      throw error;
    }
  }
}

export default new SpotifyService(); 