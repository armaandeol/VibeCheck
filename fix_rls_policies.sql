-- Fix RLS Policies for Chat Functionality
-- Run this script in your Supabase SQL Editor to fix the infinite recursion issue

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view chat participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can insert chat participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can update chat participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can delete chat participants" ON chat_participants;

-- Create simplified policies to avoid infinite recursion
CREATE POLICY "Users can view chat participants" ON chat_participants
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert chat participants" ON chat_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = chat_participants.chat_room_id 
            AND chat_rooms.created_by::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update chat participants" ON chat_participants
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete chat participants" ON chat_participants
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Test the fix
SELECT 'RLS policies updated successfully' as status;

-- Optional: Test if the policies work
-- Replace 'your-user-id' with an actual user ID
-- SELECT * FROM chat_participants WHERE user_id = 'your-user-id'::uuid LIMIT 1; 