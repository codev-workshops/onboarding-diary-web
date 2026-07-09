"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Role } from "@/lib/validation";

type NavItem = { href: string; label: string; roles: Role[] };

// Screen inventory per docs/UI_FLOWS.md; entry screens land in later steps.
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["RECRUIT", "MANAGER", "ADMIN"] },
  { href: "/tasks", label: "Tasks", roles: ["RECRUIT"] },
  { href: "/issues", label: "Issues", roles: ["RECRUIT"] },
  { href: "/feedback", label: "Feedback", roles: ["RECRUIT"] },
  { href: "/notes", label: "Notes", roles: ["RECRUIT"] },
  { href: "/reports", label: "Reports", roles: ["RECRUIT", "MANAGER", "ADMIN"] },
  { href: "/admin/users", label: "Users", roles: ["ADMIN"] },
  { href: "/admin/assignments", label: "Assignments", roles: ["ADMIN"] },
  { href: "/profile", label: "Profile", roles: ["RECRUIT", "MANAGER", "ADMIN"] },
];

export function AppShell({
  user,
  children,
}: {
  user: { name: string; role: Role };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV_ITEMS.filter((i) => i.roles.includes(user.role));

  const nav = (
    <nav className="space-y-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`block rounded px-3 py-2 text-sm font-medium ${
            pathname.startsWith(item.href)
              ? "bg-blue-600 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <button
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
          className="rounded border border-slate-300 px-3 py-1 text-slate-700"
        >
          ☰
        </button>
        <span className="font-semibold text-slate-800">Onboarding Diary</span>
        <SignOutButton />
      </header>
      {open && (
        <div className="border-b bg-white p-4 lg:hidden">
          {nav}
        </div>
      )}
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-60 shrink-0 flex-col gap-6 p-4 lg:flex">
          <div>
            <p className="px-3 text-lg font-bold text-slate-800">
              Onboarding Diary
            </p>
            <p className="px-3 text-xs text-slate-500">
              {user.name} · {user.role.toLowerCase()}
            </p>
          </div>
          {nav}
          <SignOutButton />
        </aside>
        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-200"
    >
      Log out
    </button>
  );
}
