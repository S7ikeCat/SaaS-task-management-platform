import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";
import { LoginForm } from "@/features/auth/ui/login-form";

export default async function LoginPage() {
  const session = await getServerSession(authConfig);

  if (session?.user?.email) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        <div className="hidden bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 p-10 text-white lg:block">
          <p className="text-sm text-blue-100">Task SaaS</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Organize projects, tasks and deadlines in one place
          </h1>
          <p className="mt-4 max-w-md text-blue-100">
            A clean workspace for teams to collaborate, manage project members and track progress.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <h1 className="text-3xl font-bold text-slate-900">Login</h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue working on your projects.
            </p>

            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}