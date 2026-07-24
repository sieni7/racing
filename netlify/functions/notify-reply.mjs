import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailTemplate } from './lib/email.mjs';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_KEY!);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { id, reply_body } = JSON.parse(event.body || '{}');
    if (!id || !reply_body) return { statusCode: 400, body: JSON.stringify({ error: 'id et reply_body requis' }) };

    const { data: msg, error } = await supabase.from('contact_messages').select('*').eq('id', id).single();
    if (error || !msg) return { statusCode: 404, body: JSON.stringify({ error: 'Message introuvable' }) };

    await sendEmail({
      to: msg.email,
      subject: `Réponse à votre message — Racing Club de Bingerville`,
      html: emailTemplate('Réponse de notre équipe',
        `<p>Bonjour <strong>${msg.name}</strong>,</p>
         ${msg.subject ? `<p><strong>Sujet :</strong> ${msg.subject}</p>` : ''}
         <p>Voici la réponse du Racing Club de Bingerville :</p>
         <blockquote style="background:#fff;padding:12px;border-left:3px solid #F97316;margin:8px 0;color:#374151;white-space:pre-wrap">${reply_body}</blockquote>
         <p>Merci de votre confiance.</p>
         <p>Sportivement,</p>
         <p><strong>Racing Club de Bingerville</strong></p>`),
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
