import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAdmin } from '../../../../contexts/AdminContext';
import { DataTable, type Column } from '../../../../components/admin/data/DataTable';
import { FormBuilder, type Field } from '../../../../components/admin/forms/FormBuilder';
import { ImportModal } from '../../../../components/admin/ImportModal';
import { ExportButton } from '../../../../components/admin/ExportButton';
import { AuditHistory } from '../../../../components/admin/AuditHistory';
import { ConfirmModal } from '../../../../components/admin/ConfirmModal';
import { logAudit, buildChangedFields } from '../../../../lib/audit';
import { useReadOnly } from '../../../../hooks/useReadOnly';
import { useKeyboardShortcuts } from '../../../../hooks/useKeyboardShortcuts';
import type { Player } from '../../../../lib/players';

const fields: Field[] = [
  { name: 'first_name', label: 'Prénom', type: 'text', required: true },
  { name: 'last_name', label: 'Nom', type: 'text', required: true },
  { name: 'jersey_number', label: 'Numéro', type: 'number' },
  { name: 'position', label: 'Poste', type: 'select', options: [
    { value: 'gardien', label: 'Gardien' }, { value: 'defenseur', label: 'Défenseur' },
    { value: 'milieu', label: 'Milieu' }, { value: 'attaquant', label: 'Attaquant' },
  ] },
  { name: 'nationality', label: 'Nationalité', type: 'text', suggestions: ["Côte d'Ivoire", 'France', 'Sénégal', 'Mali', 'Burkina Faso', 'Cameroun', 'Nigeria', 'Ghana'] },
  { name: 'date_of_birth', label: 'Date de naissance', type: 'date' },
  { name: 'height_cm', label: 'Taille (cm)', type: 'number' },
  { name: 'weight_kg', label: 'Poids (kg)', type: 'number' },
  { name: 'preferred_foot', label: 'Pied fort', type: 'select', options: [
    { value: 'droit', label: 'Droit' }, { value: 'gauche', label: 'Gauche' }, { value: 'both', label: 'Les deux' },
  ] },
  { name: 'photo_url', label: 'Photo', type: 'file' },
  { name: 'bio', label: 'Biographie', type: 'textarea' },
  { name: 'is_active', label: 'Actif', type: 'checkbox' },
];

export default function PlayersPage() {
  const { players, fetchPlayers, createPlayer, updatePlayer, deletePlayer } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const readOnly = useReadOnly();

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  const handleAdd = useCallback(() => { setEditingId(null); setFormValues({}); setFormErrors({}); setFormOpen(true); }, []);
  const handleEdit = useCallback((item: Player) => { setEditingId(item.id); setFormValues(item); setFormErrors({}); setFormOpen(true); }, []);
  const handleDuplicate = useCallback((item: Player) => {
    const { id, slug, created_at, updated_at, ...rest } = item as any;
    setEditingId(null); setFormValues({ ...rest, first_name: `${rest.first_name} (copie)` }); setFormErrors({}); setFormOpen(true);
  }, []);
  const handleDelete = useCallback((item: Player) => { setDeletingId(item.id); setConfirmOpen(true); }, []);

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => deletePlayer(id)));
    toast.success(`${ids.length} joueur(s) supprimé(s)`);
  }, [deletePlayer]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    await deletePlayer(deletingId);
    await logAudit({ tableName: 'players', recordId: deletingId, action: 'DELETE' });
    setSubmitting(false); setConfirmOpen(false); setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setFormErrors({});
    try {
      if (editingId) {
        const old = players.find(p => p.id === editingId) as unknown as Record<string, unknown>;
        await updatePlayer(editingId, formValues);
        const changed = buildChangedFields(old || {}, formValues);
        if (Object.keys(changed).length > 0) await logAudit({ tableName: 'players', recordId: editingId, action: 'UPDATE', changedFields: changed });
      } else {
        await createPlayer(formValues);
      }
      setFormOpen(false);
    } catch { toast.error("Erreur lors de l'enregistrement"); setFormErrors({ general: "Erreur" }); }
    setSubmitting(false);
  };

  const handleImport = async (rows: Record<string, unknown>[]) => {
    for (const row of rows) await createPlayer(row);
    toast.success(`${rows.length} joueur(s) importé(s)`);
  };

  useKeyboardShortcuts([
    { key: 'n', ctrl: true, handler: handleAdd, enabled: !formOpen && !readOnly },
    { key: 'f', ctrl: true, handler: () => (document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()), enabled: !formOpen },
  ]);

  const columns: Column<Player>[] = [
    { key: 'jersey_number', label: 'N°', width: '60px' },
    { key: 'first_name', label: 'Prénom' },
    { key: 'last_name', label: 'Nom' },
    { key: 'position', label: 'Poste', width: '120px' },
    { key: 'nationality', label: 'Nationalité' },
    { key: 'is_active', label: 'Actif', width: '80px', render: (p) => p.is_active ? <span className="text-green-600 font-medium">Oui</span> : <span className="text-gray-400">Non</span> },
  ];

  const exportColumns = columns.map(({ key, label }) => ({ key, label }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Joueurs</h1>
          <p className="text-sm text-gray-500">{players.length} joueurs</p>
        </div>
        <div className="flex gap-2">
          {!readOnly && (
            <button onClick={() => setImportOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:border-primary">
              + Import
            </button>
          )}
          <button onClick={() => setAuditOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:border-primary">
            Historique
          </button>
          <ExportButton data={players} columns={exportColumns} filename="joueurs-rcb" title="Effectif RCB" />
        </div>
      </div>

      <DataTable
        data={players}
        columns={columns}
        onAdd={readOnly ? undefined : handleAdd}
        onEdit={readOnly ? undefined : handleEdit}
        onDelete={readOnly ? undefined : handleDelete}
        onDuplicate={readOnly ? undefined : handleDuplicate}
        onBulkDelete={readOnly ? undefined : handleBulkDelete}
        searchFields={['first_name', 'last_name', 'position', 'nationality']}
        addLabel="Joueur"
        readOnly={readOnly}
        storageKey="rcb_dt_players"
      />

      {formOpen && (
        <FormBuilder
          title={editingId ? 'Modifier le joueur' : 'Ajouter un joueur'}
          fields={fields}
          values={formValues}
          onChange={(n, v) => setFormValues(p => ({ ...p, [n]: v }))}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={submitting}
          errors={formErrors}
        />
      )}

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport}
        columns={exportColumns} title="Import joueurs CSV" />

      <AuditHistory open={auditOpen} onClose={() => setAuditOpen(false)} tableName="players" />

      <ConfirmModal isOpen={confirmOpen} title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce joueur ?" onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }} loading={submitting} />
    </div>
  );
}
