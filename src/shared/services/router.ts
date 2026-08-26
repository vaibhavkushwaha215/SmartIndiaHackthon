/**
 * SahyogSeva - Clean Pathname-based Router & Navigation Service
 * 
 * Lightweight SPA navigation using browser History API without external router bloat.
 * Normalizes leading/trailing slashes, handles query params, legacy hash migration,
 * and maintains reactive route sync across refresh, back, and forward actions.
 */

export type AppRoute =
  | 'booking'
  | 'book-service'
  | 'booking-status'
  | 'login'
  | 'register'
  | 'apply-worker'
  | 'worker-dashboard'
  | 'worker-jobs'
  | 'worker-earnings'
  | 'admin-dashboard'
  | 'admin-workers'
  | 'admin-analytics'
  | 'superadmin'
  | 'my-bookings'
  | 'demand-forecast'
  | 'logs'
  | 'settings'
  | 'not-found';

export const ROUTE_PATH_MAP: Record<Exclude<AppRoute, 'not-found' | 'book-service' | 'booking-status'>, string> = {
  'booking': '/',
  'login': '/login',
  'register': '/register',
  'apply-worker': '/apply-worker',
  'worker-dashboard': '/worker/dashboard',
  'worker-jobs': '/worker/jobs',
  'worker-earnings': '/worker/earnings',
  'admin-dashboard': '/admin/dashboard',
  'admin-workers': '/admin/workers',
  'admin-analytics': '/admin/analytics',
  'superadmin': '/superadmin',
  'my-bookings': '/my-bookings',
  'demand-forecast': '/demand-forecast',
  'logs': '/logs',
  'settings': '/settings',
};

const PATH_ROUTE_MAP: Record<string, AppRoute> = {
  '': 'booking',
  '/': 'booking',
  'booking': 'booking',
  'services': 'booking',
  'login': 'login',
  'signin': 'login',
  'sign-in': 'login',
  'register': 'register',
  'signup': 'register',
  'sign-up': 'register',
  'apply-worker': 'apply-worker',
  'apply': 'apply-worker',
  'join': 'apply-worker',
  'worker/dashboard': 'worker-dashboard',
  'worker-dashboard': 'worker-dashboard',
  'worker': 'worker-dashboard',
  'worker/jobs': 'worker-jobs',
  'worker-jobs': 'worker-jobs',
  'worker/earnings': 'worker-earnings',
  'worker-earnings': 'worker-earnings',
  'admin/dashboard': 'admin-dashboard',
  'admin-dashboard': 'admin-dashboard',
  'admin': 'admin-dashboard',
  'admin/workers': 'admin-workers',
  'admin-workers': 'admin-workers',
  'admin/analytics': 'admin-analytics',
  'admin-analytics': 'admin-analytics',
  'superadmin': 'superadmin',
  'my-bookings': 'my-bookings',
  'bookings': 'my-bookings',
  'demand-forecast': 'demand-forecast',
  'logs': 'logs',
  'settings': 'settings',
};

/**
 * Normalizes a raw pathname or route string by removing query strings, hashes,
 * and leading/trailing slashes.
 */
export function normalizePath(path: string): string {
  if (!path) return '';
  return path
    .split('?')[0]
    .split('#')[0]
    .trim()
    .toLowerCase()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

/**
 * Derives canonical AppRoute from current browser location.
 * Migrates legacy hashes to clean pathnames automatically.
 */
export function parseRouteFromLocation(): AppRoute {
  // Check for legacy hash-based URLs first for seamless migration
  const hash = window.location.hash;
  if (hash) {
    const rawHashPath = hash.replace(/^#\/?/, '');
    const normalizedHash = normalizePath(rawHashPath);
    if (normalizedHash in PATH_ROUTE_MAP) {
      const resolvedRoute = PATH_ROUTE_MAP[normalizedHash];
      const targetPath = (ROUTE_PATH_MAP as any)[resolvedRoute] || '/';
      // Clean up the URL in address bar without reloading
      window.history.replaceState({}, '', targetPath);
      return resolvedRoute;
    }
  }

  // Parse clean pathname
  const rawPath = window.location.pathname;
  const normalized = normalizePath(rawPath);

  if (normalized in PATH_ROUTE_MAP) {
    return PATH_ROUTE_MAP[normalized];
  }

  // Dynamic Parameterized Routes
  if (normalized.startsWith('book/')) {
    return 'book-service';
  }

  if (normalized.startsWith('bookings/') || normalized.startsWith('booking/')) {
    const parts = normalized.split('/');
    if (parts.length >= 2 && parts[1]) {
      return 'booking-status';
    }
    return 'my-bookings';
  }

  return 'not-found';
}

/**
 * Helper to extract serviceId from /book/:serviceId URL
 */
export function getServiceIdFromUrl(): string | null {
  const normalized = normalizePath(window.location.pathname);
  if (normalized.startsWith('book/')) {
    const parts = normalized.split('/');
    return parts[1] || null;
  }
  return null;
}

/**
 * Helper to extract requestId from /bookings/:requestId URL
 */
export function getRequestIdFromUrl(): string | null {
  const normalized = normalizePath(window.location.pathname);
  if (normalized.startsWith('bookings/') || normalized.startsWith('booking/')) {
    const parts = normalized.split('/');
    return parts[1] || null;
  }
  return null;
}

/**
 * Returns the clean pathname for a given route key.
 */
export function getPathForRoute(route: string): string {
  if (route in ROUTE_PATH_MAP) {
    return (ROUTE_PATH_MAP as any)[route];
  }
  if (route.startsWith('/')) {
    return route;
  }
  return `/${route}`;
}

/**
 * Programmatic client-side navigation using History API.
 * Does not trigger full page reload.
 */
export function navigate(pathOrRoute: string, replace = false): void {
  const targetPath = getPathForRoute(pathOrRoute);
  const currentFull = window.location.pathname + window.location.search;

  if (currentFull !== targetPath) {
    if (replace) {
      window.history.replaceState({}, '', targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
    }
  }

  // Dispatch popstate event to trigger route state updates across components
  window.dispatchEvent(new PopStateEvent('popstate'));
}
