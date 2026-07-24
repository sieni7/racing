import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getContactMessages, sendMessage, markAsRead, replyToMessage, deleteContactMessage, type ContactMessage } from '../../../lib/contact';

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({ name: 'Admin', email: '', subject: '', message: '' });

  useEffect(() => {
    getContactMessages().then(setMessages).catch(() => toast.error('Erreur chargement')).finally(() => setLoading(false));
  }, []);

  const openMessage = useCallback(async (msg: ContactMessage) => {
    setSelected(msg);
    setReplyText('');
    if (!msg.read) {
      await markAsRead(msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
  }, []);

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    try {
      await replyToMessage(selected.id, replyText);
      toast.success('Réponse enregistrée');
      setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, replied: true, reply_body: replyText } : m));
      setReplyText('');
    } catch { toast.error('Erreur'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success('Message supprimé');
    } catch { toast.error('Erreur'); }
  };

  const handleCompose = async () => {
    if (!composeForm.name || !composeForm.email || !composeForm.message) return;
    try {
      await sendMessage(composeForm);
      toast.success('Message envoyé');
      setComposeOpen(false);
      setComposeForm({ name: 'Admin', email: '', subject: '', message: '' });
      const updated = await getContactMessages();
      setMessages(updated);
    } catch { toast.error('Erreur'); }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Messagerie</h1>
      </div>
      {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Messagerie</h1>
          <p className="text-sm text-gray-500">{messages.length} message{messages.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setComposeOpen(true); setSelected(null); }}
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau message
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">Aucun message</p>
          ) : messages.map(m => (
            <button key={m.id} onClick={() => openMessage(m)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selected?.id === m.id
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : !m.read
                    ? 'border-primary/30 bg-primary/5 dark:bg-primary/10 font-medium'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 dark:text-white truncate">{m.name}</p>
                  <p className="text-xs text-gray-500 truncate">{m.subject || 'Sans sujet'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {m.replied && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Répondu</span>}
                  <span className="text-xs text-gray-400">{new Date(m.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {composeOpen ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Nouveau message</h3>
            <input placeholder="Nom" value={composeForm.name} onChange={e => setComposeForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
            <input placeholder="Email du destinataire" value={composeForm.email} onChange={e => setComposeForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
            <input placeholder="Sujet" value={composeForm.subject} onChange={e => setComposeForm(p => ({ ...p, subject: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
            <textarea rows={4} placeholder="Message" value={composeForm.message} onChange={e => setComposeForm(p => ({ ...p, message: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm resize-y" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setComposeOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm">Annuler</button>
              <button onClick={handleCompose}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90">Envoyer</button>
            </div>
          </div>
        ) : selected ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{selected.name}</h3>
                <p className="text-sm text-gray-500">{selected.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{new Date(selected.created_at).toLocaleString('fr-FR')}</span>
                <button onClick={() => handleDelete(selected.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            {selected.subject && <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sujet : {selected.subject}</p>}
            <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">{selected.message}</p>

            {selected.reply_body && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Votre réponse</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 rounded-xl p-4">{selected.reply_body}</p>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Répondre</label>
              <textarea rows={3} value={replyText} onChange={e => setReplyText(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm resize-y" />
              <button onClick={handleReply} disabled={!replyText.trim()}
                className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                Envoyer la réponse
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            Sélectionnez un message ou rédigez-en un nouveau
          </div>
        )}
      </div>
    </div>
  );
}
