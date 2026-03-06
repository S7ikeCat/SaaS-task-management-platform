import { PrismaClient, ProjectRole, TaskPriority, TaskStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.create({
    data: {
      name: "Alex Team Lead",
      email: "alex@example.com",
      passwordHash,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      name: "Ivan Frontend",
      email: "ivan@example.com",
      passwordHash,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: "Maria Backend",
      email: "maria@example.com",
      passwordHash,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Task Management SaaS",
      description: "Test assignment project",
      ownerId: owner.id,
    },
  });

  await prisma.projectMember.createMany({
    data: [
      { userId: owner.id, projectId: project.id, role: ProjectRole.OWNER },
      { userId: dev1.id, projectId: project.id, role: ProjectRole.MEMBER },
      { userId: dev2.id, projectId: project.id, role: ProjectRole.MEMBER },
    ],
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Build login page",
        description: "Create login form UI",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        projectId: project.id,
        assigneeId: dev1.id,
        creatorId: owner.id,
        order: 1,
      },
      {
        title: "Implement auth API",
        description: "Create register/login backend logic",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        projectId: project.id,
        assigneeId: dev2.id,
        creatorId: owner.id,
        order: 1,
      },
      {
        title: "Create Prisma schema",
        description: "Design database models",
        status: TaskStatus.REVIEW,
        priority: TaskPriority.MEDIUM,
        projectId: project.id,
        assigneeId: dev2.id,
        creatorId: owner.id,
        order: 2,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });