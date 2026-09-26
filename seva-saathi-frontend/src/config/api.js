/**
 * API base URL.
 * Development default: FastAPI on port 5000.
 * Production: set VITE_API_BASE_URL at build time (e.g. https://api.example.com).
 * Leave VITE_API_BASE_URL empty to use same-origin paths (Vite /api proxy).
 */
const rawBase = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL =
  rawBase === undefined ? "http://localhost:5000" : String(rawBase).replace(/\/$/, "");

export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}
