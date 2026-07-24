import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_KEY!);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { name, email, subject, message } = JSON.parse(event.body || '{}');
    if (!name || !email || !message) return { statusCode: 400, body: JSON.stringify({ error: 'Champs obligatoires : name, email, message' }) };
    const { error } = await supabase.from('contact_messages').insert({ name, email, subject, message });
    if (error) throw error;
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
