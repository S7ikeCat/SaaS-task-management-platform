"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirm = window.confirm(
      "Delete this project? This will remove all tasks and members."
    );

    if (!confirm) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete project");
        return;
      }

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg border px-4 py-2 text-sm hover:bg-red-500/10"
    >
      {loading ? "Deleting..." : "Delete project"}
    </button>
  );
}