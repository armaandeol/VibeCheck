-- Fix RLS policies for friend and chat functionality
-- Run this in your Supabase SQL Editor

-- Drop and recreate profiles policies to be more permissive
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- More permissive profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view other profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Drop and recreate friends policies
DROP POLICY IF EXISTS "Users can view their friends" ON friends;
DROP POLICY IF EXISTS "Users can insert friend requests" ON friends;
DROP POLICY IF EXISTS "Users can update their friend requests" ON friends;
DROP POLICY IF EXISTS "Users can delete their friend requests" ON friends;

-- More permissive friends policies
CREATE POLICY "Users can view their friends" ON friends
    FOR SELECT USING (auth.uid()::text = user_id::text OR auth.uid()::text = friend_id::text);

CREATE POLICY "Users can insert friend requests" ON friends
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their friend requests" ON friends
    FOR UPDATE USING (auth.uid()::text = user_id::text OR auth.uid()::text = friend_id::text);

CREATE POLICY "Users can delete their friend requests" ON friends
    FOR DELETE USING (auth.uid()::text = user_id::text OR auth.uid()::text = friend_id::text);

-- Drop and recreate chat rooms policies
DROP POLICY IF EXISTS "Users can view their chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can update their chat rooms" ON chat_rooms;

-- More permissive chat rooms policies
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
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_room_id = chat_rooms.id 
            AND chat_participants.user_id::text = auth.uid()::text
        )
    );

-- Drop and recreate chat participants policies
DROP POLICY IF EXISTS "Users can view chat participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can manage chat participants" ON chat_participants;

-- More permissive chat participants policies
CREATE POLICY "Users can view chat participants" ON chat_participants
    FOR SELECT USING (
        user_id::text = auth.uid()::text
        OR EXISTS (
            SELECT 1 FROM chat_rooms
            WHERE chat_rooms.id = chat_participants.chat_room_id
            AND EXISTS (
                SELECT 1 FROM chat_participants AS cp2
                WHERE cp2.chat_room_id = chat_rooms.id
                AND cp2.user_id::text = auth.uid()::text
            )
        )
    );

CREATE POLICY "Users can manage chat participants" ON chat_participants
    FOR ALL USING (
        user_id::text = auth.uid()::text
        OR EXISTS (
            SELECT 1 FROM chat_rooms
            WHERE chat_rooms.id = chat_participants.chat_room_id
            AND EXISTS (
                SELECT 1 FROM chat_participants AS cp2
                WHERE cp2.chat_room_id = chat_rooms.id
                AND cp2.user_id::text = auth.uid()::text
            )
        )
    );

-- Drop and recreate chat messages policies
DROP POLICY IF EXISTS "Users can view messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;

-- More permissive chat messages policies
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
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_room_id = chat_messages.chat_room_id 
            AND chat_participants.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update their own messages" ON chat_messages
    FOR UPDATE USING (sender_id::text = auth.uid()::text);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon users for basic access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Test the fix
SELECT 'RLS policies updated successfully' as status;

-- Optional: Test if the policies work
-- Replace 'your-user-id' with an actual user ID
-- SELECT * FROM chat_participants WHERE user_id = 'your-user-id'::uuid LIMIT 1; 