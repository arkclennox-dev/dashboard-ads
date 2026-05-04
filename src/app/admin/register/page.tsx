import { RegisterForm } from "./register-form";

export const dynamic = "force-dynamic";

export default function AdminRegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Buat akun</h1>
      <p className="mt-1 text-sm text-muted">
        Gratis. Tidak perlu kartu kredit.
      </p>
      <RegisterForm />
    </main>
  );
}
