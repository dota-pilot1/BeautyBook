"use client";

import { useState } from "react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { MenuTable } from "@/features/menu-management/MenuTable";
import { MenuTreeTab } from "@/features/menu-management/MenuTreeTab";

const TABS = [
  { id: "list", label: "목록" },
  { id: "tree", label: "트리 순서" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function MenuManagementPage() {
  const [tab, setTab] = useState<TabId>("list");

  return (
    <RequireAuth>
      <main className="w-full px-4 py-4">
        <header className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">메뉴 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            헤더 메뉴를 추가·수정·삭제합니다. 변경 사항은 즉시 헤더에 반영됩니다.
          </p>
        </header>

        <div className="flex gap-1 border-b border-border mb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "list" && <MenuTable />}
        {tab === "tree" && <MenuTreeTab />}
      </main>
    </RequireAuth>
  );
}
