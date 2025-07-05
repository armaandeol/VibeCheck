import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import Chat from '../components/Chat'

const musicPersonality = {
  primaryGenre: 'Indie Rock',
  secondaryGenre: 'Electronic',
  mood: 'Energetic',
  listeningTime: '2.5 hours/day',
  topArtists: ['The Weeknd', 'Tame Impala', 'Daft Punk', 'Arctic Monkeys', 'Glass Animals'],
  topTracks: ['Blinding Lights', 'The Less I Know The Better', 'Get Lucky', 'Do I Wanna Know?', 'Heat Waves']
}

const recentActivity = [
  { id: 1, type: 'playlist', text: 'Created "Late Night Coding" playlist', time: '2 hours ago' },
  { id: 2, type: 'blend', text: 'Created blend with Sarah Kim', time: '1 day ago' },
  { id: 3, type: 'friend', text: 'Connected with Alex Chen', time: '3 days ago' },
  { id: 4, type: 'mood', text: 'Mood analysis: Energetic & Focused', time: '1 week ago' },
]

const ProfilePage = () => {
  const { user } = useAuth()
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-dashboard flex items-center justify-center relative overflow-hidden">
      {/* Floating Elements */}
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-black/30 rounded-2xl shadow-2xl backdrop-blur-xl">
        {/* Left: Profile & Stats */}
        <div className="col-span-1 flex flex-col items-center md:items-start">
          <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 text-center md:text-left">
            {user?.email || 'Music Lover'}
          </h1>
          <p className="text-gray-300 mb-4 text-center md:text-left">VibeCheck Member</p>
          <div className="flex space-x-6 mb-6">
            <div className="text-center">
              <div className="text-xl font-bold text-gradient">127</div>
              <div className="text-gray-400 text-sm">Playlists</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gradient">2.4k</div>
              <div className="text-gray-400 text-sm">Tracks</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gradient">23</div>
              <div className="text-gray-400 text-sm">Friends</div>
            </div>
          </div>
          <button
            className="btn-primary px-8 py-3 text-lg mb-3"
            onClick={() => setShowChat(true)}
          >
            Open Chat
          </button>
          <button className="btn-secondary px-8 py-3 text-lg">Edit Profile</button>
        </div>

        {/* Middle: Music Personality & Quick Actions */}
        <div className="col-span-1 flex flex-col items-center md:items-start">
          <div className="card-glass w-full mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Music Personality</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">{musicPersonality.mood}</span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">{musicPersonality.primaryGenre}</span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">{musicPersonality.secondaryGenre}</span>
            </div>
            <div className="text-gray-400 text-sm mb-2">Listening: {musicPersonality.listeningTime}</div>
            <div className="mb-2">
              <div className="font-semibold text-white">Top Artists:</div>
              <ul className="list-disc list-inside text-gray-300 text-sm">
                {musicPersonality.topArtists.map((artist, i) => <li key={i}>{artist}</li>)}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white">Top Tracks:</div>
              <ul className="list-disc list-inside text-gray-300 text-sm">
                {musicPersonality.topTracks.map((track, i) => <li key={i}>{track}</li>)}
              </ul>
            </div>
          </div>
          <div className="w-full flex flex-col gap-3">
            <button className="btn-accent w-full">Share Profile</button>
            <button className="btn-secondary w-full">Invite Friend</button>
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="col-span-1">
          <div className="card-glass w-full">
            <h3 className="text-xl font-bold text-white mb-2">Recent Activity</h3>
            <ul className="space-y-3">
              {recentActivity.map((act) => (
                <li key={act.id} className="flex items-center space-x-3 bg-slate-800/60 rounded-lg px-3 py-2">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-white font-bold">
                    {act.type === 'playlist' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>}
                    {act.type === 'blend' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" /></svg>}
                    {act.type === 'friend' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    {act.type === 'mood' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  </span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{act.text}</div>
                    <div className="text-gray-400 text-xs">{act.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Floating Chat Popup */}
      {showChat && (
        <Chat
          selectedFriend={null}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}

export default ProfilePage
