
// Simple in-memory cache for processed clothing blobs
// In a real app, this could use IndexedDB for persistence across reloads
const clothingCache = new Map<string, string>();

export const getCachedClothing = (id: string): string | undefined => {
    return clothingCache.get(id);
};

export const cacheClothing = (id: string, url: string) => {
    clothingCache.set(id, url);
};

export const hasCachedClothing = (id: string): boolean => {
    return clothingCache.has(id);
};
