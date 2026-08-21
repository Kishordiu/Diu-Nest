// =============================================================
// DIU NEST — Real-Data Type System
// Every field that comes from the web carries provenance.
// Every number answers: "Where did this come from?"
// =============================================================

// --------------- Data Origin Labels ---------------
export type DataLabel =
  | 'live-web'
  | 'cached-web'
  | 'uploaded-document'
  | 'calculated'
  | 'simulation'
  | 'ai-inference'
  | 'user-input'
  | 'organizational';

export type VerificationStatus =
  | 'verified'       // Cross-verified by independent source
  | 'supported'      // Multiple sources agree
  | 'self-declared'  // Only supplier's own website claims this
  | 'unverified'     // No independent verification found
  | 'conflict'       // Sources disagree
  | 'not-available'  // Data not found
  | 'stale';         // Data found but old

export type SourceTier = 1 | 2 | 3 | 4;

export type SourceQuality = 'high' | 'medium' | 'low';

export type RiskLevel = 'low' | 'medium' | 'high';

export type ConstraintType = 'hard' | 'soft';

export type MissionStatus = 'draft' | 'searching' | 'discovered' | 'analyzing' | 'decided' | 'approved' | 'ordered' | 'completed';

// --------------- Source Provenance ---------------
export interface SourceRecord {
  id: string;
  url: string;
  domain: string;
  title: string;
  sourceType: 'manufacturer' | 'distributor' | 'marketplace' | 'government' | 'certification' | 'directory' | 'news' | 'unknown';
  sourceTier: SourceTier;
  sourceQuality: SourceQuality;
  retrievedAt: string; // ISO timestamp
  publishedAt?: string;
  contentHash?: string;
  extractedFields: string[];
  rawSnippet?: string; // Relevant extracted text
  accessible: boolean; // Could we actually read the page?
  freshnessMs?: number; // Age in ms since retrieval
}

// --------------- Sourced Field (Generic Wrapper) ---------------
// Every important value carries its provenance
export interface SourcedField<T> {
  value: T | null;
  source: SourceRecord | null;
  confidence: number; // 0-100, how confident in extraction accuracy
  status: VerificationStatus;
  label: DataLabel;
  lastUpdated: string; // ISO timestamp
}

// --------------- Procurement Requirement ---------------
export interface RequirementConstraint {
  field: string;
  value: string;
  type: ConstraintType;
  extractionConfidence: number;
  source: 'explicit' | 'inferred' | 'missing';
}

export interface ProcurementRequirement {
  id: string;
  rawText: string;
  category: RequirementConstraint;
  product: RequirementConstraint;
  quantity: RequirementConstraint;
  location: RequirementConstraint;
  budget: RequirementConstraint;
  deadline: RequirementConstraint;
  quality?: RequirementConstraint;
  certifications?: RequirementConstraint;
  specifications?: RequirementConstraint[];
  industry?: RequirementConstraint;
  priority?: RequirementConstraint;
  parsedAt: string;
  allConstraints: RequirementConstraint[];
}

// --------------- Intent Field (for UI) ---------------
export interface IntentField {
  label: string;
  value: string;
  type: 'explicit' | 'inferred' | 'missing';
  confidence: number;
  editable: boolean;
  constraintType: ConstraintType;
}

// --------------- Discovered Supplier ---------------
export interface DiscoveredSupplier {
  id: string;
  name: SourcedField<string>;
  website: SourcedField<string>;
  location: SourcedField<string>;
  country: SourcedField<string>;
  supplierType: SourcedField<'manufacturer' | 'distributor' | 'marketplace' | 'unknown'>;
  products: SourcedField<string[]>;
  certifications: SourcedField<string[]>;
  contactInfo: SourcedField<string>;

  // Data confidence — NOT supplier quality
  dataConfidence: number; // 0-100: how complete/well-supported is our info?
  sourceCount: number;
  sources: SourceRecord[];
  identityConfidence: number; // 0-100: how sure we are this is a real, distinct entity
  
  // Market listings found for this supplier
  listings: MarketListing[];
  
  // Risk signals
  riskSignals: RiskSignal[];
  
  // Freshness
  lastRetrieved: string;
  freshnessStatus: 'live' | 'cached' | 'stale' | 'unknown';
}

// --------------- Market Listing (NOT a quote) ---------------
export interface MarketListing {
  id: string;
  productName: SourcedField<string>;
  manufacturer: SourcedField<string>;
  model: SourcedField<string>;
  price: SourcedField<number>;
  currency: SourcedField<string>;
  priceType: 'listed' | 'contact-supplier' | 'rfq-required' | 'range';
  priceRange?: { min: number; max: number };
  availability: SourcedField<string>;
  moq: SourcedField<number>;
  specifications: SpecificationField[];
  source: SourceRecord;
  label: DataLabel;
}

export interface SpecificationField {
  name: string;
  value: string;
  unit?: string;
  source: SourceRecord;
}

// --------------- Market Intelligence ---------------
export interface MarketPriceRange {
  currency: string;
  lowest: number;
  highest: number;
  median: number;
  sourceCount: number;
  sources: SourceRecord[];
  lastUpdated: string;
  anomalies: PriceAnomaly[];
}

export interface PriceAnomaly {
  price: number;
  source: SourceRecord;
  deviation: number; // percentage from median
  reason: string;
}

