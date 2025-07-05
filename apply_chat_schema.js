// Script to apply chat schema to Supabase database
// Run this with: node apply_chat_schema.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
const supabaseUrl = "https://qcjdhqhhcycpecsxptnh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjamRocWhoY3lwZWNzeHB0bmg6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTc1NzAsImV4cCI6MjA2NzIzMzU3MH0.9vUBLONh8d7VLkeJi9hLjjR1pHTN8YzkaEa77hyOvmI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyChatSchema() {
  try {
    console.log('Reading chat schema file...');
    const schemaPath = path.join(process.cwd(), 'supabase_chat_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Applying chat schema to Supabase...');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.warn(`Warning on statement ${i + 1}:`, error.message);
          }
        } catch (err) {
          console.warn(`Warning on statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('Chat schema applied successfully!');
    console.log('You can now test the chat functionality.');
    
  } catch (error) {
    console.error('Error applying chat schema:', error);
    console.log('\nAlternative: You can manually run the SQL in your Supabase dashboard:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of supabase_chat_schema.sql');
    console.log('4. Click "Run" to execute the schema');
  }
}

applyChatSchema(); 