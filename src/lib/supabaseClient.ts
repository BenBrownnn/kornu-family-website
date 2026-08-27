import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://valpjnmwmjgcyemnrfqi.supabase.co';
const supabaseKey = 'sb_publishable_XmOO4rftRYLuEENBOP4FpQ_RvzKQP58';

export const supabase = createClient(supabaseUrl, supabaseKey);