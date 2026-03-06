"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete project?",
      text: "This will remove the project, all tasks and all members.",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#2563eb",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Failed to delete project",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Project deleted",
        confirmButtonColor: "#2563eb",
      });

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
    >
      {loading ? "Deleting..." : "Delete project"}
    </button>
  );
}