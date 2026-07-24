import { supabase } from './supabase';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  reply_body: string | null;
  created_at: string;
}

const TABLE = 'contact_messages';

export async function sendMessage(values: { name: string; email: string; subject?: string; message: string }): Promise<void> {
  const { error } = await supabase.from(TABLE).insert(values);
  if (error) throw error;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as ContactMessage[];
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function replyToMessage(id: string, reply_body: string): Promise<void> {
  const { error } = await supabase.from(TABLE).update({ replied: true, reply_body }).eq('id', id);
  if (error) throw error;
}

export async function deleteContactMessage(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
