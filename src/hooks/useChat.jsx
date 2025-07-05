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
    if (!roomId) {
      console.log('No room ID provided for fetchMessages');
      return;
    }

    console.log('Fetching messages for room:', roomId);

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles(id, name, avatar_url)
        `)
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      console.log('Fetched messages:', data);
      
      // Ensure messages have proper sender information
      const processedMessages = data?.map(message => ({
        ...message,
        sender: message.sender || { id: message.sender_id, name: 'Unknown', avatar_url: null }
      })) || [];
      
      console.log('Processed messages:', processedMessages);
      setMessages(processedMessages)
    } catch (err) {
      console.error('Error in fetchMessages:', err);
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
      console.log('Fetching chat rooms for user:', user.id);
      
      // Try the direct approach first
      try {
        // First get all chat room IDs where user is a participant
        const { data: participantRooms, error: participantError } = await supabase
          .from('chat_participants')
          .select('chat_room_id')
          .eq('user_id', user.id);

        if (participantError) {
          console.error('Error fetching participant rooms:', participantError);
          throw participantError;
        }

        if (!participantRooms || participantRooms.length === 0) {
          console.log('No chat rooms found for user');
          setChatRooms([]);
          return;
        }

        const roomIds = participantRooms.map(p => p.chat_room_id);
        console.log('Room IDs:', roomIds);

        // Now fetch the actual chat rooms with participants and last message
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
          .in('id', roomIds)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching chat rooms:', error);
          throw error;
        }
        
        console.log('Fetched chat rooms:', data);
        setChatRooms(data || [])
      } catch (directError) {
        console.warn('Direct approach failed, trying alternative:', directError);
        
        // Fallback: Use RPC function or simpler query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('created_by', user.id)
          .order('updated_at', { ascending: false });

        if (fallbackError) {
          console.error('Fallback approach also failed:', fallbackError);
          throw fallbackError;
        }

        console.log('Fallback chat rooms:', fallbackData);
        setChatRooms(fallbackData || []);
      }
    } catch (err) {
      console.error('Error in fetchChatRooms:', err);
      setError(err.message)
      setChatRooms([])
    } finally {
      setLoading(false)
    }
  }, [user])

  // Send a message
  const sendMessage = useCallback(async (message, roomId = chatRoomId, messageType = 'text', metadata = null) => {
    console.log('sendMessage called with:', { message, roomId, messageType, metadata, user: user?.id });
    
    if (!user) {
      console.error('No user logged in');
      return null;
    }
    
    if (!roomId) {
      console.error('No room ID provided');
      return null;
    }
    
    if (!message.trim() && messageType === 'text') {
      console.error('Empty message for text type');
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

      // Create optimistic message for immediate UI update
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        ...messageData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {
          id: user.id,
          name: user.name || user.email,
          avatar_url: user.avatar_url
        }
      };

      // Add optimistic message to UI immediately
      setMessages(prev => [...prev, optimisticMessage]);

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select(`
          *,
          sender:profiles(id, name, avatar_url)
        `)

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        throw error;
      }
      
      const sentMessage = data?.[0];
      if (sentMessage) {
        // Replace optimistic message with real message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id ? {
              ...sentMessage,
              sender: sentMessage.sender || { id: sentMessage.sender_id, name: 'Unknown', avatar_url: null }
            } : msg
          )
        );
      }
      
      // Update last read timestamp
      try {
        await supabase.rpc('update_last_read', { chat_room_uuid: roomId });
      } catch (readError) {
        console.warn('Failed to update last read:', readError);
      }
      
      return sentMessage || null;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message)
      return null
    }
  }, [user, chatRoomId])

  // Create a direct message chat room
  const createDirectMessage = useCallback(async (otherUserId) => {
    if (!user) {
      console.error('No user logged in for createDirectMessage');
      return null;
    }

    if (!otherUserId) {
      console.error('No other user ID provided for createDirectMessage');
      return null;
    }

    console.log('Creating direct message between:', user.id, 'and', otherUserId);

    try {
      const { data, error } = await supabase.rpc('create_direct_message', {
        user1_id: user.id,
        user2_id: otherUserId
      })

      if (error) {
        console.error('Error creating direct message:', error);
        throw error;
      }

      console.log('Direct message created with room ID:', data);
      return data;
    } catch (err) {
      console.error('Error in createDirectMessage:', err);
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
    if (!chatRoomId) {
      console.log('No chat room ID for real-time subscription');
      return;
    }

    console.log('Setting up real-time subscription for room:', chatRoomId);

    const subscription = supabase
      .channel(`chat:${chatRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${chatRoomId}`
      }, (payload) => {
        console.log('Real-time INSERT received:', payload);
        const newMessage = {
          ...payload.new,
          sender: payload.new.sender || { id: payload.new.sender_id, name: 'Unknown', avatar_url: null }
        };
        setMessages(prev => {
          // Check if message already exists (to avoid duplicates)
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) {
            console.log('Message already exists, not adding duplicate');
            return prev;
          }
          console.log('Adding new message to state:', newMessage);
          return [...prev, newMessage];
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${chatRoomId}`
      }, (payload) => {
        console.log('Real-time UPDATE received:', payload);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === payload.new.id ? {
              ...payload.new,
              sender: payload.new.sender || { id: payload.new.sender_id, name: 'Unknown', avatar_url: null }
            } : msg
          )
        )
      })
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      })

    return () => {
      console.log('Cleaning up real-time subscription for room:', chatRoomId);
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