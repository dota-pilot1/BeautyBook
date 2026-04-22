"use client";

import { RequireAuth } from "@/widgets/guards/RequireAuth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}

function DashboardInner() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] text-center px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-3">BeautyBook</h1>
      <p className="text-muted-foreground max-w-md">
        미용실 예약 관리 플랫폼입니다.
        <br />
        예약 관리, 고객 관리, 직원 스케줄 등의 기능이 추가될 예정입니다.
      </p>
    </main>
  );
}
