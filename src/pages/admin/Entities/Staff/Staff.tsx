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
import type { Staff } from '../../../../lib/staff';

const fields: Field[] = [
  { name: 'first_name', label: 'Prénom', type: 'text', required: true },
  { name: 'last_name', label: 'Nom', type: 'text', required: true },
  { name: 'fonction', label: 'Fonction', type: 'select', options: [
    { value: 'coach', label: 'Entraîneur' }, { value: 'assistant_coach', label: 'Entraîneur adjoint' },
    { value: 'physio', label: 'Kinésithérapeute' }, { value: 'doctor', label: 'Médecin' },
    { value: 'team_manager', label: 'Team manager' }, { value: 'president', label: 'Président' },
    { value: 'manager', label: 'Manager' }, { value: 'joueur', label: 'Joueur' }, { value: 'parent', label: 'Parent' },
    { value: 'other', label: 'Autre' },
  ], required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Téléphone', type: 'text' },
  { name: 'photo_url', label: 'Photo', type: 'file' },
  { name: 'bio', label: 'Biographie', type: 'textarea' },
  { name: 'is_active', label: 'Actif', type: 'select', options: [{ value: 'true', label: 'Oui' }, { value: 'false', label: 'Non' }] },
];

const fonctionLabels: Record<string, string> = {
  coach: 'Entraîneur', assistant_coach: 'Entraîneur adjoint', physio: 'Kinésithérapeute',
  doctor: 'Médecin', team_manager: 'Team manager', president: 'Président',
  manager: 'Manager', joueur: 'Joueur', parent: 'Parent', other: 'Autre',
};

export default function StaffPage() {
  const { staff, fetchStaff, createStaff, updateStaff, deleteStaff } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Staff | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const readOnly = useReadOnly();

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleAdd = useCallback(() => { setEditingId(null); setFormValues({ is_active: 'true' }); setFormErrors({}); setFormOpen(true); }, []);
  const handleEdit = useCallback((item: Staff) => { setEditingId(item.id); setFormValues({ ...item, is_active: String(item.is_active) }); setFormErrors({}); setFormOpen(true); }, []);
  const handleView = useCallback((item: Staff) => { setViewItem(item); }, []);
  const handleDuplicate = useCallback((item: Staff) => {
    const { id, created_at, updated_at, ...rest } = item as any;
    setEditingId(null); setFormValues({ ...rest, first_name: `${rest.first_name} (copie)` }); setFormErrors({}); setFormOpen(true);
  }, []);
  const handleDelete = useCallback((item: Staff) => { setDeletingId(item.id); setConfirmOpen(true); }, []);

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteStaff(id)));
    toast.success(`${ids.length} membre(s) supprimé(s)`);
  }, [deleteStaff]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    await deleteStaff(deletingId);
    await logAudit({ tableName: 'staff', recordId: deletingId, action: 'DELETE' });
    setSubmitting(false); setConfirmOpen(false); setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setFormErrors({});
    try {
      const data = { ...formValues, is_active: formValues.is_active === 'true' };
      if (editingId) {
        const old = staff.find(s => s.id === editingId) as unknown as Record<string, unknown>;
        await updateStaff(editingId, data);
        const changed = buildChangedFields(old || {}, data);
        if (Object.keys(changed).length > 0) await logAudit({ tableName: 'staff', recordId: editingId, action: 'UPDATE', changedFields: changed });
      } else {
        await createStaff(data);
      }
      setFormOpen(false);
    } catch { toast.error("Erreur lors de l'enregistrement"); setFormErrors({ general: "Erreur" }); }
    setSubmitting(false);
  };

  useKeyboardShortcuts([
    { key: 'n', ctrl: true, handler: handleAdd, enabled: !formOpen && !readOnly },
    { key: 'f', ctrl: true, handler: () => (document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()), enabled: !formOpen },
  ]);

  const columns: Column<Staff>[] = [
    { key: 'first_name', label: 'Nom', render: (s) => `${s.first_name} ${s.last_name}` },
    { key: 'fonction', label: 'Fonction', render: (s) => fonctionLabels[s.fonction || s.role] || s.fonction || s.role },
    { key: 'email', label: 'Email' },
    { key: 'is_active', label: 'Actif', render: (s) => s.is_active ? <span className="text-green-600">●</span> : <span className="text-gray-300">○</span>, width: '60px' },
  ];

  const exportColumns = columns.map(({ key, label }) => ({ key: key === 'first_name' ? 'full_name' : key, label }));

  const viewFields = viewItem ? [
    { label: 'Prénom', value: viewItem.first_name },
    { label: 'Nom', value: viewItem.last_name },
    { label: 'Fonction', value: fonctionLabels[viewItem.fonction || viewItem.role] || viewItem.fonction || viewItem.role },
    { label: 'Email', value: viewItem.email || '—' },
    { label: 'Téléphone', value: viewItem.phone || '—' },
    { label: 'Biographie', value: viewItem.bio || '—' },
    { label: 'Actif', value: viewItem.is_active ? 'Oui' : 'Non' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Staff</h1>
          <p className="text-sm text-gray-500">{staff.length} membres</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAuditOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:border-primary">
            Historique
          </button>
          <ExportButton data={staff} columns={exportColumns} filename="staff-rcb" />
        </div>
      </div>

      <DataTable data={staff} columns={columns}
        onAdd={readOnly ? undefined : handleAdd}
        onEdit={readOnly ? undefined : handleEdit}
        onView={handleView}
        onDelete={readOnly ? undefined : handleDelete}
        onDuplicate={readOnly ? undefined : handleDuplicate}
        onBulkDelete={readOnly ? undefined : handleBulkDelete}
        searchFields={['first_name', 'last_name', 'email', 'fonction', 'role']}
        addLabel="Membre" readOnly={readOnly} storageKey="rcb_dt_staff" />

      {formOpen && (
        <FormBuilder title={editingId ? 'Modifier le membre' : 'Ajouter un membre'}
          fields={fields} values={formValues}
          onChange={(n, v) => setFormValues(p => ({ ...p, [n]: v }))}
          onSubmit={handleSubmit} onCancel={() => setFormOpen(false)}
          loading={submitting} errors={formErrors} />
      )}

      <ViewModal open={!!viewItem} onClose={() => setViewItem(null)} item={viewItem}
        title={`${viewItem?.first_name} ${viewItem?.last_name}`} fields={viewFields}
        imageUrl={viewItem?.photo_url} />

      <AuditHistory open={auditOpen} onClose={() => setAuditOpen(false)} tableName="staff" />

      <ConfirmModal isOpen={confirmOpen} title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce membre ?" onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }} loading={submitting} />
    </div>
  );
}
