import Link from "next/link";
import { FolderOpen, Plus, BarChart3, Home, Settings } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/projects", icon: Home },
  { name: "All Projects", href: "/projects", icon: FolderOpen },
  { name: "New Project", href: "/projects/new", icon: Plus },
  { name: "Statistics", href: "/projects/stats", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
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
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
