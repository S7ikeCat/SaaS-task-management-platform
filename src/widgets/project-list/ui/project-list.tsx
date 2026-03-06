"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
    return <p>Loading projects...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Active projects */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Active Projects</h2>

        {activeProjects.length === 0 ? (
          <p className="text-sm text-gray-500">
            No active projects yet.
          </p>
        ) : (
          activeProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block rounded-xl border p-4 transition hover:bg-white/5"
            >
              <h3 className="font-semibold">{project.name}</h3>

              <p className="text-sm text-gray-500 mt-1">
                {project.description || "No description"}
              </p>
            </Link>
          ))
        )}
      </div>

      {/* Completed projects */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Completed Projects</h2>

        {completedProjects.length === 0 ? (
          <p className="text-sm text-gray-500">
            No completed projects yet.
          </p>
        ) : (
          completedProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block rounded-xl border p-4 opacity-70 transition hover:bg-white/5"
            >
              <h3 className="font-semibold">{project.name}</h3>

              <p className="text-sm text-gray-500 mt-1">
                {project.description || "No description"}
              </p>

              <p className="text-xs text-green-500 mt-2">
                Completed
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}