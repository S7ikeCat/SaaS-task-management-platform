"use client";

import { useState } from "react";
import Swal from "sweetalert2";

type Props = {
  projectId: string;
  isOwner: boolean;
};

export function InviteMemberForm({ projectId, isOwner }: Props) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOwner) {
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      await Swal.fire({
        icon: "warning",
        title: "Email is required",
        confirmButtonColor: "#2563eb",
      });
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
        await Swal.fire({
          icon: "error",
          title: "Failed to add participant",
          text: data.error || "Something went wrong",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      setEmail("");

      await Swal.fire({
        icon: "success",
        title: "Participant added",
        text: "The user has been added to the project",
        confirmButtonColor: "#2563eb",
      });
      sessionStorage.setItem("scroll-y", String(window.scrollY));
      window.location.reload();
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Please try again",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">Add participant</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add an existing user to this project by email
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">User email</label>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            type="email"
            placeholder="ivan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {isLoading ? "Adding..." : "Add participant"}
        </button>
      </form>
    </section>
  );
}