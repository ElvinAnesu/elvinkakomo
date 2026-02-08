"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/Card";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() { 

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingIncome, setPendingIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  const getRevenue = useCallback(async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("amount")
    setTotalRevenue(data?.reduce((sum, payment) => sum + payment.amount, 0) || 0);
  }, []);

  const getPendingIncome = useCallback(async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("amount_due")
      .eq("is_paid", false);
      setPendingIncome(data?.reduce((sum, invoice) => sum + invoice.amount_due, 0) || 0);
  }, []);

  const getTotalExpenses = useCallback(async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("amount")
    setTotalExpenses(data?.reduce((sum, expense) => sum + expense.amount, 0) || 0);
  }, []);

  const getActiveProjects = useCallback(async () => {
    //count all projects with status of in-progress
    const { count, error } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "in-progress")

    setActiveProjects(count || 0);
  }, []);

  const getTotalClients = useCallback(async () => {
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "client")
    setTotalClients(count || 0);
  }, []);

  const getMonthlyRevenue = useCallback(async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("amount")
      .gte("payment_date", new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
          0, 0, 0, 0
        ).toISOString())
    setMonthlyRevenue(data?.reduce((sum, payment) => sum + payment.amount, 0) || 0);
  }, []);

  useEffect(() => {
    getRevenue();
    getPendingIncome();
    getTotalExpenses();
    getActiveProjects();
    getTotalClients();
    getMonthlyRevenue();
    setLoading(false);
  }, [getRevenue, getPendingIncome, getTotalExpenses, getActiveProjects, getTotalClients, getMonthlyRevenue]);

  
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
                  ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  ${pendingIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  ${(totalRevenue - totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              {activeProjects}
            </p>
            <p className="text-sm text-[#64748B]">Currently in progress</p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Total Clients</h3>
            <p className="text-4xl font-bold gradient-text mb-2">
              {totalClients}
            </p>
            <p className="text-sm text-[#64748B]">Active partnerships</p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Monthly Revenue</h3>
            <p className="text-4xl font-bold gradient-text mb-2">
              ${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-[#64748B]">This month</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
