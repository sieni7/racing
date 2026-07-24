import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailTemplate } from './lib/email.mjs';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_SERVICE_KEY || '');

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { name, email, subject, message } = JSON.parse(event.body || '{}');
    if (!name || !email || !message) return { statusCode: 400, body: JSON.stringify({ error: 'Champs obligatoires : name, email, message' }) };

    const { error } = await supabase.from('contact_messages').insert({ name, email, subject, message });
    if (error) throw error;

    await sendEmail({
      to: process.env.CONTACT_EMAIL || 'contact@racingclub.ci',
      subject: `[RCB] Nouveau message de ${name}`,
      html: emailTemplate('Nouveau message de contact',
        `<p><strong>De :</strong> ${name} (${email})</p>
         <p><strong>Sujet :</strong> ${subject || 'Sans sujet'}</p>
         <p><strong>Message :</strong></p>
         <blockquote style="background:#fff;padding:12px;border-left:3px solid #F97316;margin:8px 0;color:#374151">${message}</blockquote>
         <p style="font-size:13px;color:#6b7280">Connectez-vous à l'admin pour répondre → <a href="${process.env.URL || 'https://racing-club.netlify.app'}/admin/contact">Messagerie</a></p>`),
    });

    await sendEmail({
      to: email,
      subject: 'Nous avons bien reçu votre message — RC Bingerville',
      html: emailTemplate('Message reçu ✓',
        `<p>Bonjour <strong>${name}</strong>,</p>
         <p>Nous accusons réception de votre message et vous remercions de nous avoir contactés.</p>
         ${subject ? `<p><strong>Sujet :</strong> ${subject}</p>` : ''}
         <p>Notre équipe vous répondra dans les plus brefs délais.</p>
         <p>Sportivement,</p>
         <p><strong>Racing Club de Bingerville</strong></p>`),
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
