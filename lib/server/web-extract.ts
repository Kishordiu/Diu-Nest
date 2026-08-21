// Web content extraction and supplier field extraction
// Uses heuristic/regex-based extraction (no AI dependency)

import { extractionCache, getCacheKey } from './cache';
import { createSourceRecord } from './provenance';
import type { SourceRecord } from '../types';
import type { ExtractedSupplier } from '../schemas';

export interface ExtractedContent {
  url: string;
  title: string;
  text: string;
  source: SourceRecord;
}

// Extract text content from a URL using Tavily extract API
export async function extractUrl(url: string): Promise<ExtractedContent | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  const cacheKey = getCacheKey('extract', url);
  const cached = extractionCache.get(cacheKey) as ExtractedContent | null;
  if (cached) return cached;

  try {
    const response = await fetch('https://api.tavily.com/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        urls: [url],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.results?.[0];
    if (!result) return null;

    const source = createSourceRecord({
      url,
      title: result.title || url,
      snippet: result.raw_content?.slice(0, 500),
    });

    const extracted: ExtractedContent = {
      url,
      title: result.title || '',
      text: result.raw_content || '',
      source,
    };

    // Cache for 1 hour
    extractionCache.set(cacheKey, extracted, 60 * 60 * 1000);
    return extracted;
  } catch {
    return null;
  }
}

// Extract supplier fields from text content using regex/heuristic patterns
export function extractSupplierFields(text: string, url: string, title: string): ExtractedSupplier {
  const t = text.toLowerCase();

  return {
    companyName: extractCompanyName(text, title, url),
    website: url,
    location: extractLocation(text),
    country: extractCountry(text),
    supplierType: inferSupplierType(text, url),
    products: extractProducts(text),
    certifications: extractCertifications(text),
    contactInfo: extractContact(text),
    prices: extractPrices(text),
    specifications: extractSpecifications(text),
  };
}

function extractCompanyName(text: string, title: string, url: string): string | null {
  // Try title first (often the company name)
  if (title) {
    // Remove common suffixes
    const cleaned = title
      .replace(/\s*[-|–—]\s*.+$/, '') // "Company - Products" → "Company"
      .replace(/\s*(Pvt\.?\s*Ltd\.?|Private\s+Limited|LLC|Inc\.?|Ltd\.?|LLP)$/i, '')
      .trim();
    if (cleaned.length > 2 && cleaned.length < 80) return cleaned;
  }
  
  // Try to extract from text
  const patterns = [
    /(?:About|Welcome to|company)\s+([A-Z][A-Za-z\s&]+(?:Pvt\.?\s*Ltd\.?|Industries|Systems|Instruments|Sensors|Technologies|Electronics))/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].trim();
  }

  // Fallback: use domain
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '');
    return domain.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  } catch {
    return null;
  }
}

function extractLocation(text: string): string | null {
  const indianCities = [
    'Chennai', 'Mumbai', 'Bangalore', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune',
    'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Noida', 'Gurgaon', 'Gurugram',
    'Coimbatore', 'Vadodara', 'Indore', 'Thane', 'Nagpur', 'Nashik', 'Surat',
    'Visakhapatnam', 'Kochi', 'Chandigarh', 'Bhopal', 'Patna', 'Ludhiana',
    'Rajkot', 'Faridabad', 'Aurangabad', 'Mysore', 'Mysuru', 'Ranchi', 'Dehradun',
  ];
  for (const city of indianCities) {
    if (text.includes(city)) return `${city}, India`;
  }
  
  const intlCities = ['Shanghai', 'Shenzhen', 'Tokyo', 'Seoul', 'Singapore', 'Berlin', 'London', 'New York'];
  for (const city of intlCities) {
    if (text.includes(city)) return city;
  }
  return null;
}

function extractCountry(text: string): string | null {
  const countries = ['India', 'China', 'USA', 'Germany', 'Japan', 'South Korea', 'Taiwan', 'UK', 'Singapore'];
  for (const c of countries) {
    if (text.includes(c)) return c;
  }
  return null;
}

function inferSupplierType(text: string, url: string): ExtractedSupplier['supplierType'] {
  const t = text.toLowerCase();
  if (t.includes('manufactur') || t.includes('factory') || t.includes('production facility')) return 'manufacturer';
  if (t.includes('distribut') || t.includes('authorized dealer') || t.includes('reseller')) return 'distributor';
  const marketplaces = ['indiamart', 'alibaba', 'tradeindia', 'amazon', 'flipkart'];
  if (marketplaces.some(m => url.toLowerCase().includes(m))) return 'marketplace';
  return 'unknown';
}

function extractProducts(text: string): string[] | null {
  const products: string[] = [];
  const patterns = [
    /(?:temperature|pressure|humidity|flow|level|vibration|proximity|displacement|force|torque)\s*sensors?/gi,
    /(?:RTD|thermocouple|thermistor|PT100|PT1000|NTC|PTC)\b/gi,
    /(?:infrared|IR|digital|analog|wireless)\s*(?:sensor|transmitter|controller)/gi,
  ];
  for (const p of patterns) {
    const matches = text.match(p);
    if (matches) products.push(...matches.map(m => m.trim()));
  }
  // Deduplicate
  const unique = Array.from(new Set(products.map(p => p.toLowerCase())));
  return unique.length > 0 ? unique : null;
}

