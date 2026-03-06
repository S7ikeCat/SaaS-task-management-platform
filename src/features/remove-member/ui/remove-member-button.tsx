"use client";

import { useState } from "react";

type Props = {
  projectId: string;
  memberId: string;
};

export function RemoveMemberButton({ projectId, memberId }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  async function onRemove() {
    const confirmed = window.confirm(
      "Remove this participant from the project? All tasks assigned to this user in this project will be deleted."
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/projects/${projectId}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to remove participant");
        return;
      }

      window.location.reload();
    } catch {
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onRemove}
      disabled={isLoading}
      className="rounded-lg border px-3 py-2 text-xs hover:bg-white/5"
    >
      {isLoading ? "Removing..." : "Remove"}
    </button>
  );
}