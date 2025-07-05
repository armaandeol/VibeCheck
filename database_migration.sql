-- Database Migration for Friend Request System
-- Run this script in your Supabase SQL Editor to add support for cancelled friend requests

-- Update the friends table to include 'cancelled' status
ALTER TABLE friends DROP CONSTRAINT IF EXISTS friends_status_check;
ALTER TABLE friends ADD CONSTRAINT friends_status_check 
  CHECK (status IN ('pending', 'accepted', 'blocked', 'cancelled'));

-- Verify the constraint was added
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'friends'::regclass AND conname = 'friends_status_check'; 