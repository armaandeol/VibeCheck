import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const AuthCallback = () => {
  const [status, setStatus] = useState('Processing authentication...');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('Processing authentication tokens...');
        
        // Wait a moment for Supabase to process the URL hash
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          throw error;
        }

        if (session) {
          setStatus('Authentication successful! Redirecting...');
          console.log('User authenticated:', session.user.email);
          
          // Clear the URL hash to clean up the URL
          window.history.replaceState(null, '', window.location.pathname);
          
          // Redirect to home page after successful authentication
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        } else {
          setStatus('No session found, redirecting to login...');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 1000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message);
        setStatus('Authentication failed');
        
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="card-glass p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Authentication</h1>
            <p className="text-gray-300">{status}</p>
          </div>

          {error ? (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
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

export default AuthCallback; 