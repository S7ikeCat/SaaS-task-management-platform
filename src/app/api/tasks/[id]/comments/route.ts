import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authConfig } from '@/features/auth/model/auth.config';
import { prisma } from '@/shared/lib/prisma';

const MAX_COMMENT_LENGTH = 2000;

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

  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return NextResponse.json(comments);
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
  const content = typeof body.content === 'string' ? body.content.trim() : '';

  if (!content) {
    return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
  }

  if (content.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json({ error: 'Comment is too long' }, { status: 400 });
  }

  const comment = await prisma.taskComment.create({
    data: {
      content,
      taskId,
      authorId: userId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
