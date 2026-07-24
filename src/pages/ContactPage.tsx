import { useState, useRef, useEffect, type FormEvent } from 'react';
import SEOHead from '../components/SEOHead';
import { sendMessage } from '../lib/contact';

const SUBJECT_OPTIONS = [
  { value: '', label: 'Sélectionnez un sujet…' },
  { value: 'information', label: 'Demande d\'information' },
  { value: 'partenariat', label: 'Partenariat / Sponsoring' },
  { value: 'support', label: 'Support technique' },
  { value: 'presse', label: 'Presse / Médias' },
  { value: 'autre', label: 'Autre' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX = 500;

type FieldErrors = { name?: string; email?: string; message?: string };

function validateName(v: string): string | null {
  if (!v.trim()) return 'Le nom est requis.';
  if (v.trim().length < 2) return 'Minimum 2 caractères.';
  return null;
}

function validateEmail(v: string): string | null {
  if (!v.trim()) return 'L\'email est requis.';
  if (!EMAIL_REGEX.test(v)) return 'Email invalide.';
  return null;
}

function validateMessage(v: string): string | null {
  if (!v.trim()) return 'Le message est requis.';
  if (v.trim().length < 10) return 'Minimum 10 caractères.';
  return null;
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', honeypot: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [cooldown, setCooldown] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  function touch(field: string) {
    setTouched(prev => new Set(prev).add(field));
  }

  function validate(): FieldErrors {
    return {
      name: validateName(form.name) ?? undefined,
      email: validateEmail(form.email) ?? undefined,
      message: validateMessage(form.message) ?? undefined,
    };
  }

  function fieldError(field: keyof FieldErrors): string | undefined {
    return touched.has(field) ? errors[field] : undefined;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(new Set(['name', 'email', 'message']));
    const v = validate();
    setErrors(v);
    if (v.name || v.email || v.message) return;
    if (form.honeypot) return;
    setSending(true);
    setCooldown(true);
    try {
      await sendMessage({ name: form.name, email: form.email, subject: form.subject || undefined, message: form.message });
      setDone(true);
    } catch {
      try {
        const res = await fetch('/.netlify/functions/submit-contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, subject: form.subject, message: form.message }),
        });
        if (!res.ok) throw new Error('Erreur');
        setDone(true);
      } catch {
        setErrors(prev => ({ ...prev, message: 'Erreur lors de l\'envoi. Veuillez réessayer.' }));
        touch('message');
      }
    } finally {
      setSending(false);
      setTimeout(() => setCooldown(false), 2000);
    }
  };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <SEOHead title="Contact" description="Contactez le Racing Club de Bingerville." />
        <h1 className="font-display text-3xl font-black text-gray-900 dark:text-white mb-2">Contact</h1>
        <div ref={successRef} tabIndex={-1} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center outline-none">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Message envoyé !</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Nous vous répondrons dans les plus brefs délais.</p>
          <button onClick={() => { setDone(false); setForm({ name: '', email: '', subject: '', message: '', honeypot: '' }); setErrors({}); setTouched(new Set()); nameRef.current?.focus(); }}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors text-sm">
            Envoyer un autre message
          </button>
        </div>
      </div>
    );
  }

  const commonInput = (hasError: boolean) =>
    `mt-1 w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-primary/40 ${
      hasError
        ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-white'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary'
    }`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <SEOHead title="Contact" description="Contactez le Racing Club de Bingerville." />

      <h1 className="font-display text-3xl font-black text-gray-900 dark:text-white mb-2">Contact</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Une question, un message ? Écrivez-nous.</p>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-5" noValidate>
        <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
          <label htmlFor="honeypot">Ne pas remplir</label>
          <input id="honeypot" name="honeypot" type="text" value={form.honeypot} onChange={e => setForm(p => ({ ...p, honeypot: e.target.value }))} tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom *</label>
            <input ref={nameRef} required value={form.name}
              onChange={e => { setForm(p => ({ ...p, name: e.target.value })); if (touched.has('name')) setErrors(prev => ({ ...prev, name: validateName(e.target.value) ?? undefined })); }}
              onBlur={() => { touch('name'); setErrors(prev => ({ ...prev, name: validateName(form.name) ?? undefined })); }}
              className={commonInput(!!fieldError('name'))} />
            {fieldError('name') && <p className="text-xs text-red-500 mt-1">{fieldError('name')}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email *</label>
            <input type="email" required value={form.email}
              onChange={e => { setForm(p => ({ ...p, email: e.target.value })); if (touched.has('email')) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) ?? undefined })); }}
              onBlur={() => { touch('email'); setErrors(prev => ({ ...prev, email: validateEmail(form.email) ?? undefined })); }}
              className={commonInput(!!fieldError('email'))} />
            {fieldError('email') && <p className="text-xs text-red-500 mt-1">{fieldError('email')}</p>}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sujet</label>
          <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
            className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm appearance-none cursor-pointer">
            {SUBJECT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message *</label>
            <span className={`text-xs ${form.message.length > MESSAGE_MAX ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
              {form.message.length}/{MESSAGE_MAX}
            </span>
          </div>
          <textarea required rows={5} value={form.message}
            onChange={e => { setForm(p => ({ ...p, message: e.target.value })); if (touched.has('message')) setErrors(prev => ({ ...prev, message: validateMessage(e.target.value) ?? undefined })); }}
            onBlur={() => { touch('message'); setErrors(prev => ({ ...prev, message: validateMessage(form.message) ?? undefined })); }}
            className={`${commonInput(!!fieldError('message'))} resize-y`} />
          {fieldError('message') && <p className="text-xs text-red-500 mt-1">{fieldError('message')}</p>}
        </div>

        <button type="submit" disabled={sending || cooldown}
          className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {sending ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Envoi…
            </>
          ) : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}
