"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  Workflow,
  Target,
  Clock,
  Award,
  Layers,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/domains", label: "Domains", Icon: BookOpen },
  { href: "/study", label: "Study Guide", Icon: GraduationCap },
  { href: "/anti-patterns", label: "Anti-Patterns", Icon: AlertTriangle },
  { href: "/scenarios", label: "Scenarios", Icon: Workflow },
  { href: "/quiz", label: "Domain Quiz", Icon: Target },
  { href: "/mock", label: "Mock Exam", Icon: Clock },
  { href: "/real-exam", label: "Real Exam Simulation", Icon: Award },
  { href: "/flashcards", label: "Flashcards", Icon: Layers },
];

function setCookie(name, value) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

export default function AppSidebar({ defaultCollapsed }) {
  const [collapsed, setCollapsed] = useState(!!defaultCollapsed);
  const pathname = usePathname();

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      setCookie("sidebarCollapsed", next);
      return next;
    });
  };

  return (
    <aside
      className={`flex flex-col shrink-0 bg-shell-bg border-r border-shell-border overflow-y-auto overflow-x-hidden transition-[width] duration-300 ease-out ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className={`flex items-center py-2.5 px-2.5 shrink-0 ${collapsed ? "justify-center" : "justify-end"}`}>
        <button
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-8 h-8 rounded-md flex items-center justify-center text-shell-text-muted hover:bg-shell-hover hover:text-shell-text transition-colors"
        >
          {collapsed ? <PanelLeft size={17} strokeWidth={1.8} /> : <PanelLeftClose size={17} strokeWidth={1.8} />}
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2.5 pb-4 flex-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`group flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[13.5px] font-medium transition-colors whitespace-nowrap ${
                collapsed ? "justify-center px-0" : ""
              } ${
                active
                  ? "bg-shell-active text-shell-text"
                  : "text-shell-text-muted hover:bg-shell-hover hover:text-shell-text"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={1.8}
                className={`shrink-0 transition-colors ${active ? "text-accent-2" : ""}`}
              />
              {!collapsed && <span className="overflow-hidden text-ellipsis">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
