const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Define the data to be inserted
const dataToInsert = [{
  id: 'SUPABASE_EDGE_FUNCTION_URL',
  value: supabaseUrl,
}, {
  id: 'SUPABASE_ANON_KEY',
  value: supabaseAnonKey,
}];

// Insert data into the 'public.config' table
supabase
  .from('config')
  .upsert(dataToInsert)
  .then((response) => {
    if (response.error) {
      console.error('Error inserting data:', response.error.message);
    } else {
      console.log('Data inserted successfully');
    }
  })
  .catch((error) => {
    console.error('Error inserting data:', error.message);
  });