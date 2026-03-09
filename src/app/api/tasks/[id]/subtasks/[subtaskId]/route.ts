import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authConfig } from '@/features/auth/model/auth.config';
import { prisma } from '@/shared/lib/prisma';

type Context = {
  params: Promise<{ id: string; subtaskId: string }>;
};

async function getCurrentUserId() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  return user?.id ?? null;
}

async function getSubtaskForMember(taskId: string, subtaskId: string, userId: string) {
  return prisma.subtask.findFirst({
    where: {
      id: subtaskId,
      taskId,
      task: {
        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    },
    select: {
      id: true,
    },
  });
}

export async function PATCH(req: Request, context: Context) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: taskId, subtaskId } = await context.params;
  const subtask = await getSubtaskForMember(taskId, subtaskId, userId);

  if (!subtask) {
    return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });
  }

  const body = await req.json();
  const data: { completed?: boolean; title?: string } = {};

  if (typeof body.completed === 'boolean') {
    data.completed = body.completed;
  }

  if (typeof body.title === 'string' && body.title.trim()) {
    data.title = body.title.trim();
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const updatedSubtask = await prisma.subtask.update({
    where: { id: subtaskId },
    data,
  });

  return NextResponse.json(updatedSubtask);
}
