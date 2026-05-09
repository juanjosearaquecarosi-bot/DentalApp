import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://qalsnhgutforgjtqciex.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbHNuaGd1dGZvcmdqdHFjaWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI2NzAsImV4cCI6MjA5MzkxODY3MH0.8dqHhQpBrGcvoCqfu9ObOSuCLcw1HVjO9E-jLIbAIxg"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
