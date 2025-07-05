import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Login from '../components/Login'
import SpotifyCard from '../components/SpotifyCard'
import SpotifySection from '../components/SpotifySection'

const LoginPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center pt-16">
      <SpotifySection className="w-full max-w-md mx-auto flex flex-col items-center justify-center">
        <SpotifyCard className="w-full">
          <Login />
        </SpotifyCard>
      </SpotifySection>
    </div>
  )
}

export default LoginPage
