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
        order: vi.fn().mockResolvedValue(mockPlayers),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAllPlayers();

      expect(result).toEqual(mockPlayers);
    });
  });

  describe('createPlayer', () => {
    it('should create player on success', async () => {
      const newPlayer = { first_name: 'Pierre', last_name: 'Durand', jersey_number: 9, position: 'attaquant' };
      const createdPlayer = { id: '3', ...newPlayer };

      const mockSingle = vi.fn().mockResolvedValue(createdPlayer);
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as vi.Mock).mockReturnValue({ insert: mockInsert });

      const result = await createPlayer(newPlayer);

      expect(result).toEqual(createdPlayer);
    });
  });

  describe('updatePlayer', () => {
    it('should update player on success', async () => {
      const updatedPlayer = { id: '1', first_name: 'Jean', last_name: 'Dupont', jersey_number: 10, position: 'defenseur' };

      const mockSingle = vi.fn().mockResolvedValue(updatedPlayer);
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updatePlayer('1', { position: 'defenseur' });

      expect(result).toEqual(updatedPlayer);
    });
  });

  describe('deletePlayer', () => {
    it('should delete player on success', async () => {
      const mockEq = vi.fn().mockResolvedValue(undefined);
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ delete: mockDelete });

      await expect(deletePlayer('1')).resolves.toBeUndefined();
    });
  });
});