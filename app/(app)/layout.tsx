"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LogOutIcon,
  MenuIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UploadIcon,
  InfoIcon,
  MessageSquareIcon,
    GamepadIcon,
} from "lucide-react";

const sidebarItems = [
  { href: "/home", icon: LayoutDashboardIcon, label: "Home Page" },
  { href: "/social-share", icon: Share2Icon, label: "Social Share" },
  { href: "/cloudcraft-chat", icon: MessageSquareIcon, label: "Talk to CloudCraft" },
  { href: "/video-upload", icon: UploadIcon, label: "Video Upload" },
   { href: "/game", icon: GamepadIcon, label: "CloudCraft Quiz " },
  { href: "/about", icon: InfoIcon, label: "About" },
];

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"cloudcraft" | "light" | "dark" | "cupcake">(
    "cloudcraft"
  );
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("cc-theme") as
      | "cloudcraft"
      | "light"
      | "dark"
      | "cupcake"
      | null;
    const initial = stored || "cloudcraft";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("cc-theme", theme);
  }, [theme]);

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        onChange={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <header className="w-full bg-gradient-to-r from-base-200 via-base-100 to-base-200/80 shadow-sm">
          <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex-none lg:hidden">
              <label
                htmlFor="sidebar-drawer"
                className="btn btn-square btn-ghost drawer-button"
              >
                <MenuIcon />
              </label>
            </div>
            <div className="flex-1">
              <Link href="/" onClick={handleLogoClick}>
               <div className="btn btn-ghost normal-case text-lg sm:text-2xl font-bold tracking-tight cursor-pointer burning-text" style={{animation: "pulse 2s ease-in-out infinite"}}>
  CloudCraft Studio
</div>
              </Link>
            </div>
            <div className="flex-none flex items-center space-x-4">
              <div className="form-control hidden sm:block">
                <label className="label cursor-pointer gap-2">
                  <span className="label-text text-xs">Theme</span>
                  <select
                    className="select select-bordered select-xs"
                    value={theme}
                    onChange={(e) =>
                      setTheme(e.target.value as
                        | "cloudcraft"
                        | "light"
                        | "dark"
                        | "cupcake")
                    }
                  >
                    <option value="cloudcraft">CloudCraft</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="cupcake">Cupcake</option>
                  </select>
                </label>
              </div>
              {user && (
                <>
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      <img
                        src={user.imageUrl}
                        alt={
                          user.username || user.emailAddresses[0].emailAddress
                        }
                      />
                    </div>
                  </div>
                  <span className="text-sm truncate max-w-xs lg:max-w-md hidden sm:inline">
                    {user.username || user.emailAddresses[0].emailAddress}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-ghost btn-circle hidden sm:flex"
                  >
                    <LogOutIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-8">
            {children}
          </div>
        </main>
      </div>
      <div className="drawer-side">
        <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
        <aside className="bg-base-200 w-64 h-full flex flex-col">
          <div className="flex items-center justify-center py-4">
            <div className="avatar placeholder">
              <div className="w-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-primary-content flex items-center justify-center text-xl font-extrabold shadow-lg">
                CS
              </div>
            </div>
          </div>
          <ul className="menu p-4 w-full text-base-content flex-grow">
            {sidebarItems.map((item) => (
              <li key={item.href} className="mb-2">
                <Link
                  href={item.href}
                  className={`flex items-center space-x-4 px-4 py-2 rounded-lg ${
                    pathname === item.href
                      ? "bg-primary text-white"
                      : "hover:bg-base-300"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
            {/* Mobile only theme toggle */}
            <li className="mt-2 sm:hidden">
              <button
                className="flex items-center space-x-4 px-4 py-2 rounded-lg hover:bg-base-300 w-full"
                onClick={() => setTheme(theme === "dark" || theme === "cloudcraft" ? "light" : "cloudcraft")}
              >
                <span className="text-xl">{theme === "light" ? "🌙" : "☀️"}</span>
                <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
              </button>
            </li>
          </ul>
          {user && (
            <div className="p-4">
              <button
                onClick={handleSignOut}
                className="btn btn-outline btn-error w-full"
              >
                <LogOutIcon className="mr-2 h-5 w-5" />
                Sign Out
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}