import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  ?? 'http://127.0.0.1:54321'
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  db: { schema: 'ai' },
})

// For auth operations that need public schema
export const supabaseAuth = createClient(supabaseUrl, supabaseAnon)
