import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllPlayers, createPlayer, updatePlayer, deletePlayer } from '../lib/players';
import { supabase } from '../lib/supabase';

describe('players service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllPlayers', () => {
    it('should return all players on success', async () => {
      const mockPlayers = [
        { id: '1', first_name: 'Jean', last_name: 'Dupont', jersey_number: 10, position: 'milieu' },
        { id: '2', first_name: 'Marie', last_name: 'Martin', jersey_number: 1, position: 'gardien' },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockPlayers, error: null }),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAllPlayers();

      expect(result.data).toEqual(mockPlayers);
      expect(result.error).toBeNull();
    });
  });

  describe('createPlayer', () => {
    it('should create player on success', async () => {
      const newPlayer = { first_name: 'Pierre', last_name: 'Durand', jersey_number: 9, position: 'attaquant' };
      const createdPlayer = { id: '3', ...newPlayer };

      const mockSingle = vi.fn().mockResolvedValue({ data: createdPlayer, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as vi.Mock).mockReturnValue({ insert: mockInsert });

      const result = await createPlayer(newPlayer);

      expect(result.data).toEqual(createdPlayer);
      expect(result.error).toBeNull();
    });
  });

  describe('updatePlayer', () => {
    it('should update player on success', async () => {
      const updatedPlayer = { id: '1', first_name: 'Jean', last_name: 'Dupont', jersey_number: 10, position: 'defenseur' };

      const mockSingle = vi.fn().mockResolvedValue({ data: updatedPlayer, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updatePlayer('1', { position: 'defenseur' });

      expect(result.data).toEqual(updatedPlayer);
      expect(result.error).toBeNull();
    });
  });

  describe('deletePlayer', () => {
    it('should delete player on success', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ delete: mockDelete });

      const result = await deletePlayer('1');

      expect(result.error).toBeNull();
    });
  });
});