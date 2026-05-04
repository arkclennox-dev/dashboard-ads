"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none";

export function RegisterForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const supabase = getSupabaseBrowser();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setBusy(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    setBusy(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mt-6 rounded-lg border border-border bg-surface-2 p-4 text-sm text-ink">
        <p className="font-semibold">Cek email kamu!</p>
        <p className="mt-1 text-muted">
          Kami sudah kirim link konfirmasi ke <strong>{email}</strong>. Klik link tersebut untuk
          mengaktifkan akun, lalu{" "}
          <Link href="/admin/login" className="text-brand-300 hover:underline">
            login di sini
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form className="mt-6 space-y-3" onSubmit={onSubmit}>
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Nama toko / brand</div>
        <input
          className={inputCls}
          type="text"
          placeholder="Toko Saya"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Email</div>
        <input
          className={inputCls}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Password</div>
        <input
          className={inputCls}
          type="password"
          autoComplete="new-password"
          placeholder="Min. 6 karakter"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-600 disabled:opacity-60"
      >
        {busy ? "Mendaftar…" : "Daftar gratis"}
      </button>
      <p className="text-center text-xs text-muted">
        Sudah punya akun?{" "}
        <Link href="/admin/login" className="text-brand-300 hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
