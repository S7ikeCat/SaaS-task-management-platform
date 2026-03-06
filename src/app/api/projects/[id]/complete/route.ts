import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";
import { prisma } from "@/shared/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(_: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { id } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      ownerId: true,
      isCompleted: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== user.id) {
    return NextResponse.json(
      { error: "Only owner can complete project" },
      { status: 403 }
    );
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}