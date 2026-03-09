import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authConfig } from '@/features/auth/model/auth.config';
import { generateSubtaskPlan } from '@/shared/lib/ai/task-assistant';
import { prisma } from '@/shared/lib/prisma';

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: Context) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { id: taskId } = await context.params;

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
    },
  });

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const plan = generateSubtaskPlan(task.title, task.description);
  const existing = await prisma.subtask.findMany({
    where: { taskId },
    select: { title: true },
  });

  const existingTitles = new Set(existing.map((item) => item.title.trim().toLowerCase()));

  const lastSubtask = await prisma.subtask.findFirst({
    where: { taskId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  let order = (lastSubtask?.order ?? 0) + 1;

  const toCreate = plan.subtasks
    .filter((item) => !existingTitles.has(item.title.trim().toLowerCase()))
    .map((item) => ({
      title: item.title,
      taskId,
      order: order++,
    }));

  if (toCreate.length > 0) {
    await prisma.subtask.createMany({
      data: toCreate,
    });
  }

  const subtasks = await prisma.subtask.findMany({
    where: { taskId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });

  return NextResponse.json({
    insight: plan.insight,
    subtasks,
    added: toCreate.length,
  });
}
