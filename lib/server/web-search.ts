// Tavily Web Search Provider
// All web search goes through this service. Never exposes API key to browser.

import { TavilySearchResponseSchema, type TavilySearchResult } from '../schemas';
import { searchCache, getCacheKey } from './cache';

export interface SearchOptions {
  maxResults?: number;
  searchDepth?: 'basic' | 'advanced';
  includeDomains?: string[];
  excludeDomains?: string[];
  includeAnswer?: boolean;
  topic?: 'general' | 'news';
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  rawContent?: string | null;
  score: number;
  publishedDate?: string | null;
}

export interface WebSearchProvider {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  isAvailable(): boolean;
}

// Rate limiting state
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 500; // Min 500ms between requests
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 20;
let minuteStart = Date.now();

function checkRateLimit(): boolean {
  const now = Date.now();
  if (now - minuteStart > 60000) {
    requestCount = 0;
    minuteStart = now;
  }
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) return false;
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL_MS) return false;
  return true;
}

async function waitForRateLimit(): Promise<void> {
  while (!checkRateLimit()) {
    await new Promise(r => setTimeout(r, 200));
  }
}

// Tavily implementation
export class TavilySearchProvider implements WebSearchProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY || '';
  }

  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!this.isAvailable()) {
      throw new Error('TAVILY_API_KEY not configured');
    }

    // Check cache
    const cacheKey = getCacheKey('search', query, JSON.stringify(options));
    const cached = searchCache.get(cacheKey) as SearchResult[] | null;
    if (cached) return cached;

    await waitForRateLimit();

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        lastRequestTime = Date.now();
        requestCount++;

        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: this.apiKey,
            query,
            max_results: options.maxResults || 10,
            search_depth: options.searchDepth || 'basic',
            include_domains: options.includeDomains,
            exclude_domains: options.excludeDomains,
            include_answer: options.includeAnswer || false,
            include_raw_content: true,
            topic: options.topic || 'general',
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (response.status === 429) {
          const backoff = Math.pow(2, attempt) * 1000;
          await new Promise(r => setTimeout(r, backoff));
          continue;
        }

        if (!response.ok) {
          throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const parsed = TavilySearchResponseSchema.parse(data);

        const results: SearchResult[] = parsed.results.map(r => ({
          title: r.title,
          url: r.url,
          content: r.content,
          rawContent: r.raw_content,
          score: r.score,
          publishedDate: r.published_date,
        }));

        // Cache results (10 minutes)
        searchCache.set(cacheKey, results, 10 * 60 * 1000);

        return results;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries - 1) {
          const backoff = Math.pow(2, attempt) * 1000;
          await new Promise(r => setTimeout(r, backoff));
        }
      }
    }

    throw lastError || new Error('Search failed after retries');
  }
}

// Singleton
let _provider: TavilySearchProvider | null = null;
export function getSearchProvider(): TavilySearchProvider {
  if (!_provider) _provider = new TavilySearchProvider();
  return _provider;
}
