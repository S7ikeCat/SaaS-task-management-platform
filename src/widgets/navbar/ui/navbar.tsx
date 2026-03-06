import Link from "next/link";
import { getServerSession } from "next-auth";
import { FiBriefcase, FiHome } from "react-icons/fi";

import { authConfig } from "@/features/auth/model/auth.config";
import { LogoutButton } from "@/features/auth/ui/logout-button";
import { NotificationsBell } from "./notifications-bell";

export async function Navbar() {
  const session = await getServerSession(authConfig);
  const isAuthenticated = Boolean(session?.user?.email);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href={isAuthenticated ? "/dashboard" : "/login"}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <FiBriefcase size={18} />
          </div>

          <div>
            <p className="text-base font-bold text-slate-900">Task SaaS</p>
            <p className="text-xs text-slate-500">Project management workspace</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:flex"
              >
                <FiHome size={16} />
                Dashboard
              </Link>

              <NotificationsBell />

              <div className="hidden rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600 md:block">
                {session?.user?.name ?? session?.user?.email}
              </div>

              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}