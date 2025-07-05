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

  // Add friend by email
  async addFriend(userId, friendEmail) {
    // First, find the friend's profile by email
    const { data: friendProfile, error: friendError } = await database.select(
      "profiles",
      "id, name, email",
      { email: friendEmail }
    );

    if (friendError || !friendProfile?.[0]) {
      return {
        data: null,
        error: friendError || { message: "Friend not found" },
      };
    }

    // Get current user's profile
    const { data: currentProfile, error: currentError } = await this.getProfile(
      userId
    );

    if (currentError || !currentProfile) {
      return {
        data: null,
        error: currentError || { message: "Current user profile not found" },
      };
    }

    // Check if friend is already added
    const friends = currentProfile.friends || [];
    const isAlreadyFriend = friends.some(
      (friend) => friend.id === friendProfile[0].id
    );

    if (isAlreadyFriend) {
      return { data: null, error: { message: "Friend already added" } };
    }

    // Add friend to the list
    const updatedFriends = [
      ...friends,
      {
        id: friendProfile[0].id,
        name: friendProfile[0].name,
        email: friendProfile[0].email,
        added_at: new Date().toISOString(),
      },
    ];

    const { data, error } = await this.updateProfile(userId, {
      friends: updatedFriends,
    });
    return { data, error };
  },

  // Remove friend
  async removeFriend(userId, friendId) {
    const { data: currentProfile, error: currentError } = await this.getProfile(
      userId
    );

    if (currentError || !currentProfile) {
      return {
        data: null,
        error: currentError || { message: "Current user profile not found" },
      };
    }

    const friends = currentProfile.friends || [];
    const updatedFriends = friends.filter((friend) => friend.id !== friendId);

    const { data, error } = await this.updateProfile(userId, {
      friends: updatedFriends,
    });
    return { data, error };
  },

  // Get user's friends
  async getFriends(userId) {
    // Use Supabase RPC to get all accepted friends for this user
    const { data, error } = await supabase.rpc('get_user_friends', { user_uuid: userId });
    return { data: data || [], error };
  },

  // Search users by email (for adding friends)
  async searchUserByEmail(email) {
    const { data, error } = await database.select(
      "profiles",
      "id, name, email",
      { email }
    );
    return { data: data?.[0], error };
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
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .select();
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
};

export default profile;
