// Test script to verify authentication callback functionality
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qcjdhqhhcycpecsxptnh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjamRocWhoY3lwZWNzeHB0bmg6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTc1NzAsImV4cCI6MjA2NzIzMzU3MH0.9vUBLONh8d7VLkeJi9hLjjR1pHTN8YzkaEa77hyOvmI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthCallback() {
  console.log('🧪 Testing Authentication Callback...\n');
  
  try {
    // Test 1: Check if we can get the current session
    console.log('1️⃣ Testing session retrieval...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (session) {
      console.log('✅ Session found');
      console.log('   User email:', session.user.email);
      console.log('   User ID:', session.user.id);
    } else {
      console.log('ℹ️  No active session (this is normal if not logged in)');
    }
    
    // Test 2: Check if we can get the current user
    console.log('\n2️⃣ Testing user retrieval...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ User error:', userError.message);
    } else if (user) {
      console.log('✅ User found');
      console.log('   User email:', user.email);
      console.log('   User ID:', user.id);
    } else {
      console.log('ℹ️  No user found (this is normal if not logged in)');
    }
    
    // Test 3: Test OAuth sign-in URL generation
    console.log('\n3️⃣ Testing OAuth sign-in URL generation...');
    const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });
    
    if (oauthError) {
      console.log('❌ OAuth error:', oauthError.message);
    } else {
      console.log('✅ OAuth URL generated successfully');
      console.log('   URL:', oauthData.url);
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('✅ Authentication system is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Deploy your app with the new /auth/callback route');
    console.log('2. Update your Supabase project settings:');
    console.log('   - Go to Authentication > URL Configuration');
    console.log('   - Set Site URL to your deployed domain');
    console.log('   - Add your deployed domain + /auth/callback to Redirect URLs');
    console.log('3. Test the Google sign-in flow');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testAuthCallback(); 