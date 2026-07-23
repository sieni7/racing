import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAdmin } from '../../../../contexts/AdminContext';
import { DataTable, type Column } from '../../../../components/admin/data/DataTable';
import { FormBuilder, type Field } from '../../../../components/admin/forms/FormBuilder';
import { NewsPreview } from '../../../../components/admin/NewsPreview';
import { ConfirmModal } from '../../../../components/admin/ConfirmModal';
import { AuditHistory } from '../../../../components/admin/AuditHistory';
import { ExportButton } from '../../../../components/admin/ExportButton';
import { logAudit, buildChangedFields } from '../../../../lib/audit';
import { useReadOnly } from '../../../../hooks/useReadOnly';
import { useKeyboardShortcuts } from '../../../../hooks/useKeyboardShortcuts';
import type { News } from '../../../../lib/news';

const fields: Field[] = [
  { name: 'title', label: 'Titre', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true },
  { name: 'excerpt', label: 'Résumé', type: 'textarea' },
  { name: 'content', label: 'Contenu', type: 'textarea', required: true },
  { name: 'status', label: 'Statut', type: 'select', options: [
    { value: 'draft', label: 'Brouillon' }, { value: 'published', label: 'Publié' }, { value: 'archived', label: 'Archivé' },
  ] },
  { name: 'cover_image_url', label: 'Image de couverture', type: 'file' },
];

const draftSaveKey = 'rcb_news_draft_v2';

export default function NewsPage() {
  const { news, fetchNews, createNews, updateNews, deleteNews } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const readOnly = useReadOnly();
  const prevValues = useRef<Record<string, any>>({});

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleAdd = useCallback(() => {
    const saved = (() => { try { return JSON.parse(localStorage.getItem(draftSaveKey) || '{}'); } catch { return {}; } })();
    setEditingId(null); setFormValues(saved); setFormErrors({}); setFormOpen(true);
  }, []);

  const handleEdit = useCallback((item: News) => { setEditingId(item.id); setFormValues(item); setFormErrors({}); setFormOpen(true); }, []);
  const handleDuplicate = useCallback((item: News) => {
    const { id, slug, created_at, updated_at, ...rest } = item as any;
    setEditingId(null); setFormValues({ ...rest, title: `${rest.title} (copie)` }); setFormErrors({}); setFormOpen(true);
  }, []);
  const handleDelete = useCallback((item: News) => { setDeletingId(item.id); setConfirmOpen(true); }, []);

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteNews(id)));
    toast.success(`${ids.length} actualité(s) supprimée(s)`);
  }, [deleteNews]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    await deleteNews(deletingId);
    await logAudit({ tableName: 'news', recordId: deletingId, action: 'DELETE' });
    setSubmitting(false); setConfirmOpen(false); setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setFormErrors({});
    try {
      if (editingId) {
        const old = news.find(n => n.id === editingId) as unknown as Record<string, unknown>;
        await updateNews(editingId, formValues);
        const changed = buildChangedFields(old || {}, formValues);
        if (Object.keys(changed).length > 0) await logAudit({ tableName: 'news', recordId: editingId, action: 'UPDATE', changedFields: changed });
      } else {
        await createNews(formValues);
        localStorage.removeItem(draftSaveKey);
      }
      setFormOpen(false);
    } catch { toast.error("Erreur lors de l'enregistrement"); setFormErrors({ general: "Erreur" }); }
    setSubmitting(false);
  };

  useEffect(() => {
    if (!formOpen || editingId || formValues.status !== 'draft') return;
    const timer = setInterval(() => {
      if (JSON.stringify(prevValues.current) !== JSON.stringify(formValues)) {
        localStorage.setItem(draftSaveKey, JSON.stringify(formValues));
        prevValues.current = formValues;
        toast.success('Brouillon sauvegardé', { id: 'draft-save', duration: 1500 });
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [formOpen, editingId, formValues]);

  useKeyboardShortcuts([
    { key: 'n', ctrl: true, handler: handleAdd, enabled: !formOpen && !readOnly },
    { key: 'f', ctrl: true, handler: () => (document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()), enabled: !formOpen },
  ]);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = { draft: 'bg-yellow-100 text-yellow-700', published: 'bg-green-100 text-green-700', archived: 'bg-gray-100 text-gray-600' };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${colors[status] || ''}`}>{status}</span>;
  };

  const columns: Column<News>[] = [
    { key: 'title', label: 'Titre' },
    { key: 'status', label: 'Statut', render: (n) => statusBadge(n.status), width: '120px' },
    { key: 'published_at', label: 'Date', render: (n) => n.published_at ? new Date(n.published_at).toLocaleDateString('fr-FR') : 'Brouillon', width: '120px' },
  ];

  const exportColumns = columns.map(({ key, label }) => ({ key, label }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Actualités</h1>
          <p className="text-sm text-gray-500">{news.length} articles</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAuditOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:border-primary">
            Historique
          </button>
          <ExportButton data={news} columns={exportColumns} filename="actualites-rcb" />
        </div>
      </div>

      <DataTable data={news} columns={columns}
        onAdd={readOnly ? undefined : handleAdd}
        onEdit={readOnly ? undefined : handleEdit}
        onDelete={readOnly ? undefined : handleDelete}
        onDuplicate={readOnly ? undefined : handleDuplicate}
        onBulkDelete={readOnly ? undefined : handleBulkDelete}
        searchFields={['title']} addLabel="Article"
        readOnly={readOnly} storageKey="rcb_dt_news" />

      {formOpen && (
        <>
          <FormBuilder title={editingId ? "Modifier l'actualité" : "Ajouter une actualité"}
            fields={fields} values={formValues}
            onChange={(n, v) => setFormValues(p => ({ ...p, [n]: v }))}
            onSubmit={handleSubmit} onCancel={() => setFormOpen(false)}
            loading={submitting} errors={formErrors} />
          <div className="fixed bottom-6 right-6 z-50">
            <button onClick={() => setPreviewOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium shadow-lg hover:shadow-xl flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Aperçu
            </button>
          </div>
          <NewsPreview open={previewOpen} onClose={() => setPreviewOpen(false)}
            title={formValues.title || ''} content={formValues.content || ''}
            excerpt={formValues.excerpt} coverImageUrl={formValues.cover_image_url} status={formValues.status} />
        </>
      )}

      <AuditHistory open={auditOpen} onClose={() => setAuditOpen(false)} tableName="news" />

      <ConfirmModal isOpen={confirmOpen} title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette actualité ?" onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }} loading={submitting} />
    </div>
  );
}
