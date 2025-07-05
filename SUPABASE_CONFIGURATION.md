# VibeCheck - Supabase Database Configuration

## Overview

This document outlines the Supabase database configuration for the VibeCheck application. The app uses a `profiles` table to store user information and manage user relationships.

## Database Schema

### Profiles Table

The `profiles` table stores all user profile information:

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    account_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    top_artists TEXT[] DEFAULT '{}',
    top_songs TEXT[] DEFAULT '{}',
    friends JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references auth.users(id) |
| `name` | TEXT | User's display name |
| `email` | TEXT | User's email address (unique) |
| `account_created_at` | TIMESTAMP | When the account was created |
| `top_artists` | TEXT[] | Array of user's favorite artists |
| `top_songs` | TEXT[] | Array of user's favorite songs |
| `friends` | JSONB | JSON array of friend objects |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record last update timestamp |

### Friends Structure

The `friends` field stores an array of friend objects with the following structure:

```json
[
  {
    "id": "uuid-of-friend",
    "name": "Friend's Name",
    "email": "friend@example.com",
    "added_at": "2023-12-01T10:00:00.000Z"
  }
]
```

## SQL Setup Commands

Run these commands in your Supabase SQL editor:

### 1. Create the profiles table

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    account_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    top_artists TEXT[] DEFAULT '{}',
    top_songs TEXT[] DEFAULT '{}',
    friends JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Enable Row Level Security (RLS)

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 3. Create RLS Policies

```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can read other users' profiles (for friend search)
-- This policy allows reading basic info for friend searches
CREATE POLICY "Users can read other profiles for friends" ON profiles
    FOR SELECT USING (true);

-- Note: The above policies work together - users can read their own profile 
-- AND other profiles for friend search functionality
```

### 4. Create updated_at trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5. Create function to handle user signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email, account_created_at)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'display_name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        NEW.created_at
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, ignore
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't prevent user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

## Environment Variables

Make sure these environment variables are set in your `.env.local` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

## File Structure

The profile functionality is implemented across several files:

### Backend/Database Layer
- `src/lib/supabase.js` - Supabase client configuration
- `src/lib/database.js` - Generic database operations
- `src/lib/profile.js` - Profile-specific operations

### Frontend/React Layer
- `src/hooks/useAuth.jsx` - Authentication hook with profile management
- `src/components/Profile.jsx` - Profile management component
- `src/pages/ProfilePage.jsx` - Profile page with tabs

## Features

### Profile Management
- ✅ Automatic profile creation on user signup
- ✅ Profile editing (name, top artists, top songs)
- ✅ View profile information
- ✅ Account creation date tracking

### Friend System
- ✅ Add friends by email
- ✅ Remove friends
- ✅ View friends list
- ✅ Search users by email
- ✅ Friend relationship tracking

### Data Types
- ✅ User ID (UUID)
- ✅ Name (Text)
- ✅ Email (Text, unique)
- ✅ Account creation date (Timestamp)
- ✅ Top artists (Array)
- ✅ Top songs (Array)
- ✅ Friends (JSON array with relationship metadata)

## Security

### Row Level Security (RLS)
- Users can only read/write their own profiles
- Users can read other users' profiles for friend search
- All database operations are secured through RLS policies

### Authentication
- Uses Supabase Auth with OAuth providers
- Profiles are automatically linked to auth users
- No direct database access without authentication

## Usage Examples

### Creating a Profile (Automatic)
Profiles are automatically created when users sign up through the auth trigger.

### Adding a Friend
```javascript
const { data, error } = await addFriend('friend@example.com');
```

### Updating Profile
```javascript
const { data, error } = await updateProfile({
  name: 'New Name',
  top_artists: ['Artist 1', 'Artist 2'],
  top_songs: ['Song 1', 'Song 2']
});
```

### Getting User Profile
```javascript
const { data, error } = await profile.getProfile(userId);
```

## Next Steps

For future enhancements, consider:

