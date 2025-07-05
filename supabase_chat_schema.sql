-- VibeCheck Chat Schema
-- Add real-time chat functionality to existing database
-- Run this script in your Supabase SQL Editor

-- ========================================
-- CORE TABLES
-- ========================================

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    account_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    top_artists TEXT[] DEFAULT '{}',
    top_songs TEXT[] DEFAULT '{}',
    friends JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Add top_artists column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'top_artists'
    ) THEN
        ALTER TABLE profiles ADD COLUMN top_artists TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add top_songs column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'top_songs'
    ) THEN
        ALTER TABLE profiles ADD COLUMN top_songs TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add friends column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'friends'
    ) THEN
        ALTER TABLE profiles ADD COLUMN friends JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Friends Table for proper friend relationships
DROP TABLE IF EXISTS friends CASCADE;
CREATE TABLE IF NOT EXISTS friends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- ========================================
-- CHAT TABLES
-- ========================================

-- Chat Rooms Table
DROP TABLE IF EXISTS chat_rooms CASCADE;
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT,
    is_direct_message BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Room Participants
DROP TABLE IF EXISTS chat_participants CASCADE;
CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chat_room_id, user_id)
);

-- Chat Messages Table
DROP TABLE IF EXISTS chat_messages CASCADE;
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'playlist_share', 'mood_share')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view other profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Friends policies
DROP POLICY IF EXISTS "Users can view their friends" ON friends;
DROP POLICY IF EXISTS "Users can manage their friends" ON friends;

CREATE POLICY "Users can view their friends" ON friends
    FOR SELECT USING (auth.uid()::text = user_id::text OR auth.uid()::text = friend_id::text);

CREATE POLICY "Users can manage their friends" ON friends
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can update their chat rooms" ON chat_rooms;

DROP POLICY IF EXISTS "Users can view chat participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can manage chat participants" ON chat_participants;

DROP POLICY IF EXISTS "Users can view messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;

-- Chat rooms policies
CREATE POLICY "Users can view their chat rooms" ON chat_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_room_id = chat_rooms.id 
            AND chat_participants.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can create chat rooms" ON chat_rooms
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can update their chat rooms" ON chat_rooms
    FOR UPDATE USING (auth.uid()::text = created_by::text);

-- Chat participants policies
CREATE POLICY "Users can view chat participants" ON chat_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants cp2
            WHERE cp2.chat_room_id = chat_participants.chat_room_id 
            AND cp2.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage chat participants" ON chat_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = chat_participants.chat_room_id 
            AND chat_rooms.created_by::text = auth.uid()::text
        )
    );

-- Chat messages policies
CREATE POLICY "Users can view messages in their chats" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_room_id = chat_messages.chat_room_id 
            AND chat_participants.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can send messages in their chats" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid()::text = sender_id::text AND
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_room_id = chat_messages.chat_room_id 
            AND chat_participants.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update their own messages" ON chat_messages
    FOR UPDATE USING (auth.uid()::text = sender_id::text);

-- ========================================
-- FUNCTIONS
-- ========================================

-- Function to update updated_at column automatically
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a direct message chat room
DROP FUNCTION IF EXISTS create_direct_message(UUID, UUID) CASCADE;
CREATE OR REPLACE FUNCTION create_direct_message(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
    chat_room_id UUID;
BEGIN
    -- Check if DM already exists
    SELECT cr.id INTO chat_room_id
    FROM chat_rooms cr
    JOIN chat_participants cp1 ON cr.id = cp1.chat_room_id
    JOIN chat_participants cp2 ON cr.id = cp2.chat_room_id
    WHERE cr.is_direct_message = true
    AND cp1.user_id = user1_id
    AND cp2.user_id = user2_id;
    
    -- If DM exists, return it
    IF chat_room_id IS NOT NULL THEN
        RETURN chat_room_id;
    END IF;
    
    -- Create new DM
    INSERT INTO chat_rooms (is_direct_message, created_by)
    VALUES (true, user1_id)
    RETURNING id INTO chat_room_id;
    
    -- Add participants
    INSERT INTO chat_participants (chat_room_id, user_id)
    VALUES (chat_room_id, user1_id), (chat_room_id, user2_id);
    
    RETURN chat_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last read timestamp
DROP FUNCTION IF EXISTS update_last_read(UUID) CASCADE;
CREATE OR REPLACE FUNCTION update_last_read(chat_room_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE chat_participants
    SET last_read_at = NOW()
    WHERE chat_room_id = chat_room_uuid
    AND user_id::text = auth.uid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count
DROP FUNCTION IF EXISTS get_unread_count(UUID) CASCADE;
CREATE OR REPLACE FUNCTION get_unread_count(chat_room_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    last_read TIMESTAMP WITH TIME ZONE;
    unread_count INTEGER;
BEGIN
    -- Get last read timestamp
    SELECT last_read_at INTO last_read
    FROM chat_participants
    WHERE chat_room_id = chat_room_uuid
    AND user_id::text = auth.uid()::text;
    
    -- Count unread messages
    SELECT COUNT(*) INTO unread_count
    FROM chat_messages
    WHERE chat_room_id = chat_room_uuid
    AND sender_id::text != auth.uid()::text
    AND created_at > COALESCE(last_read, '1970-01-01'::timestamp);
    
    RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS
-- ========================================

-- Update timestamps
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS update_friends_updated_at ON friends;
CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON friends
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INDEXES
-- ========================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_direct_message ON chat_rooms(is_direct_message);

CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON chat_participants(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_last_read ON chat_participants(last_read_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- ========================================
-- SAMPLE DATA (Optional)
-- ========================================

-- Insert sample friends relationships (uncomment and modify as needed)
-- INSERT INTO friends (user_id, friend_id, status) VALUES 
-- ('user1-uuid', 'user2-uuid', 'accepted'),
-- ('user1-uuid', 'user3-uuid', 'pending');

-- ========================================
-- UTILITY FUNCTIONS
-- ========================================

-- Function to create profile for existing user (if needed)
DROP FUNCTION IF EXISTS create_profile_for_existing_user(TEXT) CASCADE;
CREATE OR REPLACE FUNCTION create_profile_for_existing_user(user_email TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO profiles (id, email, name)
    SELECT id, email, raw_user_meta_data->>'name'
    FROM auth.users
    WHERE email = user_email
    AND id NOT IN (SELECT id FROM profiles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's friends list
DROP FUNCTION IF EXISTS get_user_friends(UUID) CASCADE;
CREATE OR REPLACE FUNCTION get_user_friends(user_uuid UUID)
RETURNS TABLE (
    friend_id UUID,
    friend_name TEXT,
    friend_email TEXT,
    friend_avatar_url TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.email,
        p.avatar_url,
        f.status
    FROM friends f
    JOIN profiles p ON (f.friend_id = p.id OR f.user_id = p.id)
    WHERE (f.user_id = user_uuid OR f.friend_id = user_uuid)
    AND p.id != user_uuid
    AND f.status = 'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 