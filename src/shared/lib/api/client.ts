export function getApiOrigin(): string {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (configured && configured.trim().length > 0) {
    return configured.replace(/\/+$/, "");
  }

  // Default: same-origin. In development the Vite proxy forwards /api/* to the
  // backend, so no cross-origin cookie issues. In production the frontend is
  // served by the same host as the backend.
  return "";
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiOrigin()}${normalizedPath}`;
}
