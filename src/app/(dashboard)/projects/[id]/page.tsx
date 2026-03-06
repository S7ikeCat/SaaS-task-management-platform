import Link from "next/link";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";
import { prisma } from "@/shared/lib/prisma";

import { InviteMemberForm } from "@/features/invite-member/ui/invite-member-form";
import { RemoveMemberButton } from "@/features/remove-member/ui/remove-member-button";

import { CreateTaskForm } from "@/features/create-task/ui/create-task-form";

import { TaskList } from "@/widgets/task-list/ui/task-list";
import { KanbanBoardClient } from "@/widgets/kanban-board/ui/kanban-board-client";

import { CompleteProjectButton } from "@/features/complete-project/ui/complete-project-button";
import { DeleteProjectButton } from "@/features/delete-project/ui/delete-project-button";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;

  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return null;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: true,
      members: {
        include: {
          user: true,
        },
      },
      tasks: true,
    },
  });

  if (!project) return null;

  const isOwner = project.ownerId === user.id;

  const members = project.members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
  }));

  const tasks = project.tasks;

  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === "TODO").length,
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    REVIEW: tasks.filter((t) => t.status === "REVIEW").length,
    DONE: tasks.filter((t) => t.status === "DONE").length,
  };

  const now = new Date();

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE"
  ).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="space-y-8">

        {/* BACK */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          ← Back to projects
        </Link>

        {/* HEADER */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {project.name}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {project.description || "No description"}
              </p>
            </div>

            {isOwner && !project.isCompleted && (
              <div className="flex gap-3">
                <CompleteProjectButton projectId={project.id} />
                <DeleteProjectButton projectId={project.id} />
              </div>
            )}
          </div>
        </section>

        {/* ANALYTICS */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-slate-900">
            Project analytics
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

            <StatCard label="To Do" value={tasksByStatus.TODO} />
            <StatCard label="In Progress" value={tasksByStatus.IN_PROGRESS} />
            <StatCard label="Review" value={tasksByStatus.REVIEW} />
            <StatCard label="Done" value={tasksByStatus.DONE} />

            <StatCard
              label="Overdue"
              value={overdueTasks}
              danger
            />

          </div>
        </section>

        {/* PROJECT INFO */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Project overview
          </h2>

          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-900">Owner:</span>{" "}
              {project.owner.name ?? project.owner.email}
            </p>

            <p>
              <span className="font-medium text-slate-900">Members:</span>{" "}
              {project.members.length}
            </p>
          </div>
        </section>

        {/* MEMBERS */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Participants
          </h2>

          <div className="space-y-3">
            {project.members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {member.user.name ?? member.user.email}
                  </p>

                  <p className="text-sm text-slate-500">
                    {member.user.email}
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                    {member.role}
                  </span>

                  {isOwner && member.role !== "OWNER" && (
                    <RemoveMemberButton
                      projectId={project.id}
                      memberId={member.id}
                    />
                  )}

                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INVITE */}
        <InviteMemberForm projectId={project.id} isOwner={isOwner} />

        {/* CREATE TASK */}
        <CreateTaskForm projectId={project.id} members={members} />

        {/* KANBAN */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-slate-900">
            Kanban board
          </h2>

          <KanbanBoardClient
            projectId={project.id}
            initialTasks={tasks.map((task) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate
                ? task.dueDate.toISOString()
                : null,
            }))}
          />
        </section>

        {/* TASK LIST */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Tasks
          </h2>

          <TaskList
            projectId={project.id}
            members={members}
            isOwner={isOwner}
            currentUserId={user.id}
          />
        </section>

      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 text-center ${
        danger
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p
        className={`text-sm ${
          danger ? "text-red-600" : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}