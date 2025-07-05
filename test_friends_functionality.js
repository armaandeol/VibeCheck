// Test script to verify friend functionality
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qcjdhqhhcycpecsxptnh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjamRocWhoY3lwZWNzeHB0bmg6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTc1NzAsImV4cCI6MjA2NzIzMzU3MH0.9vUBLONh8d7VLkeJi9hLjjR1pHTN8YzkaEa77hyOvmI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFriendsFunctionality() {
  console.log('🧪 Testing Friends Functionality...\n');
  
  try {
    // Test 1: Check if profiles table is accessible
    console.log('1️⃣ Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
      console.log('   Found profiles:', profiles?.length || 0);
    }
    
    // Test 2: Check if friends table is accessible
    console.log('\n2️⃣ Testing friends table access...');
    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('*')
      .limit(3);
    
    if (friendsError) {
      console.log('❌ Friends table error:', friendsError.message);
    } else {
      console.log('✅ Friends table accessible');
      console.log('   Found friend relationships:', friends?.length || 0);
    }
    
    // Test 3: Test RPC function
    console.log('\n3️⃣ Testing get_user_friends RPC function...');
    if (profiles && profiles.length > 0) {
      const testUserId = profiles[0].id;
      const { data: rpcResult, error: rpcError } = await supabase.rpc('get_user_friends', {
        user_uuid: testUserId
      });
      
      if (rpcError) {
        console.log('❌ RPC function error:', rpcError.message);
      } else {
        console.log('✅ RPC function working');
        console.log('   Friends for test user:', rpcResult?.length || 0);
      }
    } else {
      console.log('⚠️  No profiles found to test RPC function');
    }
    
    // Test 4: Test chat tables
    console.log('\n4️⃣ Testing chat tables...');
    const { data: chatRooms, error: chatRoomsError } = await supabase
      .from('chat_rooms')
      .select('*')
      .limit(1);
    
    if (chatRoomsError) {
      console.log('❌ Chat rooms error:', chatRoomsError.message);
    } else {
      console.log('✅ Chat rooms table accessible');
    }
    
    const { data: chatMessages, error: chatMessagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);
    
    if (chatMessagesError) {
      console.log('❌ Chat messages error:', chatMessagesError.message);
    } else {
      console.log('✅ Chat messages table accessible');
    }
    
    // Test 5: Test create_direct_message function
    console.log('\n5️⃣ Testing create_direct_message function...');
    if (profiles && profiles.length >= 2) {
      const user1Id = profiles[0].id;
      const user2Id = profiles[1].id;
      
      const { data: dmResult, error: dmError } = await supabase.rpc('create_direct_message', {
        user1_id: user1Id,
        user2_id: user2Id
      });
      
      if (dmError) {
        console.log('❌ create_direct_message error:', dmError.message);
      } else {
        console.log('✅ create_direct_message function working');
        console.log('   Created/found chat room ID:', dmResult);
      }
    } else {
      console.log('⚠️  Need at least 2 profiles to test direct message creation');
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('If you see ✅ for all tests, your database is properly configured!');
    console.log('If you see ❌, there might be RLS policy issues.');
    console.log('\nNext steps:');
    console.log('1. Open your app and log in');
    console.log('2. Try adding a friend using the "Add Friends" button');
    console.log('3. Check the browser console for detailed logs');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testFriendsFunctionality(); 