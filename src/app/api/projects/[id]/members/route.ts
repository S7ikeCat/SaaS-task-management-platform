import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";
import { prisma } from "@/shared/lib/prisma";
import { projectService } from "@/entities/project/model/project.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(req: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { id: projectId } = await context.params;

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
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
      { error: "Only the project owner can add members" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const userToAdd = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!userToAdd) {
    return NextResponse.json(
      { error: "User with this email not found" },
      { status: 404 }
    );
  }

  const existingMember = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: userToAdd.id,
    },
    select: {
      id: true,
    },
  });

  if (existingMember) {
    return NextResponse.json(
      { error: "User is already a project member" },
      { status: 409 }
    );
  }

  const member = await projectService.addMemberToProject(projectId, userToAdd.id);

  return NextResponse.json(member, { status: 201 });
}