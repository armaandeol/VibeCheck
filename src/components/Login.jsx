import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      })
      
      if (error) {
        console.error('Error signing in with Google:', error.message)
        alert('Error signing in with Google. Please try again.')
      } else {
        // The redirect will be handled by the OAuth flow
        // The user will be redirected to home after successful authentication
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      alert('Error signing in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 animate-gradient-shift flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="card-glass max-w-4xl w-full relative z-10 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Image */}
          <div className="md:w-1/2 bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8 flex items-center justify-center backdrop-blur-sm border-r border-slate-700/50">
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-slate-600/50 animate-pulse-glow">
                <div className="text-6xl animate-float">🎵</div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 text-gradient">
                Welcome to VibeCheck
              </h2>
              <p className="text-blue-200 text-lg">
                Discover your musical journey and connect with your vibe
              </p>
              <div className="mt-6 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Sign In
                </h1>
                <h2 className="text-xl text-blue-300 mb-4">
                  Check Your Vibe
                </h2>
                <p className="text-gray-300">
                  Join thousands of music lovers discovering their perfect soundtrack. 
                  Sign in to unlock personalized recommendations and connect with your musical identity.
                </p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white/10 backdrop-blur-sm border-2 border-slate-600/50 rounded-xl px-6 py-4 flex items-center justify-center space-x-3 hover:bg-white/20 hover:border-slate-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 group"
              >
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-white font-medium">Continue with Google</span>
                  </>
                )}
              </button>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
