"use client";

import { useState } from "react";

type Props = {
  projectId: string;
  isOwner: boolean;
};

export function InviteMemberForm({ projectId, isOwner }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOwner) {
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add member");
        return;
      }

      setEmail("");
      setSuccessMessage("Participant added successfully");

      window.location.reload();
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border p-5 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Add participant</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add an existing user to this project by email
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">User email</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          type="email"
          placeholder="ivan@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {successMessage ? (
        <p className="text-sm text-green-500">{successMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg border px-4 py-2 font-medium"
      >
        {isLoading ? "Adding..." : "Add participant"}
      </button>
    </form>
  );
}