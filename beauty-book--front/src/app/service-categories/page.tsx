"use client";

import { Package } from "lucide-react";
import { RequireRole } from "@/widgets/guards/RequireRole";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function ServiceCategoriesPage() {
  return (
    <RequireRole roles={["ROLE_ADMIN", "ROLE_MANAGER"]}>
      <AdminPlaceholderPage
        title="시술 카테고리 관리"
        description="시술 카테고리와 예약 화면 노출 순서를 관리합니다."
        icon={Package}
        tasks={["카테고리 등록", "카테고리 순서 변경", "카테고리 숨김", "시술 연결"]}
      />
    </RequireRole>
  );
}