// --------------- Uploaded Quotation ---------------
export interface UploadedQuotation {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  extractionStatus: 'pending' | 'extracting' | 'complete' | 'failed';
  supplierName: SourcedField<string>;
  quotationNumber: SourcedField<string>;
  quotationDate: SourcedField<string>;
  validUntil: SourcedField<string>;
  currency: SourcedField<string>;
  items: NormalizedQuoteItem[];
  subtotal: SourcedField<number>;
  tax: SourcedField<number>;
  shipping: SourcedField<number>;
  grandTotal: SourcedField<number>;
  deliveryDays: SourcedField<number>;
  warranty: SourcedField<string>;
  paymentTerms: SourcedField<string>;
  label: 'uploaded-document';
}

export interface NormalizedQuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  source: 'uploaded-document' | 'live-web';
  confidence: number;
}

// --------------- Evidence ---------------
export interface EvidenceNode {
  id: string;
  claim: string;
  source: SourceRecord;
  field: string; // What field this is evidence for
  supplierId?: string;
  status: VerificationStatus;
  confidence: number;
  label: DataLabel;
  crossReferences: string[]; // IDs of supporting/conflicting evidence
  conflictsWith?: string[]; // IDs of contradicting evidence
}

// --------------- Risk ---------------
export interface RiskSignal {
  id: string;
  type: 'missing-certification' | 'unverified-identity' | 'price-anomaly' |
        'stale-data' | 'low-confidence' | 'specification-gap' | 'delivery-unclear' |
        'expired-quote' | 'conflicting-sources' | 'no-independent-evidence' |
        'payment-risk' | 'identity-ambiguity';
  severity: RiskLevel;
  title: string;
  description: string;
  evidence?: EvidenceNode;
  recommendation: string;
}

// --------------- Decision ---------------
export interface DecisionPolicy {
  cost: number;       // weight 0-100, all sum to 100
  delivery: number;
  quality: number;
  reliability: number;
  risk: number;
}

export interface DecisionScore {
  supplierId: string;
  supplierName: string;
  totalScore: number;
  breakdown: {
    category: keyof DecisionPolicy;
    weight: number;
    score: number;       // 0-100
    weightedScore: number;
    reasoning: string;
    evidenceCount: number;
    dataAvailable: boolean;
  }[];
  requirementFit: RequirementFitResult[];
  recommendation: 'recommended' | 'acceptable' | 'not-recommended' | 'insufficient-data';
  confidenceLevel: 'high' | 'medium' | 'low' | 'insufficient';
}

export interface RequirementFitResult {
  requirement: string;
  required: string;
  actual: string | null;
  status: 'pass' | 'fail' | 'partial' | 'unknown';
  constraintType: ConstraintType;
}

// --------------- True Cost ---------------
export interface TrueCostBreakdown {
  quotedSubtotal: { value: number; source: string; label: DataLabel } | null;
  shipping: { value: number; source: string; label: DataLabel } | null;
  tax: { value: number; source: string; label: DataLabel } | null;
  logistics: { value: number; source: string; label: DataLabel } | null;
  delayImpact: { value: number; source: string; label: DataLabel } | null;
  riskAdjustment: { value: number; source: string; label: DataLabel } | null;
  discount: { value: number; source: string; label: DataLabel } | null;
  estimatedTotal: number;
  componentsIncluded: number;
  componentsNotQuantified: string[];
  currency: string;
}

// --------------- Firewall ---------------
export interface FirewallCheck {
  id: string;
  label: string;
  detail: string;
  status: 'pass' | 'review' | 'block';
  evidence?: EvidenceNode;
  label_type: DataLabel;
}

// --------------- Simulation ---------------
export interface SimulationScenario {
  id: string;
  name: string;
  changes: Record<string, string | number>;
  baseline: DecisionScore[];
  simulated: DecisionScore[];
  delta: { supplierId: string; scoreDelta: number; rankChange: number }[];
  label: 'simulation';
}

// --------------- Search Activity ---------------
export interface SearchActivity {
  id: string;
  query: string;
  status: 'searching' | 'complete' | 'error';
  resultsFound: number;
  usableSources: number;
  suppliersIdentified: number;
  manufacturersFound: number;
  distributorsFound: number;
  marketplaceListings: number;
  timestamp: string;
  durationMs: number;
  error?: string;
}

// --------------- Audit ---------------
export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  sourcesUsed: number;
  dataLabel: DataLabel;
}

// --------------- Mission ---------------
export interface ProcurementMission {
  id: string;
  status: MissionStatus;
  createdAt: string;
  
  // Requirement
  rawInput: string;
  requirement: ProcurementRequirement | null;
  
  // Discovery
  searchActivities: SearchActivity[];
  discoveredSuppliers: DiscoveredSupplier[];
  
  // Market Intelligence
  marketRange: MarketPriceRange | null;
  
  // Quotations
  uploadedQuotations: UploadedQuotation[];
  
  // Evidence
  evidence: EvidenceNode[];
  
  // Decision
  decisionPolicy: DecisionPolicy;
  decisionScores: DecisionScore[];
  selectedSupplierId: string | null;
  
  // Firewall
  firewallChecks: FirewallCheck[];
  
  // Risk
  riskSignals: RiskSignal[];
  
  // Simulation
  simulations: SimulationScenario[];
  
  // Approval
  approvedAt: string | null;
  approvedBy: string | null;
  
  // Audit
  auditLog: AuditEvent[];
  
  // Intelligence status
  isLive: boolean;
  lastSearchAt: string | null;
}

// --------------- Premortem (generated from risk signals) ---------------
export interface PremortScenario {
  id: string;
  title: string;
  probability: number; // Only if calculable, else -1
  impact: RiskLevel;
  description: string;
  mitigation: string;
  basedOn: RiskSignal[];
  label: 'calculated' | 'ai-inference';
}
