import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authConfig } from '@/features/auth/model/auth.config';
import { generateTaskDraft } from '@/shared/lib/ai/task-assistant';

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const title = typeof body.title === 'string' ? body.title.trim() : '';

  if (!title) {
    return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
  }

  return NextResponse.json(generateTaskDraft(title));
}
