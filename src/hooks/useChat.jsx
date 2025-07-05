import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth.jsx'
import { supabase } from '../lib/supabase.js'

export const useChat = (chatRoomId = null) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [chatRooms, setChatRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  // Fetch messages for a specific chat room
  const fetchMessages = useCallback(async (roomId) => {
    if (!roomId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles(name, avatar_url)
        `)
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch user's chat rooms
  const fetchChatRooms = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          participants:chat_participants(
            user:profiles(id, name, avatar_url)
          ),
          last_message:chat_messages(
            message,
            created_at,
            sender:profiles(name)
          )
        `)
        .in('id', 
          supabase
            .from('chat_participants')
            .select('chat_room_id')
            .eq('user_id', user.id)
        )
        .order('updated_at', { ascending: false })

      if (error) throw error
      setChatRooms(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Send a message
  const sendMessage = useCallback(async (message, roomId = chatRoomId, messageType = 'text', metadata = null) => {
    console.log('sendMessage called with:', { message, roomId, messageType, metadata, user: user?.id });
    
    if (!user || !roomId || (!message.trim() && messageType === 'text')) {
      console.log('sendMessage validation failed:', { user: !!user, roomId: !!roomId, messageTrim: message?.trim() });
      return null;
    }

    try {
      const messageData = {
        chat_room_id: roomId,
        sender_id: user.id,
        message: message.trim(),
        message_type: messageType
      }

      if (metadata) {
        messageData.metadata = metadata
      }

      console.log('Sending message data:', messageData);

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()

      console.log('Supabase response:', { data, error });

      if (error) throw error
      
      // Update last read timestamp
      await supabase.rpc('update_last_read', { chat_room_uuid: roomId })
      
      return data[0]
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message)
      return null
    }
  }, [user, chatRoomId])

  // Create a direct message chat room
  const createDirectMessage = useCallback(async (otherUserId) => {
    if (!user) return null

    try {
      const { data, error } = await supabase.rpc('create_direct_message', {
        user1_id: user.id,
        user2_id: otherUserId
      })

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [user])

  // Create a group chat room
  const createGroupChat = useCallback(async (name, participantIds) => {
    if (!user) return null

    try {
      // Create chat room
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name,
          is_direct_message: false,
          created_by: user.id
        })
        .select()
        .single()

      if (roomError) throw roomError

      // Add participants
      const participants = [
        { chat_room_id: room.id, user_id: user.id },
        ...participantIds.map(id => ({ chat_room_id: room.id, user_id: id }))
      ]

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants)

      if (participantsError) throw participantsError

      return room
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [user])

  // Get unread message count
  const getUnreadCount = useCallback(async (roomId) => {
    if (!user || !roomId) return 0

    try {
      const { data, error } = await supabase.rpc('get_unread_count', {
        chat_room_uuid: roomId
      })

      if (error) throw error
      return data || 0
    } catch (err) {
      setError(err.message)
      return 0
    }
  }, [user])

  // Mark messages as read
  const markAsRead = useCallback(async (roomId) => {
    if (!user || !roomId) return

    try {
      await supabase.rpc('update_last_read', { chat_room_uuid: roomId })
    } catch (err) {
      setError(err.message)
    }
  }, [user])

  // Real-time subscription for messages
  useEffect(() => {
    if (!chatRoomId) return

    const subscription = supabase
      .channel(`chat:${chatRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${chatRoomId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${chatRoomId}`
      }, (payload) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === payload.new.id ? payload.new : msg
          )
        )
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [chatRoomId])

  // Real-time subscription for chat rooms
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('chat_rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_rooms'
      }, () => {
        fetchChatRooms()
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_participants'
      }, () => {
        fetchChatRooms()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, fetchChatRooms])

  // Initial data fetch
  useEffect(() => {
    if (chatRoomId) {
      fetchMessages(chatRoomId)
    }
    fetchChatRooms()
  }, [chatRoomId, fetchMessages, fetchChatRooms])

  return {
    messages,
    chatRooms,
    loading,
    error,
    onlineUsers,
    sendMessage,
    createDirectMessage,
    createGroupChat,
    getUnreadCount,
    markAsRead,
    fetchMessages,
    fetchChatRooms
  }
} 