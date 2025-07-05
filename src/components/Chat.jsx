import { useState, useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import SpotifyService from '../lib/spotify.js'

const Chat = ({ selectedFriend: initialFriend, onClose }) => {
  const { user, getFriends } = useAuth()
  const [selectedFriend, setSelectedFriend] = useState(initialFriend)
  const [currentChatRoom, setCurrentChatRoom] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [friends, setFriends] = useState([])
  const [blendLoading, setBlendLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Use the chat hook for real-time functionality
  const {
    messages,
    chatRooms,
    loading,
    error,
    sendMessage,
    createDirectMessage,
    getUnreadCount,
    markAsRead
  } = useChat(currentChatRoom?.id)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const { data, error } = await getFriends();
        if (!error && data) {
          setFriends(data.map(friend => ({
            id: friend.friend_id,
            name: friend.friend_name,
            avatar_url: friend.friend_avatar_url,
            email: friend.friend_email
          })));
        }
      } catch (err) {
        console.error('Error fetching friends:', err);
      }
    };
    if (user) {
      fetchFriends();
    }
  }, [user, getFriends]);

  // Handle friend selection and create/get chat room
  const handleFriendSelect = async (friend) => {
    console.log('handleFriendSelect called with friend:', friend);
    setSelectedFriend(friend)
    
    // Check if DM already exists
    const existingRoom = chatRooms.find(room => 
      room.is_direct_message && 
      room.participants.some(p => p.user.id === friend.id)
    )

    console.log('Existing room found:', existingRoom);

    if (existingRoom) {
      console.log('Using existing room:', existingRoom.id);
      setCurrentChatRoom(existingRoom)
      markAsRead(existingRoom.id)
    } else {
      console.log('Creating new DM for friend:', friend.id);
      // Create new DM
      const roomId = await createDirectMessage(friend.id)
      console.log('New room ID:', roomId);
      if (roomId) {
        const newRoom = {
          id: roomId,
          name: null,
          is_direct_message: true,
          participants: [
            { user: { id: user.id, name: user.name, avatar_url: user.avatar_url } },
            { user: { id: friend.id, name: friend.name, avatar_url: friend.avatar_url } }
          ]
        }
        console.log('Setting new room:', newRoom);
        setCurrentChatRoom(newRoom)
      } else {
        console.error('Failed to create new DM');
      }
    }
  }

  const handleSendMessage = async () => {
    console.log('handleSendMessage called:', { 
      newMessage: newMessage.trim(), 
      currentChatRoom: currentChatRoom?.id,
      user: user?.id 
    });
    
    if (newMessage.trim() && currentChatRoom) {
      const success = await sendMessage(newMessage, currentChatRoom.id)
      console.log('sendMessage result:', success);
      if (success) {
        setNewMessage('')
      }
    } else {
      console.log('Message validation failed:', { 
        messageTrimmed: newMessage.trim(), 
        hasChatRoom: !!currentChatRoom 
      });
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleBlend = async () => {
    if (!selectedFriend || blendLoading) return
    
    setBlendLoading(true)
    try {
      // Get current user's Spotify tokens from database
      const userTokens = await SpotifyService.getStoredTokensFromDatabase(user.id)
      if (!userTokens?.access_token) {
        alert('Please connect your Spotify account first!')
        return
      }

      // Get friend's Spotify tokens from their profile
      const friendTokens = await SpotifyService.getStoredTokensFromDatabase(selectedFriend.id)
      if (!friendTokens?.access_token) {
        alert(`${selectedFriend.name || selectedFriend.email} needs to connect their Spotify account first!`)
        return
      }

      // Check if friend's token is valid, refresh if needed
      let friendAccessToken = friendTokens.access_token
      if (friendTokens.expires_at && Date.now() > parseInt(friendTokens.expires_at)) {
        try {
          const refreshedTokens = await SpotifyService.refreshAccessToken(friendTokens.refresh_token)
          friendAccessToken = refreshedTokens.access_token
          
          // Update friend's tokens in database
          await SpotifyService.storeTokensInDatabase(refreshedTokens, selectedFriend.id)
        } catch (refreshError) {
          alert(`${selectedFriend.name || selectedFriend.email} needs to reconnect their Spotify account!`)
          return
        }
      }

      // Get both users' top tracks
      const [userTopTracks, friendTopTracks] = await Promise.all([
        SpotifyService.getTopTracks(userTokens.access_token, 'medium_term', 10),
        SpotifyService.getTopTracks(friendAccessToken, 'medium_term', 10)
      ])

      // Combine and shuffle tracks from both users
      const allTracks = [...userTopTracks.items, ...friendTopTracks.items]
      const shuffledTracks = allTracks.sort(() => Math.random() - 0.5).slice(0, 20)
      const trackUris = shuffledTracks.map(track => track.uri)

      // Get current user's profile for playlist creation
      const userProfile = await SpotifyService.getUserProfile(userTokens.access_token)
      
      // Create collaborative playlist
      const playlistName = `${user.name || 'You'} & ${selectedFriend.name || selectedFriend.email} - Blend`
      const playlistDescription = `A collaborative playlist blending ${user.name || 'your'} and ${selectedFriend.name || selectedFriend.email}'s music tastes`
      
      const playlist = await SpotifyService.createPlaylist(
        userTokens.access_token, 
        userProfile.id, 
        playlistName, 
        playlistDescription, 
        true // public
      )

      // Add tracks to playlist
      if (trackUris.length > 0) {
        await SpotifyService.addTracksToPlaylist(userTokens.access_token, playlist.id, trackUris)
      }

      // Send playlist message to chat
      if (currentChatRoom) {
        await sendMessage('', currentChatRoom.id, 'playlist_share', {
          playlist: {
            id: playlist.id,
            name: playlist.name,
            url: playlist.external_urls.spotify,
            cover: playlist.images?.[0]?.url,
            tracks: trackUris.length,
            duration: '~1h'
          }
        })
      }

      // Open playlist in Spotify
      window.open(playlist.external_urls.spotify, '_blank')
      
    } catch (error) {
      console.error('Error creating blend playlist:', error)
      alert('Failed to create blend playlist. Please try again!')
    } finally {
      setBlendLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const renderMessage = (message) => {
    const isSent = message.sender_id === user?.id
    
    if (message.message_type === 'playlist_share') {
      const playlist = message.metadata?.playlist
      return (
        <div className={`message-bubble ${isSent ? 'message-sent' : 'message-received'}`}>
          <div className="flex items-center space-x-3">
            <img 
              src={playlist?.cover || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200'}
              alt={playlist?.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <div className="font-semibold text-sm">{playlist?.name || 'Playlist'}</div>
              <div className="text-xs opacity-70">
                {playlist?.tracks || 0} tracks • {playlist?.duration || '0m'}
              </div>
            </div>
          </div>
          <div className="message-time">{formatTime(message.created_at)}</div>
        </div>
      )
    }

    return (
      <div className={`message-bubble ${isSent ? 'message-sent' : 'message-received'}`}>
        <div>{message.message}</div>
        <div className="message-time">{formatTime(message.created_at)}</div>
      </div>
    )
  }

  // Friends List View
  if (!selectedFriend) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm md:max-w-md">
        <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 flex flex-col h-[400px]">
          <div className="flex items-center justify-between p-4 border-b border-slate-700 rounded-t-xl bg-slate-800">
            <div className="text-white font-bold text-lg">Friends</div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors ml-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-gray-400 text-center py-4">Loading friends...</div>
            ) : friends.length === 0 ? (
              <div className="text-gray-400 text-center py-4">No friends yet. Start connecting!</div>
            ) : (
              friends.map(friend => (
                <button
                  key={friend.id}
                  className="w-full flex items-center space-x-4 bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-3 transition-colors"
                  onClick={() => handleFriendSelect(friend)}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} alt={friend.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      friend.name?.charAt(0) || 'F'
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-semibold">{friend.name || friend.email}</div>
                    <div className="text-green-400 text-xs">Online</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // Chat View
  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm md:max-w-md">
      <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 flex flex-col h-[500px]">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 rounded-t-xl bg-slate-800">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSelectedFriend(null)} className="text-gray-400 hover:text-white mr-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="friend-avatar">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedFriend?.avatar_url ? (
                  <img src={selectedFriend.avatar_url} alt={selectedFriend.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  selectedFriend?.name?.charAt(0) || 'F'
                )}
              </div>
            </div>
            <div>
              <div className="text-white font-semibold">{selectedFriend?.name || selectedFriend?.email || 'Friend'}</div>
              <div className="text-green-400 text-xs">Online</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Blend Button */}
            <button 
              onClick={handleBlend}
              disabled={blendLoading}
              className="flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {blendLoading ? (
                <span className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
              ) : (
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              )}
              {blendLoading ? 'Creating...' : 'Blend'}
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors ml-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-container bg-slate-900">
          {loading ? (
            <div className="text-gray-400 text-center py-4">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-400 text-center py-4">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="animate-fade-in">
                {renderMessage(message)}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-xl">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg px-4 py-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat 