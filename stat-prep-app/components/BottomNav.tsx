"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, History, BarChart2 } from "lucide-react";

const TABS = [
  { href: "/",         label: "学習",  Icon: BookOpen   },
  { href: "/history",  label: "履歴",  Icon: History    },
  { href: "/weakness", label: "分析",  Icon: BarChart2  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 flex-1 py-2 text-xs font-medium transition-colors ${
                active
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