function extractCertifications(text: string): string[] | null {
  const certs: string[] = [];
  const patterns = [
    /ISO\s*\d{4,5}(?::\d{4})?/gi,
    /CE\s*(?:Mark(?:ed)?|certified)/gi,
    /UL\s*(?:Listed|Certified)/gi,
    /RoHS\b/gi,
    /BIS\s*(?:Certified|approved)/gi,
    /IEC\s*\d{5}/gi,
    /ATEX\b/gi,
    /NABL\b/gi,
    /GMP\b/gi,
    /FDA\s*(?:approved|registered)/gi,
  ];
  for (const p of patterns) {
    const matches = text.match(p);
    if (matches) certs.push(...matches.map(m => m.trim()));
  }
  const unique = Array.from(new Set(certs.map(c => c.toUpperCase())));
  return unique.length > 0 ? unique : null;
}

function extractContact(text: string): string | null {
  // Phone
  const phone = text.match(/(?:\+91|0)\s*[\d\s-]{10,14}/);
  // Email
  const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  
  const parts: string[] = [];
  if (phone) parts.push(phone[0].trim());
  if (email) parts.push(email[0].trim());
  return parts.length > 0 ? parts.join(' | ') : null;
}

function extractPrices(text: string): ExtractedSupplier['prices'] {
  const prices: NonNullable<ExtractedSupplier['prices']> = [];
  
  // INR patterns: ₹1,234 or Rs. 1,234 or INR 1,234
  const inrPattern = /(?:₹|Rs\.?\s*|INR\s*)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:\/\s*(?:unit|piece|pc|nos|each|set))?/gi;
  let match;
  while ((match = inrPattern.exec(text)) !== null) {
    const price = parseFloat(match[1].replace(/,/g, ''));
    if (price > 0 && price < 10000000) {
      prices.push({
        productName: 'Product',
        price,
        currency: 'INR',
        priceType: 'listed',
        moq: null,
      });
    }
  }

  // USD patterns: $1,234 or USD 1,234
  const usdPattern = /(?:\$|USD\s*)\s*([\d,]+(?:\.\d{1,2})?)/gi;
  while ((match = usdPattern.exec(text)) !== null) {
    const price = parseFloat(match[1].replace(/,/g, ''));
    if (price > 0 && price < 1000000) {
      prices.push({
        productName: 'Product',
        price,
        currency: 'USD',
        priceType: 'listed',
        moq: null,
      });
    }
  }

  // "Contact supplier" / "Get Quote"
  if (text.toLowerCase().includes('contact supplier') || text.toLowerCase().includes('get quote') || text.toLowerCase().includes('request quote')) {
    if (prices.length === 0) {
      prices.push({
        productName: 'Product',
        price: null,
        currency: 'INR',
        priceType: 'contact-supplier',
        moq: null,
      });
    }
  }

  // MOQ extraction
  const moqMatch = text.match(/(?:MOQ|Minimum\s+Order|Min\.?\s+Qty)\s*[:\s]*(\d+)/i);
  if (moqMatch && prices.length > 0) {
    prices[0].moq = parseInt(moqMatch[1]);
  }

  return prices.length > 0 ? prices : null;
}

function extractSpecifications(text: string): ExtractedSupplier['specifications'] {
  const specs: NonNullable<ExtractedSupplier['specifications']> = [];

  const patterns: [RegExp, string, string?][] = [
    [/(?:temperature\s*range|operating\s*range)\s*[:\s]*(-?\d+(?:\.\d+)?)\s*°?\s*C?\s*(?:to|–|-|~)\s*(-?\d+(?:\.\d+)?)\s*°?\s*C/i, 'Temperature Range', '°C'],
    [/(?:accuracy|precision)\s*[:\s]*[±]?\s*([\d.]+)\s*°?\s*C/i, 'Accuracy', '°C'],
    [/(?:resolution)\s*[:\s]*([\d.]+)\s*°?\s*C/i, 'Resolution', '°C'],
    [/(?:response\s*time)\s*[:\s]*([\d.]+)\s*(ms|sec|seconds?)/i, 'Response Time'],
    [/(?:IP|protection)\s*(?:rating|class)?\s*[:\s]*(IP\s*\d{2})/i, 'IP Rating'],
    [/(?:output|interface)\s*[:\s]*(4-20\s*mA|0-10\s*V|RS-?485|Modbus|PT100|PT1000)/i, 'Output Type'],
    [/(?:supply|power)\s*(?:voltage)?\s*[:\s]*(\d+(?:-\d+)?)\s*V\s*(?:DC|AC)?/i, 'Power Supply', 'V'],
  ];

  for (const [pattern, name, unit] of patterns) {
    const match = text.match(pattern);
    if (match) {
      specs.push({
        name,
        value: match[0].replace(/^[^:]*[:]\s*/, '').trim(),
        unit,
      });
    }
  }

  return specs.length > 0 ? specs : null;
}
