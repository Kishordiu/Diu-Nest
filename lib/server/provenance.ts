import { nanoid } from 'nanoid';
import type { SourceRecord, SourceTier, SourceQuality } from '../types';

// Create a SourceRecord from a web search result or extraction
export function createSourceRecord(params: {
  url: string;
  title: string;
  snippet?: string;
  publishedDate?: string | null;
}): SourceRecord {
  const domain = extractDomain(params.url);
  const sourceType = classifySourceType(domain, params.title, params.url);
  const sourceTier = classifySourceTier(sourceType);

  return {
    id: nanoid(12),
    url: params.url,
    domain,
    title: params.title || domain,
    sourceType,
    sourceTier,
    sourceQuality: tierToQuality(sourceTier),
    retrievedAt: new Date().toISOString(),
    publishedAt: params.publishedDate || undefined,
    extractedFields: [],
    rawSnippet: params.snippet?.slice(0, 500),
    accessible: true,
  };
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Classify source type based on domain patterns
export function classifySourceType(
  domain: string,
  title: string,
  url: string
): SourceRecord['sourceType'] {
  const d = domain.toLowerCase();
  const t = (title || '').toLowerCase();
  const u = url.toLowerCase();

  // Government / certification
  if (d.includes('.gov') || d.includes('bis.gov') || d.includes('cdsco') || d.includes('iso.org')) {
    return 'government';
  }
  if (d.includes('bureau-veritas') || d.includes('tuv') || d.includes('sgs.com') || t.includes('certification')) {
    return 'certification';
  }

  // Marketplaces
  const marketplaces = [
    'indiamart.com', 'tradeindia.com', 'alibaba.com', 'amazon.', 'flipkart.com',
    'justdial.com', 'sulekha.com', 'exportersindia.com', 'tradekey.com',
    'made-in-china.com', 'globalsources.com', 'thomasnet.com',
  ];
  if (marketplaces.some(m => d.includes(m))) {
    return 'marketplace';
  }

  // Directories
  const directories = ['yellowpages', 'mouthshut', 'glassdoor', 'linkedin.com', 'crunchbase.com'];
  if (directories.some(dir => d.includes(dir))) {
    return 'directory';
  }

  // News
  if (d.includes('news') || d.includes('times') || d.includes('economic') || d.includes('business-standard')) {
    return 'news';
  }

  // If domain looks like a company website (short domain, no marketplace patterns)
  const parts = d.split('.');
  if (parts.length <= 3 && !marketplaces.some(m => d.includes(m))) {
    // Could be manufacturer or distributor — check content
    if (t.includes('manufacturer') || t.includes('manufacturing') || t.includes('factory') || u.includes('/products')) {
      return 'manufacturer';
    }
    if (t.includes('distributor') || t.includes('dealer') || t.includes('supplier') || t.includes('trading')) {
      return 'distributor';
    }
    // Default company website — could be manufacturer
    return 'manufacturer';
  }

  return 'unknown';
}

export function classifySourceTier(sourceType: SourceRecord['sourceType']): SourceTier {
  switch (sourceType) {
    case 'manufacturer':
    case 'government':
    case 'certification':
      return 1;
    case 'distributor':
    case 'marketplace':
      return 2;
    case 'directory':
      return 3;
    case 'news':
    case 'unknown':
    default:
      return 4;
  }
}

export function tierToQuality(tier: SourceTier): SourceQuality {
  if (tier === 1) return 'high';
  if (tier <= 2) return 'medium';
  return 'low';
}

export function formatRetrievedAgo(isoTimestamp: string): string {
  const ms = Date.now() - new Date(isoTimestamp).getTime();
  if (ms < 60000) return 'just now';
  if (ms < 3600000) return `${Math.floor(ms / 60000)} min ago`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
  return `${Math.floor(ms / 86400000)}d ago`;
}
