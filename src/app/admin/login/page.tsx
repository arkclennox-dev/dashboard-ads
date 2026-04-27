import Link from "next/link";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Admin login</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in with the email associated with your Supabase project.
      </p>
      <form className="mt-6 space-y-3" action="/admin" method="GET">
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Email</div>
          <input className={inputCls} type="email" name="email" autoComplete="email" />
        </label>
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Password</div>
          <input
            className={inputCls}
            type="password"
            name="password"
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white"
        >
          Continue
        </button>
      </form>
      <p className="mt-6 text-xs text-muted">
        Demo build: this form bypasses auth and goes straight to the{" "}
        <Link href="/admin" className="text-brand-300 hover:underline">
          dashboard
        </Link>
        .
      </p>
    </main>
  );
}
