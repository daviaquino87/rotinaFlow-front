export function getApiOrigin(): string {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (configured && configured.trim().length > 0) {
    return configured.replace(/\/+$/, "");
  }

  if (typeof window === "undefined") {
    return "";
  }

  const { protocol, hostname, port, origin } = window.location;
  if (port === "5173") {
    return `${protocol}//${hostname}:3000`;
  }

  return origin;
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiOrigin()}${normalizedPath}`;
}
