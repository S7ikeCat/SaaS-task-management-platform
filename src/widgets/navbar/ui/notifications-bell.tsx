"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  dueDate: string;
  type: "overdue" | "today" | "tomorrow";
  label: string;
};

export function NotificationsBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications");
        const data = await response.json();
        setItems(data.notifications ?? []);
      } catch {
        setItems([]);
      }
    }

    loadNotifications();
  }, []);

  const count = items.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-lg border px-3 py-2 text-sm hover:bg-white/5"
      >
        🔔
        {count > 0 ? (
          <span className="absolute -right-2 -top-2 rounded-full border px-2 py-0.5 text-xs">
            {count}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-96 rounded-xl border bg-black p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Deadline notifications</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500">No urgent tasks.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/projects/${item.projectId}`}
                  className="block rounded-lg border p-3 hover:bg-white/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.title}</p>
                    <span
                      className={`text-xs ${
                        item.type === "overdue"
                          ? "text-red-500"
                          : item.type === "today"
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.projectName}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(item.dueDate).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}