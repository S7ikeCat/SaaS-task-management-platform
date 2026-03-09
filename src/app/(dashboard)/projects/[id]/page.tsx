import Link from "next/link";
import { getServerSession } from "next-auth";
import { FiArrowLeft, FiCalendar, FiFolder, FiUsers, FiZap } from "react-icons/fi";

import { authConfig } from "@/features/auth/model/auth.config";
import { prisma } from "@/shared/lib/prisma";

import { InviteMemberForm } from "@/features/invite-member/ui/invite-member-form";
import { RemoveMemberButton } from "@/features/remove-member/ui/remove-member-button";

import { CreateTaskForm } from "@/features/create-task/ui/create-task-form";

import { TaskList } from "@/widgets/task-list/ui/task-list";
import { KanbanBoardClient } from "@/widgets/kanban-board/ui/kanban-board-client";

import { CompleteProjectButton } from "@/features/complete-project/ui/complete-project-button";
import { DeleteProjectButton } from "@/features/delete-project/ui/delete-project-button";

import { ParticipantsList } from "@/features/participants/ui/participants-list";

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

  const stats = [
    { label: "Total tasks", value: tasks.length, icon: FiFolder, tone: "border border-slate-200 " },
    { label: "In progress", value: tasksByStatus.IN_PROGRESS, icon: FiZap, tone: "bg-blue-50 text-blue-700" },
    { label: "Members", value: project.members.length, icon: FiUsers, tone: "bg-violet-50 text-violet-700" },
    { label: "Overdue", value: overdueTasks, icon: FiCalendar, tone: "bg-rose-50 text-rose-700" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <FiArrowLeft />
          Back to projects
        </Link>

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_70px_-45px_rgba(15,23,42,0.55)]">
          <div className="grid gap-0 xl:grid-cols-[1.5fr_0.9fr]">
            <div className="relative overflow-hidden px-6 py-8 sm:px-8 sm:py-9">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.15),transparent_28%)]" />
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#16a34a] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    {project.isCompleted ? "Completed" : "Active project"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    Owner: {project.owner.name ?? project.owner.email}
                  </span>
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {project.name}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  {project.description || "No description yet. Add context so the team can align faster."}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#tasks"
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Open tasks
                  </a>
                  <a
                    href="#create-task"
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Create task
                  </a>
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-slate-200 bg-slate-50/70 p-6 sm:grid-cols-2 xl:border-l xl:border-t-0 xl:grid-cols-2">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`rounded-3xl p-4 ${stat.tone}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{stat.label}</p>
                        <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                      </div>
                      <div className="rounded-2xl bg-white/15 p-3">
                        <Icon className="text-lg" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.55)]">
  <div className="mb-5">
    <h2 className="text-xl font-semibold text-slate-950">Delivery snapshot</h2>
    <p className="text-sm text-slate-500">
      Quick view of current execution across statuses.
    </p>
  </div>

  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
    <StatCard label="To Do" value={tasksByStatus.TODO} />
    <StatCard label="In Progress" value={tasksByStatus.IN_PROGRESS} />
    <StatCard label="Review" value={tasksByStatus.REVIEW} />
    <StatCard label="Done" value={tasksByStatus.DONE} />
  </div>

  <div className="mt-6 grid gap-4 md:grid-cols-3">
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Total tasks
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{tasks.length}</p>
      <p className="mt-1 text-xs text-slate-500">All tracked items in this project</p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-blue-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
        Active workload
      </p>
      <p className="mt-2 text-2xl font-semibold text-blue-800">
        {tasksByStatus.TODO + tasksByStatus.IN_PROGRESS + tasksByStatus.REVIEW}
      </p>
      <p className="mt-1 text-xs text-blue-700/80">Tasks still in execution flow</p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-rose-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">
        Overdue risk
      </p>
      <p className="mt-2 text-2xl font-semibold text-rose-700">{overdueTasks}</p>
      <p className="mt-1 text-xs text-rose-700/80">Items with passed due date</p>
    </div>
  </div>

  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-700">Project completion</p>
        <p className="text-xs text-slate-500">
          Based on tasks moved to Done
        </p>
      </div>
      <span className="text-sm font-semibold text-slate-900">
        {tasks.length > 0 ? Math.round((tasksByStatus.DONE / tasks.length) * 100) : 0}%
      </span>
    </div>

    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-blue-500 transition-all"
        style={{
          width: `${tasks.length > 0 ? (tasksByStatus.DONE / tasks.length) * 100 : 0}%`,
        }}
      />
    </div>

    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
        Done: {tasksByStatus.DONE}
      </span>
      <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
        Review: {tasksByStatus.REVIEW}
      </span>
      <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
        In progress: {tasksByStatus.IN_PROGRESS}
      </span>
    </div>
  </div>
</div>

          <section className="min-h-[500px] rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.55)]">
  <div className="mb-4 flex items-center justify-between gap-3">
    <div>
      <h2 className="text-xl font-semibold text-slate-950">Participants</h2>
      <p className="text-sm text-slate-500">Project members and ownership visibility.</p>
    </div>
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
      {project.members.length} members
    </span>
  </div>

  <ParticipantsList
  members={project.members}
  projectId={project.id}
  isOwner={isOwner}
/>
</section>
        </section>

        <InviteMemberForm projectId={project.id} isOwner={isOwner} />

        <div id="create-task">
          <CreateTaskForm projectId={project.id} members={members} />
        </div>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.55)]">
          <KanbanBoardClient
            projectId={project.id}
            initialTasks={tasks.map((task) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate ? task.dueDate.toISOString() : null,
            }))}
          />
        </section>

        <section id="tasks" className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.55)]">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-950">Task workspace</h2>
            <p className="text-sm text-slate-500">Search, filter, and inspect tasks in a cleaner workflow.</p>
          </div>

          <TaskList projectId={project.id} members={members} isOwner={isOwner} currentUserId={user.id} />
        </section>

        {isOwner && !project.isCompleted ? (
          <section className="flex flex-wrap gap-3 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.55)]">
            <CompleteProjectButton projectId={project.id} />
            <DeleteProjectButton projectId={project.id} />
          </section>
        ) : null}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
