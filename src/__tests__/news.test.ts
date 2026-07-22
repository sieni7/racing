import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllNews, getPublishedNews, getRecentNews, getNewsBySlug, getNewsById, createNews, updateNews, deleteNews } from '../lib/news';
import { supabase } from '../lib/supabase';

const mockNews = [
  { id: '1', title: 'News 1', slug: 'news-1', status: 'published', published_at: '2026-01-15', content: 'Content 1' },
  { id: '2', title: 'News 2', slug: 'news-2', status: 'draft', published_at: null, content: 'Content 2' },
];

const mockNewsItem = mockNews[0];

describe('news service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllNews', () => {
    it('should return all news on success', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockNews, error: null }),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAllNews();

      expect(result.data).toEqual(mockNews);
      expect(result.error).toBeNull();
    });
  });

  describe('getPublishedNews', () => {
    it('should return published news on success', async () => {
      const publishedNews = mockNews.filter(n => n.status === 'published');

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: publishedNews, error: null }),
        }),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getPublishedNews();

      expect(result.data).toEqual(publishedNews);
      expect(result.error).toBeNull();
    });
  });

  describe('getRecentNews', () => {
    it('should return recent published news with limit', async () => {
      const recentNews = mockNews.filter(n => n.status === 'published');

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: recentNews, error: null }),
          }),
        }),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getRecentNews(3);

      expect(result).toEqual(recentNews);
    });
  });

  describe('getNewsBySlug', () => {
    it('should return news by slug on success', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockNewsItem, error: null }),
        }),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getNewsBySlug('news-1');

      expect(result).toEqual(mockNewsItem);
    });
  });

  describe('getNewsById', () => {
    it('should return news by id on success', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockNewsItem, error: null }),
        }),
      });
      (supabase.from as vi.Mock).mockReturnValue({ select: mockSelect });

      const result = await getNewsById('1');

      expect(result).toEqual(mockNewsItem);
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

      expect(result.data).toEqual(createdNews);
      expect(result.error).toBeNull();
    });
  });

  describe('updateNews', () => {
    it('should update news on success', async () => {
      const updatedNews = { ...mockNewsItem, title: 'Updated Title' };

      const mockSingle = vi.fn().mockResolvedValue({ data: updatedNews, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateNews('1', { title: 'Updated Title' });

      expect(result.data).toEqual(updatedNews);
      expect(result.error).toBeNull();
    });
  });

  describe('deleteNews', () => {
    it('should delete news on success', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as vi.Mock).mockReturnValue({ delete: mockDelete });

      const result = await deleteNews('1');

      expect(result.error).toBeNull();
    });
  });
});