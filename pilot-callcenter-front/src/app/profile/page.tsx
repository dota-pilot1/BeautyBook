"use client";

import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { useAuth } from "@/entities/user/model/authStore";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <main className="w-full px-4 py-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">내 프로필</h1>
        <p className="text-sm text-muted-foreground mt-1">로그인된 계정의 정보와 권한을 확인합니다.</p>
      </header>

      <div className="space-y-4 max-w-xl">
        <Section title="계정 정보">
          <Row label="이름" value={user.username} />
          <Row label="이메일" value={user.email} />
          <Row label="역할" value={user.role.name} />
        </Section>

        <Section title="보유 권한">
          {user.permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground px-4 py-3">권한이 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2 px-4 py-3">
              {user.permissions.map((perm) => (
                <span
                  key={perm}
                  className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {perm}
                </span>
              ))}
            </div>
          )}
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border">
      <div className="px-4 py-3 border-b border-border bg-muted/50">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center px-4 py-2.5 border-b border-border last:border-0">
      <span className="w-24 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
