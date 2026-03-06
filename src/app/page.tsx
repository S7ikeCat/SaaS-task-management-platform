import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authConfig } from "@/features/auth/model/auth.config";

export default async function HomePage() {
  const session = await getServerSession(authConfig);

  if (session?.user?.email) {
    redirect("/dashboard");
  }

  redirect("/login");
}