import { LoginForm } from "@/features/auth/login/LoginForm";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const nextParam = params.next;
  const nextPath = Array.isArray(nextParam) ? nextParam[0] : nextParam;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">로그인</h1>
          <p className="text-sm text-muted-foreground">
            BeautyBook에 접속합니다.
          </p>
        </div>
        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
