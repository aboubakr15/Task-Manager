"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboardIcon,
  CheckSquareIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
  BellIcon,
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { signOut } from "next-auth/react";

function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
    },
    {
      name: "Tasks",
      href: "/dashboard/tasks",
      icon: <CheckSquareIcon className="h-5 w-5" />,
    },
    {
      name: "Teams",
      href: "/dashboard/teams",
      icon: <UsersIcon className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <SettingsIcon className="h-5 w-5" />,
    },
  ];

  return (
    <div className="md:w-[250px] bg-[#00155a] flex flex-col h-screen sticky top-0 left-0">
      <div className="flex flex-col items-center">
        <h2 className="mt-8 text-white text-3xl font-bold">TaskMaster</h2>
      </div>

      <nav className="mt-10 flex-1">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-blue-700/50 transition-colors duration-200",
                  pathname === item.href && "bg-blue-700/50 font-medium"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}

          {/* Notifications Section */}
          <li className="mt-6 mb-2">
            <div>
              <div className="notification-wrapper">
                <NotificationDropdown />
              </div>
            </div>
          </li>
        </ul>
      </nav>

      <div className="mt-auto mb-8 px-4">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-white hover:bg-red-600/30 transition-colors duration-200"
        >
          <LogOutIcon className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
