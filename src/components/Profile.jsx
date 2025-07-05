import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import SpotifySection from './SpotifySection';
import SpotifyService from '../lib/spotify';
import { supabase } from '../lib/supabase';

const Profile = ({ isSpotifyConnected, spotifyProfile, spotifyTopArtists, spotifyTopTracks }) => {
  const { user, userProfile, updateProfile, updateTopArtists, updateTopSongs, addFriend, removeFriend, getFriends, searchUserByEmail, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    top_artists: [],
    top_songs: []
  });
  const [friends, setFriends] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        name: userProfile.name || '',
        top_artists: userProfile.top_artists || [],
        top_songs: userProfile.top_songs || []
      });
    }
  }, [userProfile]);

  useEffect(() => {
    loadFriends();
    if (!user) return;
    // Real-time subscription for friends table
    const subscription = supabase
      .channel('profile_friends')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends', filter: `user_id=eq.${user.id}` }, loadFriends)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends', filter: `friend_id=eq.${user.id}` }, loadFriends)
      .subscribe();
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [user]);

  const loadFriends = async () => {
    try {
      const { data } = await getFriends();
      setFriends(data || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({
        name: editForm.name,
        top_artists: editForm.top_artists,
        top_songs: editForm.top_songs
      });
      
      if (error) {
        setMessage(`Error updating profile: ${error.message}`);
      } else {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        await refreshProfile();
      }
    } catch (error) {
      setMessage(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendEmail.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const { error } = await addFriend(friendEmail.trim());
      if (error) {
        setMessage(`Error adding friend: ${error.message}`);
      } else {
        setMessage('Friend request sent!');
        setFriendEmail('');
        await loadFriends();
      }
    } catch (error) {
      setMessage(`Error adding friend: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    setLoading(true);
    setMessage('');
    try {
      const { error } = await removeFriend(friendId);
      if (error) {
        setMessage(`Error removing friend: ${error.message}`);
      } else {
        setMessage('Friend removed successfully!');
        await loadFriends();
      }
    } catch (error) {
      setMessage(`Error removing friend: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleArrayInputChange = (field, index, value) => {
    const newArray = [...editForm[field]];
    newArray[index] = value;
    setEditForm(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field) => {
    setEditForm(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field, index) => {
    const newArray = editForm[field].filter((_, i) => i !== index);
    setEditForm(prev => ({ ...prev, [field]: newArray }));
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Connect with Spotify Section (restored design) */}
        {!isSpotifyConnected && (
          <div className="card-glass p-8 mb-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.481.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Connect Your Spotify</h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Connect your Spotify account to get personalized music recommendations and create mood-based playlists.
            </p>
            <button
              onClick={() => {
                window.location.href = SpotifyService.getAuthUrl();
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-300 flex items-center gap-2 mx-auto shadow-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.481.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Connect with Spotify
            </button>
          </div>
        )}

        {/* Profile Header */}
        <div className="card-glass mb-8">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
                <p className="text-blue-300">Manage your VibeCheck profile</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.includes('Error') 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                  : 'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}>
                {message}
              </div>
            )}

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-white bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2">
                    {isSpotifyConnected && spotifyProfile?.display_name ? spotifyProfile.display_name : userProfile.name || 'No name set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Email</label>
                <p className="text-white bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2">
                  {isSpotifyConnected && spotifyProfile?.email ? spotifyProfile.email : userProfile.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Account Created</label>
                <p className="text-white bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2">
                  {new Date(userProfile.account_created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">User ID</label>
                <p className="text-white bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-sm font-mono">
                  {userProfile.id}
                </p>
              </div>
            </div>

            {/* Top Artists */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-blue-300 mb-2">Top Artists</label>
              {isEditing ? (
                <div className="space-y-2">
                  {editForm.top_artists.map((artist, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={artist}
                        onChange={(e) => handleArrayInputChange('top_artists', index, e.target.value)}
                        className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Artist name"
                      />
                      <button
                        onClick={() => removeArrayItem('top_artists', index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors duration-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('top_artists')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-300"
                  >
                    Add Artist
                  </button>
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2">
                  {isSpotifyConnected && spotifyTopArtists?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {spotifyTopArtists.map((artist, index) => (
                        <span key={index} className="bg-green-600/30 text-green-300 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                          {artist.name}
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        </span>
                      ))}
                    </div>
                  ) : userProfile.top_artists?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {userProfile.top_artists.map((artist, index) => (
                        <span key={index} className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded-full text-sm">
                          {artist}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No top artists set</p>
                  )}
                </div>
              )}
            </div>

            {/* Top Songs */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-blue-300 mb-2">Top Songs</label>
              {isEditing ? (
                <div className="space-y-2">
                  {editForm.top_songs.map((song, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={song}
                        onChange={(e) => handleArrayInputChange('top_songs', index, e.target.value)}
                        className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Song name"
                      />
                      <button
                        onClick={() => removeArrayItem('top_songs', index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors duration-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('top_songs')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-300"
                  >
                    Add Song
                  </button>
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2">
                  {isSpotifyConnected && spotifyTopTracks?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {spotifyTopTracks.map((track, index) => (
                        <span key={index} className="bg-green-600/30 text-green-300 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                          {track.name}
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        </span>
                      ))}
                    </div>
                  ) : userProfile.top_songs?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {userProfile.top_songs.map((song, index) => (
                        <span key={index} className="bg-purple-600/30 text-purple-300 px-2 py-1 rounded-full text-sm">
                          {song}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No top songs set</p>
                  )}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Spotify Section */}
        <SpotifySection />

        {/* Friends Section */}
        <div className="card-glass">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Friends</h2>
            
            {/* Add Friend Form */}
            <form onSubmit={handleAddFriend} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="Enter friend's email"
                  className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <span className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Add Friend'}
                </button>
              </div>
            </form>

            {/* Friends List */}
            <div className="space-y-3">
              {friends.length ? (
                friends.map((friend) => (
                  <div key={friend.friend_id} className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {friend.friend_avatar_url ? (
                          <img src={friend.friend_avatar_url} alt={friend.friend_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          friend.friend_name?.charAt(0) || friend.friend_email?.charAt(0) || 'F'
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{friend.friend_name || 'User'}</h3>
                        <p className="text-blue-300 text-sm">{friend.friend_email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend.friend_id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors duration-300 text-sm disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? <span className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Remove'}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No friends added yet. Add friends by their email to start connecting!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
