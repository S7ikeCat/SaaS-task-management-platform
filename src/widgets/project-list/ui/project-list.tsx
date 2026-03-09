"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiCheckCircle, FiClock, FiFolder } from "react-icons/fi";

type Project = {
  id: string;
  name: string;
  description?: string | null;
  isCompleted?: boolean;
};

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-1">{description}</p>
    </div>
  );
}

function ProjectCard({ project, completed }: { project: Project; completed?: boolean }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_18px_45px_-38px_rgba(15,23,42,0.45)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="truncate text-base font-semibold text-slate-900">{project.name}</h4>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
            {project.description || "No description added yet."}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            completed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {completed ? "done" : "active"}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-500">Open workspace</span>
        <span className="inline-flex items-center gap-2 font-medium text-slate-700 transition group-hover:text-slate-950">
          View
          <FiArrowRight />
        </span>
      </div>
    </Link>
  );
}

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

  const totalProjects = activeProjects.length + completedProjects.length;

  const dashboardStats = useMemo(
    () => [
      {
        label: "Total",
        value: totalProjects,
        icon: FiFolder,
        tone: "border border-slate-200 bg-white text-slate-700",
      },
      {
        label: "Active",
        value: activeProjects.length,
        icon: FiClock,
        tone: "bg-blue-50 text-blue-700",
      },
      {
        label: "Completed",
        value: completedProjects.length,
        icon: FiCheckCircle,
        tone: "bg-emerald-50 text-emerald-700",
      },
    ],
    [activeProjects.length, completedProjects.length, totalProjects]
  );

  if (isLoading) {
    return <p className="text-slate-500">Loading projects...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-3xl p-4 ${stat.tone}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-3">
                  <Icon className="text-lg" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FiClock className="text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Active projects</h3>
          </div>

          {activeProjects.length === 0 ? (
            <EmptyState
              title="No active projects yet"
              description="Create your first project to start organizing work."
            />
          ) : (
            <div className="space-y-3">
              {activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-emerald-600" />
            <h3 className="text-base font-semibold text-slate-900">Completed projects</h3>
          </div>

          {completedProjects.length === 0 ? (
            <EmptyState
              title="Nothing completed yet"
              description="Finished projects will appear here for quick access."
            />
          ) : (
            <div className="space-y-3">
              {completedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} completed />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
