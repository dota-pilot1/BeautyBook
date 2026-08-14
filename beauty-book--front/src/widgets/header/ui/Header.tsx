"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Eye,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MonitorCog,
  Package,
  Scissors,
  Settings,
  ShieldCheck,
  UserCircle,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, authActions } from "@/entities/user/model/authStore";
import { menuApi } from "@/entities/menu/api/menuApi";
import type { MenuRecord, MenuItem } from "@/entities/menu/model/types";
import { RoleBadge } from "@/features/user-management/RoleBadge";
import { NavLink } from "@/shared/ui/NavLink";
import { ThemeSwitcher } from "@/shared/ui/theme/ThemeSwitcher";
import { LanguageSelect } from "@/shared/ui/LanguageSelect";

function buildTree(flat: MenuRecord[], userRole: string | null): MenuItem[] {
  const visible = flat.filter(
    (m) => m.visible && (!m.requiredRole || m.requiredRole === userRole)
  );
  const map = new Map<number, MenuItem>();
  visible.forEach((m) => map.set(m.id, { ...m, children: [] }));

  const roots: MenuItem[] = [];
  map.forEach((item) => {
    if (item.parentId === null) {
      roots.push(item);
    } else {
      map.get(item.parentId)?.children.push(item);
    }
  });

  const sort = (items: MenuItem[]) =>
    items.sort((a, b) => a.displayOrder - b.displayOrder);

  map.forEach((item) => sort(item.children));
  return sort(roots);
}

const adminMenuMeta: Record<string, { description: string; icon: LucideIcon }> = {
  ADMIN_DASHBOARD: { description: "운영 상태와 핵심 지표를 한 화면에서 확인합니다.", icon: LayoutDashboard },
  ADMIN_RESERVATIONS: { description: "접수된 예약과 방문 상태를 관리합니다.", icon: ClipboardList },
  ADMIN_APPOINTMENT_BOARD: { description: "당일 예약과 시술 진행 상태를 확인합니다.", icon: CalendarDays },
  ADMIN_REVENUE: { description: "일별 매출과 결제 흐름을 확인합니다.", icon: BarChart3 },
  ADMIN_SERVICES: { description: "시술 메뉴와 가격을 관리합니다.", icon: Scissors },
  ADMIN_SERVICE_CATEGORIES: { description: "시술 카테고리와 노출 순서를 정리합니다.", icon: Package },
  ADMIN_SERVICE_AVAILABILITY: { description: "예약 가능 여부와 노출 상태를 조정합니다.", icon: Eye },
  ADMIN_USERS: { description: "회원 계정을 확인하고 역할을 조정합니다.", icon: Users },
  ADMIN_ROLES: { description: "시스템 롤과 커스텀 롤을 관리합니다.", icon: BadgeCheck },
  ADMIN_PERMISSIONS: { description: "예약, 시술, 매출 권한 코드를 관리합니다.", icon: KeyRound },
  ADMIN_ROLE_PERMISSIONS: { description: "역할별 접근 권한을 매핑합니다.", icon: ShieldCheck },
  ADMIN_SITE_SETTINGS: { description: "메인 화면과 매장 소개 설정을 편집합니다.", icon: MonitorCog },
  ADMIN_SCREEN_SETTINGS: { description: "화면 안내 문구와 표시 설정을 편집합니다.", icon: MonitorCog },
  ADMIN_NAV_MANAGEMENT: { description: "상단 헤더 메뉴와 노출 구성을 조정합니다.", icon: Menu },
  ADMIN_MENU_MANAGEMENT: { description: "상단 헤더 메뉴와 노출 구성을 조정합니다.", icon: Menu },
};

const beautyAdminSections = [
  {
    label: "운영 관리",
    codes: [
      "ADMIN_RESERVATIONS",
      "ADMIN_APPOINTMENT_BOARD",
      "ADMIN_SERVICES",
      "ADMIN_SERVICE_CATEGORIES",
      "ADMIN_SERVICE_AVAILABILITY",
      "ADMIN_REVENUE",
    ],
  },
  {
    label: "시스템 관리",
    codes: [
      "ADMIN_USERS",
      "ADMIN_ROLES",
      "ADMIN_PERMISSIONS",
      "ADMIN_ROLE_PERMISSIONS",
      "ADMIN_SITE_SETTINGS",
      "ADMIN_SCREEN_SETTINGS",
      "ADMIN_NAV_MANAGEMENT",
      "ADMIN_MENU_MANAGEMENT",
    ],
  },
];

function flattenLeaves(item: MenuItem): MenuItem[] {
  if (item.children.length === 0) return item.path ? [item] : [];
  return item.children.flatMap(flattenLeaves);
}

