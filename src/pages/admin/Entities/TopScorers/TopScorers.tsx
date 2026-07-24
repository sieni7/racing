import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAdmin } from '../../../../contexts/AdminContext';
import { DataTable, type Column } from '../../../../components/admin/data/DataTable';
import { FormBuilder, type Field } from '../../../../components/admin/forms/FormBuilder';
import { ConfirmModal } from '../../../../components/admin/ConfirmModal';
import type { TopScorer } from '../../../../lib/top-scorers';

const columns: Column<TopScorer>[] = [
  { key: 'player_name', label: 'Joueur', sortable: true },
  { key: 'goals', label: 'Buts', sortable: true, width: '80px' },
  { key: 'position', label: 'Poste' },
  { key: 'season', label: 'Saison' },
];

const fields: Field[] = [
  { name: 'player_name', label: 'Nom du joueur', type: 'text', required: true },
  { name: 'goals', label: 'Buts', type: 'number', required: true },
  { name: 'position', label: 'Poste', type: 'text' },
  { name: 'season', label: 'Saison', type: 'text' },
  { name: 'image_url', label: 'URL photo', type: 'text' },
  { name: 'sort_order', label: 'Ordre', type: 'number' },
];

export default function TopScorersPage() {
  const { topScorers, fetchTopScorers, createTopScorer, updateTopScorer, deleteTopScorer } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchTopScorers(); }, [fetchTopScorers]);

  const handleAdd = useCallback(() => { setEditingId(null); setFormValues({}); setFormOpen(true); }, []);
  const handleEdit = useCallback((item: TopScorer) => { setEditingId(item.id); setFormValues(item); setFormOpen(true); }, []);
  const handleDelete = useCallback((item: TopScorer) => { setDeletingId(item.id); setConfirmOpen(true); }, []);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    await deleteTopScorer(deletingId);
    setSubmitting(false); setConfirmOpen(false); setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingId) await updateTopScorer(editingId, formValues);
      else await createTopScorer(formValues);
      setFormOpen(false);
    } catch { toast.error('Erreur'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Meilleurs buteurs</h1>
      <DataTable data={topScorers} columns={columns} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}
        searchFields={['player_name', 'season']} addLabel="Buteur" storageKey="rcb_dt_topscorers" />
      {formOpen && <FormBuilder fields={fields} values={formValues} onChange={(n, v) => setFormValues(p => ({ ...p, [n]: v }))}
        onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} title={editingId ? 'Modifier le buteur' : 'Ajouter un buteur'} loading={submitting} />}
      {confirmOpen && <ConfirmModal isOpen={confirmOpen} title="Confirmer" message="Supprimer ce buteur ?" onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} loading={submitting} />}
    </div>
  );
}
