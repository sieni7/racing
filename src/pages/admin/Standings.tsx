import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminForm } from '../../components/admin/AdminForm';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { useAdmin } from '../../contexts/AdminContext';
import type { Standing } from '../../types';

const standingFields = [
  { name: 'season', label: 'Saison', type: 'text' as const, required: true },
  { name: 'team_name', label: 'Équipe', type: 'text' as const, required: true },
  { name: 'played', label: 'Matchs joués', type: 'number' as const },
  { name: 'won', label: 'Victoires', type: 'number' as const },
  { name: 'drawn', label: 'Nuls', type: 'number' as const },
  { name: 'lost', label: 'Défaites', type: 'number' as const },
  { name: 'goals_for', label: 'Buts pour', type: 'number' as const },
  { name: 'goals_against', label: 'Buts contre', type: 'number' as const },
  { name: 'form', label: 'Forme (ex: VNVVD)', type: 'text' as const },
];

export const AdminStandings: React.FC = () => {
  const { standings, fetchStandings, createStanding, updateStanding, deleteStanding } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchStandings(); }, [fetchStandings]);

  const handleAdd = () => {
    setEditingId(null);
    setFormValues({});
    setFormErrors({});
    setFormOpen(true);
  };

  const handleEdit = (item: Standing) => {
    setEditingId(item.id);
    setFormValues(item);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleDelete = (item: Standing) => {
    setDeletingId(item.id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    await deleteStanding(deletingId);
    setSubmitting(false);
    setConfirmOpen(false);
    setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormErrors({});
    try {
      if (editingId) {
        await updateStanding(editingId, formValues);
      } else {
        await createStanding(formValues);
      }
      setFormOpen(false);
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
      setFormErrors({ general: 'Erreur lors de l\'enregistrement' });
    }
    setSubmitting(false);
  };

  const columns = [
    { key: 'team_name', label: 'Équipe' },
    { key: 'season', label: 'Saison' },
    { key: 'played', label: 'J' },
    { key: 'points', label: 'Pts' },
    { key: 'goal_diff', label: 'Diff' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Classement</h1>
      <AdminTable
        data={standings}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchFields={['team_name', 'season']}
        addLabel="Ajouter une équipe"
        itemsPerPage={15}
      />

      {formOpen && (
        <AdminForm
          title={editingId ? 'Modifier l\'équipe' : 'Ajouter une équipe'}
          fields={standingFields}
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
        message="Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        loading={submitting}
      />
    </div>
  );
};

export default AdminStandings;
