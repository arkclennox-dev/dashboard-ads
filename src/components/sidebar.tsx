"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBook,
  IconBranch,
  IconChart,
  IconChevronDown,
  IconGrid,
  IconLayers,
  IconLink,
  IconLogo,
  IconMegaphone,
  IconPlug,
  IconSettings,
  IconTag,
} from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: typeof IconGrid;
  badge?: number;
}

const primary: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: IconGrid },
  { href: "/admin/landing-pages", label: "Landing Page", icon: IconLayers },
  { href: "/admin/redirects", label: "Redirect Builder", icon: IconLink },
];

const secondary: NavItem[] = [
  { href: "/admin/clicks", label: "Klik", icon: IconTag },
  { href: "/admin/reports", label: "Laporan", icon: IconChart },
  { href: "/admin/ad-spend", label: "Biaya Iklan", icon: IconBranch },
  { href: "/admin/meta-accounts", label: "Akun Meta", icon: IconMegaphone },
  { href: "/admin/komisi", label: "Komisi", icon: IconTag },
];

const tertiary: NavItem[] = [
  { href: "/admin/api-keys", label: "API Keys", icon: IconPlug },
  { href: "/admin/settings", label: "Pengaturan", icon: IconSettings },
  { href: "/admin/panduan", label: "Panduan", icon: IconBook },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname() ?? "";
  const active =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={[
        "group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-brand text-white shadow-card"
          : "text-ink-2 hover:bg-surface-3 hover:text-ink",
      ].join(" ")}
    >
      <span className="flex items-center gap-3">
        <Icon className={active ? "text-white" : "text-muted"} />
        <span>{item.label}</span>
      </span>
      {item.badge != null && (
        <span
          className={[
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            active ? "bg-white/15 text-white" : "bg-brand/15 text-brand-300",
          ].join(" ")}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-border bg-surface px-4 py-5">
      <Link href="/admin" className="flex items-center gap-2 px-2 pb-6">
        <IconLogo />
        <span className="text-base font-semibold tracking-tight">Meta Ads</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {primary.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      <div className="my-4 h-px bg-border" />

      <nav className="flex flex-col gap-1">
        {secondary.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      <div className="my-4 h-px bg-border" />

      <nav className="flex flex-col gap-1">
        {tertiary.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-border bg-surface-2 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
            AC
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">Acme Marketing</div>
            <div className="text-xs text-muted">Ad Account</div>
          </div>
          <IconChevronDown className="text-muted" />
        </div>
        <a
          href="/api/auth/signout"
          className="mt-3 block w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-center text-xs font-medium text-ink-2 hover:bg-surface-3"
        >
          Sign out
        </a>
      </div>
    </aside>
  );
}
