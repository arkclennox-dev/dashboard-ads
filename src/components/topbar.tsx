import { IconBell, IconHelp } from "./icons";

interface TopbarProps {
  title: string;
  subtitle?: string;
  notifications?: number;
  initials?: string;
}

export function Topbar({
  title,
  subtitle,
  notifications = 3,
  initials = "JD",
}: TopbarProps) {
  return (
    <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink-2 hover:bg-surface-3"
        >
          <IconHelp />
          Help
        </button>
        <button
          type="button"
          className="relative rounded-lg border border-border bg-surface-2 p-2 text-ink-2 hover:bg-surface-3"
          aria-label="Notifications"
        >
          <IconBell />
          {notifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
              {notifications}
            </span>
          )}
        </button>
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
