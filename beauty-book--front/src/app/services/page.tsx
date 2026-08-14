"use client";

import { Scissors } from "lucide-react";
import { RequireRole } from "@/widgets/guards/RequireRole";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function ServicesPage() {
  return (
    <RequireRole roles={["ROLE_ADMIN", "ROLE_MANAGER"]}>
      <AdminPlaceholderPage
        title="시술 메뉴 관리"
        description="시술명, 가격, 소요 시간, 설명 이미지를 관리합니다."
        icon={Scissors}
        tasks={["시술 등록/수정", "가격 관리", "소요 시간 설정", "대표 이미지 연결"]}
      />
    </RequireRole>
  );
}
