"use client";

import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { MenuTable } from "@/features/menu-management/MenuTable";

export default function MenuManagementPage() {
  return (
    <RequireAuth>
      <main className="w-full px-4 py-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">메뉴 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            헤더 메뉴를 추가·수정·삭제합니다. 변경 사항은 즉시 헤더에 반영됩니다.
          </p>
        </header>
        <MenuTable />
      </main>
    </RequireAuth>
  );
}
