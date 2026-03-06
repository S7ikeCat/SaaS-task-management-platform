"use server";

import { getServerSession } from "next-auth";
import { authConfig } from "@/features/auth/model/auth.config";

import { projectService } from "@/entities/project/model/project.service";

export async function createProject(name: string, description?: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return projectService.createProject(
    session.user.id,
    name,
    description
  );
}