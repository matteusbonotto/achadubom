import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://SEU-PROJETO.supabase.co';
const supabaseAnonKey = 'SEU-ANON-KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 