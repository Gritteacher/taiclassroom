import { createClient } from '@supabase/supabase-js';

// ใส่ URL ของโปรเจกต์ (ตัด /rest/v1/ ออกแล้ว)
const supabaseUrl = 'https://ipunydbgurjiaqlilnph.supabase.co';

// ใส่ Anon Key ที่ก๊อปปี้มา
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdW55ZGJndXJqaWFxbGlsbnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTAyNjksImV4cCI6MjA5Mjg2NjI2OX0.c3hjPDm-Ksn6G_eNKLKzYC-xGzeupF_A9QxQAuz1J6s';

export const supabase = createClient(supabaseUrl, supabaseKey);