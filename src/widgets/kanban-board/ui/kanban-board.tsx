"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { FiCalendar, FiMessageSquare, FiMinus, FiUser } from "react-icons/fi";

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string | null;
};

type Props = {
  projectId: string;
  initialTasks: Task[];
};

const columns: { id: TaskStatus; title: string; accent: string }[] = [
  { id: "TODO", title: "To Do", accent: "bg-slate-900" },
  { id: "IN_PROGRESS", title: "In Progress", accent: "bg-blue-600" },
  { id: "REVIEW", title: "Review", accent: "bg-amber-500" },
  { id: "DONE", title: "Done", accent: "bg-emerald-600" },
];

function priorityTone(priority?: Task["priority"]) {
  switch (priority) {
    case "URGENT":
      return "bg-rose-100 text-rose-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-blue-100 text-blue-700";
    case "LOW":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        type: "task",
        task,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.55 : 1,
  };

  const fakeCommentCount = (task.title.length % 4) + 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md active:cursor-grabbing"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-slate-900">{task.title}</p>
            <FiMinus className="mt-1 shrink-0 text-slate-300" />
          </div>
          {task.description ? (
            <p className="line-clamp-3 text-xs leading-5 text-slate-500">{task.description}</p>
          ) : (
            <p className="text-xs text-slate-400">No task description</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityTone(task.priority)}`}>
            {task.priority ?? "MEDIUM"}
          </span>
          {task.dueDate ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              <FiCalendar />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <FiUser />
            Team task
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiMessageSquare />
            {fakeCommentCount} comments
          </span>
        </div>
      </div>
    </div>
  );
}

function Column({
  id,
  title,
  tasks,
  accent,
}: {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  accent: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      status: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-80 rounded-[28px] border p-4 transition ${
        isOver ? "border-blue-300 bg-blue-50/70" : "border-slate-200 bg-slate-50/80"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ projectId, initialTasks }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const tasksByColumn = useMemo(() => {
    return {
      TODO: tasks.filter((task) => task.status === "TODO"),
      IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS"),
      REVIEW: tasks.filter((task) => task.status === "REVIEW"),
      DONE: tasks.filter((task) => task.status === "DONE"),
    };
  }, [tasks]);

  function handleDragStart(event: DragStartEvent) {
    const draggedTask = event.active.data.current?.task as Task | undefined;

    if (draggedTask) {
      setActiveTask(draggedTask);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = String(active.id);
    const nextStatus = String(over.id) as TaskStatus;

    const existingTask = tasks.find((task) => task.id === taskId);

    if (!existingTask) return;
    if (existingTask.status === nextStatus) return;

    const previousTasks = tasks;

    const optimisticTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: nextStatus } : task
    );

    setTasks(optimisticTasks);

    try {
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
        setTasks(previousTasks);
        return;
      }

      router.refresh();
      sessionStorage.setItem("scroll-y", String(window.scrollY));
      window.location.reload();
    } catch {
      setTasks(previousTasks);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Kanban board</h2>
          <p className="text-sm text-slate-500">Drag tasks between columns to update their status.</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
          {tasks.length} total tasks
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={tasksByColumn[column.id]}
              accent={column.accent}
            />
          ))}
        </div>

        <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
      </DndContext>
    </section>
  );
}
