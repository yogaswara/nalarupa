const VISITOR_KEY = 'nalarupa_visitor_id';

function createVisitorId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getVisitorId() {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const storedVisitorId = window.localStorage.getItem(VISITOR_KEY);
  if (storedVisitorId) {
    return storedVisitorId;
  }

  const visitorId = createVisitorId();
  window.localStorage.setItem(VISITOR_KEY, visitorId);
  return visitorId;
}

export function resetVisitorId() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(VISITOR_KEY);
  }
}