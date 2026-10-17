const STORAGE_URL =
  import.meta.env.VITE_STORAGE_URL ?? "http://localhost:8000/storage";

export const storageUrl = (path?: string | null): string | null =>
  path ? `${STORAGE_URL}/${path}` : null;