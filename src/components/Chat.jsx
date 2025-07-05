import { useState, useRef, useEffect } from 'react'

const mockFriends = [
  { id: 1, name: 'Alex Chen', online: true },
  { id: 2, name: 'Sarah Kim', online: false },
  { id: 3, name: 'Priya Singh', online: true },
  { id: 4, name: 'John Doe', online: true },
]

const Chat = ({ selectedFriend: initialFriend, onClose }) => {
  const [selectedFriend, setSelectedFriend] = useState(initialFriend)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'friend',
      text: 'Hey! Check out this new playlist I made for rainy days',
      time: '2:30 PM',
      type: 'text'
    },
    {
      id: 2,
      sender: 'me',
      text: 'That sounds perfect! Can you share it?',
      time: '2:32 PM',
      type: 'text'
    },
    {
      id: 3,
      sender: 'friend',
      text: 'Sure! Here\'s my "Rainy Day Vibes" playlist',
      time: '2:33 PM',
      type: 'playlist',
      playlist: {
        name: 'Rainy Day Vibes',
        tracks: 23,
        duration: '1h 15m',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200'
      }
    },
    {
      id: 4,
      sender: 'me',
      text: 'Love it! The vibe is perfect for today',
      time: '2:35 PM',
      type: 'text'
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'me',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      }
      setMessages([...messages, message])
      setNewMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderMessage = (message) => {
    const isSent = message.sender === 'me'
    
    if (message.type === 'playlist') {
      return (
        <div className={`message-bubble ${isSent ? 'message-sent' : 'message-received'}`}>
          <div className="flex items-center space-x-3">
            <img 
              src={message.playlist.cover} 
              alt={message.playlist.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <div className="font-semibold text-sm">{message.playlist.name}</div>
              <div className="text-xs opacity-70">
                {message.playlist.tracks} tracks • {message.playlist.duration}
              </div>
            </div>
          </div>
          <div className="message-time">{message.time}</div>
        </div>
      )
    }

    return (
      <div className={`message-bubble ${isSent ? 'message-sent' : 'message-received'}`}>
        <div>{message.text}</div>
        <div className="message-time">{message.time}</div>
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
            {mockFriends.map(friend => (
              <button
                key={friend.id}
                className="w-full flex items-center space-x-4 bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-3 transition-colors"
                onClick={() => setSelectedFriend(friend)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {friend.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-semibold">{friend.name}</div>
                  <div className={`text-xs ${friend.online ? 'text-green-400' : 'text-gray-400'}`}>{friend.online ? 'Online' : 'Offline'}</div>
                </div>
              </button>
            ))}
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
                {selectedFriend?.name?.charAt(0) || 'F'}
              </div>
            </div>
            <div>
              <div className="text-white font-semibold">{selectedFriend?.name || 'Friend'}</div>
              <div className="text-green-400 text-xs">{selectedFriend?.online ? 'Online' : 'Offline'}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Blend Button */}
            <button className="flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:scale-105 transition-transform">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Blend
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
          {messages.map((message) => (
            <div key={message.id} className="animate-fade-in">
              {renderMessage(message)}
            </div>
          ))}
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
              className="flex-1 search-input"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat 