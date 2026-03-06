import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";
import { prisma } from "@/shared/lib/prisma";
import { updateTaskSchema } from "@/shared/lib/validations/task";

type RouteContext = {
  params: Promise<{
    id: string;
    taskId: string;
  }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { id: projectId, taskId } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== currentUser.id) {
    return NextResponse.json(
      { error: "Only the project owner can edit tasks" },
      { status: 403 }
    );
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
    },
    select: {
      id: true,
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = await req.json();

  const parsed = updateTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid task data" },
      { status: 400 }
    );
  }

  const { title, description, assigneeId, dueDate, priority, status } =
    parsed.data;

  if (
    assigneeId &&
    !project.members.some((member) => member.userId === assigneeId)
  ) {
    return NextResponse.json(
      { error: "Assignee must be a project member" },
      { status: 400 }
    );
  }

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      title,
      description: description || undefined,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      status,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(updatedTask);
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { id: projectId, taskId } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== currentUser.id) {
    return NextResponse.json(
      { error: "Only the project owner can delete tasks" },
      { status: 403 }
    );
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
    },
    select: {
      id: true,
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return NextResponse.json({ success: true });
}