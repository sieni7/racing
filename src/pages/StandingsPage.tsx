import { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import type { Standing } from '../types';

const columns = [
  { key: 'position', label: 'Pos' },
  { key: 'team_name', label: 'Équipe' },
  { key: 'played', label: 'J' },
  { key: 'won', label: 'V' },
  { key: 'drawn', label: 'N' },
  { key: 'lost', label: 'D' },
  { key: 'goals_for', label: 'BP' },
  { key: 'goals_against', label: 'BC' },
  { key: 'goal_diff', label: 'Diff' },
  { key: 'points', label: 'Pts' },
  { key: 'form', label: 'Forme' },
];

export default function StandingsPage() {
  const { standings, fetchStandings, createStanding, updateStanding, deleteStanding } = useAdmin();
  const [season, setSeason] = useState('');
  const [seasons, setSeasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredStandings = season ? standings.filter(s => s.season === season) : standings;

  useEffect(() => {
    fetchStandings().then(() => setLoading(false));
  }, [fetchStandings]);

  useEffect(() => {
    const uniqueSeasons = [...new Set(standings.map(s => s.season))].sort().reverse();
    setSeasons(uniqueSeasons);
    if (!season && uniqueSeasons.length > 0) setSeason(uniqueSeasons[0]);
  }, [standings]);

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
    } catch (err: any) {
      setFormErrors({ general: err.message });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-display font-bold mb-8">Classement</h1>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-display font-bold">Classement</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={season}
            onChange={e => setSeason(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Toutes les saisons</option>
            {seasons.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-cta transition-colors"
          >
            + Ajouter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredStandings.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucune équipe pour cette saison
                </td>
              </tr>
            ) : (
              filteredStandings.map((team, idx) => (
                <tr
                  key={team.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${idx === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
                >
                  <td className="px-4 py-3 text-sm font-bold text-primary">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{team.team_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{team.played}</td>
                  <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">{team.won}</td>
                  <td className="px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">{team.drawn}</td>
                  <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">{team.lost}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{team.goals_for}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{team.goals_against}</td>
                   <td className={`px-4 py-3 text-sm font-medium ${team.goal_diff > 0 ? 'text-green-600' : team.goal_diff < 0 ? 'text-red-600' : 'text-gray-600'} dark:text-gray-400`}>
                    {team.goal_diff > 0 ? '+' : ''}{team.goal_diff}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-primary">{team.points}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">{team.form || '-'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => handleEdit(team)} className="text-blue-600 hover:underline text-sm">Modifier</button>
                    <button onClick={() => handleDelete(team)} className="text-red-600 hover:underline text-sm">Supprimer</button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

      {formOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-display font-bold mb-6">{editingId ? 'Modifier l\'équipe' : 'Ajouter une équipe'}</h2>
              <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Saison <span className="text-red-500">*</span></label>
                  <select value={formValues.season} onChange={e => setFormValues(p => ({...p, season: e.target.value}))} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required>
                    {seasons.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Équipe <span className="text-red-500">*</span></label>
                  <input type="text" value={formValues.team_name} onChange={e => setFormValues(p => ({...p, team_name: e.target.value}))} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['played', 'won', 'drawn', 'lost', 'goals_for', 'goals_against'].map(field => (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-1">{field.replace('_', ' ')}</label>
                      <input type="number" value={formValues[field] || 0} onChange={e => setFormValues(p => ({...p, [field]: parseInt(e.target.value) || 0}))} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" min="0" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Forme (ex: VNVVD)</label>
                  <input type="text" value={formValues.form} onChange={e => setFormValues(p => ({...p, form: e.target.value}))} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                </div>
                {formErrors.general && <p className="text-red-500 text-sm">{formErrors.general}</p>}
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                  <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-cta transition-colors disabled:opacity-50">{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${confirmOpen ? 'block' : 'hidden'}`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h3 className="text-xl font-display font-bold mb-2">Confirmer la suppression</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setConfirmOpen(false); setDeletingId(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Annuler</button>
            <button onClick={confirmDelete} disabled={submitting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">{submitting ? 'Suppression...' : 'Confirmer'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { StandingsPage };