# DIU NEST

![Cinematic hero](https://capsule-render.vercel.app/api?type=rect&color=0:070707,100:171717&height=230&text=DIU%20NEST&fontColor=F3F3EE&fontSize=40&fontAlignY=38&desc=PROCUREMENT%20INTELLIGENCE%20%2F%20EVIDENCE&descColor=999991&descSize=12&descAlignY=66&animation=fadeIn)

> **PROCUREMENT INTELLIGENCE / EVIDENCE.**

## THE PREMISE

DIU NEST is an evidence-first procurement workspace: discover suppliers, attach proof to claims, calculate cost and risk, challenge a decision, simulate outcomes, then keep an auditable approval trail.

## THE EXPERIENCE

**DIU NEST is an evidence-first procurement workspace: discover suppliers, attach proof to claims, calculate cost and risk, challenge a decision, simulate outcomes, then keep an auditable approval trail.**

## THE SYSTEM

Evidence before confidence. | A supplier claim should point somewhere. | Procurement decisions should remain inspectable after the meeting.

## THE STACK

Next.js and Framer Motion shape the mission-style frontend. Tavily provides web discovery and Gemini is planned for structured extraction; the product flow separates discovery, evidence, analysis and approval states.

## RUN

Requirements: Node.js and npm. The repository includes `.env.example`; it contains placeholders only.

```bash
npm ci
cp .env.example .env.local
```

Replace `YOUR_TAVILY_API_KEY` in `.env.local` with a **newly issued** key from Tavily. Do not commit local environment files. Then run:

```bash
npm run dev
```

Open the local URL printed by Next.js. A production build can be checked with `npm run build`.

## ENVIRONMENT AND SECURITY

The Tavily credential previously appeared in a public example file and has been removed from the latest version. Rotate/revoke that key in Tavily before using the integration again; deleting it from the latest commit does not erase Git history. Keep all actual keys in ignored local environment files or deployment secrets. The optional AI provider integration is not presented as live.

## PROJECT STATE

**Next.js · React · TypeScript · Tailwind CSS · Framer Motion · Tavily · Gemini**

This README intentionally distinguishes implemented behaviour from future integrations so the project can evolve without overstating what exists today.

---

<p align="center"><strong>K. KISHOR KUMAR</strong><br><sub>ENGINEERING / PRODUCT / SYSTEMS</sub></p>