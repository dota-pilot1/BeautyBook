"use client";

import type { RoleSummary } from "@/entities/user/model/types";

const ROLE_STYLES: Record<string, string> = {
  ROLE_ADMIN: "bg-red-100 text-red-700 border-red-200",
  ROLE_MANAGER: "bg-orange-100 text-orange-700 border-orange-200",
  ROLE_STYLIST: "bg-blue-100 text-blue-700 border-blue-200",
  ROLE_CUSTOMER: "bg-gray-100 text-gray-700 border-gray-200",
};

const DEFAULT_STYLE = "bg-slate-100 text-slate-700 border-slate-200";

export function RoleBadge({ role }: { role: RoleSummary }) {
  const style = ROLE_STYLES[role.code] ?? DEFAULT_STYLE;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}
      title={role.code}
    >
      {role.name}
    </span>
  );
}
