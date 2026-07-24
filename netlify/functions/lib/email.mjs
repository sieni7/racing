const RESEND_API = 'https://api.resend.com/emails';

export function sendEmail({ to, subject, html, from = 'Racing Club <noreply@racingclub.ci>' }) {
  if (!process.env.RESEND_API_KEY) return Promise.resolve();
  return fetch(RESEND_API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
}

export function emailTemplate(title, body) {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#F97316;padding:16px;border-radius:12px 12px 0 0">
      <h1 style="color:#fff;margin:0;font-size:20px">Racing Club de Bingerville</h1>
    </div>
    <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
      <h2 style="color:#111827;font-size:18px;margin:0 0 12px">${title}</h2>
      ${body}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
      <p style="color:#6b7280;font-size:12px;margin:0">Racing Club de Bingerville — Stade de Bingerville, Côte d'Ivoire</p>
    </div>
  </div>`;
}
