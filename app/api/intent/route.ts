import { NextResponse } from 'next/server';
import { IntentRequestSchema } from '@/lib/schemas';
import { compileIntent } from '@/lib/server/intent-compiler';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = IntentRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }
    const requirement = compileIntent(parsed.data.text);
    return NextResponse.json({ requirement });
  } catch (err) {
    return NextResponse.json({ error: 'Intent compilation failed' }, { status: 500 });
  }
}
