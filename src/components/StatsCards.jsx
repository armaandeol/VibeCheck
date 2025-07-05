import React from 'react'

const stats = [
  { key: 'playlists', label: 'Playlists', icon: (
    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="4" rx="2"/><rect x="3" y="10" width="18" height="4" rx="2"/><rect x="3" y="16" width="10" height="4" rx="2"/></svg>
  ) },
  { key: 'tracks', label: 'Tracks', icon: (
    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 15c1.333-.667 4-.667 5.333 0M8 11c2-.667 6-.667 8 0"/></svg>
  ) },
  { key: 'friends', label: 'Friends', icon: (
    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
  ) },
]

const StatsCards = ({ playlists, tracks, friends }) => {
  const values = { playlists, tracks, friends }
  return (
    <div className="flex flex-wrap gap-6 justify-center md:justify-start mb-8">
      {stats.map(stat => (
        <div key={stat.key} className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-xl shadow-lg p-6 min-w-[140px] flex flex-col items-center">
          <div className="mb-2">{stat.icon}</div>
          <div className="text-2xl font-bold text-white mb-1">{values[stat.key]}</div>
          <div className="text-green-400 text-sm font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards 