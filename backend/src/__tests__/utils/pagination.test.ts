import { parsePagination, buildPaginatedResponse } from '../../utils/pagination';

describe('Pagination Utils', () => {
  describe('parsePagination', () => {
    it('should return default values when no query params provided', () => {
      const result = parsePagination({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(0);
      expect(result.sortBy).toBe('createdAt');
      expect(result.sortOrder).toBe('desc');
    });

    it('should parse page and limit from query', () => {
      const result = parsePagination({ page: '3', limit: '20' });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(40);
    });

    it('should enforce minimum page of 1', () => {
      const result = parsePagination({ page: '-1' });
      expect(result.page).toBe(1);
    });

    it('should enforce minimum limit of 1', () => {
      const result = parsePagination({ limit: '0' });
      expect(result.limit).toBe(1);
    });

    it('should enforce maximum limit of 100', () => {
      const result = parsePagination({ limit: '200' });
      expect(result.limit).toBe(100);
    });

    it('should use custom default sortBy', () => {
      const result = parsePagination({}, 'date');
      expect(result.sortBy).toBe('date');
    });

    it('should parse sortBy and sortOrder from query', () => {
      const result = parsePagination({ sortBy: 'title', sortOrder: 'asc' });
      expect(result.sortBy).toBe('title');
      expect(result.sortOrder).toBe('asc');
    });

    it('should default to desc for invalid sortOrder', () => {
      const result = parsePagination({ sortOrder: 'invalid' as 'asc' | 'desc' });
      expect(result.sortOrder).toBe('desc');
    });
  });

  describe('buildPaginatedResponse', () => {
    it('should build correct response structure', () => {
      const data = [{ id: '1' }, { id: '2' }];
      const result = buildPaginatedResponse(data, 50, 1, 10);
      expect(result.data).toBe(data);
      expect(result.total).toBe(50);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(5);
    });

    it('should calculate totalPages correctly with remainder', () => {
      const result = buildPaginatedResponse([], 23, 1, 10);
      expect(result.totalPages).toBe(3);
    });

    it('should handle empty results', () => {
      const result = buildPaginatedResponse([], 0, 1, 10);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });
});
