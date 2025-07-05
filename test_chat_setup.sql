-- Test script for VibeCheck Chat Setup
-- Run this in your Supabase SQL Editor to verify the setup

-- 1. Check if tables exist
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✅' ELSE '❌' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'friends', 'chat_rooms', 'chat_participants', 'chat_messages');

-- 2. Check if functions exist
SELECT 
    routine_name,
    CASE WHEN routine_name IS NOT NULL THEN '✅' ELSE '❌' END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_friends', 'create_direct_message', 'update_last_read', 'get_unread_count', 'test_chat_functionality');

-- 3. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'friends', 'chat_rooms', 'chat_participants', 'chat_messages')
ORDER BY tablename, policyname;

-- 4. Check sample data (replace with actual user IDs)
-- Replace 'your-user-id-here' with an actual user ID from your auth.users table
SELECT 'Sample data check - replace user ID' as note;

-- Example: Check if a specific user has friends
-- SELECT * FROM get_user_friends('your-user-id-here'::uuid);

-- Example: Check if a specific user has chat rooms
-- SELECT 
--     cr.id,
--     cr.name,
--     cr.is_direct_message,
--     cp.user_id,
--     p.name as participant_name
-- FROM chat_rooms cr
-- JOIN chat_participants cp ON cr.id = cp.chat_room_id
-- JOIN profiles p ON cp.user_id = p.id
-- WHERE cp.user_id = 'your-user-id-here'::uuid;

-- 5. Check indexes
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'friends', 'chat_rooms', 'chat_participants', 'chat_messages')
ORDER BY tablename, indexname;

-- 6. Test function (replace with actual user ID)
-- SELECT * FROM test_chat_functionality('your-user-id-here'::uuid);

-- ========================================
-- MANUAL TEST DATA CREATION
-- ========================================

-- To create test data, uncomment and modify the following sections:

-- 1. Create a test friend relationship (replace with actual user IDs)
-- INSERT INTO friends (user_id, friend_id, status) 
-- VALUES 
--     ('user1-uuid-here', 'user2-uuid-here', 'accepted')
-- ON CONFLICT (user_id, friend_id) DO NOTHING;

-- 2. Create a test chat room (replace with actual user IDs)
-- INSERT INTO chat_rooms (id, is_direct_message, created_by) 
-- VALUES 
--     (gen_random_uuid(), true, 'user1-uuid-here')
-- ON CONFLICT DO NOTHING;

-- 3. Add participants to the chat room (replace with actual room ID and user IDs)
-- INSERT INTO chat_participants (chat_room_id, user_id) 
-- VALUES 
--     ('room-uuid-here', 'user1-uuid-here'),
--     ('room-uuid-here', 'user2-uuid-here')
-- ON CONFLICT (chat_room_id, user_id) DO NOTHING;

-- 4. Add a test message (replace with actual room ID and user ID)
-- INSERT INTO chat_messages (chat_room_id, sender_id, message) 
-- VALUES 
--     ('room-uuid-here', 'user1-uuid-here', 'Hello! This is a test message.')
-- ON CONFLICT DO NOTHING;

-- ========================================
-- TROUBLESHOOTING QUERIES
-- ========================================

-- Check all users in the system
-- SELECT id, email, name FROM profiles ORDER BY created_at DESC;

-- Check all friend relationships
-- SELECT 
--     f.id,
--     f.status,
--     u1.email as user_email,
--     u2.email as friend_email
-- FROM friends f
-- JOIN profiles u1 ON f.user_id = u1.id
-- JOIN profiles u2 ON f.friend_id = u2.id
-- ORDER BY f.created_at DESC;

-- Check all chat rooms and participants
-- SELECT 
--     cr.id,
--     cr.name,
--     cr.is_direct_message,
--     p.email as participant_email
-- FROM chat_rooms cr
-- JOIN chat_participants cp ON cr.id = cp.chat_room_id
-- JOIN profiles p ON cp.user_id = p.id
-- ORDER BY cr.created_at DESC;

-- Check all messages
-- SELECT 
--     cm.id,
--     cm.message,
--     cm.created_at,
--     p.email as sender_email,
--     cr.is_direct_message
-- FROM chat_messages cm
-- JOIN profiles p ON cm.sender_id = p.id
-- JOIN chat_rooms cr ON cm.chat_room_id = cr.id
-- ORDER BY cm.created_at DESC; 