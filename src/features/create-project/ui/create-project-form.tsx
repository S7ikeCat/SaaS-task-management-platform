"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateProjectForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Project name is required");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          description: trimmedDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create project");
        return;
      }

      setName("");
      setDescription("");
      //router.refresh();
      window.location.reload();
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border p-4 space-y-4"
    >
      <div>
        <h2 className="text-xl font-semibold">Create project</h2>
        <p className="text-sm text-gray-500">
          Add a new workspace for tasks and team collaboration
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Project name</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Task Management SaaS"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="w-full rounded-lg border px-3 py-2 min-h-25"
          placeholder="Short project description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg border px-4 py-2 font-medium"
      >
        {isLoading ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}