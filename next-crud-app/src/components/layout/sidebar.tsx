"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Insights", href: "/projects/stats", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/projects/stats") {
      return pathname === "/projects/stats";
    }

    if (href === "/projects") {
      return pathname.startsWith("/projects") && pathname !== "/projects/stats";
    }

    return pathname === href;
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-semibold">Project Manager</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
              isActive(item.href)
                ? "bg-gray-800 text-white border-l-4 border-blue-500"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 mr-3",
                isActive(item.href) ? "text-blue-400" : "text-gray-400"
              )}
            />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
