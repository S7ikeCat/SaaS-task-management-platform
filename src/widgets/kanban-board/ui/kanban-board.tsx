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

const columns: { id: TaskStatus; title: string }[] = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "REVIEW", title: "Review" },
  { id: "DONE", title: "Done" },
];

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:cursor-grabbing"
    >
      <div className="space-y-3">
        <div>
          <p className="font-semibold text-slate-900">{task.title}</p>
          {task.description ? (
            <p className="mt-1 line-clamp-3 text-xs text-slate-500">
              {task.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
            {task.status}
          </span>

          {task.priority ? (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-medium text-blue-700">
              {task.priority}
            </span>
          ) : null}

          {task.dueDate ? (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Column({
  id,
  title,
  tasks,
}: {
  id: TaskStatus;
  title: string;
  tasks: Task[];
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
      className={`min-h-80 rounded-3xl border p-4 transition ${
        isOver
          ? "border-blue-300 bg-blue-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
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
      window.location.reload();
    } catch {
      setTasks(previousTasks);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Kanban board</h2>
        <p className="text-sm text-slate-500">
          Drag tasks between columns to update their status
        </p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={tasksByColumn[column.id]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}