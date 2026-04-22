"use client";

import { useTranslation } from "react-i18next";
import { SignupForm } from "@/features/auth/signup/SignupForm";

export default function RegisterPage() {
  const { t } = useTranslation("auth");
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">{t("signUpTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("signUpSubtitle")}</p>
        </div>
        <SignupForm />
      </div>
    </main>
  );
}
