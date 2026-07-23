import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllNews, getPublishedNews, getRecentNews, getNewsBySlug, getNewsById, createNews, updateNews, deleteNews } from '../lib/news';
import { supabase } from '../lib/supabase';

describe('news service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllNews', () => {
    it('should return all news on success', async () => {
      const mockNews = [
        { id: '1', title: 'News 1', slug: 'news-1', status: 'published', published_at: '2026-01-15', content: 'Content 1' },
        { id: '2', title: 'News 2', slug: 'news-2', status: 'draft', published_at: null, content: 'Content 2' },
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockNews, error: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAllNews();

      expect(result).toEqual(mockNews);
    });
  });

  describe('getPublishedNews', () => {
    it('should return published news on success', async () => {
      const mockNews = [
        { id: '1', title: 'News 1', slug: 'news-1', status: 'published', published_at: '2026-01-15', content: 'Content 1' },
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockNews, error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getPublishedNews();

      expect(result).toEqual(mockNews);
    });
  });

  describe('getRecentNews', () => {
    it('should return recent published news with limit', async () => {
      const recentNews = [
        { id: '1', title: 'News 1', slug: 'news-1', status: 'published' },
      ];

      const mockLimit = vi.fn().mockResolvedValue({ data: recentNews, error: null });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getRecentNews(3);

      expect(result).toEqual(recentNews);
    });
  });

  describe('getNewsBySlug', () => {
    it('should return news by slug on success', async () => {
      const mockNews = { id: '1', title: 'Test News', slug: 'news-1', status: 'published' };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockNews, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getNewsBySlug('news-1');

      expect(result).toEqual(mockNews);
    });
  });

  describe('getNewsById', () => {
    it('should return news by id on success', async () => {
      const mockNews = { id: '1', title: 'Test News', slug: 'news-1', status: 'published' };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockNews, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getNewsById('1');

      expect(result).toEqual(mockNews);
    });
  });

  describe('createNews', () => {
    it('should create news on success', async () => {
      const newNews = { title: 'New Article', slug: 'new-article', content: 'Content', status: 'published' };
      const createdNews = { id: '3', ...newNews };

      const mockSingle = vi.fn().mockResolvedValue({ data: createdNews, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as vi.Mock).mockReturnValue({ insert: mockInsert });

      const result = await createNews(newNews);

      expect(result).toEqual(createdNews);
    });
  });

  describe('updateNews', () => {
    it('should update news on success', async () => {
      const updatedNews = { id: '1', title: 'Updated Title', slug: 'news-1', status: 'published' };

      const mockSingle = vi.fn().mockResolvedValue({ data: updatedNews, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateNews('1', { title: 'Updated Title' });

      expect(result).toEqual(updatedNews);
    });
  });

  describe('deleteNews', () => {
    it('should delete news on success', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ delete: mockDelete });

      await expect(deleteNews('1')).resolves.toBeUndefined();
    });
  });
});