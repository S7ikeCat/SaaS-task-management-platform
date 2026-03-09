"use client";

import { useState } from "react";
import { RemoveMemberButton } from "@/features/remove-member/ui/remove-member-button";

type Member = {
  id: string;
  role: string;
  user: {
    name: string | null;
    email: string;
  };
};

type Props = {
  members: Member[];
  projectId: string;
  isOwner: boolean;
};

export function ParticipantsList({ members, projectId, isOwner }: Props) {
  const [search, setSearch] = useState("");

  const filteredMembers = members.filter((member) => {
    const name = member.user.name?.toLowerCase() || "";
    const email = member.user.email.toLowerCase();
    const query = search.toLowerCase();

    return name.includes(query) || email.includes(query);
  });

  return (
    <>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search participants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
        />
      </div>

      <div
        className={[
          "space-y-3 pr-2 participants-scroll",
          filteredMembers.length > 3 ? "max-h-[330px] overflow-y-auto" : "",
        ].join(" ")}
      >
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">
                {member.user.name ?? member.user.email}
              </p>
              <p className="text-sm text-slate-500">{member.user.email}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {member.role}
              </span>

              {isOwner && member.role !== "OWNER" && (
                <RemoveMemberButton
                  projectId={projectId}
                  memberId={member.id}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}