function buildAdminGroups(item: MenuItem) {
  if (item.children.some((child) => child.children.length > 0)) {
    return item.children.map((child) => ({
      id: child.id,
      label: child.label,
      children: child.children.length > 0 ? child.children : [child],
    }));
  }

  const used = new Set<string>();
  const groups = beautyAdminSections
    .map((section, index) => {
      const children = section.codes
        .map((code) => item.children.find((child) => child.code === code))
        .filter((child): child is MenuItem => Boolean(child));
      children.forEach((child) => used.add(child.code));
      return { id: -index - 1, label: section.label, children };
    })
    .filter((group) => group.children.length > 0);

  const uncategorized = item.children.filter((child) => !used.has(child.code));
  if (uncategorized.length > 0) {
    groups.push({ id: -99, label: "기타", children: uncategorized });
  }

  return groups;
}

function AdminMegaMenu({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const leaves = flattenLeaves(item);
  const isActive = leaves.some((leaf) => leaf.path && pathname.startsWith(leaf.path));
  const groups = buildAdminGroups(item);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors ${
          isActive || open
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        {item.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-background shadow-xl">
          <div className="max-h-[min(520px,calc(100vh-7rem))] overflow-y-auto p-2">
            {groups.map((group, groupIndex) => (
              <section
                key={group.id}
                className={groupIndex > 0 ? "mt-2 border-t border-border pt-2" : ""}
              >
                <h3 className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.children.map((child) => {
                    const meta = adminMenuMeta[child.code] ?? {
                      description: "관리 기능으로 이동합니다.",
                      icon: Settings,
                    };
                    const Icon = meta.icon;
                    const childActive = child.path ? pathname.startsWith(child.path) : false;

                    return (
                      <Link
                        key={child.id}
                        href={child.path ?? "#"}
                        target={child.isExternal ? "_blank" : undefined}
                        rel={child.isExternal ? "noopener noreferrer" : undefined}
                        onClick={() => setOpen(false)}
                        title={meta.description}
                        className={`group flex min-w-0 items-center gap-2 rounded-md px-2.5 py-2 transition-colors ${
                          childActive
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
                            childActive
                              ? "border-primary-foreground/25 bg-primary-foreground/10"
                              : "border-border bg-muted text-muted-foreground group-hover:border-primary group-hover:text-primary"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {child.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownMenu({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isActive = item.children.some(
    (c) => c.path && pathname.startsWith(c.path)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 items-center gap-1 border-b-2 px-1 text-sm transition-colors ${
          isActive
            ? "border-primary text-foreground font-medium"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        {item.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-44 rounded-md border border-border bg-background shadow-lg z-50 py-1 overflow-hidden">
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={child.path ?? "#"}
              target={child.isExternal ? "_blank" : undefined}
              rel={child.isExternal ? "noopener noreferrer" : undefined}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NavItem({ item }: { item: MenuItem; key?: React.Key }) {
  if (item.children.length > 0) {
    if (item.code === "ADMIN") {
      return <AdminMegaMenu item={item} />;
    }
    return <DropdownMenu item={item} />;
  }
  return (
    <NavLink href={item.path ?? "#"} exact={item.path === "/dashboard"}>
      {item.label}
    </NavLink>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = (name ?? "?").slice(0, 2).toUpperCase();
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-[10px] font-bold select-none">
      {initials}
    </span>
  );
}

function UserDropdown({
  displayName,
  user,
  onLogout,
}: {
  displayName: string;
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  onLogout: () => void;
}) {
  const { t } = useTranslation("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-2.5 transition-colors hover:bg-accent"
      >
        <UserAvatar name={displayName} />
        <span className="text-sm font-medium leading-none text-foreground">
          {displayName}
        </span>
        {user.role && (
          <>
            <span className="h-3.5 w-px bg-border/80" />
            <RoleBadge role={user.role} />
          </>
        )}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-md border border-border bg-background shadow-lg z-50 py-1 overflow-hidden">
          <div className="border-b border-border px-3 py-2.5">
            <div className="flex items-center gap-2">
              <UserAvatar name={displayName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {user.role && <div className="mt-2"><RoleBadge role={user.role} /></div>}
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <UserCircle className="h-4 w-4" />
            {t("profile")}
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { t } = useTranslation("nav");
  const { status, user } = useAuth();
  const router = useRouter();

  const userRole = user?.role?.code ?? null;

  const { data: flatMenus = [] } = useQuery({
    queryKey: ["menus"],
    queryFn: menuApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  const tree = buildTree(flatMenus, userRole);

  const handleLogout = async () => {
    await authActions.logout();
    router.replace("/login");
  };

  const displayName = user?.username ?? user?.email ?? "?";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="relative flex h-14 w-full items-center px-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          BeautyBook
        </Link>

        {status === "authenticated" && (
          <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-5">
            {tree.map((item) => <NavItem key={item.id} item={item} />)}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          <LanguageSelect />
          <ThemeSwitcher />
          {status === "authenticated" ? (
            user && <UserDropdown displayName={displayName} user={user} onLogout={handleLogout} />
          ) : status === "anonymous" ? (
            <>
              <Link
                href="/register"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-foreground transition-colors hover:bg-accent"
              >
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <span className="hidden sm:inline text-sm font-medium leading-none">
                  {t("register")}
                </span>
              </Link>
              <Link
                href="/login"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-primary-foreground transition-opacity hover:opacity-90"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium leading-none">
                  {t("login")}
                </span>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
