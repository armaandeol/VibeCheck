import { supabase } from "./supabase.js";
import { database } from "./database.js";

export const profile = {
  // Create a new profile when user signs up
  async createProfile(userData) {
    const profileData = {
      id: userData.id,
      name:
        userData.user_metadata?.full_name || userData.user_metadata?.name || "",
      email: userData.email,
      account_created_at: userData.created_at,
      top_artists: [],
      top_songs: [],
      friends: [],
    };

    const { data, error } = await database.insert("profiles", profileData);
    return { data, error };
  },

  // Get profile by user ID
  async getProfile(userId) {
    const { data, error } = await database.select("profiles", "*", {
      id: userId,
    });
    return { data: data?.[0], error };
  },

  // Update profile
  async updateProfile(userId, updates) {
    const { data, error } = await database.update("profiles", updates, {
      id: userId,
    });
    return { data, error };
  },

  // Update top artists
  async updateTopArtists(userId, artists) {
    const { data, error } = await database.update(
      "profiles",
      { top_artists: artists },
      { id: userId }
    );
    return { data, error };
  },

  // Update top songs
  async updateTopSongs(userId, songs) {
    const { data, error } = await database.update(
      "profiles",
      { top_songs: songs },
      { id: userId }
    );
    return { data, error };
  },

  // Add friend by email (robust, uses friends table)
  async addFriend(userId, friendEmail) {
    console.log('addFriend called with:', { userId, friendEmail });
    
    // Prevent adding yourself
    const { data: friendProfile, error: friendError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('email', friendEmail)
      .single();
      
    if (friendError || !friendProfile) {
      console.error('Friend not found:', friendError);
      return {
        data: null,
        error: friendError || { message: "Friend not found" },
      };
    }
    
    const friendId = friendProfile.id;
    if (userId === friendId) {
      return { data: null, error: { message: "You cannot add yourself as a friend." } };
    }
    
    // Check for existing request or friendship in either direction
    const { data: existing, error: existingError } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
      .in('status', ['pending', 'accepted']);
      
    if (existingError) {
      console.error('Error checking existing friendship:', existingError);
      return { data: null, error: existingError };
    }
    
    if (existing && existing.length > 0) {
      return { data: null, error: { message: "Friend request already sent or you are already friends." } };
    }
    
    // Insert pending request
    const { data, error } = await supabase
      .from('friends')
      .insert({ user_id: userId, friend_id: friendId, status: 'pending' })
      .select();
      
    console.log('Friend request result:', { data, error });
    return { data, error };
  },

  // Remove friend (removes both directions)
  async removeFriend(userId, friendId) {
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);
    return { error };
  },

  // Get user's friends
  async getFriends(userId) {
    console.log('getFriends called with userId:', userId);
    
    try {
      // Use Supabase RPC to get all accepted friends for this user
      const { data, error } = await supabase.rpc('get_user_friends', { user_uuid: userId });
      
      console.log('getFriends RPC result:', { data, error });
      
      if (error) {
        console.error('getFriends RPC error:', error);
        return { data: [], error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.error('getFriends exception:', err);
      return { data: [], error: err };
    }
  },

  // Get all friend relationships (accepted, pending, etc.)
  async getAllFriendRelationships(userId) {
    console.log('getAllFriendRelationships called with userId:', userId);
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        created_at,
        updated_at,
        user:profiles!friends_user_id_fkey(id, name, email, avatar_url),
        friend:profiles!friends_friend_id_fkey(id, name, email, avatar_url)
      `)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    console.log('getAllFriendRelationships database result:', { data, error });
    
    if (error) {
      console.error('getAllFriendRelationships error:', error);
      return { data: [], error };
    }

    // Transform the data to include relationship context
    const transformedData = data.map(relationship => {
      const isCurrentUserSender = relationship.user_id === userId;
      const otherUser = isCurrentUserSender ? relationship.friend : relationship.user;
      
      return {
        id: relationship.id,
        status: relationship.status,
        created_at: relationship.created_at,
        updated_at: relationship.updated_at,
        isCurrentUserSender,
        other_user: {
          id: otherUser.id,
          name: otherUser.name,
          email: otherUser.email,
          avatar_url: otherUser.avatar_url
        }
      };
    });

    console.log('getAllFriendRelationships transformed data:', transformedData);
    return { data: transformedData, error: null };
  },

  // Search users by email (for adding friends)
  async searchUserByEmail(email) {
    console.log('searchUserByEmail called with email:', email);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('email', email)
      .single();
      
    console.log('searchUserByEmail result:', { data, error });
    return { data, error };
  },

  // Get all profiles (for admin purposes or friend suggestions)
  async getAllProfiles() {
    const { data, error } = await database.select(
      "profiles",
      "id, name, email, account_created_at"
    );
    return { data, error };
  },

  // Check if profile exists
  async profileExists(userId) {
    const { data, error } = await this.getProfile(userId);
    return { exists: !!data && !error, data, error };
  },

  // Accept a friend request
  async acceptFriendRequest(requestId) {
    console.log('Accepting friend request with ID:', requestId);
    
    // First, let's check if the request exists and get its details
    const { data: requestData, error: fetchError } = await supabase
      .from('friends')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching friend request:', fetchError);
      return { data: null, error: fetchError };
    }
    
    console.log('Found friend request:', requestData);
    
    // Now update the status
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .select();
    
    console.log('Update result:', { data, error });
    
    return { data, error };
  },

  // Reject a friend request
  async rejectFriendRequest(requestId) {
    const { data, error } = await supabase
      .from('friends')
      .delete()
      .eq('id', requestId)
      .select();
    return { data, error };
  },

  // Cancel/withdraw a friend request
  async cancelFriendRequest(requestId) {
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'cancelled' })
      .eq('id', requestId)
      .select();
    return { data, error };
  },
};

export default profile;
