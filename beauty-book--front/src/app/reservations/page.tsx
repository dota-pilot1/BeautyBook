"use client";

import { ClipboardList } from "lucide-react";
import { RequireRole } from "@/widgets/guards/RequireRole";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function ReservationsPage() {
  return (
    <RequireRole roles={["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_USER"]}>
      <AdminPlaceholderPage
        title="예약 관리"
        description="접수된 예약과 방문 상태, 예약 변경 흐름을 관리합니다."
        icon={ClipboardList}
        tasks={["예약 목록 조회", "방문 상태 확인", "예약 변경/취소", "예약 상세 화면"]}
      />
    </RequireRole>
  );
}
