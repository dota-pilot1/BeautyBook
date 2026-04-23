"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi } from "@/entities/menu/api/menuApi";
import type { MenuRecord } from "@/entities/menu/model/types";
import { toast, toastError } from "@/shared/lib/toast";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { MenuFormDialog } from "./MenuFormDialog";

export function MenuTable() {
  const qc = useQueryClient();
  const [formTarget, setFormTarget] = useState<MenuRecord | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuRecord | null>(null);

  const { data: menus = [], isLoading, isError } = useQuery({
    queryKey: ["menus"],
    queryFn: menuApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => menuApi.delete(id),
    onSuccess: () => {
      toast.success("메뉴가 삭제되었습니다.");
      qc.invalidateQueries({ queryKey: ["menus"] });
      setDeleteTarget(null);
    },
    onError: (e) => toastError(e, "삭제에 실패했습니다."),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">로딩 중...</p>;
  if (isError) return <p className="text-sm text-destructive">데이터를 불러오지 못했습니다.</p>;

  const parentLabel = (parentId: number | null) => {
    if (!parentId) return <span className="text-muted-foreground">—</span>;
    const p = menus.find((m) => m.id === parentId);
    return p ? p.label : parentId;
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setFormTarget("new")}
          className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + 메뉴 추가
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <Th>ID</Th>
              <Th>코드</Th>
              <Th>부모</Th>
              <Th>레이블</Th>
              <Th>경로</Th>
              <Th>역할</Th>
              <Th>순서</Th>
              <Th>표시</Th>
              <Th className="text-right">액션</Th>
            </tr>
          </thead>
          <tbody>
            {menus.map((menu) => (
              <tr key={menu.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <Td className="text-muted-foreground">{menu.id}</Td>
                <Td className="font-mono text-xs">{menu.code}</Td>
                <Td>{parentLabel(menu.parentId)}</Td>
                <Td className="font-medium">{menu.label}</Td>
                <Td className="text-muted-foreground">{menu.path ?? "—"}</Td>
                <Td>
                  {menu.requiredRole ? (
                    <span className="rounded px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      {menu.requiredRole}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </Td>
                <Td>{menu.displayOrder}</Td>
                <Td>
                  <span className={menu.visible ? "text-green-600" : "text-muted-foreground"}>
                    {menu.visible ? "표시" : "숨김"}
                  </span>
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setFormTarget(menu)}
                      className="rounded px-2 py-1 text-xs border border-border hover:bg-accent transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setDeleteTarget(menu)}
                      className="rounded px-2 py-1 text-xs border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MenuFormDialog
        target={formTarget}
        menus={menus}
        onClose={() => setFormTarget(null)}
      />

      {deleteTarget && (
        <ConfirmDialog
          title="메뉴 삭제"
          description={`"${deleteTarget.label}" 메뉴를 삭제하시겠습니까?`}
          confirmLabel="삭제"
          variant="destructive"
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
