"use client";

import { useState } from "react";

export function CompleteProjectButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    const confirm = window.confirm("Mark project as completed?");

    if (!confirm) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/projects/${projectId}/complete`, {
        method: "PATCH",
      });

      if (!res.ok) {
        alert("Failed to complete project");
        return;
      }

      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleComplete}
      className="rounded-lg border px-4 py-2 text-sm hover:bg-green-500/10"
    >
      {loading ? "Completing..." : "Complete project"}
    </button>
  );
}