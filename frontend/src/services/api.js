import { getVisitorId } from './visitor';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function buildApiUrl(path) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(buildApiUrl(path), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-visitor-id': getVisitorId(),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
    signal: options.signal,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && payload.error ? payload.error : 'Request failed.';
    throw new Error(message);
  }

  return payload;
}

export function generateVisual(payload) {
  return apiRequest('/v1/images/generate', {
    method: 'POST',
    body: payload,
  });
}

export function fetchTaskStatus(taskId) {
  return apiRequest(`/v1/images/tasks/${taskId}`);
}

export function regenerateVisual(taskId, text) {
  return apiRequest(`/v1/images/tasks/${taskId}/regenerate`, {
    method: 'POST',
    body: text ? { text } : undefined,
  });
}

export function fetchGallery() {
  return apiRequest('/v1/images/gallery');
}

export function resolveMediaUrl(imageUrl) {
  if (!imageUrl) {
    return '';
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  return buildApiUrl(imageUrl);
}
