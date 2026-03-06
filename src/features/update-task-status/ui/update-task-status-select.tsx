"use client";

import { useState } from "react";

type Props = {
  projectId: string;
  taskId: string;
  currentStatus: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
};

export function UpdateTaskStatusSelect({
  projectId,
  taskId,
  currentStatus,
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  async function onChange(nextStatus: string) {
    setStatus(nextStatus as typeof currentStatus);

    try {
      setIsLoading(true);

      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to update status");
        return;
      }

      window.location.reload();
    } catch {
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <select
      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500"
      value={status}
      disabled={isLoading}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="TODO">TODO</option>
      <option value="IN_PROGRESS">IN_PROGRESS</option>
      <option value="REVIEW">REVIEW</option>
      <option value="DONE">DONE</option>
    </select>
  );
}