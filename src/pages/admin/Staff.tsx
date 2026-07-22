import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminForm } from '../../components/admin/AdminForm';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../../lib/staff';
import type { Staff } from '../../lib/staff';

const staffFields = [
  { name: 'first_name', label: 'Prénom', type: 'text' as const, required: true },
  { name: 'last_name', label: 'Nom', type: 'text' as const, required: true },
  { name: 'role', label: 'Rôle', type: 'select' as const, options: [
    { value: 'entraineur_principal', label: 'Entraîneur principal' },
    { value: 'entraineur_adjoint', label: 'Entraîneur adjoint' },
    { value: 'preparateur_physique', label: 'Préparateur physique' },
    { value: 'gardien_entraineur', label: 'Entraîneur des gardiens' },
    { value: 'medecin', label: 'Médecin' },
    { value: 'kinésithérapeute', label: 'Kinésithérapeute' },
    { value: 'manager', label: 'Manager' },
    { value: 'autre', label: 'Autre' },
  ] },
  { name: 'email', label: 'Email', type: 'email' as const },
  { name: 'phone', label: 'Téléphone', type: 'text' as const },
  { name: 'bio', label: 'Biographie', type: 'textarea' as const },
  { name: 'is_active', label: 'Actif', type: 'select' as const, options: [
    { value: 'true', label: 'Oui' },
    { value: 'false', label: 'Non' },
  ] },
];

export const AdminStaff: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    const { data, error } = await getAllStaff();
    if (error) toast.error('Erreur chargement du staff');
    else setStaff(data || []);
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAdd = () => {
    setEditingId(null);
    setFormValues({});
    setFormErrors({});
    setFormOpen(true);
  };

  const handleEdit = (item: Staff) => {
    setEditingId(item.id);
    setFormValues({ ...item, is_active: String(item.is_active) });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleDelete = (item: Staff) => {
    setDeletingId(item.id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    const { error } = await deleteStaff(deletingId);
    if (error) toast.error('Erreur lors de la suppression');
    else { toast.success('Membre du staff supprimé'); fetchStaff(); }
    setSubmitting(false);
    setConfirmOpen(false);
    setDeletingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormErrors({});
    const data = { ...formValues, is_active: formValues.is_active === 'true' };
    const result = editingId
      ? await updateStaff(editingId, data)
      : await createStaff(data as any);
    if (result.error) {
      toast.error('Erreur lors de l\'enregistrement');
      setFormErrors({ general: result.error.message });
    } else {
      toast.success(editingId ? 'Membre modifié' : 'Membre ajouté');
      setFormOpen(false);
      fetchStaff();
    }
    setSubmitting(false);
  };

  const columns = [
    { key: 'first_name', label: 'Prénom' },
    { key: 'last_name', label: 'Nom' },
    { key: 'role', label: 'Rôle' },
    { key: 'email', label: 'Email' },
    { key: 'is_active', label: 'Actif', render: (item: Staff) => item.is_active ? '✅' : '❌' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Staff</h1>
      <AdminTable
        data={staff}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchFields={['first_name', 'last_name', 'role', 'email']}
        addLabel="Ajouter un membre"
        itemsPerPage={10}
      />

      {formOpen && (
        <AdminForm
          title={editingId ? 'Modifier le membre' : 'Ajouter un membre'}
          fields={staffFields}
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
        message="Êtes-vous sûr de vouloir supprimer ce membre du staff ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        loading={submitting}
      />
    </div>
  );
};

export default AdminStaff;