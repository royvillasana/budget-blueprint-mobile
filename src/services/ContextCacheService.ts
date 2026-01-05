interface CachedContext {
  data: any;
  timestamp: number;
  userId: string;
}

class ContextCacheService {
  private cache = new Map<string, CachedContext>();
  private TTL = 120000; // 2 minutes

  get(userId: string, year: number, month: number): any | null {
    const key = `${userId}-${year}-${month}`;
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }

    this.cache.delete(key);
    return null;
  }

  set(userId: string, year: number, month: number, data: any): void {
    const key = `${userId}-${year}-${month}`;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      userId,
    });
  }

  clear(userId: string): void {
    for (const [key, value] of this.cache.entries()) {
      if (value.userId === userId) {
        this.cache.delete(key);
      }
    }
  }

  clearAll(): void {
    this.cache.clear();
  }
}

export const contextCache = new ContextCacheService();

// Listen for data changes to invalidate cache
if (typeof window !== 'undefined') {
  window.addEventListener('transaction-added', () => {
    contextCache.clearAll();
  });
}
