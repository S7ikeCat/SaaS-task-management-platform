import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";
import { prisma } from "@/shared/lib/prisma";
import { createTaskSchema } from "@/shared/lib/validations/task";
import { taskService } from "@/entities/task/model/task.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { id: projectId } = await context.params;

  const projectMembership = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!projectMembership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tasks = await taskService.getProjectTasks(projectId, user.id);

  return NextResponse.json(tasks, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(req: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { id: projectId } = await context.params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId: user.id,
        },
      },
    },
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

  const body = await req.json();

  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid task data" },
      { status: 400 }
    );
  }

  const { title, description, assigneeId, dueDate, priority } = parsed.data;

  if (
    assigneeId &&
    !project.members.some((member) => member.userId === assigneeId)
  ) {
    return NextResponse.json(
      { error: "Assignee must be a project member" },
      { status: 400 }
    );
  }

  const task = await taskService.createTask({
    title,
    description: description || undefined,
    projectId,
    assigneeId: assigneeId || undefined,
    creatorId: user.id,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    priority,
  });

  return NextResponse.json(task, { status: 201 });
}