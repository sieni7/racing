import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_SERVICE_KEY || '');

export const handler = async () => {
  try {
    const { data } = await supabase.from('site_config').select('maintenance_mode').single();
    return { statusCode: 200, body: JSON.stringify({ maintenance: data?.maintenance_mode ?? false }) };
  } catch {
    return { statusCode: 200, body: JSON.stringify({ maintenance: false }) };
  }
};
