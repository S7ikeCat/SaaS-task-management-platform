import { prisma } from "@/shared/lib/prisma";

export const taskService = {
  async getProjectTasks(projectId: string, userId: string) {
    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        project: {
          members: {
            some: {
              userId,
            },
          },
        },
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
        subtasks: {
          select: {
            completed: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    return tasks.map(({ _count, subtasks, ...task }) => ({
      ...task,
      commentsCount: _count.comments,
      subtasksTotal: subtasks.length,
      subtasksCompleted: subtasks.filter((subtask) => subtask.completed).length,
    }));
  },

  async createTask(data: {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
    creatorId: string;
    dueDate?: Date;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  }) {
    const lastTask = await prisma.task.findFirst({
      where: {
        projectId: data.projectId,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        creatorId: data.creatorId,
        dueDate: data.dueDate,
        priority: data.priority ?? "MEDIUM",
        order: (lastTask?.order ?? 0) + 1,
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
  },
};
