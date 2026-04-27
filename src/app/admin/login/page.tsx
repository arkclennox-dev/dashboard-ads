import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Admin login</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in with the email associated with your Supabase project.
      </p>
      <Suspense
        fallback={
          <div className="mt-6 h-40 animate-pulse rounded-lg border border-border bg-surface-2" />
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
