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

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(mockMatches),
          }),
        }),
      });
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

      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue(mockMatches),
      });
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

      const mockSelect = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({ data: mockMatches, error: null, count: 1 }),
            }),
          }),
        }),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getPastMatches(1, 12);

      expect(result.matches).toEqual(mockMatches);
      expect(result.count).toBe(1);
    });

    it('should throw on error', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockRejectedValue(new Error('DB Error')),
            }),
          }),
        }),
      });
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

      const mockSelect = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({ data: mockMatches, error: null, count: 2 }),
          }),
        }),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAllMatchesPaginated(1, 12);

      expect(result.matches).toEqual(mockMatches);
      expect(result.count).toBe(2);
    });
  });

  describe('getMatchById', () => {
    it('should return match by id on success', async () => {
      const mockMatch = { id: '1', opponent_name: 'Team A', match_date: '2026-01-15', status: 'finished' };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockMatch),
        }),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getMatchById('1');

      expect(result).toEqual(mockMatch);
    });
  });

  describe('createMatch', () => {
    it('should create match on success', async () => {
      const newMatch = { opponent_name: 'New Team', match_date: '2026-10-01', status: 'upcoming' };
      const createdMatch = { id: '3', ...newMatch };

      const mockSingle = vi.fn().mockResolvedValue(createdMatch);
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

      const mockSingle = vi.fn().mockResolvedValue(updatedMatch);
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
      const mockEq = vi.fn().mockResolvedValue(undefined);
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ delete: mockDelete });

      await expect(deleteMatch('1')).resolves.toBeUndefined();
    });
  });
});