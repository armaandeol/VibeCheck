import React from 'react'

const SpotifyCard = ({ children, className = '' }) => (
  <div className={`bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-2xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
)

export default SpotifyCard 