import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SpotifyService from '../lib/spotify';

const SpotifyCallback = () => {
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');

        if (errorParam) {
          throw new Error(`Spotify authorization error: ${errorParam}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Spotify');
        }

        setStatus('Exchanging authorization code for access token...');

        // Exchange code for access token
        const tokens = await SpotifyService.getAccessToken(code);
        
        // Store tokens
        SpotifyService.storeTokens(tokens);

        setStatus('Getting your Spotify profile...');

        // Get user's Spotify profile
        const spotifyProfile = await SpotifyService.getUserProfile(tokens.access_token);
        
        // Store Spotify profile data in localStorage for now
        localStorage.setItem('spotify_profile', JSON.stringify(spotifyProfile));

        setStatus('Success! Redirecting to your profile...');

        // Redirect back to profile page
        setTimeout(() => {
          navigate('/profile');
        }, 2000);

      } catch (err) {
        console.error('Spotify callback error:', err);
        setError(err.message);
        setStatus('Error occurred');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="card-glass p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.481.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Connecting to Spotify</h1>
            <p className="text-gray-300">{status}</p>
          </div>

          {error ? (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
              <button
                onClick={() => navigate('/profile')}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Return to Profile
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotifyCallback; 