import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";
import { prisma } from "@/shared/lib/prisma";

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ notifications: [] });
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
    return NextResponse.json({ notifications: [] });
  }

  const tasks = await prisma.task.findMany({
    where: {
      assigneeId: user.id,
      dueDate: {
        not: null,
      },
      status: {
        not: "DONE",
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const notifications = tasks
    .filter((task) => {
      if (!task.dueDate) return false;

      const dueDate = new Date(task.dueDate);
      const dueDay = new Date(dueDate);
      dueDay.setHours(0, 0, 0, 0);

      return dueDay <= tomorrow;
    })
    .map((task) => {
      const dueDate = new Date(task.dueDate as Date);
      const dueDay = new Date(dueDate);
      dueDay.setHours(0, 0, 0, 0);

      let type: "overdue" | "today" | "tomorrow" = "today";
      let label = "Due today";

      if (dueDay < today) {
        type = "overdue";
        label = "Overdue";
      } else if (dueDay.getTime() === today.getTime()) {
        type = "today";
        label = "Due today";
      } else if (dueDay.getTime() === tomorrow.getTime()) {
        type = "tomorrow";
        label = "Due tomorrow";
      }

      return {
        id: task.id,
        title: task.title,
        projectId: task.project.id,
        projectName: task.project.name,
        dueDate: task.dueDate,
        type,
        label,
      };
    });

  return NextResponse.json({ notifications });
}