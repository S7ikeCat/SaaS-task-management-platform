import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: Context) {
  const { id } = await context.params;

  const body = await req.json();
  const status = body.status;

  const task = await prisma.task.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(task);
}