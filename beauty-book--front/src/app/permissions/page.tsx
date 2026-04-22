"use client";

import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { PermissionTable } from "@/features/permission-management/PermissionTable";

export default function PermissionsPage() {
  return (
    <RequireAuth>
      <main className="w-full px-4 py-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">권한 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            시스템 권한(Permission)을 조회하고 등록·수정·삭제할 수 있습니다.
          </p>
        </header>
        <PermissionTable />
      </main>
    </RequireAuth>
  );
}
