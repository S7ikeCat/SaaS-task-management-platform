"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";

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
        className="relative rounded-xl border border-slate-200 bg-white p-3 text-slate-700 transition hover:bg-slate-50"
      >
        <FiBell size={18} />
        {count > 0 ? (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {count}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-14 z-50 sm:w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Deadline notifications
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-slate-500">No urgent tasks.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/projects/${item.projectId}`}
                  className="block rounded-2xl border border-slate-200 p-3 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        item.type === "overdue"
                          ? "bg-red-100 text-red-600"
                          : item.type === "today"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">{item.projectName}</p>

                  <p className="mt-1 text-xs text-slate-400">
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