"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import {
  IconBook,
  IconBranch,
  IconChart,
  IconGrid,
  IconLayers,
  IconLink,
  IconLock,
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
  adminOnly?: boolean;
  hidden?: boolean;
}

const primary: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: IconLink },
  { href: "/landing-pages", label: "Landing Page", icon: IconLayers },
  { href: "/clicks", label: "Klik", icon: IconTag },
];

const secondary: NavItem[] = [
  { href: "/admin/dashboard-ads", label: "Dashboard Ads", icon: IconGrid, adminOnly: true },
  { href: "/admin/reports", label: "Laporan", icon: IconChart, adminOnly: true },
  { href: "/admin/ad-spend", label: "Biaya Iklan", icon: IconBranch, adminOnly: true },
  { href: "/admin/meta-accounts", label: "Akun Meta", icon: IconMegaphone, adminOnly: true },
  { href: "/admin/komisi", label: "Komisi", icon: IconTag, adminOnly: true },
];

const tertiary: NavItem[] = [
  { href: "/admin/api-keys", label: "API Keys", icon: IconPlug, adminOnly: true },
  { href: "/admin/settings", label: "Pengaturan", icon: IconSettings, adminOnly: true, hidden: true },
  { href: "/panduan", label: "Panduan", icon: IconBook },
];

function NavLink({ item, isAdmin }: { item: NavItem; isAdmin: boolean }) {
  const pathname = usePathname() ?? "";
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const locked = item.adminOnly && !isAdmin;
  const Icon = item.icon;

  if (locked) {
    return (
      <div
        className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium cursor-not-allowed opacity-40 select-none"
        title="Fitur ini tersedia untuk admin"
      >
        <span className="flex items-center gap-3 text-ink-2">
          <Icon className="text-muted" />
          <span>{item.label}</span>
        </span>
        <IconLock className="text-muted" width={14} height={14} />
      </div>
    );
  }

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
    </Link>
  );
}

function useCurrentUser() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const userEmail = data.user?.email ?? null;
      setEmail(userEmail);
      if (data.user) {
        const { data: tenant } = await supabase
          .from("tenants")
          .select("is_admin")
          .eq("user_id", data.user.id)
          .maybeSingle();
        setIsAdmin(tenant?.is_admin === true);
      }
    });
  }, []);

  const initials = email ? email.slice(0, 2).toUpperCase() : "??";
  const displayName = email ?? "—";

  return { email, initials, displayName, isAdmin };
}

export function Sidebar() {
  const { initials, displayName, isAdmin } = useCurrentUser();

  const visibleTertiary = tertiary.filter(
    (item) => !(item.hidden && item.adminOnly && !isAdmin)
  );

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-border bg-surface px-4 py-5">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 pb-6">
        <IconLogo />
        <span className="text-base font-semibold tracking-tight">AdsLink</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {primary.map((item) => (
          <NavLink key={item.href} item={item} isAdmin={isAdmin} />
        ))}
      </nav>

      <div className="my-4 h-px bg-border" />

      <nav className="flex flex-col gap-1">
        {secondary.map((item) => (
          <NavLink key={item.href} item={item} isAdmin={isAdmin} />
        ))}
      </nav>

      <div className="my-4 h-px bg-border" />

      <nav className="flex flex-col gap-1">
        {visibleTertiary.map((item) => (
          <NavLink key={item.href} item={item} isAdmin={isAdmin} />
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-border bg-surface-2 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{displayName}</div>
            <div className="text-xs text-muted">{isAdmin ? "Admin" : "Member"}</div>
          </div>
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
