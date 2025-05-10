"use client";

import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutIcon, UserIcon, Settings2Icon } from "lucide-react";

function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="bg-white text-gray-800 p-4 shadow-md border-b border-blue-100">
      <div className="flex justify-between items-center w-[90%] mx-auto">
        {/* Left Side */}
        <div className="flex items-center space-x-3">
          <Link href="/">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent cursor-pointer">
              TaskMaster
            </h1>
          </Link>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex space-x-6">
          <Link
            href="/about"
            className="text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300"
          >
            Contact Us
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex gap-3 items-center">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-blue-600 border border-blue-300 hover:bg-blue-50 hover:text-blue-700 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <UserIcon className="h-5 w-5 mr-2" />
                  {session?.user?.name || "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-blue-200 text-gray-800 shadow-lg">
                <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer">
                  <Link
                    href="/dashboard"
                    className="flex items-center w-full text-gray-700"
                  >
                    <UserIcon className="h-4 w-4 mr-2 text-blue-500" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer">
                  <Link
                    href="/settings"
                    className="flex items-center w-full text-gray-700"
                  >
                    <Settings2Icon className="h-4 w-4 mr-2 text-blue-500" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-blue-100" />
                <DropdownMenuItem
                  className="hover:bg-red-50 cursor-pointer text-red-500 hover:text-red-600"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-blue-600 border border-blue-300 hover:bg-blue-50 hover:text-blue-700 px-5 py-2 rounded-lg transition-all duration-300"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-300"
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
