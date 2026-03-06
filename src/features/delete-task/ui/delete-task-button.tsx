"use client";

import { useState } from "react";

type Props = {
  projectId: string;
  taskId: string;
  isOwner: boolean;
};

export function DeleteTaskButton({ projectId, taskId, isOwner }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOwner) {
    return null;
  }

  async function onDelete() {
    const confirmed = window.confirm("Delete this task?");

    if (!confirmed) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete task");
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
    <button
      type="button"
      onClick={onDelete}
      disabled={isLoading}
      className="rounded-lg border px-3 py-2 text-xs hover:bg-white/5"
    >
      {isLoading ? "Deleting..." : "Delete"}
    </button>
  );
}