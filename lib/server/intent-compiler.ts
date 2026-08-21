// Intent Compiler — parses natural language into structured procurement requirement
// Rule-based extraction with regex patterns (no AI dependency)

import { nanoid } from 'nanoid';
import type { ProcurementRequirement, RequirementConstraint } from '../types';

function makeConstraint(field: string, value: string, source: 'explicit' | 'inferred' | 'missing', confidence: number): RequirementConstraint {
  return { field, value, type: 'hard', extractionConfidence: confidence, source };
}

export function compileIntent(rawText: string): ProcurementRequirement {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // --- Category / Product ---
  const productPatterns: [RegExp, string][] = [
    [/temperature\s*sensors?/i, 'Temperature Sensors'],
    [/pressure\s*(?:sensors?|transmitters?|gauges?)/i, 'Pressure Sensors'],
    [/humidity\s*sensors?/i, 'Humidity Sensors'],
    [/flow\s*(?:sensors?|meters?)/i, 'Flow Meters'],
    [/office\s*chairs?/i, 'Office Chairs'],
    [/PPE\s*(?:kits?|equipment)/i, 'PPE Equipment'],
    [/laptops?/i, 'Laptops'],
    [/printers?/i, 'Printers'],
    [/projectors?/i, 'Projectors'],
    [/air\s*(?:conditioners?|conditioning)/i, 'Air Conditioning'],
    [/(?:UPS|uninterruptible\s*power)/i, 'UPS Systems'],
    [/(?:CCTV|security\s*cameras?|surveillance)/i, 'Security Cameras'],
    [/(?:fire\s*(?:extinguishers?|alarm|safety)|smoke\s*detectors?)/i, 'Fire Safety Equipment'],
    [/(?:desks?|tables?|furniture)/i, 'Office Furniture'],
    [/(?:stationery|paper|notebooks?)/i, 'Office Stationery'],
  ];

  let category = '';
  let product = '';
  for (const [pattern, cat] of productPatterns) {
    if (pattern.test(text)) {
      category = cat;
      const m = text.match(pattern);
      product = m ? m[0] : cat;
      break;
    }
  }

  // Qualifiers
  const qualifiers: string[] = [];
  if (/medical[\s-]*grade/i.test(text)) qualifiers.push('Medical Grade');
  if (/industrial[\s-]*grade/i.test(text)) qualifiers.push('Industrial Grade');
  if (/food[\s-]*grade/i.test(text)) qualifiers.push('Food Grade');
  if (/military[\s-]*grade/i.test(text)) qualifiers.push('Military Grade');
  if (/ergonomic/i.test(text)) qualifiers.push('Ergonomic');

  if (qualifiers.length > 0 && category) {
    category = `${qualifiers.join(' ')} ${category}`;
  }
  if (!category) {
    // Fallback: use the text itself
    category = text.slice(0, 60);
    product = text.slice(0, 60);
  }

  // --- Quantity ---
  let quantity = '';
  const qtyMatch = text.match(/(\d[\d,]*)\s*(?:units?|pieces?|pcs?|nos?|sets?|kits?|numbers?|qty)?/i);
  if (qtyMatch) {
    quantity = qtyMatch[1].replace(/,/g, '') + (qtyMatch[2] ? ` ${qtyMatch[2]}` : ' units');
  }

  // --- Budget ---
  let budget = '';
  const budgetPatterns = [
    /(?:₹|Rs\.?\s*|INR\s*)([\d,.]+)\s*(L|lakh|lakhs?|Cr|crore|crores?|K|thousand|k)?/i,
    /(?:under|within|budget\s*(?:of|is)?)\s*(?:₹|Rs\.?\s*|INR\s*)([\d,.]+)\s*(L|lakh|lakhs?|Cr|crore|crores?)?/i,
    /\$([\d,.]+)\s*(K|M|thousand|million)?/i,
  ];
  for (const bp of budgetPatterns) {
    const bm = text.match(bp);
    if (bm) {
      let val = parseFloat(bm[1].replace(/,/g, ''));
      const mult = (bm[2] || '').toLowerCase();
      if (mult.startsWith('l')) val *= 100000;
      else if (mult.startsWith('cr')) val *= 10000000;
      else if (mult === 'k' || mult === 'thousand') val *= 1000;
      else if (mult === 'm' || mult === 'million') val *= 1000000;
      const currency = text.includes('$') ? '$' : '₹';
      budget = `${currency}${val.toLocaleString('en-IN')}`;
      break;
    }
  }

  // --- Location ---
  let location = '';
  const indianCities = [
    'Chennai', 'Mumbai', 'Bangalore', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune',
    'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Noida', 'Gurgaon', 'Gurugram',
    'Coimbatore', 'Vadodara', 'Indore', 'Surat', 'Nagpur', 'Thane', 'Kochi',
  ];
  for (const city of indianCities) {
    if (lower.includes(city.toLowerCase())) {
      location = `${city}, India`;
      break;
    }
  }
  if (!location) {
    const locMatch = text.match(/(?:deliver(?:ed|y)?\s+to|in|at|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    if (locMatch) location = locMatch[1];
  }

  // --- Deadline ---
  let deadline = '';
  const deadlineMatch = text.match(/(\d+)\s*(?:days?|weeks?|months?)/i);
  if (deadlineMatch) {
    deadline = `${deadlineMatch[1]} ${deadlineMatch[2] || 'days'}`;
  }
  if (!deadline) {
    const withinMatch = text.match(/within\s+(\d+)\s*(days?|weeks?|months?)/i);
    if (withinMatch) deadline = `${withinMatch[1]} ${withinMatch[2]}`;
  }

  // --- Certifications ---
  const certs: string[] = [];
  if (/ISO\s*\d{4,5}/i.test(text)) certs.push(...(text.match(/ISO\s*\d{4,5}(?::\d{4})?/gi) || []));
  if (/CE\b/i.test(text)) certs.push('CE');
  if (/BIS\b/i.test(text)) certs.push('BIS');
  if (/UL\b/i.test(text)) certs.push('UL');

  // --- Inferred fields ---
  const industry = /medical/i.test(text) ? 'Medical / Healthcare' :
                   /industrial/i.test(text) ? 'Industrial' :
                   /pharma/i.test(text) ? 'Pharmaceutical' :
                   /food/i.test(text) ? 'Food & Beverage' : '';

  const criticality = /medical|critical|urgent|emergency/i.test(text) ? 'High' :
                      /important|priority/i.test(text) ? 'Medium' : '';

  // Build constraints
  const allConstraints: RequirementConstraint[] = [];
  const add = (field: string, value: string, src: 'explicit' | 'inferred' | 'missing', conf: number) => {
    const c = makeConstraint(field, value, src, conf);
    allConstraints.push(c);
    return c;
  };

  const catConstraint = add('Category', category, category ? 'explicit' : 'missing', category ? 85 : 0);
  const prodConstraint = add('Product', product || category, product ? 'explicit' : 'missing', product ? 80 : 0);
  const qtyConstraint = add('Quantity', quantity, quantity ? 'explicit' : 'missing', quantity ? 95 : 0);
  const locConstraint = add('Location', location, location ? 'explicit' : 'missing', location ? 90 : 0);
  const budConstraint = add('Budget', budget, budget ? 'explicit' : 'missing', budget ? 90 : 0);
  const dlConstraint = add('Deadline', deadline, deadline ? 'explicit' : 'missing', deadline ? 90 : 0);

  if (industry) add('Industry', industry, 'inferred', 70);
  if (criticality) add('Criticality', criticality, 'inferred', 65);
  if (certs.length > 0) add('Certifications', certs.join(', '), 'explicit', 85);

  return {
    id: nanoid(10),
    rawText: text,
    category: catConstraint,
    product: prodConstraint,
    quantity: qtyConstraint,
    location: locConstraint,
    budget: budConstraint,
    deadline: dlConstraint,
    certifications: certs.length > 0 ? add('Certifications', certs.join(', '), 'explicit', 85) : undefined,
    industry: industry ? add('Industry', industry, 'inferred', 70) : undefined,
    parsedAt: new Date().toISOString(),
    allConstraints,
  };
}
