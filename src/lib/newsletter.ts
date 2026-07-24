import { supabase } from './supabase';

export async function subscribeNewsletter(email: string): Promise<boolean> {
  const { error } = await supabase.from('newsletter_subscriptions').insert({ email });
  return !error;
}
