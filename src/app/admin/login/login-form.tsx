"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseBrowser();
  const demoMode = !supabase;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      router.replace(redirect);
      return;
    }
    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace(redirect);
    router.refresh();
  }

  return (
    <>
      <form className="mt-6 space-y-3" onSubmit={onSubmit}>
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Email</div>
          <input
            className={inputCls}
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
          />
        </label>
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Password</div>
          <input
            className={inputCls}
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
          />
        </label>
        {error ? (
          <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-600 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Continue"}
        </button>
      </form>
      {!demoMode && (
        <p className="mt-4 text-center text-xs text-muted">
          Belum punya akun?{" "}
          <Link href="/admin/register" className="text-brand-300 hover:underline">
            Daftar gratis
          </Link>
        </p>
      )}
      {demoMode && (
        <p className="mt-6 text-xs text-muted">
          Demo build (no Supabase env): this form bypasses auth and goes
          straight to the{" "}
          <Link href="/admin" className="text-brand-300 hover:underline">
            dashboard
          </Link>
          .
        </p>
      )}
    </>
  );
}
