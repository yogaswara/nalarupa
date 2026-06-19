import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchGallery, generateVisual, resolveMediaUrl } from '../src/services/api';
import { resetVisitorId } from '../src/services/visitor';

describe('api service', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetVisitorId();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('sends the anonymous visitor id with requests', async () => {
    window.localStorage.setItem('nalarupa_visitor_id', 'visitor-123');
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true }),
    });

    await fetchGallery();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/images/gallery'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-visitor-id': 'visitor-123',
        }),
      })
    );
  });

  it('resolves relative media urls against the api base url', () => {
    expect(resolveMediaUrl('/uploads/image.png')).toContain('/uploads/image.png');
  });

  it('throws when the backend returns an error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'Boom' }),
    });

    await expect(generateVisual({ text: 'hello', style: 'Edu-Cartoon' })).rejects.toThrow('Boom');
  });
});