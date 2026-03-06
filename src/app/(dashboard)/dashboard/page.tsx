import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";
import { ProjectList } from "@/widgets/project-list/ui/project-list";
import { CreateProjectForm } from "@/features/create-project/ui/create-project-form";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <main className="p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-gray-500 mt-2">
          Welcome, {session.user.name ?? session.user.email}
        </p>
      </div>

      <CreateProjectForm />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Your projects</h2>
        <ProjectList />
      </section>
    </main>
  );
}