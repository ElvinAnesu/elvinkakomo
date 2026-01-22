"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/Card";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    activeProjects: 0,
    totalClients: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/auth/admin");
        return;
      }

      // Verify user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/auth/admin");
        return;
      }

      // Fetch all invoices with items
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select(
          `
          id,
          is_paid,
          created_at,
          invoice_items (
            total
          )
        `
        );

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, status, created_at");

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "client");

      if (invoicesError || projectsError || clientsError) {
        console.error("Error fetching dashboard data:", invoicesError || projectsError || clientsError);
        setLoading(false);
        return;
      }

      // Calculate totals from invoices
      const calculateInvoiceTotal = (invoice: any): number => {
        if (!invoice.invoice_items || invoice.invoice_items.length === 0) return 0;
        return invoice.invoice_items.reduce(
          (sum: number, item: any) => sum + parseFloat(item.total?.toString() || "0"),
          0
        );
      };

      const totalRevenue =
        invoicesData
          ?.filter((inv) => inv.is_paid)
          .reduce((sum, inv) => sum + calculateInvoiceTotal(inv), 0) || 0;

      const pendingIncome =
        invoicesData
          ?.filter((inv) => !inv.is_paid)
          .reduce((sum, inv) => sum + calculateInvoiceTotal(inv), 0) || 0;

      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue =
        invoicesData
          ?.filter((inv) => {
            if (!inv.is_paid) return false;
            const invoiceDate = new Date(inv.created_at);
            return (
              invoiceDate.getMonth() === currentMonth &&
              invoiceDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, inv) => sum + calculateInvoiceTotal(inv), 0) || 0;

      // Note: Expenses would need an expenses table - for now set to 0
      const totalExpenses = 0;

      const activeProjects =
        projectsData?.filter(
          (p) => p.status === "in-progress" || p.status === "pending"
        ).length || 0;

      const totalClients = clientsData?.length || 0;

      setStats({
        totalRevenue,
        pendingIncome,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        activeProjects,
        totalClients,
        monthlyRevenue,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B21A8] mx-auto mb-4"></div>
            <p className="text-[#64748B]">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A] mb-8">Business Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Pending Income</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  ${stats.pendingIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  ${stats.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📉</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Net Profit</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  ${stats.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Active Projects</h3>
            <p className="text-4xl font-bold gradient-text mb-2">
              {stats.activeProjects}
            </p>
            <p className="text-sm text-[#64748B]">Currently in progress</p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Total Clients</h3>
            <p className="text-4xl font-bold gradient-text mb-2">
              {stats.totalClients}
            </p>
            <p className="text-sm text-[#64748B]">Active partnerships</p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Monthly Revenue</h3>
            <p className="text-4xl font-bold gradient-text mb-2">
              ${stats.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-[#64748B]">This month</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
