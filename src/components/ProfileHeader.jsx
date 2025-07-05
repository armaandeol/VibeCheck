import React from 'react'

const ProfileHeader = ({ user, spotifyProfile, isSpotifyConnected }) => {
  const displayName = isSpotifyConnected && spotifyProfile?.display_name
    ? spotifyProfile.display_name
    : user?.name || user?.email?.split('@')[0] || 'Music Lover';
  const email = isSpotifyConnected && spotifyProfile?.email
    ? spotifyProfile.email
    : user?.email;
  const country = isSpotifyConnected && spotifyProfile?.country
    ? spotifyProfile.country
    : 'Unknown';
  const avatarUrl = isSpotifyConnected && spotifyProfile?.images?.[0]?.url
    ? spotifyProfile.images[0].url
    : null;
  const initial = displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="card-glass flex flex-col md:flex-row items-center md:items-end gap-8 p-8 mb-8 bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-2xl shadow-lg">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl font-bold">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        {isSpotifyConnected && (
          <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-gray-900 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 15c1.333-.667 4-.667 5.333 0M8 11c2-.667 6-.667 8 0" stroke="#222" strokeWidth="2" fill="none" /></svg>
          </span>
        )}
      </div>
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-4xl font-bold text-white mb-2">{displayName}</h1>
        <p className="text-gray-300 mb-2 text-lg">{email}</p>
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            {isSpotifyConnected ? 'Spotify Connected' : 'VibeCheck Member'}
          </span>
          <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
            {country}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader 