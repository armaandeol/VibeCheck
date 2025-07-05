import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'

const AddFriends = ({ isOpen, onClose }) => {
  const { user, addFriend, removeFriend, acceptFriendRequest, rejectFriendRequest } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('search') // 'search', 'pending', 'sent'
  const [message, setMessage] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Search for users by email
  const searchUsers = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .ilike('email', `%${query}%`)
        .neq('id', user?.id)
        .limit(10)

      if (!error && data) {
        // Filter out users who are already friends or have pending requests
        const filteredResults = data.filter(profile => {
          const isAlreadyFriend = pendingRequests.some(req => req.friend_id === profile.id)
          const hasSentRequest = sentRequests.some(req => req.friend_id === profile.id)
          return !isAlreadyFriend && !hasSentRequest
        })
        setSearchResults(filteredResults)
      }
    } catch (err) {
      console.error('Error searching users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Send friend request (robust)
  const sendFriendRequest = async (friendEmail) => {
    setActionLoading(true)
    setMessage('')
    try {
      const { error } = await addFriend(friendEmail)
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Friend request sent!')
        setSearchResults(prev => prev.filter(result => result.email !== friendEmail))
        fetchSentRequests()
      }
    } catch (err) {
      setMessage('Error sending friend request.')
    } finally {
      setActionLoading(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  // Accept friend request
  const handleAcceptFriendRequest = async (requestId) => {
    setActionLoading(true)
    setMessage('')
    try {
      const { error } = await acceptFriendRequest(requestId)
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Friend request accepted!')
        fetchPendingRequests()
      }
    } catch (err) {
      setMessage('Error accepting friend request.')
    } finally {
      setActionLoading(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  // Reject friend request
  const handleRejectFriendRequest = async (requestId) => {
    setActionLoading(true)
    setMessage('')
    try {
      const { error } = await rejectFriendRequest(requestId)
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Friend request rejected.')
        fetchPendingRequests()
      }
    } catch (err) {
      setMessage('Error rejecting friend request.')
    } finally {
      setActionLoading(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  // Cancel sent request (removeFriend)
  const cancelSentRequest = async (friendId) => {
    setActionLoading(true)
    setMessage('')
    try {
      const { error } = await removeFriend(friendId)
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Friend request canceled.')
        fetchSentRequests()
      }
    } catch (err) {
      setMessage('Error canceling friend request.')
    } finally {
      setActionLoading(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  // Fetch pending friend requests
  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          user:profiles!friends_user_id_fkey(id, name, email, avatar_url)
        `)
        .eq('friend_id', user?.id)
        .eq('status', 'pending')

      if (!error && data) {
        setPendingRequests(data)
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err)
    }
  }

  // Fetch sent friend requests
  const fetchSentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          friend:profiles!friends_friend_id_fkey(id, name, email, avatar_url)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'pending')

      if (!error && data) {
        setSentRequests(data)
      }
    } catch (err) {
      console.error('Error fetching sent requests:', err)
    }
  }

  // Search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Fetch requests on mount
  useEffect(() => {
    if (isOpen && user) {
      fetchPendingRequests()
      fetchSentRequests()
      // Real-time subscription for friend requests
      const subscription = supabase
        .channel('addfriends_friends')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'friends', filter: `user_id=eq.${user.id}` }, () => {
          fetchPendingRequests()
          fetchSentRequests()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'friends', filter: `friend_id=eq.${user.id}` }, () => {
          fetchPendingRequests()
          fetchSentRequests()
        })
        .subscribe();
      return () => {
        if (subscription) supabase.removeChannel(subscription)
      }
    }
  }, [isOpen, user])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md max-h-[600px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <h2 className="text-white font-bold text-lg">Add Friends</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'search' 
                ? 'text-green-400 border-b-2 border-green-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'pending' 
                ? 'text-green-400 border-b-2 border-green-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pending
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'sent' 
                ? 'text-green-400 border-b-2 border-green-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sent
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {activeTab === 'search' && (
            <div>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                />
              </div>
              
              {loading && (
                <div className="text-gray-400 text-center py-4">Searching...</div>
              )}
              
              {searchResults.length === 0 && !loading && searchQuery.length >= 3 && (
                <div className="text-gray-400 text-center py-4">No users found</div>
              )}
              
              {searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.name?.charAt(0) || user.email?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{user.name || 'User'}</div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => sendFriendRequest(user.email)}
                    className="bg-green-500 hover:bg-green-600 text-black px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    {actionLoading ? <span className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pending' && (
            <div>
              {pendingRequests.length === 0 ? (
                <div className="text-gray-400 text-center py-4">No pending friend requests</div>
              ) : (
                pendingRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {request.user.avatar_url ? (
                          <img src={request.user.avatar_url} alt={request.user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          request.user.name?.charAt(0) || request.user.email?.charAt(0) || 'U'
                        )}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{request.user.name || 'User'}</div>
                        <div className="text-gray-400 text-sm">{request.user.email}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptFriendRequest(request.id)}
                        className="bg-green-500 hover:bg-green-600 text-black px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                        disabled={actionLoading}
                      >
                        {actionLoading ? <span className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleRejectFriendRequest(request.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                        disabled={actionLoading}
                      >
                        {actionLoading ? <span className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div>
              {sentRequests.length === 0 ? (
                <div className="text-gray-400 text-center py-4">No sent friend requests</div>
              ) : (
                sentRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {request.friend.avatar_url ? (
                          <img src={request.friend.avatar_url} alt={request.friend.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          request.friend.name?.charAt(0) || request.friend.email?.charAt(0) || 'U'
                        )}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{request.friend.name || 'User'}</div>
                        <div className="text-gray-400 text-sm">{request.friend.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => cancelSentRequest(request.friend.id)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                      disabled={actionLoading}
                    >
                      {actionLoading ? <span className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Cancel'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Show message */}
        {message && (
          <div className={`p-3 text-center rounded-lg mb-2 ${message.startsWith('Error') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>{message}</div>
        )}
      </div>
    </div>
  )
}

export default AddFriends 