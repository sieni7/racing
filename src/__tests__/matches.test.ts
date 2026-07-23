import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUpcomingMatches,
  getAllMatches,
  getPastMatches,
  getAllMatchesPaginated,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
} from '../lib/matches';
import { supabase } from '../lib/supabase';

describe('matches service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUpcomingMatches', () => {
    it('should return upcoming matches on success', async () => {
      const mockMatches = [
        { id: '1', opponent_name: 'Team A', match_date: '2026-01-15', status: 'upcoming' },
      ];

      const mockLimit = vi.fn().mockResolvedValue({ data: mockMatches, error: null });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUpcomingMatches(5);

      expect(result).toEqual(mockMatches);
    });
  });

  describe('getAllMatches', () => {
    it('should return all matches on success', async () => {
      const mockMatches = [
        { id: '1', opponent_name: 'Team A', match_date: '2026-01-15', status: 'finished' },
        { id: '2', opponent_name: 'Team B', match_date: '2026-02-01', status: 'upcoming' },
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockMatches, error: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAllMatches();

      expect(result).toEqual(mockMatches);
    });
  });

  describe('getPastMatches', () => {
    it('should return paginated past matches on success', async () => {
      const mockMatches = [
        { id: '1', opponent_name: 'Team A', match_date: '2026-01-15', status: 'finished' },
      ];

      const mockRange = vi.fn().mockResolvedValue({ data: mockMatches, error: null, count: 1 });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getPastMatches(1, 12);

      expect(result.matches).toEqual(mockMatches);
      expect(result.count).toBe(1);
    });

    it('should throw on error', async () => {
      const mockRange = vi.fn().mockRejectedValue(new Error('DB Error'));
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      await expect(getPastMatches(1, 12)).rejects.toThrow('DB Error');
    });
  });

  describe('getAllMatchesPaginated', () => {
    it('should return paginated matches on success', async () => {
      const mockMatches = [
        { id: '1', opponent_name: 'Team A', match_date: '2026-01-15' },
        { id: '2', opponent_name: 'Team B', match_date: '2026-02-01' },
      ];

      const mockRange = vi.fn().mockResolvedValue({ data: mockMatches, error: null, count: 2 });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAllMatchesPaginated(1, 12);

      expect(result.matches).toEqual(mockMatches);
      expect(result.count).toBe(2);
    });
  });

  describe('getMatchById', () => {
    it('should return match by id on success', async () => {
      const mockMatch = { id: '1', opponent_name: 'Team A', match_date: '2026-01-15', status: 'finished' };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockMatch, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getMatchById('1');

      expect(result).toEqual(mockMatch);
    });
  });

  describe('createMatch', () => {
    it('should create match on success', async () => {
      const newMatch = { opponent_name: 'New Team', match_date: '2026-10-01', status: 'upcoming' };
      const createdMatch = { id: '3', ...newMatch };

      const mockSingle = vi.fn().mockResolvedValue({ data: createdMatch, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as vi.Mock).mockReturnValue({ insert: mockInsert });

      const result = await createMatch(newMatch);

      expect(result).toEqual(createdMatch);
    });
  });

  describe('updateMatch', () => {
    it('should update match on success', async () => {
      const updatedMatch = { id: '1', opponent_name: 'Updated Team', match_date: '2026-01-15' };

      const mockSingle = vi.fn().mockResolvedValue({ data: updatedMatch, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateMatch('1', { opponent_name: 'Updated Team' });

      expect(result).toEqual(updatedMatch);
    });
  });

  describe('deleteMatch', () => {
    it('should delete match on success', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ delete: mockDelete });

      await expect(deleteMatch('1')).resolves.toBeUndefined();
    });
  });
});