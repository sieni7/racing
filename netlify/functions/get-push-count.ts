import { createClient } from '@supabase/supabase-js';

export const handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ count: 0 }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { count, error } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ count: count ?? 0 }),
    };
  } catch {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ count: 0 }),
    };
  }
};
