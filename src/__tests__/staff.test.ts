import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../lib/staff';
import { supabase } from '../lib/supabase';

describe('staff service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllStaff', () => {
    it('should return all staff on success', async () => {
      const mockStaff = [
        { id: '1', first_name: 'Jean', last_name: 'Dupont', role: 'entraineur_principal' },
        { id: '2', first_name: 'Marie', last_name: 'Martin', role: 'medecin' },
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockStaff, error: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAllStaff();

      expect(result).toEqual(mockStaff);
    });
  });

  describe('createStaff', () => {
    it('should create staff on success', async () => {
      const newStaff = { first_name: 'Pierre', last_name: 'Durand', role: 'preparateur_physique' };
      const createdStaff = { id: '3', ...newStaff };

      const mockSingle = vi.fn().mockResolvedValue({ data: createdStaff, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as vi.Mock).mockReturnValue({ insert: mockInsert });

      const result = await createStaff(newStaff);

      expect(result).toEqual(createdStaff);
    });
  });

  describe('updateStaff', () => {
    it('should update staff on success', async () => {
      const updatedStaff = { id: '1', first_name: 'Jean', last_name: 'Dupont', role: 'entraineur_adjoint' };

      const mockSingle = vi.fn().mockResolvedValue({ data: updatedStaff, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateStaff('1', { role: 'entraineur_adjoint' });

      expect(result).toEqual(updatedStaff);
    });
  });

  describe('deleteStaff', () => {
    it('should delete staff on success', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ delete: mockDelete });

      await expect(deleteStaff('1')).resolves.toBeUndefined();
    });
  });
});