"use client";

import { useEffect, useState } from "react";
import { EditTaskForm } from "@/features/edit-task/ui/edit-task-form";
import { DeleteTaskButton } from "@/features/delete-task/ui/delete-task-button";

type Member = {
  id: string;
  name?: string | null;
  email: string;
};

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string | null;
  assignee?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
};

type Props = {
  projectId: string;
  members: Member[];
  isOwner: boolean;
};

export function TaskList({ projectId, members, isOwner }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch(`/api/projects/${projectId}/tasks`);
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      } finally {
        setIsLoading(false);
      }
    }

    loadTasks();
  }, [projectId]);

  if (isLoading) {
    return <p>Loading tasks...</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border p-4">
        <p className="font-medium">No tasks yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Create your first task for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="rounded-xl border p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">{task.title}</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border px-3 py-1">
                {task.status}
              </span>
              <span className="rounded-full border px-3 py-1">
                {task.priority}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            {task.description || "No description"}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span>
              Assignee: {task.assignee?.name ?? task.assignee?.email ?? "Unassigned"}
            </span>
            <span>
  Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}

  {task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE" && (
      <span className="ml-2 text-xs text-red-500">
        ⚠ overdue
      </span>
    )}
</span>
          </div>

          {isOwner ? (
            <div className="flex flex-wrap gap-2">
              <EditTaskForm
                projectId={projectId}
                task={task}
                members={members}
                isOwner={isOwner}
              />
              <DeleteTaskButton
                projectId={projectId}
                taskId={task.id}
                isOwner={isOwner}
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}