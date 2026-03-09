import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  FiActivity,
  FiArrowRight,
  FiFolder,
  FiLayers,
  FiPlusCircle,
  FiZap,
} from "react-icons/fi";

import { authConfig } from "@/features/auth/model/auth.config";
import { ProjectList } from "@/widgets/project-list/ui/project-list";
import { CreateProjectForm } from "@/features/create-project/ui/create-project-form";

const quickStats = [
  {
    label: "Focus today",
    value: "Ship faster",
    icon: FiZap,
    tone: "from-indigo-500/15 to-blue-500/5 text-indigo-700",
  },
  {
    label: "Workspace",
    value: "Projects + tasks",
    icon: FiLayers,
    tone: "from-emerald-500/15 to-teal-500/5 text-emerald-700",
  },
  {
    label: "Collaboration",
    value: "Team aligned",
    icon: FiActivity,
    tone: "from-amber-500/15 to-orange-500/5 text-amber-700",
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_20px_70px_-45px_rgba(15,23,42,0.55)]">
          <div className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_28%)]" />
              <div className="relative z-10 max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                  <FiActivity className="text-sm" />
                  Product workspace
                </p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Welcome back, {session.user.name ?? session.user.email}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Organize projects, prioritize work, and keep the team moving with a
                  cleaner dashboard that feels closer to a real SaaS product.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#create-project"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-blue-600 px-5 py-3 text-sm font-semibold text-white! transition hover:bg-blue-700"
                  >
                    <FiPlusCircle />
                    New project
                  </a>
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View projects
                    <FiArrowRight />
                  </a>
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-t border-slate-200/70 bg-slate-50/70 p-6 sm:p-8 lg:border-t-0 lg:border-l">
              {quickStats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className={`rounded-3xl border border-white/80 bg-gradient-to-br ${item.tone} p-5 shadow-sm`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">
                          {item.value}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
                        <Icon className="text-lg text-slate-700" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <div
            id="create-project"
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.55)]"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                <FiPlusCircle className="text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Create project</h2>
                <p className="text-sm text-slate-500">Start a new workspace stream.</p>
              </div>
            </div>
            <CreateProjectForm />
          </div>

          <div
            id="projects"
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.55)]"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
                <FiFolder className="text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Projects overview</h2>
                <p className="text-sm text-slate-500">
                  Active and completed workspaces in one view.
                </p>
              </div>
            </div>
            <ProjectList />
          </div>
        </section>
      </div>
    </main>
  );
}
