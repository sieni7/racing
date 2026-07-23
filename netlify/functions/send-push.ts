import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

export const handler = async (event: { body?: string; httpMethod?: string }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { title, body: notificationBody, icon, url } = JSON.parse(event.body || '{}');

    if (!title || !notificationBody) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'title and body are required' }) };
    }

    const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'VAPID keys not configured' }) };
    }

    webpush.setVapidDetails('mailto:admin@racing-bingerville.ci', vapidPublicKey, vapidPrivateKey);

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Supabase not configured' }) };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys');

    if (error) throw error;
    if (!subscriptions?.length) {
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ sent: 0, message: 'Aucun abonné' }) };
    }

    const payload = JSON.stringify({
      title,
      body: notificationBody,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      data: { url: url || '/' },
    });

    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(sub as webpush.PushSubscription, payload, { TTL: 86400 })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ sent, total: subscriptions.length }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: message }) };
  }
};
