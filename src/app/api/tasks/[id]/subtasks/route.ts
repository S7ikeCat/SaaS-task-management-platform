import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authConfig } from '@/features/auth/model/auth.config';
import { prisma } from '@/shared/lib/prisma';

type Context = {
  params: Promise<{ id: string }>;
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

async function getTaskForMember(taskId: string, userId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
    select: {
      id: true,
    },
  });
}

export async function GET(_: Request, context: Context) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: taskId } = await context.params;
  const task = await getTaskForMember(taskId, userId);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const subtasks = await prisma.subtask.findMany({
    where: { taskId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });

  return NextResponse.json(subtasks);
}

export async function POST(req: Request, context: Context) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: taskId } = await context.params;
  const task = await getTaskForMember(taskId, userId);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const body = await req.json();
  const title = typeof body.title === 'string' ? body.title.trim() : '';

  if (!title) {
    return NextResponse.json({ error: 'Subtask title is required' }, { status: 400 });
  }

  const lastSubtask = await prisma.subtask.findFirst({
    where: { taskId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const subtask = await prisma.subtask.create({
    data: {
      title,
      taskId,
      order: (lastSubtask?.order ?? 0) + 1,
    },
  });

  return NextResponse.json(subtask, { status: 201 });
}
