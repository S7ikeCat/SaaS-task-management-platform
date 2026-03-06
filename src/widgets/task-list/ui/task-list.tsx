"use client";

import { useEffect, useState } from "react";
import { EditTaskForm } from "@/features/edit-task/ui/edit-task-form";
import { DeleteTaskButton } from "@/features/delete-task/ui/delete-task-button";
import { UpdateTaskStatusSelect } from "@/features/update-task-status/ui/update-task-status-select";

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
  currentUserId: string;
};

export function TaskList({
  projectId,
  members,
  isOwner,
  currentUserId,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        const response = await fetch(`/api/projects/${projectId}/tasks`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        const data = await response.json();

        if (!isMounted) return;
        setTasks(Array.isArray(data) ? data : []);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading tasks...</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <p className="font-medium text-slate-900">No tasks yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Create your first task for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const canUpdateStatus = isOwner || task.assignee?.id === currentUserId;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let deadlineBadge: React.ReactNode = null;

        if (task.dueDate && task.status !== "DONE") {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);

          if (dueDate < today) {
            deadlineBadge = (
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
                ⚠ overdue
              </span>
            );
          } else if (dueDate.getTime() === today.getTime()) {
            deadlineBadge = (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                ⏰ due today
              </span>
            );
          } else if (dueDate.getTime() === tomorrow.getTime()) {
            deadlineBadge = (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                📌 due tomorrow
              </span>
            );
          }
        }

        return (
          <div
            key={task.id}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {task.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {task.description || "No description"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                    {task.priority}
                  </span>

                  {deadlineBadge}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span>
                    <span className="font-medium text-slate-700">Assignee:</span>{" "}
                    {task.assignee?.name ?? task.assignee?.email ?? "Unassigned"}
                  </span>

                  <span>
                    <span className="font-medium text-slate-700">Due:</span>{" "}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <div>
                  {canUpdateStatus ? (
                    <UpdateTaskStatusSelect
                      projectId={projectId}
                      taskId={task.id}
                      currentStatus={task.status}
                    />
                  ) : (
                    <span className="rounded-full bg-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
                      {task.status}
                    </span>
                  )}
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
            </div>
          </div>
        );
      })}
    </div>
  );
}