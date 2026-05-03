"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      // Persist token in localStorage, then redirect to dashboard
      localStorage.setItem("expense_auth_token", token);
      router.replace("/");
    } else {
      router.replace("/");
    }
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f7f4" }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthInner />
    </Suspense>
  );
}
