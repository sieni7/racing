import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminForm } from '../../components/admin/AdminForm';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { useAdmin } from '../../contexts/AdminContext';
import type { Player } from '../../lib/players';

const playerFields = [
  { name: 'first_name', label: 'Prénom', type: 'text' as const, required: true },
  { name: 'last_name', label: 'Nom', type: 'text' as const, required: true },
  { name: 'jersey_number', label: 'Numéro', type: 'number' as const },
  { name: 'position', label: 'Poste', type: 'select' as const, options: [
    { value: 'gardien', label: 'Gardien' },
    { value: 'defenseur', label: 'Défenseur' },
    { value: 'milieu', label: 'Milieu' },
    { value: 'attaquant', label: 'Attaquant' },
  ] },
  { name: 'nationality', label: 'Nationalité', type: 'text' as const },
  { name: 'date_of_birth', label: 'Date de naissance', type: 'date' as const },
  { name: 'height_cm', label: 'Taille (cm)', type: 'number' as const },
  { name: 'weight_kg', label: 'Poids (kg)', type: 'number' as const },
  { name: 'preferred_foot', label: 'Pied fort', type: 'select' as const, options: [
    { value: 'droit', label: 'Droit' },
    { value: 'gauche', label: 'Gauche' },
    { value: 'both', label: 'Les deux' },
  ] },
  { name: 'photo_url', label: 'Photo', type: 'file' as const },
  { name: 'bio', label: 'Biographie', type: 'textarea' as const },
];

export const AdminPlayers: React.FC = () => {
  const { players, fetchPlayers, createPlayer, updatePlayer, deletePlayer } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  const handleAdd = () => {
    setEditingId(null);
    setFormValues({});
    setFormErrors({});
    setFormOpen(true);
  };

  const handleEdit = (item: Player) => {
    setEditingId(item.id);
    setFormValues(item);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleDelete = (item: Player) => {
    setDeletingId(item.id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    await deletePlayer(deletingId);
    setSubmitting(false);
    setConfirmOpen(false);
    setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormErrors({});
    try {
      if (editingId) {
        await updatePlayer(editingId, formValues);
      } else {
        await createPlayer(formValues);
      }
      setFormOpen(false);
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
      setFormErrors({ general: 'Erreur lors de l\'enregistrement' });
    }
    setSubmitting(false);
  };

  const columns = [
    { key: 'jersey_number', label: 'N°' },
    { key: 'first_name', label: 'Prénom' },
    { key: 'last_name', label: 'Nom' },
    { key: 'position', label: 'Poste' },
    { key: 'nationality', label: 'Nationalité' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Joueurs</h1>
      <AdminTable
        data={players}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchFields={['first_name', 'last_name', 'position', 'nationality']}
        addLabel="Ajouter un joueur"
        itemsPerPage={10}
      />

      {formOpen && (
        <AdminForm
          title={editingId ? 'Modifier le joueur' : 'Ajouter un joueur'}
          fields={playerFields}
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
        message="Êtes-vous sûr de vouloir supprimer ce joueur ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        loading={submitting}
      />
    </div>
  );
};

export default AdminPlayers;