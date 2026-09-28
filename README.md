# DIU NEST

> **Evidence-first procurement intelligence powered by live web data.**

DIU NEST explores a deterministic procurement workflow that combines live supplier discovery, evidence collection, cost analysis, risk evaluation, challenge workflows and auditable decision records.

## The workflow

~~~text
Requirement → Discovery → Evidence → Cost → Risk → Challenge → Simulation → Firewall → Approval
~~~

## Highlights
- Live web intelligence for supplier discovery
- Evidence-linked claims rather than unsupported assertions
- Deterministic cost and risk calculations
- Supplier challenge / decision-review workflow
- Procurement compliance checks
- Exportable decision records

## Architecture
**Frontend:** Next.js · React · Tailwind CSS · Framer Motion

**Intelligence:** Tavily web search · Gemini structured extraction

**State:** React Context / mission workflow

**Export:** jsPDF · html2canvas

## Local development
~~~bash
npm install
cp .env.example .env.local
npm run dev
~~~

Configure API credentials only in local/hosting environment variables. Never commit secrets.

## Status
**Procurement intelligence prototype**

## Author
**K. Kishor Kumar** · [GitHub @Kishordiu](https://github.com/Kishordiu)
