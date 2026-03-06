import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";
import { prisma } from "@/shared/lib/prisma";
import { projectService } from "@/entities/project/model/project.service";
import { CreateTaskForm } from "@/features/create-task/ui/create-task-form";
import { TaskList } from "@/widgets/task-list/ui/task-list";

import { InviteMemberForm } from "@/features/invite-member/ui/invite-member-form";
import { RemoveMemberButton } from "@/features/remove-member/ui/remove-member-button";

import { DeleteProjectButton } from "@/features/delete-project/ui/delete-project-button";
import { CompleteProjectButton } from "@/features/complete-project/ui/complete-project-button";

import { KanbanBoard } from "@/widgets/kanban-board/ui/kanban-board";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authConfig);
  
  

  if (!session?.user?.email) {
    redirect("/login");
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
    redirect("/login");
  }

  const { id } = await params;
  

  const project = await projectService.getProjectById(id, user.id);

  if (!project) {
    notFound();
  }

  const members = project.members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
  }));

  const isOwner = project.ownerId === user.id;

  const tasks = await prisma.task.findMany({
    where: {
      projectId: project.id,
    },
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
    },
    orderBy: {
      order: "asc",
    },
  });

  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === "TODO").length,
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    REVIEW: tasks.filter((t) => t.status === "REVIEW").length,
    DONE: tasks.filter((t) => t.status === "DONE").length,
  };
  
  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== "DONE"
  ).length;

  return (
    <main className="p-10 space-y-8">
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex rounded-lg border px-3 py-2 text-sm hover:bg-white/5"
        >
          ← Back to projects
        </Link>

        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {isOwner && !project.isCompleted && (
  <div className="flex gap-3">
    <CompleteProjectButton projectId={project.id} />
    <DeleteProjectButton projectId={project.id} />
  </div>
)}
<section className="rounded-xl border p-5 space-y-4">
  <h2 className="text-2xl font-semibold">Project analytics</h2>

  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">

    <div className="rounded-lg border p-3">
      <p className="text-sm text-gray-500">To Do</p>
      <p className="text-xl font-semibold">{tasksByStatus.TODO}</p>
    </div>

    <div className="rounded-lg border p-3">
      <p className="text-sm text-gray-500">In Progress</p>
      <p className="text-xl font-semibold">{tasksByStatus.IN_PROGRESS}</p>
    </div>

    <div className="rounded-lg border p-3">
      <p className="text-sm text-gray-500">Review</p>
      <p className="text-xl font-semibold">{tasksByStatus.REVIEW}</p>
    </div>

    <div className="rounded-lg border p-3">
      <p className="text-sm text-gray-500">Done</p>
      <p className="text-xl font-semibold">{tasksByStatus.DONE}</p>
    </div>

    <div className="rounded-lg border p-3 border-red-400">
      <p className="text-sm text-red-400">Overdue</p>
      <p className="text-xl font-semibold">{overdueTasks}</p>
    </div>

  </div>
</section>
          <p className="mt-2 text-gray-500">
            {project.description || "No description"}
          </p>
        </div>
      </div>

      <section className="rounded-xl border p-5 space-y-4">
        <h2 className="text-2xl font-semibold">Project overview</h2>

        <div className="space-y-2 text-sm text-gray-300">
          <p>
            <span className="font-medium text-white">Owner:</span>{" "}
            {project.owner.name ?? project.owner.email}
          </p>
          <p>
            <span className="font-medium text-white">Members:</span>{" "}
            {project.members.length}
          </p>
        </div>
      </section>

      <section className="rounded-xl border p-5 space-y-4">
        <h2 className="text-2xl font-semibold">Participants</h2>

        <div className="space-y-3">
          {project.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">
                  {member.user.name ?? member.user.email}
                </p>
                <p className="text-sm text-gray-500">{member.user.email}</p>
              </div>

              <span className="rounded-full border px-3 py-1 text-xs">
                {member.role}
              </span>

              {isOwner && member.role !== "OWNER" ? (
    <RemoveMemberButton
      projectId={project.id}
      memberId={member.id}
    />
  ) : null}
            </div>
          ))}
        </div>
      </section>

      <InviteMemberForm projectId={project.id} isOwner={isOwner} />

      <CreateTaskForm projectId={project.id} members={members} />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <KanbanBoard initialTasks={tasks} />
        <TaskList
  projectId={project.id}
  members={members}
  isOwner={isOwner}
/>
      </section>
    </main>
  );
}