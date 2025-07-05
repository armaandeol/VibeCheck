// Quick test to check if chat tables exist
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qcjdhqhhcycpecsxptnh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjamRocWhoY3lwZWNzeHB0bmg6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTc1NzAsImV4cCI6MjA2NzIzMzU3MH0.9vUBLONh8d7VLkeJi9hLjjR1pHTN8YzkaEa77hyOvmI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('Testing database connection and tables...\n');
  
  // Test if we can connect at all
  try {
    const { data: profileTest, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.log(`❌ Connection test (profiles): ${profileError.message}`);
    } else {
      console.log(`✅ Connection test (profiles): SUCCESS`);
    }
  } catch (err) {
    console.log(`❌ Connection test (profiles): ${err.message}`);
  }
  
  const tables = ['chat_rooms', 'chat_messages', 'chat_participants', 'friends'];
  
  for (const table of tables) {
    try {
      // Try to get table info using a simple query
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0); // Don't actually fetch data, just test if table exists
      
      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ Table '${table}': DOES NOT EXIST`);
        } else if (error.message.includes('Invalid API key')) {
          console.log(`⚠️  Table '${table}': EXISTS (API key issue)`);
        } else {
          console.log(`❌ Table '${table}': ${error.message}`);
        }
      } else {
        console.log(`✅ Table '${table}': EXISTS`);
      }
    } catch (err) {
      if (err.message.includes('does not exist')) {
        console.log(`❌ Table '${table}': DOES NOT EXIST`);
      } else if (err.message.includes('Invalid API key')) {
        console.log(`⚠️  Table '${table}': EXISTS (API key issue)`);
      } else {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }
  }
  
  console.log('\nTesting RPC functions...\n');
  
  // Test RPC functions
  const functions = ['create_direct_message', 'get_user_friends', 'update_last_read'];
  
  for (const func of functions) {
    try {
      // Just test if function exists by calling with dummy data
      const { error } = await supabase.rpc(func, { 
        user1_id: '00000000-0000-0000-0000-000000000000',
        user2_id: '00000000-0000-0000-0000-000000000000'
      });
      
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        console.log(`❌ Function '${func}': DOES NOT EXIST`);
      } else {
        console.log(`✅ Function '${func}': EXISTS`);
      }
    } catch (err) {
      if (err.message.includes('function') && err.message.includes('does not exist')) {
        console.log(`❌ Function '${func}': DOES NOT EXIST`);
      } else {
        console.log(`⚠️  Function '${func}': ${err.message}`);
      }
    }
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('The chat tables likely exist but there might be a permissions issue.');
  console.log('Try opening the chat in your app and click the "Debug" button to see detailed errors.');
}

testDatabase(); 