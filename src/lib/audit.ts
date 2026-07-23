import { supabase } from './supabase';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';

export interface AuditEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: AuditAction;
  changed_fields: Record<string, { old: unknown; new: unknown }> | null;
  performed_by: string;
  created_at: string;
}

export async function logAudit(params: {
  tableName: string;
  recordId: string;
  action: AuditAction;
  changedFields?: Record<string, { old: unknown; new: unknown }>;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('audit_log').insert({
    table_name: params.tableName,
    record_id: params.recordId,
    action: params.action,
    changed_fields: params.changedFields ?? null,
    performed_by: user.id,
  });
}

export async function getAuditLog(options?: {
  tableName?: string;
  recordId?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditEntry[]> {
  let query = supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.tableName) query = query.eq('table_name', options.tableName);
  if (options?.recordId) query = query.eq('record_id', options.recordId);
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export function buildChangedFields<T extends Record<string, unknown>>(
  old: Partial<T>,
  updated: Partial<T>,
): Record<string, { old: unknown; new: unknown }> {
  const changed: Record<string, { old: unknown; new: unknown }> = {};
  for (const key of Object.keys(updated)) {
    if (key === 'id' || key === 'updated_at') continue;
    if (JSON.stringify(old[key]) !== JSON.stringify(updated[key])) {
      changed[key] = { old: old[key], new: updated[key] };
    }
  }
  return changed;
}
