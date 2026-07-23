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
import type { Gallery } from '../../../../types';

const fields: Field[] = [
  { name: 'title', label: 'Titre', type: 'text', required: true },
  { name: 'image_url', label: 'Image', type: 'file', required: true },
  { name: 'description', label: 'Description', type: 'text' },
  { name: 'category', label: 'Catégorie', type: 'select', options: [
    { value: 'match', label: 'Match' }, { value: 'training', label: 'Entraînement' },
    { value: 'event', label: 'Événement' }, { value: 'portrait', label: 'Portrait' },
    { value: 'other', label: 'Autre' },
  ] },
  { name: 'is_active', label: 'Actif', type: 'select', options: [{ value: 'true', label: 'Oui' }, { value: 'false', label: 'Non' }] },
];

const categoryLabels: Record<string, string> = {
  match: 'Match', training: 'Entraînement', event: 'Événement', portrait: 'Portrait', other: 'Autre',
};

export default function GalleryPage() {
  const { gallery, fetchGallery, createGallery, updateGallery, deleteGallery } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const readOnly = useReadOnly();

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const handleAdd = useCallback(() => { setEditingId(null); setFormValues({ is_active: 'true' }); setFormErrors({}); setFormOpen(true); }, []);
  const handleEdit = useCallback((item: Gallery) => { setEditingId(item.id); setFormValues({ ...item, is_active: String(item.is_active) }); setFormErrors({}); setFormOpen(true); }, []);
  const handleDuplicate = useCallback((item: Gallery) => {
    const { id, created_at, updated_at, ...rest } = item as any;
    setEditingId(null); setFormValues({ ...rest, title: `${rest.title} (copie)` }); setFormErrors({}); setFormOpen(true);
  }, []);
  const handleDelete = useCallback((item: Gallery) => { setDeletingId(item.id); setConfirmOpen(true); }, []);

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteGallery(id)));
    toast.success(`${ids.length} image(s) supprimée(s)`);
  }, [deleteGallery]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    await deleteGallery(deletingId);
    await logAudit({ tableName: 'gallery', recordId: deletingId, action: 'DELETE' });
    setSubmitting(false); setConfirmOpen(false); setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setFormErrors({});
    try {
      const data = { ...formValues, is_active: formValues.is_active === 'true' };
      if (editingId) {
        const old = gallery.find(g => g.id === editingId) as unknown as Record<string, unknown>;
        await updateGallery(editingId, data);
        const changed = buildChangedFields(old || {}, data);
        if (Object.keys(changed).length > 0) await logAudit({ tableName: 'gallery', recordId: editingId, action: 'UPDATE', changedFields: changed });
      } else {
        await createGallery(data);
      }
      setFormOpen(false);
    } catch { toast.error("Erreur lors de l'enregistrement"); setFormErrors({ general: "Erreur" }); }
    setSubmitting(false);
  };

  useKeyboardShortcuts([
    { key: 'n', ctrl: true, handler: handleAdd, enabled: !formOpen && !readOnly },
    { key: 'f', ctrl: true, handler: () => (document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()), enabled: !formOpen },
  ]);

  const columns: Column<Gallery>[] = [
    { key: 'image_url', label: 'Image', render: (g) => <img src={g.image_url} alt={g.title} className="w-14 h-10 rounded-lg object-cover border" />, width: '80px' },
    { key: 'title', label: 'Titre' },
    { key: 'category', label: 'Catégorie', render: (g) => categoryLabels[g.category || ''] || g.category || '—' },
    { key: 'is_active', label: 'Actif', render: (g) => g.is_active ? <span className="text-green-600">●</span> : <span className="text-gray-300">○</span>, width: '80px' },
  ];

  const exportColumns = columns.filter(c => c.key !== 'image_url').map(({ key, label }) => ({ key, label }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Galerie</h1>
          <p className="text-sm text-gray-500">{gallery.length} images</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAuditOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:border-primary">
            Historique
          </button>
          <ExportButton data={gallery} columns={exportColumns} filename="galerie-rcb" />
        </div>
      </div>

      <DataTable data={gallery} columns={columns}
        onAdd={readOnly ? undefined : handleAdd}
        onEdit={readOnly ? undefined : handleEdit}
        onDelete={readOnly ? undefined : handleDelete}
        onDuplicate={readOnly ? undefined : handleDuplicate}
        onBulkDelete={readOnly ? undefined : handleBulkDelete}
        searchFields={['title', 'category']}
        addLabel="Image" readOnly={readOnly} storageKey="rcb_dt_gallery" />

      {formOpen && (
        <FormBuilder title={editingId ? "Modifier l'image" : 'Ajouter une image'}
          fields={fields} values={formValues}
          onChange={(n, v) => setFormValues(p => ({ ...p, [n]: v }))}
          onSubmit={handleSubmit} onCancel={() => setFormOpen(false)}
          loading={submitting} errors={formErrors} />
      )}

      <AuditHistory open={auditOpen} onClose={() => setAuditOpen(false)} tableName="gallery" />

      <ConfirmModal isOpen={confirmOpen} title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette image ?" onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }} loading={submitting} />
    </div>
  );
}
