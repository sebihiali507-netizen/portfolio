import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "https://bjclrcusfmtvhrgwugjj.supabase.co";
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqY2xyY3VzZm10dmhyZ3d1Z2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxOTE1NDUsImV4cCI6MjA5OTc2NzU0NX0.R9NHJ4cPlhLCwQ2kZx6SIOutwH35XXRocjkOuf7Oj2Y";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
