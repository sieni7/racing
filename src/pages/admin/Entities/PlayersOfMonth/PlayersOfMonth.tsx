import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAdmin } from '../../../../contexts/AdminContext';
import { DataTable, type Column } from '../../../../components/admin/data/DataTable';
import { FormBuilder, type Field } from '../../../../components/admin/forms/FormBuilder';
import { ConfirmModal } from '../../../../components/admin/ConfirmModal';
import type { PlayerOfMonth } from '../../../../lib/players-of-month';

const columns: Column<PlayerOfMonth>[] = [
  { key: 'player_name', label: 'Joueur', sortable: true },
  { key: 'month', label: 'Mois', sortable: true },
  { key: 'goals', label: 'Buts', width: '80px' },
  { key: 'assists', label: 'Passes', width: '80px' },
  { key: 'season', label: 'Saison' },
];

const fields: Field[] = [
  { name: 'player_name', label: 'Nom du joueur', type: 'text', required: true },
  { name: 'month', label: 'Mois (ex: Mars 2026)', type: 'text', required: true },
  { name: 'goals', label: 'Buts', type: 'number' },
  { name: 'assists', label: 'Passes décisives', type: 'number' },
  { name: 'position', label: 'Poste', type: 'text' },
  { name: 'image_url', label: 'URL photo', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'season', label: 'Saison', type: 'text' },
];

export default function PlayersOfMonthPage() {
  const { playersOfMonth, fetchPlayersOfMonth, createPlayerOfMonth, updatePlayerOfMonth, deletePlayerOfMonth } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchPlayersOfMonth(); }, [fetchPlayersOfMonth]);

  const handleAdd = useCallback(() => { setEditingId(null); setFormValues({}); setFormOpen(true); }, []);
  const handleEdit = useCallback((item: PlayerOfMonth) => { setEditingId(item.id); setFormValues(item); setFormOpen(true); }, []);
  const handleDelete = useCallback((item: PlayerOfMonth) => { setDeletingId(item.id); setConfirmOpen(true); }, []);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    await deletePlayerOfMonth(deletingId);
    setSubmitting(false); setConfirmOpen(false); setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingId) await updatePlayerOfMonth(editingId, formValues);
      else await createPlayerOfMonth(formValues);
      setFormOpen(false);
    } catch { toast.error('Erreur'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Joueurs du mois</h1>
      <DataTable data={playersOfMonth} columns={columns} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}
        searchFields={['player_name', 'month', 'season']} addLabel="Joueur du mois" storageKey="rcb_dt_playersofmonth" />
      {formOpen && <FormBuilder fields={fields} values={formValues} onChange={(n, v) => setFormValues(p => ({ ...p, [n]: v }))}
        onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} title={editingId ? 'Modifier' : 'Ajouter un joueur du mois'} loading={submitting} />}
      {confirmOpen && <ConfirmModal isOpen={confirmOpen} title="Confirmer" message="Supprimer ce joueur du mois ?" onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} loading={submitting} />}
    </div>
  );
}
