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

const mockMatches = [
  { id: '1', opponent_name: 'Team A', match_date: '2026-01-15', status: 'finished', racing_score: 2, opponent_score: 1 },
  { id: '2', opponent_name: 'Team B', match_date: '2026-02-01', status: 'upcoming', racing_score: null, opponent_score: null },
];

const mockMatch = mockMatches[0];

describe('matches service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUpcomingMatches', () => {
    it('should return upcoming matches on success', async () => {
      const upcomingMatches = mockMatches.filter(m => m.status === 'upcoming');

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: upcomingMatches, error: null }),
          }),
        }),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUpcomingMatches(5);

      expect(result).toEqual(upcomingMatches);
    });
  });

  describe('getAllMatches', () => {
    it('should return all matches on success', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockMatches, error: null }),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAllMatches();

      expect(result.data).toEqual(mockMatches);
      expect(result.error).toBeNull();
    });

    it('should return error on failure', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAllMatches();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(new Error('DB Error'));
    });
  });

  describe('getPastMatches', () => {
    it('should return paginated past matches on success', async () => {
      const pastMatches = mockMatches.filter(m => m.status === 'finished');

      const mockRange = vi.fn().mockResolvedValue({ data: pastMatches, error: null, count: 1 });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getPastMatches(1, 12);

      expect(result.matches).toEqual(pastMatches);
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
      const mockRange = vi.fn().mockResolvedValue({ data: mockMatches, error: null, count: 2 });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAllMatchesPaginated(1, 12);

      expect(result.matches).toEqual(mockMatches);
      expect(result.count).toBe(2);
    });

    it('should throw on error', async () => {
      const mockRange = vi.fn().mockRejectedValue(new Error('DB Error'));
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      await expect(getAllMatchesPaginated(1, 12)).rejects.toThrow('DB Error');
    });
  });

  describe('getMatchById', () => {
    it('should return match by id on success', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockMatch, error: null }),
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

      const mockSingle = vi.fn().mockResolvedValue({ data: createdMatch, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as vi.Mock).mockReturnValue({ insert: mockInsert });

      const result = await createMatch(newMatch);

      expect(result.data).toEqual(createdMatch);
      expect(result.error).toBeNull();
    });

    it('should return error on failure', async () => {
      const newMatch = { opponent_name: 'New Team' };

      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as vi.Mock).mockReturnValue({ insert: mockInsert });

      const result = await createMatch(newMatch);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(new Error('Insert failed'));
    });
  });

  describe('updateMatch', () => {
    it('should update match on success', async () => {
      const updatedMatch = { ...mockMatch, opponent_name: 'Updated Team' };

      const mockSingle = vi.fn().mockResolvedValue({ data: updatedMatch, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateMatch('1', { opponent_name: 'Updated Team' });

      expect(result.data).toEqual(updatedMatch);
      expect(result.error).toBeNull();
    });
  });

  describe('deleteMatch', () => {
    it('should delete match on success', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ delete: mockDelete });

      const result = await deleteMatch('1');

      expect(result.error).toBeNull();
    });
  });
});