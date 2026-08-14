"use client";

import { Eye } from "lucide-react";
import { RequireRole } from "@/widgets/guards/RequireRole";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function ServiceAvailabilityPage() {
  return (
    <RequireRole roles={["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_USER"]}>
      <AdminPlaceholderPage
        title="시술 예약 가능 관리"
        description="시술별 예약 가능 여부와 예약 화면 노출 상태를 조정합니다."
        icon={Eye}
        tasks={["예약 가능 처리", "예약 중지", "노출 ON/OFF", "임시 숨김"]}
      />
    </RequireRole>
  );
}
