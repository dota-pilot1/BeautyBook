"use client";

import { CalendarDays } from "lucide-react";
import { RequireRole } from "@/widgets/guards/RequireRole";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function AppointmentBoardPage() {
  return (
    <RequireRole roles={["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_USER"]}>
      <AdminPlaceholderPage
        title="예약 현황"
        description="당일 예약과 시술 진행 상태를 시간표 기준으로 확인합니다."
        icon={CalendarDays}
        tasks={["당일 예약 보기", "방문 접수", "시술 진행", "완료 알림"]}
      />
    </RequireRole>
  );
}
