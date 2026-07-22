import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminForm } from '../../components/admin/AdminForm';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { getAllMatches, createMatch, updateMatch, deleteMatch } from '../../lib/matches';
import type { Match } from '../../lib/matches';

const matchFields = [
  { name: 'opponent_name', label: 'Adversaire', type: 'text' as const, required: true },
  { name: 'is_home', label: 'Domicile', type: 'select' as const, options: [
    { value: 'true', label: 'Oui' },
    { value: 'false', label: 'Non' },
  ] },
  { name: 'match_date', label: 'Date', type: 'datetime-local' as const, required: true },
  { name: 'venue', label: 'Stade', type: 'text' as const },
  { name: 'competition', label: 'Compétition', type: 'text' as const },
  { name: 'season', label: 'Saison', type: 'text' as const },
  { name: 'status', label: 'Statut', type: 'select' as const, options: [
    { value: 'scheduled', label: 'Programmé' },
    { value: 'live', label: 'En cours' },
    { value: 'finished', label: 'Terminé' },
    { value: 'postponed', label: 'Reporté' },
    { value: 'cancelled', label: 'Annulé' },
  ] },
  { name: 'racing_score', label: 'Score RCB', type: 'number' as const },
  { name: 'opponent_score', label: 'Score adversaire', type: 'number' as const },
  { name: 'summary', label: 'Résumé', type: 'textarea' as const },
];

export const AdminMatches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchMatches = async () => {
    const { data, error } = await getAllMatches();
    if (error) toast.error('Erreur chargement des matchs');
    else setMatches(data || []);
  };

  useEffect(() => { fetchMatches(); }, []);

  const handleAdd = () => {
    setEditingId(null);
    setFormValues({});
    setFormErrors({});
    setFormOpen(true);
  };

  const handleEdit = (item: Match) => {
    setEditingId(item.id);
    setFormValues({ ...item, is_home: String(item.is_home) });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleDelete = (item: Match) => {
    setDeletingId(item.id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    const { error } = await deleteMatch(deletingId);
    if (error) toast.error('Erreur lors de la suppression');
    else { toast.success('Match supprimé'); fetchMatches(); }
    setSubmitting(false);
    setConfirmOpen(false);
    setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormErrors({});
    const data = { ...formValues, is_home: formValues.is_home === 'true' };
    const result = editingId
      ? await updateMatch(editingId, data)
      : await createMatch(data as any);
    if (result.error) {
      toast.error('Erreur lors de l\'enregistrement');
      setFormErrors({ general: result.error.message });
    } else {
      toast.success(editingId ? 'Match modifié' : 'Match ajouté');
      setFormOpen(false);
      fetchMatches();
    }
    setSubmitting(false);
  };

  const columns = [
    { key: 'opponent_name', label: 'Adversaire' },
    { key: 'match_date', label: 'Date', render: (item: Match) => new Date(item.match_date).toLocaleDateString('fr-FR') },
    { key: 'competition', label: 'Compétition' },
    { key: 'status', label: 'Statut' },
    { key: 'racing_score', label: 'Score', render: (item: Match) =>
      item.status === 'finished' ? `${item.racing_score ?? '-'} - ${item.opponent_score ?? '-'}` : 'À venir'
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Matchs</h1>
      <AdminTable
        data={matches}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchFields={['opponent_name', 'competition']}
        addLabel="Ajouter un match"
        itemsPerPage={10}
      />

      {formOpen && (
        <AdminForm
          title={editingId ? 'Modifier le match' : 'Ajouter un match'}
          fields={matchFields}
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
        message="Êtes-vous sûr de vouloir supprimer ce match ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        loading={submitting}
      />
    </div>
  );
};

export default AdminMatches;