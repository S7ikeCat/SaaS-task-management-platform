"use client";

import { useEffect, useMemo, useState } from "react";
import { FiMessageSquare, FiPlus, FiSearch, FiX, FiZap } from "react-icons/fi";
import Swal from "sweetalert2";

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
  commentsCount: number;
  subtasksTotal: number;
  subtasksCompleted: number;
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

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name?: string | null;
    email: string;
  };
};

type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

type DrawerState = {
  task: Task;
  comments: Comment[];
  subtasks: Subtask[];
  isLoading: boolean;
  aiInsight?: string | null;
};

function priorityTone(priority: Task["priority"]) {
  switch (priority) {
    case "URGENT":
      return "bg-rose-100 text-rose-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

function statusLabel(status: Task["status"]) {
  return status.replace(/_/g, " ");
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function TaskList({ projectId, members, isOwner, currentUserId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [subtaskDraft, setSubtaskDraft] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [isSavingSubtask, setIsSavingSubtask] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  async function loadTasks() {
    const response = await fetch(`/api/projects/${projectId}/tasks`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    const data = await response.json();
    setTasks(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const response = await fetch(`/api/projects/${projectId}/tasks`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        const data = await response.json();

        if (isMounted) {
          setTasks(Array.isArray(data) ? data : []);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesQuery =
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description?.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || task.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, tasks]);

  async function openDrawer(task: Task) {
    setDrawer({
      task,
      comments: [],
      subtasks: [],
      isLoading: true,
      aiInsight: null,
    });
    setCommentDraft("");
    setSubtaskDraft("");

    try {
      const [commentsResponse, subtasksResponse] = await Promise.all([
        fetch(`/api/tasks/${task.id}/comments`, { cache: "no-store" }),
        fetch(`/api/tasks/${task.id}/subtasks`, { cache: "no-store" }),
      ]);

      const [comments, subtasks] = await Promise.all([
        commentsResponse.json(),
        subtasksResponse.json(),
      ]);

      setDrawer({
        task,
        comments: Array.isArray(comments) ? comments : [],
        subtasks: Array.isArray(subtasks) ? subtasks : [],
        isLoading: false,
        aiInsight: null,
      });
    } catch {
      setDrawer((prev) =>
        prev
          ? {
              ...prev,
              isLoading: false,
            }
          : prev
      );
    }
  }

  function syncTaskCounters(taskId: string, update: Partial<Task>) {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...update } : task)));
    setDrawer((prev) => (prev && prev.task.id === taskId ? { ...prev, task: { ...prev.task, ...update } } : prev));
  }

  async function addComment() {
    if (!drawer || !commentDraft.trim()) return;

    try {
      setIsSavingComment(true);

      const response = await fetch(`/api/tasks/${drawer.task.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentDraft.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add comment");
      }

      setDrawer((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, data],
            }
          : prev
      );
      setCommentDraft("");
      syncTaskCounters(drawer.task.id, { commentsCount: drawer.task.commentsCount + 1 });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Failed to add comment",
        text: error instanceof Error ? error.message : "Please try again",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsSavingComment(false);
    }
  }

  async function addSubtask() {
    if (!drawer || !subtaskDraft.trim()) return;

    try {
      setIsSavingSubtask(true);

      const response = await fetch(`/api/tasks/${drawer.task.id}/subtasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: subtaskDraft.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add subtask");
      }

      setDrawer((prev) =>
        prev
          ? {
              ...prev,
              subtasks: [...prev.subtasks, data],
            }
          : prev
      );
      setSubtaskDraft("");
      syncTaskCounters(drawer.task.id, { subtasksTotal: drawer.task.subtasksTotal + 1 });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Failed to add subtask",
        text: error instanceof Error ? error.message : "Please try again",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsSavingSubtask(false);
    }
  }

  async function toggleSubtask(subtaskId: string, completed: boolean) {
    if (!drawer) return;

    try {
      const response = await fetch(`/api/tasks/${drawer.task.id}/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update subtask");
      }

      const nextSubtasks = drawer.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, completed: data.completed } : subtask
      );

      const subtasksCompleted = nextSubtasks.filter((item) => item.completed).length;

      setDrawer((prev) =>
        prev
          ? {
              ...prev,
              subtasks: nextSubtasks,
            }
          : prev
      );
      syncTaskCounters(drawer.task.id, {
        subtasksCompleted,
        subtasksTotal: nextSubtasks.length,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Failed to update subtask",
        text: error instanceof Error ? error.message : "Please try again",
        confirmButtonColor: "#2563eb",
      });
    }
  }

  async function generateAiPlan() {
    if (!drawer) return;

    try {
      setIsGeneratingPlan(true);

      const response = await fetch(`/api/tasks/${drawer.task.id}/ai-plan`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate AI plan");
      }

      const subtasks = Array.isArray(data.subtasks) ? data.subtasks : [];
      const subtasksCompleted = subtasks.filter((item: Subtask) => item.completed).length;

      setDrawer((prev) =>
        prev
          ? {
              ...prev,
              subtasks,
              aiInsight: data.insight ?? null,
            }
          : prev
      );
      syncTaskCounters(drawer.task.id, {
        subtasksTotal: subtasks.length,
        subtasksCompleted,
      });

      await Swal.fire({
        icon: "success",
        title: "AI plan ready",
        text:
          data.added > 0
            ? `Added ${data.added} new subtasks to the task.`
            : "No new subtasks were added because similar steps already exist.",
        confirmButtonColor: "#2563eb",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "AI plan failed",
        text: error instanceof Error ? error.message : "Please try again",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading tasks...</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
        <p className="font-medium text-slate-900">No tasks yet</p>
        <p className="mt-1 text-sm text-slate-500">Create your first task for this project.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["ALL", "TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {status === "ALL" ? "All" : statusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {filteredTasks.map((task) => {
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
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600">Overdue</span>
                );
              } else if (dueDate.getTime() === today.getTime()) {
                deadlineBadge = (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">Due today</span>
                );
              } else if (dueDate.getTime() === tomorrow.getTime()) {
                deadlineBadge = (
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">Due tomorrow</span>
                );
              }
            }

            return (
              <div key={task.id} className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <button type="button" onClick={() => openDrawer(task)} className="text-left">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 transition hover:text-blue-700">{task.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                          {task.description || "No description"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityTone(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                          {statusLabel(task.status)}
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
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>
                  </button>

                  <div className="flex flex-col gap-3 lg:min-w-52 lg:items-end">
                    <div>
                      {canUpdateStatus ? (
                        <UpdateTaskStatusSelect projectId={projectId} taskId={task.id} currentStatus={task.status} />
                      ) : (
                        <span className="rounded-full bg-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
                          {task.status}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <FiMessageSquare /> {task.commentsCount} comments
                      </span>
                      <span>{task.subtasksCompleted}/{task.subtasksTotal} subtasks</span>
                    </div>

                    {isOwner ? (
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <EditTaskForm projectId={projectId} task={task} members={members} isOwner={isOwner} />
                        <DeleteTaskButton projectId={projectId} taskId={task.id} isOwner={isOwner} />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {drawer ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-[1px]">
          <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Task details</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">{drawer.task.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{drawer.task.description || "No description for this task yet."}</p>
              </div>
              <button
                type="button"
                onClick={() => setDrawer(null)}
                className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 transition hover:bg-slate-50"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <section className="grid gap-3 md:grid-cols-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{statusLabel(drawer.task.status)}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Priority</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{drawer.task.priority}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Assignee</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {drawer.task.assignee?.name ?? drawer.task.assignee?.email ?? "Unassigned"}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Progress</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {drawer.task.subtasksCompleted}/{drawer.task.subtasksTotal} complete
                  </p>
                </div>
              </section>

              {drawer.isLoading ? (
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  Loading collaboration details...
                </div>
              ) : (
                <>
                  <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-950">Subtasks</h4>
                        <p className="text-sm text-slate-500">Real checklist items stored for this task.</p>
                      </div>
                      <button
                        type="button"
                        onClick={generateAiPlan}
                        className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        <FiZap /> {isGeneratingPlan ? "Generating..." : "Generate with AI"}
                      </button>
                    </div>

                    {drawer.aiInsight ? (
                      <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-700">
                        {drawer.aiInsight}
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      {drawer.subtasks.length > 0 ? (
                        drawer.subtasks.map((subtask) => (
                          <label
                            key={subtask.id}
                            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                          >
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={(e) => toggleSubtask(subtask.id, e.target.checked)}
                            />
                            <span className={subtask.completed ? "line-through text-slate-400" : ""}>{subtask.title}</span>
                          </label>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                          No subtasks yet. Add one manually or generate a plan with AI.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        value={subtaskDraft}
                        onChange={(e) => setSubtaskDraft(e.target.value)}
                        placeholder="Add a subtask"
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={addSubtask}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <FiPlus /> {isSavingSubtask ? "Adding..." : "Add subtask"}
                      </button>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-slate-950">Comments</h4>
                      <p className="text-sm text-slate-500">Discussion is now saved and restored after refresh.</p>
                    </div>
                    <div className="space-y-3">
                      {drawer.comments.length > 0 ? (
                        drawer.comments.map((comment) => (
                          <div key={comment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900">
                                {comment.author.name ?? comment.author.email}
                              </p>
                              <span className="text-xs text-slate-400">{formatRelativeDate(comment.createdAt)}</span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{comment.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                          No comments yet. Start the discussion for this task.
                        </div>
                      )}
                    </div>
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        placeholder="Write a comment"
                        className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={addComment}
                          className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          {isSavingComment ? "Saving..." : "Add comment"}
                        </button>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
