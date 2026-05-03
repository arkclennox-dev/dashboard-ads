interface TopbarProps {
  title: string;
  subtitle?: string;
  initials?: string;
}

export function Topbar({ title, subtitle, initials = "JD" }: TopbarProps) {
  return (
    <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
