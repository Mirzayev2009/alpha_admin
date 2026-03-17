// supabaseClient.js — Centralized Supabase client configuration
// Import this file anywhere you need to talk to Supabase.

import { createClient } from "@supabase/supabase-js";

// Your Supabase project URL (same for every client)
const SUPABASE_URL = "https://hmjbepqisyfqctddgqwj.supabase.co";

// Anon key — safe to use in the browser, respects Row Level Security (RLS)
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtamJlcHFpc3lmcWN0ZGRncXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTA1MjgsImV4cCI6MjA4MDE2NjUyOH0.xAjmb9xSutFL6JRuyblE-kn9fb06jzXyamgHEB1Ab_k";

// Service role key — bypasses RLS, use only for admin operations
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtamJlcHFpc3lmcWN0ZGRncXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU5MDUyOCwiZXhwIjoyMDgwMTY2NTI4fQ.o-iPHOLzGqesJMwOjwWuX68WhlNPPi_XphxL8ulPaZc";

// Default client — for normal read operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client — for insert/update/delete that need to bypass RLS
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
