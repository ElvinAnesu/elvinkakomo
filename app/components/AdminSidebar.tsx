"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [financesExpanded, setFinancesExpanded] = useState(
    pathname?.includes("/finance")
  );
  const [loggingOut, setLoggingOut] = useState(false);

  const sections = [
    { id: "overview", label: "Overview", icon: "📊", href: "/admin" },
    { id: "projects", label: "Projects", icon: "🚀", href: "/admin/projects" },
    {
      id: "finances",
      label: "Finances",
      icon: "💵",
      children: [
        { id: "billing", label: "Billing", href: "/admin/finance/billing" },
        { id: "expenses", label: "Expenses", href: "/admin/finance/expenses" },
      ],
    },
    { id: "clients", label: "Clients", icon: "👥", href: "/admin/clients" },
  ];

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === "finances") {
      setFinancesExpanded(!financesExpanded);
    }
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
      
      // Redirect to admin login page
      router.push("/auth/admin");
      router.refresh();
    } catch (err) {
      console.error("Error logging out:", err);
      alert("Failed to log out. Please try again.");
      setLoggingOut(false);
    }
  };

  return (
    <aside className="fixed left-0 top-[64px] w-64 bg-white border-r border-[#E5E7EB] h-[calc(100vh-64px)] p-6 flex flex-col">
      <div className="flex-1">
        <nav className="space-y-2">
          {sections.map((section) => (
            <div key={section.id}>
              {section.children ? (
                <button
                  onClick={() => handleSectionClick(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                    pathname?.includes(section.id)
                      ? "bg-[#6B21A8] text-white"
                      : "text-[#64748B] hover:bg-[#FAFAFA]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span>{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                  </div>
                  <span
                    className={`transform transition-transform ${
                      financesExpanded ? "rotate-90" : ""
                    }`}
                  >
                    ›
                  </span>
                </button>
              ) : (
                <Link
                  href={section.href!}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    pathname === section.href
                      ? "bg-[#6B21A8] text-white"
                      : "text-[#64748B] hover:bg-[#FAFAFA]"
                  }`}
                >
                  <span>{section.icon}</span>
                  <span className="font-medium">{section.label}</span>
                </Link>
              )}
              {section.children && financesExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {section.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm block ${
                        pathname === child.href
                          ? "bg-[#6B21A8] text-white"
                          : "text-[#64748B] hover:bg-[#FAFAFA]"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto pt-4 border-t border-[#E5E7EB]">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full text-left px-4 py-3 rounded-lg transition-colors text-[#64748B] hover:bg-red-50 hover:text-red-600 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
