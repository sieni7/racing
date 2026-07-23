import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAdmin } from '../../../../contexts/AdminContext';
import { DataTable, type Column } from '../../../../components/admin/data/DataTable';
import { FormBuilder, type Field } from '../../../../components/admin/forms/FormBuilder';
import { ViewModal } from '../../../../components/admin/ViewModal';
import { ConfirmModal } from '../../../../components/admin/ConfirmModal';
import { AuditHistory } from '../../../../components/admin/AuditHistory';
import { ExportButton } from '../../../../components/admin/ExportButton';
import { logAudit, buildChangedFields } from '../../../../lib/audit';
import { useReadOnly } from '../../../../hooks/useReadOnly';
import { useKeyboardShortcuts } from '../../../../hooks/useKeyboardShortcuts';
import type { Standing } from '../../../../types';

const fields: Field[] = [
  { name: 'team_name', label: 'Équipe', type: 'text', required: true },
  { name: 'played', label: 'Matchs joués', type: 'number', required: true },
  { name: 'won', label: 'Victoires', type: 'number', required: true },
  { name: 'drawn', label: 'Nuls', type: 'number', required: true },
  { name: 'lost', label: 'Défaites', type: 'number', required: true },
  { name: 'goals_for', label: 'Buts pour', type: 'number', required: true },
  { name: 'goals_against', label: 'Buts contre', type: 'number', required: true },
  { name: 'goal_diff', label: 'Différence', type: 'number' },
  { name: 'points', label: 'Points', type: 'number', required: true },
  { name: 'season', label: 'Saison', type: 'text' },
  { name: 'form', label: 'Forme (ex: VNDP)', type: 'text' },
];

export default function StandingsPage() {
  const { standings, fetchStandings, createStanding, updateStanding, deleteStanding } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Standing | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const readOnly = useReadOnly();

  useEffect(() => { fetchStandings(); }, [fetchStandings]);

  useEffect(() => {
    const gf = Number(formValues.goals_for) || 0;
    const ga = Number(formValues.goals_against) || 0;
    setFormValues(p => ({ ...p, goal_diff: gf - ga }));
  }, [formValues.goals_for, formValues.goals_against]);

  const handleAdd = useCallback(() => { setEditingId(null); setFormValues({}); setFormErrors({}); setFormOpen(true); }, []);
  const handleEdit = useCallback((item: Standing) => { setEditingId(item.id); setFormValues(item); setFormErrors({}); setFormOpen(true); }, []);
  const handleView = useCallback((item: Standing) => { setViewItem(item); }, []);
  const handleDuplicate = useCallback((item: Standing) => {
    const { id, created_at, updated_at, ...rest } = item as any;
    setEditingId(null); setFormValues({ ...rest, team_name: `${rest.team_name}` }); setFormErrors({}); setFormOpen(true);
  }, []);
  const handleDelete = useCallback((item: Standing) => { setDeletingId(item.id); setConfirmOpen(true); }, []);

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteStanding(id)));
    toast.success(`${ids.length} équipe(s) supprimée(s)`);
  }, [deleteStanding]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    await deleteStanding(deletingId);
    await logAudit({ tableName: 'standings', recordId: deletingId, action: 'DELETE' });
    setSubmitting(false); setConfirmOpen(false); setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setFormErrors({});
    try {
      if (editingId) {
        const old = standings.find(s => s.id === editingId) as unknown as Record<string, unknown>;
        await updateStanding(editingId, formValues);
        const changed = buildChangedFields(old || {}, formValues);
        if (Object.keys(changed).length > 0) await logAudit({ tableName: 'standings', recordId: editingId, action: 'UPDATE', changedFields: changed });
      } else {
        await createStanding(formValues);
      }
      setFormOpen(false);
    } catch { toast.error("Erreur lors de l'enregistrement"); setFormErrors({ general: "Erreur" }); }
    setSubmitting(false);
  };

  useKeyboardShortcuts([
    { key: 'n', ctrl: true, handler: handleAdd, enabled: !formOpen && !readOnly },
    { key: 'f', ctrl: true, handler: () => (document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()), enabled: !formOpen },
  ]);

  const columns: Column<Standing>[] = [
    { key: 'team_name', label: 'Équipe' },
    { key: 'played', label: 'J', width: '40px' },
    { key: 'won', label: 'G', width: '40px' },
    { key: 'drawn', label: 'N', width: '40px' },
    { key: 'lost', label: 'P', width: '40px' },
    { key: 'goals_for', label: 'BP', width: '40px' },
    { key: 'goals_against', label: 'BC', width: '40px' },
    { key: 'goal_diff', label: 'Diff', width: '60px' },
    { key: 'points', label: 'Pts', width: '50px', render: (s) => <span className="font-bold text-primary">{s.points}</span> },
    { key: 'season', label: 'Saison' },
  ];

  const exportColumns = columns.map(({ key, label }) => ({ key, label }));

  const viewFields = viewItem ? [
    { label: 'Équipe', value: viewItem.team_name },
    { label: 'Matchs joués', value: viewItem.played },
    { label: 'Victoires', value: viewItem.won },
    { label: 'Nuls', value: viewItem.drawn },
    { label: 'Défaites', value: viewItem.lost },
    { label: 'Buts pour', value: viewItem.goals_for },
    { label: 'Buts contre', value: viewItem.goals_against },
    { label: 'Différence', value: viewItem.goal_diff },
    { label: 'Points', value: viewItem.points },
    { label: 'Saison', value: viewItem.season || '—' },
    { label: 'Forme', value: viewItem.form || '—' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Classement</h1>
          <p className="text-sm text-gray-500">{standings.length} équipes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAuditOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:border-primary">
            Historique
          </button>
          <ExportButton data={standings} columns={exportColumns} filename="classement-rcb" />
        </div>
      </div>

      <DataTable data={standings} columns={columns}
        onAdd={readOnly ? undefined : handleAdd}
        onEdit={readOnly ? undefined : handleEdit}
        onView={handleView}
        onDelete={readOnly ? undefined : handleDelete}
        onDuplicate={readOnly ? undefined : handleDuplicate}
        onBulkDelete={readOnly ? undefined : handleBulkDelete}
        searchFields={['team_name', 'season']}
        addLabel="Équipe" readOnly={readOnly} storageKey="rcb_dt_standings" />

      {formOpen && (
        <FormBuilder title={editingId ? "Modifier l'équipe" : 'Ajouter une équipe'}
          fields={fields} values={formValues}
          onChange={(n, v) => setFormValues(p => ({ ...p, [n]: v }))}
          onSubmit={handleSubmit} onCancel={() => setFormOpen(false)}
          loading={submitting} errors={formErrors} />
      )}

      <ViewModal open={!!viewItem} onClose={() => setViewItem(null)} item={viewItem}
        title={`Classement : ${viewItem?.team_name}`} fields={viewFields} />

      <AuditHistory open={auditOpen} onClose={() => setAuditOpen(false)} tableName="standings" />

      <ConfirmModal isOpen={confirmOpen} title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette équipe du classement ?" onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }} loading={submitting} />
    </div>
  );
}
