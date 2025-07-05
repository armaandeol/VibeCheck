import React from 'react'

const SpotifyButton = ({ children, onClick, type = 'button', disabled = false, className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-full px-6 py-3 transition-all duration-200 shadow-md hover:from-green-400 hover:to-green-600 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
)

export default SpotifyButton 