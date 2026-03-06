import { RegisterForm } from "@/features/auth/ui/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        <div className="hidden bg-linear-to-br from-emerald-500 via-cyan-500 to-blue-600 p-10 text-white lg:block">
          <p className="text-sm text-cyan-100">Create your workspace</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Start managing team projects with a clean and modern interface
          </h1>
          <p className="mt-4 max-w-md text-cyan-100">
            Invite participants, assign tasks, control deadlines and track project progress.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <h1 className="text-3xl font-bold text-slate-900">Register</h1>
            <p className="mt-2 text-sm text-slate-500">
              Create an account to start using the platform.
            </p>

            <div className="mt-8">
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}