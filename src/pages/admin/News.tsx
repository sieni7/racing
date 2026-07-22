import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import toast from 'react-hot-toast';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminForm } from '../../components/admin/AdminForm';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import type { News } from '../../lib/news';

const newsFields = [
  { name: 'title', label: 'Titre', type: 'text' as const, required: true },
  { name: 'slug', label: 'Slug', type: 'text' as const, required: true },
  { name: 'excerpt', label: 'Résumé', type: 'textarea' as const },
  { name: 'content', label: 'Contenu', type: 'textarea' as const, required: true },
  { name: 'status', label: 'Statut', type: 'select' as const, options: [
    { value: 'draft', label: 'Brouillon' },
    { value: 'published', label: 'Publié' },
    { value: 'archived', label: 'Archivé' },
  ] },
  { name: 'cover_image_url', label: 'Image de couverture', type: 'file' as const },
];

export const AdminNews: React.FC = () => {
  const { news, fetchNews, createNews, updateNews, deleteNews } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleAdd = () => {
    setEditingId(null);
    setFormValues({});
    setFormErrors({});
    setFormOpen(true);
  };

  const handleEdit = (item: News) => {
    setEditingId(item.id);
    setFormValues(item);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleDelete = (item: News) => {
    setDeletingId(item.id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    await deleteNews(deletingId);
    setSubmitting(false);
    setConfirmOpen(false);
    setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormErrors({});
    try {
      if (editingId) {
        await updateNews(editingId, formValues);
      } else {
        await createNews(formValues);
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
    { key: 'status', label: 'Statut' },
    { key: 'published_at', label: 'Date', render: (item: News) =>
      item.published_at ? new Date(item.published_at).toLocaleDateString('fr-FR') : 'Brouillon'
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Actualités</h1>
      <AdminTable
        data={news}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchFields={['title']}
        addLabel="Ajouter une actualité"
        itemsPerPage={10}
      />

      {formOpen && (
        <AdminForm
          title={editingId ? 'Modifier l\'actualité' : 'Ajouter une actualité'}
          fields={newsFields}
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
        message="Êtes-vous sûr de vouloir supprimer cette actualité ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        loading={submitting}
      />
    </div>
  );
};

export default AdminNews;