import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";
import { prisma } from "@/shared/lib/prisma";
import { projectService } from "@/entities/project/model/project.service";


export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const activeProjects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId: user.id },
      },
      isCompleted: false,
    },
    orderBy: { createdAt: "desc" },
  });
  
  const completedProjects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId: user.id },
      },
      isCompleted: true,
    },
    orderBy: { completedAt: "desc" },
  });
  
  return NextResponse.json({
    activeProjects,
    completedProjects,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const name =
    typeof body.name === "string" ? body.name.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (!name) {
    return NextResponse.json(
      { error: "Project name is required" },
      { status: 400 }
    );
  }

  const project = await projectService.createProject(
    user.id,
    name,
    description || undefined
  );

  return NextResponse.json(project, { status: 201 });
}