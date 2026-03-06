"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export function CompleteProjectButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    const result = await Swal.fire({
      icon: "question",
      title: "Complete project?",
      text: "The project will be moved to completed projects.",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#2563eb",
      confirmButtonText: "Complete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/projects/${projectId}/complete`, {
        method: "PATCH",
      });

      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Failed to complete project",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Project completed",
        confirmButtonColor: "#2563eb",
      });

      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleComplete}
      className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
    >
      {loading ? "Completing..." : "Complete project"}
    </button>
  );
}