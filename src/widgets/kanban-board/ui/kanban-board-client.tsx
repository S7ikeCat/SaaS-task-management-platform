"use client";

import dynamic from "next/dynamic";

export const KanbanBoardClient = dynamic(
  () =>
    import("@/widgets/kanban-board/ui/kanban-board").then(
      (mod) => mod.KanbanBoard
    ),
  {
    ssr: false,
  }
);