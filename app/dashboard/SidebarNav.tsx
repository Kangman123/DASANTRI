"use client";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Users, ClipboardCheck, Notebook, Book, Building2, BarChart3,
  UserCog, Layers, BookOpen, Download, Wallet, Bell,
} from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  LayoutGrid, Users, ClipboardCheck, Notebook, Book, Building2, BarChart3,
  UserCog, Layers, BookOpen, Download, Wallet, Bell,
};

type MenuItem = { href: string; icon: string; label: string };
type MenuGroup = { label: string; items: MenuItem[] };

export function SidebarNav({ menuGroups }: { menuGroups: MenuGroup[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 flex flex-col gap-5 overflow-y-auto">
      {menuGroups.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-2 px-4">
            {group.label}
          </p>
          <div className="flex flex-col gap-1.5">
            {group.items.map((item) => {
              const Icon = ICONS[item.icon];
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white text-slate-800 dark:bg-slate-700 dark:text-white"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}