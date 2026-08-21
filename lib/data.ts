// DIU NEST — Configuration Data
// NO MOCK/DEMO DATA. This file contains only configuration constants.

import type { DecisionPolicy } from './types';

// Default decision policy weights (sum to 100)
export const DEFAULT_DECISION_POLICY: DecisionPolicy = {
  cost: 30,
  delivery: 25,
  quality: 20,
  reliability: 15,
  risk: 10,
};

// Source tier definitions
export const SOURCE_TIER_LABELS: Record<number, string> = {
  1: 'Official / Manufacturer / Government',
  2: 'Authorized Distributor / Marketplace',
  3: 'Directory / Social',
  4: 'News / Unverified',
};

// Procurement categories for intent compilation
export const PROCUREMENT_CATEGORIES = [
  'Temperature Sensors',
  'Pressure Sensors',
  'Humidity Sensors',
  'Flow Meters',
  'Office Furniture',
  'PPE Equipment',
  'IT Equipment',
  'Lab Equipment',
  'Industrial Machinery',
  'Safety Equipment',
  'Electrical Components',
  'Building Materials',
];

// Indian cities for location detection
export const INDIAN_CITIES = [
  'Chennai', 'Mumbai', 'Bangalore', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune',
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Noida', 'Gurgaon', 'Gurugram',
  'Coimbatore', 'Vadodara', 'Indore', 'Surat', 'Nagpur', 'Thane', 'Kochi',
];
