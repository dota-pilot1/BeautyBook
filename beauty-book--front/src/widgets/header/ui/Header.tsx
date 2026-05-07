"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, LogIn, LogOut, UserCircle, UserPlus } from "lucide-react";
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
      <div className="flex h-14 w-full items-center justify-between px-4">
        <nav className="flex min-w-0 items-center gap-5">
          <Link
            href="/"
            className="mr-2 text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            BeautyBook
          </Link>
          {status === "authenticated" &&
            tree.map((item) => <NavItem key={item.id} item={item} />)}
        </nav>

        <div className="flex items-center gap-2">
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
