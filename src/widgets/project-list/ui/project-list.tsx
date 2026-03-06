"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiCheckCircle, FiClock } from "react-icons/fi";

type Project = {
  id: string;
  name: string;
  description?: string | null;
  isCompleted?: boolean;
};

export function ProjectList() {
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();

        setActiveProjects(data.activeProjects ?? []);
        setCompletedProjects(data.completedProjects ?? []);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (isLoading) {
    return <p className="text-slate-500">Loading projects...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FiClock className="text-blue-600" />
          <h3 className="text-base font-semibold text-slate-900">Active Projects</h3>
        </div>

        {activeProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
            No active projects yet.
          </div>
        ) : (
          activeProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              <h4 className="font-semibold text-slate-900">{project.name}</h4>
              <p className="mt-1 text-sm text-slate-500">
                {project.description || "No description"}
              </p>
            </Link>
          ))
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FiCheckCircle className="text-emerald-600" />
          <h3 className="text-base font-semibold text-slate-900">
            Completed Projects
          </h3>
        </div>

        {completedProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
            No completed projects yet.
          </div>
        ) : (
          completedProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 opacity-80 transition hover:bg-slate-100"
            >
              <h4 className="font-semibold text-slate-900">{project.name}</h4>
              <p className="mt-1 text-sm text-slate-500">
                {project.description || "No description"}
              </p>
              <p className="mt-2 text-xs font-medium text-emerald-600">Completed</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}