1. **Chat System**: Implement real-time messaging between friends
2. **Music Integration**: Connect with Spotify/Apple Music APIs
3. **Recommendation Engine**: Use ML to suggest music based on friends' preferences
4. **Privacy Settings**: Allow users to control profile visibility
5. **Activity Feed**: Track and display user music activities
6. **Groups/Communities**: Create music-based communities
7. **Push Notifications**: Notify users of friend activities

## Troubleshooting

### Common Issues

1. **Profile not created**: Check if the trigger `on_auth_user_created` is properly set up
2. **RLS blocking access**: Verify RLS policies are correctly configured
3. **Friend addition failing**: Ensure the friend's email exists in the profiles table
4. **Environment variables**: Double-check `.env.local` configuration
5. **OAuth users can't sign in**: New OAuth users need to complete the signup flow first
6. **Profile not created for OAuth users**: The trigger might not fire for OAuth - check the function

### OAuth-Specific Issues

**Problem**: New users with OAuth (Google) can't sign in on their first attempt.

**Solution**: OAuth users are automatically signed up on first login. The issue is often:
- The trigger `on_auth_user_created` is not firing
- RLS policies are blocking the profile creation
- The profile creation fails silently

**Fix**: Run this SQL to ensure the trigger works with OAuth:

```sql
-- Check if the trigger exists
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';

-- If the trigger exists but isn't working, recreate it:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Also ensure the function handles OAuth users properly:
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email, account_created_at)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'display_name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        NEW.created_at
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, ignore
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't prevent user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Debug Commands

```sql
-- Check if profile exists
SELECT * FROM profiles WHERE email = 'user@example.com';

-- Check all profiles
SELECT id, name, email, account_created_at FROM profiles;

-- Check auth users
SELECT id, email, created_at, raw_user_meta_data FROM auth.users ORDER BY created_at DESC;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check triggers
SELECT * FROM information_schema.triggers WHERE event_object_table = 'profiles';

-- Check if trigger function exists
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'handle_new_user';

-- Test profile creation manually (replace with actual user ID)
SELECT handle_new_user() FROM auth.users WHERE email = 'test@example.com';

-- Check for any errors in Supabase logs
-- (This should be done in the Supabase dashboard under Logs)
```

## Support

If you encounter any issues with the database setup, please:

1. Check the Supabase logs for error messages
2. Verify all SQL commands were executed successfully
3. Ensure environment variables are properly configured
4. Test the auth flow to confirm user signup works correctly

## Step-by-Step Troubleshooting for OAuth Login Issues

### Step 1: Check if the user was created in auth.users

```sql
-- Check the most recent auth users
SELECT id, email, created_at, raw_user_meta_data 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

### Step 2: Check if profile was created

```sql
-- Check if profile exists for the user
SELECT * FROM profiles WHERE email = 'your-email@example.com';
```

### Step 3: If profile doesn't exist, check the trigger

```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'handle_new_user';
```

### Step 4: Manually create profile if needed

```sql
-- Replace with actual user data
INSERT INTO profiles (id, name, email, account_created_at)
SELECT 
    id,
    COALESCE(
        raw_user_meta_data->>'full_name', 
        raw_user_meta_data->>'name',
        split_part(email, '@', 1)
    ),
    email,
    created_at
FROM auth.users 
WHERE email = 'your-email@example.com';
```

### Step 5: Check RLS policies

```sql
-- Verify RLS policies allow access
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### Step 6: Test with simplified RLS (temporarily)

```sql
-- TEMPORARILY disable RLS for testing (re-enable afterwards!)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Try your login again, then re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Quick Fix Script

Run this if you're having issues with OAuth users:

```sql
-- First, check what users exist without profiles
SELECT u.id, u.email, u.created_at, u.raw_user_meta_data
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Create profiles for users who don't have them
INSERT INTO profiles (id, name, email, account_created_at)
SELECT 
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'full_name', 
        u.raw_user_meta_data->>'name',
        u.raw_user_meta_data->>'display_name',
        split_part(u.email, '@', 1)
    ),
    u.email,
    u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
```
