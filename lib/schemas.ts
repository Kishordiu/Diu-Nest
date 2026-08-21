import { z } from 'zod';

// --------------- Search Result Schema (from Tavily) ---------------
export const TavilySearchResultSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  content: z.string(),
  raw_content: z.string().optional().nullable(),
  score: z.number().min(0).max(1),
  published_date: z.string().optional().nullable(),
});

export const TavilySearchResponseSchema = z.object({
  query: z.string(),
  results: z.array(TavilySearchResultSchema),
  response_time: z.number().optional(),
});

export type TavilySearchResult = z.infer<typeof TavilySearchResultSchema>;
export type TavilySearchResponse = z.infer<typeof TavilySearchResponseSchema>;

// --------------- Extracted Supplier Fields ---------------
export const ExtractedSupplierSchema = z.object({
  companyName: z.string().nullable(),
  website: z.string().nullable(),
  location: z.string().nullable(),
  country: z.string().nullable(),
  supplierType: z.enum(['manufacturer', 'distributor', 'marketplace', 'unknown']).nullable(),
  products: z.array(z.string()).nullable(),
  certifications: z.array(z.string()).nullable(),
  contactInfo: z.string().nullable(),
  prices: z.array(z.object({
    productName: z.string(),
    price: z.number().nullable(),
    currency: z.string().default('INR'),
    priceType: z.enum(['listed', 'contact-supplier', 'rfq-required', 'range']),
    moq: z.number().nullable(),
  })).nullable(),
  specifications: z.array(z.object({
    name: z.string(),
    value: z.string(),
    unit: z.string().optional(),
  })).nullable(),
});

export type ExtractedSupplier = z.infer<typeof ExtractedSupplierSchema>;

// --------------- Intent Parsing ---------------
export const ParsedIntentSchema = z.object({
  category: z.string().nullable(),
  product: z.string().nullable(),
  quantity: z.number().nullable(),
  quantityUnit: z.string().nullable(),
  budget: z.number().nullable(),
  budgetCurrency: z.string().default('INR'),
  location: z.string().nullable(),
  deadline: z.number().nullable(),
  deadlineUnit: z.enum(['days', 'weeks', 'months']).default('days'),
  quality: z.string().nullable(),
  certifications: z.array(z.string()).nullable(),
  specifications: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })).nullable(),
  industry: z.string().nullable(),
  priority: z.array(z.string()).nullable(),
});

export type ParsedIntent = z.infer<typeof ParsedIntentSchema>;

// --------------- API Request Schemas ---------------
export const IntentRequestSchema = z.object({
  text: z.string().min(5).max(2000),
});

export const SearchRequestSchema = z.object({
  requirement: z.string().min(5).max(2000),
  location: z.string().optional(),
  category: z.string().optional(),
  maxResults: z.number().min(1).max(30).default(15),
});

export const DiscoverRequestSchema = z.object({
  requirementText: z.string().min(5),
  parsedCategory: z.string().optional(),
  parsedLocation: z.string().optional(),
  parsedProduct: z.string().optional(),
  forceRefresh: z.boolean().default(false),
});

export const DecisionScoreRequestSchema = z.object({
  suppliers: z.array(z.string()), // supplier IDs
  policy: z.object({
    cost: z.number().min(0).max(100),
    delivery: z.number().min(0).max(100),
    quality: z.number().min(0).max(100),
    reliability: z.number().min(0).max(100),
    risk: z.number().min(0).max(100),
  }),
  requirement: z.any(), // ProcurementRequirement
});

export const SimulateRequestSchema = z.object({
  changes: z.record(z.string(), z.union([z.string(), z.number()])),
  supplierIds: z.array(z.string()),
  policy: z.any(),
  requirement: z.any(),
});
