import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAdmin } from '../../../../contexts/AdminContext';
import { DataTable, type Column } from '../../../../components/admin/data/DataTable';
import { FormBuilder, type Field } from '../../../../components/admin/forms/FormBuilder';
import { ConfirmModal } from '../../../../components/admin/ConfirmModal';
import { AuditHistory } from '../../../../components/admin/AuditHistory';
import { ExportButton } from '../../../../components/admin/ExportButton';
import { logAudit, buildChangedFields } from '../../../../lib/audit';
import { useReadOnly } from '../../../../hooks/useReadOnly';
import { useKeyboardShortcuts } from '../../../../hooks/useKeyboardShortcuts';
import type { Match } from '../../../../lib/matches';

const fields: Field[] = [
  { name: 'opponent_name', label: 'Adversaire', type: 'text', required: true },
  { name: 'is_home', label: 'Domicile', type: 'select', options: [{ value: 'true', label: 'Oui' }, { value: 'false', label: 'Non' }] },
  { name: 'match_date', label: 'Date', type: 'datetime-local', required: true },
  { name: 'venue', label: 'Stade', type: 'text' },
  { name: 'competition', label: 'Compétition', type: 'text' },
  { name: 'season', label: 'Saison', type: 'text' },
  { name: 'matchday', label: 'Journée', type: 'number' },
  { name: 'status', label: 'Statut', type: 'select', options: [
    { value: 'upcoming', label: 'À venir' },
    { value: 'finished', label: 'Terminé' }, { value: 'postponed', label: 'Reporté' },
  ], dependsOn: undefined },
  { name: 'racing_score', label: 'Score RCB', type: 'number', dependsOn: { field: 'status', value: 'finished' } },
  { name: 'opponent_score', label: 'Score adversaire', type: 'number', dependsOn: { field: 'status', value: 'finished' } },
  { name: 'summary', label: 'Résumé', type: 'textarea' },
];

export default function MatchesPage() {
  const { matches, fetchMatches, createMatch, updateMatch, deleteMatch } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const readOnly = useReadOnly();

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleAdd = useCallback(() => { setEditingId(null); setFormValues({}); setFormErrors({}); setFormOpen(true); }, []);
  const handleEdit = useCallback((item: Match) => { setEditingId(item.id); setFormValues({ ...item, is_home: String(item.is_home) }); setFormErrors({}); setFormOpen(true); }, []);
  const handleDuplicate = useCallback((item: Match) => {
    const { id, created_at, updated_at, ...rest } = item as any;
    setEditingId(null); setFormValues({ ...rest, opponent_name: `${rest.opponent_name} (copie)` }); setFormErrors({}); setFormOpen(true);
  }, []);
  const handleDelete = useCallback((item: Match) => { setDeletingId(item.id); setConfirmOpen(true); }, []);

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteMatch(id)));
    toast.success(`${ids.length} match(s) supprimé(s)`);
  }, [deleteMatch]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    await deleteMatch(deletingId);
    await logAudit({ tableName: 'matches', recordId: deletingId, action: 'DELETE' });
    setSubmitting(false); setConfirmOpen(false); setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setFormErrors({});
    try {
      const data = { ...formValues, is_home: formValues.is_home === 'true' };
      if (editingId) {
        const old = matches.find(m => m.id === editingId) as unknown as Record<string, unknown>;
        await updateMatch(editingId, data);
        const changed = buildChangedFields(old || {}, data);
        if (Object.keys(changed).length > 0) await logAudit({ tableName: 'matches', recordId: editingId, action: 'UPDATE', changedFields: changed });
      } else {
        await createMatch(data);
      }
      setFormOpen(false);
    } catch { toast.error("Erreur lors de l'enregistrement"); setFormErrors({ general: "Erreur" }); }
    setSubmitting(false);
  };

  useKeyboardShortcuts([
    { key: 'n', ctrl: true, handler: handleAdd, enabled: !formOpen && !readOnly },
    { key: 'f', ctrl: true, handler: () => (document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()), enabled: !formOpen },
  ]);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = { upcoming: 'bg-blue-100 text-blue-700', finished: 'bg-green-100 text-green-700', postponed: 'bg-yellow-100 text-yellow-700' };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${colors[status] || ''}`}>{status}</span>;
  };

  const columns: Column<Match>[] = [
    { key: 'match_date', label: 'Date', render: (m) => new Date(m.match_date).toLocaleDateString('fr-FR'), width: '120px' },
    { key: 'opponent_name', label: 'Adversaire' },
    { key: 'competition', label: 'Compétition' },
    { key: 'status', label: 'Statut', render: (m) => statusBadge(m.status), width: '120px' },
    { key: 'racing_score', label: 'Score', render: (m) => m.status === 'finished' ? `${m.racing_score ?? '-'} - ${m.opponent_score ?? '-'}` : '—', width: '80px' },
  ];

  const exportColumns = columns.map(({ key, label }) => ({ key, label }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Matchs</h1>
          <p className="text-sm text-gray-500">{matches.length} matchs</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAuditOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:border-primary">
            Historique
          </button>
          <ExportButton data={matches} columns={exportColumns} filename="matchs-rcb" />
        </div>
      </div>

      <DataTable data={matches} columns={columns}
        onAdd={readOnly ? undefined : handleAdd}
        onEdit={readOnly ? undefined : handleEdit}
        onDelete={readOnly ? undefined : handleDelete}
        onDuplicate={readOnly ? undefined : handleDuplicate}
        onBulkDelete={readOnly ? undefined : handleBulkDelete}
        searchFields={['opponent_name', 'competition', 'season']}
        addLabel="Match" readOnly={readOnly} storageKey="rcb_dt_matches" />

      {formOpen && (
        <FormBuilder title={editingId ? 'Modifier le match' : 'Ajouter un match'}
          fields={fields} values={formValues}
          onChange={(n, v) => setFormValues(p => ({ ...p, [n]: v }))}
          onSubmit={handleSubmit} onCancel={() => setFormOpen(false)}
          loading={submitting} errors={formErrors} />
      )}

      <AuditHistory open={auditOpen} onClose={() => setAuditOpen(false)} tableName="matches" />

      <ConfirmModal isOpen={confirmOpen} title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce match ?" onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }} loading={submitting} />
    </div>
  );
}
