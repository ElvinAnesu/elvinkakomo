"use client";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <main className="flex-1 flex relative">
        <Sidebar />
        <div className="flex-1 ml-64 overflow-y-auto h-[calc(100vh-120px)]">
          {children}
        </div>
      </main>
    </div>
  );
}
