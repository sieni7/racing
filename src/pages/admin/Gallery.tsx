import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminForm } from '../../components/admin/AdminForm';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { useAdmin } from '../../contexts/AdminContext';
import type { Gallery } from '../../types';

const galleryFields = [
  { name: 'title', label: 'Titre', type: 'text' as const, required: true },
  { name: 'description', label: 'Description', type: 'textarea' as const },
  { name: 'image_url', label: 'URL image', type: 'text' as const, required: true },
  { name: 'thumbnail_url', label: 'URL miniature', type: 'text' as const },
  { name: 'category', label: 'Catégorie', type: 'select' as const, options: [
    { value: 'match', label: 'Match' },
    { value: 'entrainement', label: 'Entraînement' },
    { value: 'evenement', label: 'Événement' },
    { value: 'autre', label: 'Autre' },
  ] },
  { name: 'is_video', label: 'Type', type: 'select' as const, options: [
    { value: 'false', label: 'Photo' },
    { value: 'true', label: 'Vidéo' },
  ] },
  { name: 'video_url', label: 'URL vidéo', type: 'text' as const },
  { name: 'sort_order', label: 'Ordre', type: 'number' as const },
];

export const AdminGallery: React.FC = () => {
  const { gallery, fetchGallery, createGallery, updateGallery, deleteGallery } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const handleAdd = () => {
    setEditingId(null);
    setFormValues({});
    setFormErrors({});
    setFormOpen(true);
  };

  const handleEdit = (item: Gallery) => {
    setEditingId(item.id);
    setFormValues(item);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleDelete = (item: Gallery) => {
    setDeletingId(item.id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    await deleteGallery(deletingId);
    setSubmitting(false);
    setConfirmOpen(false);
    setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormErrors({});
    try {
      if (editingId) {
        await updateGallery(editingId, formValues);
      } else {
        await createGallery(formValues);
      }
      setFormOpen(false);
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
      setFormErrors({ general: 'Erreur lors de l\'enregistrement' });
    }
    setSubmitting(false);
  };

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'category', label: 'Catégorie' },
    { key: 'is_video', label: 'Type' },
    { key: 'sort_order', label: 'Ordre' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Galerie</h1>
      <AdminTable
        data={gallery}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchFields={['title', 'category']}
        addLabel="Ajouter un média"
        itemsPerPage={10}
      />

      {formOpen && (
        <AdminForm
          title={editingId ? 'Modifier le média' : 'Ajouter un média'}
          fields={galleryFields}
          values={formValues}
          onChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={submitting}
          errors={formErrors}
        />
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce média ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        loading={submitting}
      />
    </div>
  );
};

export default AdminGallery;
