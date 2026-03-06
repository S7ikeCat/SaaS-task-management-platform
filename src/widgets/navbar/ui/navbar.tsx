import Link from "next/link";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";
import { LogoutButton } from "@/features/auth/ui/logout-button";
import { NotificationsBell } from "./notifications-bell";

export async function Navbar() {
  const session = await getServerSession(authConfig);
  const isAuthenticated = Boolean(session?.user?.email);

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href={isAuthenticated ? "/dashboard" : "/login"} className="text-lg font-bold">
          Task SaaS
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg border px-4 py-2 text-sm hover:bg-white/5"
              >
                Dashboard
              </Link>

              <NotificationsBell />

              <div className="hidden text-sm text-gray-400 md:block">
                {session?.user?.name ?? session?.user?.email}
              </div>

              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border px-4 py-2 text-sm hover:bg-white/5"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg border px-4 py-2 text-sm hover:bg-white/5"
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