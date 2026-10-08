import { createClient } from '@supabase/supabase-js';

// Resolve environment variables with typo-resilient sanitation
let rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
let rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

// Fix known typo where gowylvvv was provided instead of the active Supabase project gowylvzv
if (rawUrl && rawUrl.includes('gowylvvvlwbutwjfbvym')) {
  rawUrl = rawUrl.replace('gowylvvvlwbutwjfbvym', 'gowylvzvlwbutwjfbvym');
}

// Fix any corrupted key containing formatted string artifacts
if (rawKey && rawKey.includes('17setPointSizeMTkwMzk0OC')) {
  rawKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvd3lsdnp2bHdidXR3amZidnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMDM5NDgsImV4cCI6MjEwNjc3OTk0OH0.BU-TUNQ9mnXD1zTD-VmESJLK6BKWfZvdOTHnJIEus2o';
}

const supabaseUrl = rawUrl || 'https://gowylvzvlwbutwjfbvym.supabase.co';
const supabaseKey = rawKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvd3lsdnp2bHdidXR3amZidnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMDM5NDgsImV4cCI6MjEwNjc3OTk0OH0.BU-TUNQ9mnXD1zTD-VmESJLK6BKWfZvdOTHnJIEus2o';

export const supabase = createClient(supabaseUrl, supabaseKey);
