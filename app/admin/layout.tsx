"use client";

import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import DashboardHeader from "../components/DashboardHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#FAFAFA]">
      <DashboardHeader />
      <main className="flex-1 flex relative">
        <AdminSidebar />
        <div className="flex-1 ml-64 overflow-y-auto h-[calc(100vh-64px)]">
          {children}
        </div>
      </main>
    </div>
  );
}
