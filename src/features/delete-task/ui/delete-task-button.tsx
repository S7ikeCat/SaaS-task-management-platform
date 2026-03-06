"use client";

import { useState } from "react";
import Swal from "sweetalert2";

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
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete task?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#2563eb",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        await Swal.fire({
          icon: "error",
          title: "Failed to delete task",
          text: data.error || "Something went wrong",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Task deleted",
        confirmButtonColor: "#2563eb",
      });

      window.location.reload();
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Please try again",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={isLoading}
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
    >
      {isLoading ? "Deleting..." : "Delete"}
    </button>
  );
}