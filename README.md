# DIU NEST

Evidence-first procurement intelligence powered by live web data.

## The Problem
Government and enterprise procurement teams spend thousands of hours manually discovering suppliers, comparing quotes, validating claims, and auditing supply chains. Decisions are often made on incomplete data, leading to brittle supply chains and unexpected cost overruns. Current tools lack live web intelligence and fail to cryptographically trace decision provenance.

## Our Solution
DIU NEST is a deterministic procurement intelligence platform. It replaces the traditional manual procurement dashboard with a unified, transparent mission flow. Instead of guessing supplier viability, NEST uses live web search to discover candidates, extract real quotations, cross-reference compliance (OFAC, BIS), simulate supply chain shocks (What-If), and produce a final, auditable PDF record. 

## Why It Is Different
- **Live Web Intelligence:** We don't rely on stale, pre-populated databases. We dynamically fetch and evaluate current market data.
- **Evidence Provenance:** Every claim is tied to its source. We don't hallucinate metrics.
- **Deterministic Procurement Engines:** Calculations like "True Cost" and "Digital Twin" use strict, deterministic logic rather than opaque generative AI.
- **Decision Challenge:** The system actively assigns an "Advocate" and "Challenger" to stress-test your chosen supplier.
- **Procurement Firewall:** Automatic checks against sanctions and violation registries before approval.

## How It Works
Requirement → Live Discovery → Evidence → Cost → Risk → Challenge → Simulation → Firewall → Approval.

## Real Data
Supplier discovery uses real web intelligence APIs (Tavily) and extracts actual data from live web sources using structured Gemini models. We never claim information is verified if the system only found it online—everything is treated as a claim requiring evidence.

## Architecture
- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes
- **Intelligence:** Tavily (Web Search), Gemini (Data Structuring)
- **State Management:** React Context (`MissionContext`) for a strict 14-step timeline.
- **Offline Export:** `jsPDF` + `html2canvas` for secure record keeping.

## Technical Architecture
`Browser → Next.js → API Routes → Tavily/Gemini → Deterministic Procurement Engines → MissionContext → UI`

## Trust / Evidence
Every important external field remains traceable to its source. The UI actively displays source badges and links back to the original documents or web pages. When a mission concludes, the entire decision tree, evidence topology, and financial commitments are hashed and stored in a final PDF ledger.

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
# Copy .env.example to .env.local and add your real API keys
cp .env.example .env.local

# 3. Start the development server
npm run dev
```

### Environment Variables
You will need the following API keys in your `.env.local`:
```
TAVILY_API_KEY=tvly-...
GEMINI_API_KEY=AIza...
```

## Demo Flow
1. **Enter Requirement:** Start a new mission (e.g., "100 units of titanium fasteners").
2. **Compile Intent:** The system parses your requirement.
3. **Live Discovery:** Watch the system query the web for real suppliers.
4. **Supplier Cards:** Browse the interactive dossiers.
5. **Quote Comparison:** Inspect and compare quotations.
6. **True Cost:** See the deterministic cost breakdown (shipping, taxes, etc.).
7. **Evidence:** Review the claims and sources.
8. **Challenge:** Read the Advocate vs. Challenger arguments.
9. **What-If:** Simulate delays or defect spikes.
10. **Digital Twin:** View the logistics topology.
11. **Firewall:** Pass compliance checks.
12. **PDF Record:** Generate the final procurement PDF.

## Project Structure
- `app/` - Next.js App Router (Landing page, Mission orchestrator)
- `components/mission/` - The 14 individual stages of the procurement mission
- `lib/server/` - Deterministic engines (True Cost, Discovery, Evidence)
- `components/ui/` - Reusable UI elements, Aurora gradients, Liquid Glass buttons

## Limitations
- Web information can be incomplete. If pricing isn't public, the True Cost engine correctly marks it as "NOT QUANTIFIED".
- Supplier claims require human verification. The system surfaces evidence, but it does not replace human judgement.
- The Digital Twin is a visual simulation based on assumed logistics routes.

## Future Direction
- Supplier Memory (historical performance tracking)
- ERP Integration (direct PO generation into existing systems)
- Continuous Supplier Monitoring (alerting if a chosen supplier later hits the OFAC list)
- Policy Integration

## Team
- **Built for the DIU Hackathon**
