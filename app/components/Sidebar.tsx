"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

interface SidebarProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function Sidebar({
  currentSection,
  onSectionChange,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  
  const sections = [
    { id: "projects", label: "Projects", href: "/dashboard/projects" },
    { id: "billing", label: "Billing", href: "/dashboard/billing" },
  ];

  const isActive = (href: string) => {
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error logging out:", error);
        alert("Failed to log out. Please try again.");
        setLoggingOut(false);
        return;
      }
      
      // Redirect to login page
      router.push("/auth/login");
      router.refresh();
    } catch (err) {
      console.error("Error logging out:", err);
      alert("Failed to log out. Please try again.");
      setLoggingOut(false);
    }
  };

  return (
    <aside className="fixed left-0 top-[120px] w-64 bg-white border-r border-[#E5E7EB] h-[calc(100vh-120px)] p-6 flex flex-col">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-6">
          Dashboard
        </h2>
        <nav className="space-y-2">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className={`w-full block text-left px-4 py-2 rounded-lg transition-colors ${
                isActive(section.href)
                  ? "bg-[#6B21A8] text-white"
                  : "text-[#64748B] hover:bg-[#FAFAFA]"
              }`}
            >
              {section.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto pt-4 border-t border-[#E5E7EB]">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full text-left px-4 py-2 rounded-lg transition-colors text-[#64748B] hover:bg-red-50 hover:text-red-600 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
