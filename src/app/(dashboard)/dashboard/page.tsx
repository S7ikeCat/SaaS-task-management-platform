import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { FiFolder, FiPlusCircle } from "react-icons/fi";

import { authConfig } from "@/features/auth/model/auth.config";
import { ProjectList } from "@/widgets/project-list/ui/project-list";
import { CreateProjectForm } from "@/features/create-project/ui/create-project-form";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="space-y-8">
        <section className="rounded-3xl bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white shadow-lg">
          <p className="text-sm text-blue-100">Workspace overview</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Welcome back, {session.user.name ?? session.user.email}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-100 sm:text-base">
            Create projects, manage tasks, track deadlines and keep your team in sync.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FiPlusCircle className="text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Create project
              </h2>
            </div>
            <CreateProjectForm />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FiFolder className="text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Your projects
              </h2>
            </div>
            <ProjectList />
          </div>
        </section>
      </div>
    </main>
  );
}