import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";
import { prisma } from "@/shared/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    memberId: string;
  }>;
};

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

  const { id: projectId, memberId } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== currentUser.id) {
    return NextResponse.json(
      { error: "Only the project owner can remove members" },
      { status: 403 }
    );
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      id: memberId,
    },
    select: {
      id: true,
      userId: true,
      role: true,
      projectId: true,
    },
  });

  if (!member || member.projectId !== projectId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (member.role === "OWNER") {
    return NextResponse.json(
      { error: "Project owner cannot be removed" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.task.deleteMany({
      where: {
        projectId,
        assigneeId: member.userId,
      },
    }),
    prisma.projectMember.delete({
      where: {
        id: member.id,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}