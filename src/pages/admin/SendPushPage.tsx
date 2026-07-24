import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FormBuilder } from '../../components/admin/forms/FormBuilder';
import { sendPush } from '../../lib/notifications';
import type { NotificationPayload } from '../../lib/notifications';

const pushFields = [
  { name: 'title', label: 'Titre', type: 'text' as const, required: true },
  { name: 'body', label: 'Corps du message', type: 'textarea' as const, required: true },
  { name: 'icon', label: 'Icône (URL)', type: 'text' as const },
  { name: 'badge', label: 'Badge (URL)', type: 'text' as const },
  { name: 'tag', label: 'Tag (identifiant)', type: 'text' as const },
  { name: 'data_url', label: 'URL à ouvrir au clic', type: 'text' as const },
];

export const SendPushPage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<Partial<NotificationPayload>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [subscriptions, setSubscriptions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/.netlify/functions/get-push-count')
      .then(r => r.json())
      .then(data => { setSubscriptions(data.count); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormErrors({});
    try {
      const result = await sendPush(formValues as NotificationPayload);
      toast.success(`Notification envoyée à ${result.sent} abonné(s)`);
      setFormOpen(false);
    } catch (err: any) {
      toast.error('Erreur: ' + err.message);
      setFormErrors({ general: err.message });
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-display font-bold">Notifications Push</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-display font-bold mb-4">Abonnés actuels</h2>
        <p className="text-4xl font-bold text-primary">{loading ? '...' : subscriptions}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Abonnés actifs aux notifications push</p>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setFormValues({}); setFormErrors({}); setFormOpen(true); }}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-colors"
        >
          + Nouvelle notification
        </button>
      </div>

      {formOpen && (
        <FormBuilder
          title="Envoyer une notification"
          fields={pushFields}
          values={formValues}
          onChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={submitting}
          errors={formErrors}
        />
      )}
    </div>
  );
};

export default SendPushPage;