"use client";

import { use, useState, useEffect } from "react";
import Card from "../../../components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Project {
  id: string;
  project_name: string;
  status: string | null;
}

export default function ClientDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [ongoingProjects, setOngoingProjects] = useState(0);

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      try {
        // Fetch client profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .eq("id", id)
          .eq("role", "client")
          .single();

        if (profileError || !profileData) {
          console.error("Error fetching client:", profileError);
          setLoading(false);
          return;
        }

        setClientName(profileData.name);
        setClientEmail(profileData.email);

        // Fetch projects for this client
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("id, project_name, status")
          .eq("client", id)
          .order("created_at", { ascending: false });

        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
        } else {
          setProjects(projectsData || []);
          setProjectCount(projectsData?.length || 0);
          setCompletedProjects(projectsData?.filter((p) => p.status === "complete").length || 0);
          setOngoingProjects(projectsData?.filter((p) => p.status === "in-progress").length || 0);
        }

        // Fetch invoices for this client
        const { data: invoicesData, error: invoicesError } = await supabase
          .from("invoices")
          .select(`
            id,
            is_paid,
            invoice_items (
              total
            )
          `)
          .eq("client", id);

        if (invoicesError) {
          console.error("Error fetching invoices:", invoicesError);
        } else {
          // Calculate total revenue (paid invoices)
          const paidInvoices = invoicesData?.filter((inv) => inv.is_paid) || [];
          const revenue = paidInvoices.reduce((sum, inv) => {
            const items = inv.invoice_items as { total: number }[] | null;
            if (items && Array.isArray(items)) {
              return sum + items.reduce((itemSum, item) => {
                return itemSum + parseFloat(item.total?.toString() || "0");
              }, 0);
            }
            return sum;
          }, 0);
          setTotalRevenue(revenue);

          // Calculate pending payments (unpaid invoices)
          const unpaidInvoices = invoicesData?.filter((inv) => !inv.is_paid) || [];
          const pending = unpaidInvoices.reduce((sum, inv) => {
            const items = inv.invoice_items as { total: number }[] | null;
            if (items && Array.isArray(items)) {
              return sum + items.reduce((itemSum, item) => {
                return itemSum + parseFloat(item.total?.toString() || "0");
              }, 0);
            }
            return sum;
          }, 0);
          setPendingPayments(pending);
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-[#64748B]">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!clientName) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link
            href="/admin/clients"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Clients</span>
          </Link>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-xl font-semibold text-[#0F172A] mb-2">
              Client Not Found
            </p>
            <p className="text-[#64748B]">
              The client you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const getStatusDisplay = (status: string | null) => {
    if (!status) return "Pending";
    const statusMap: Record<string, string> = {
      complete: "Completed",
      "in-progress": "Ongoing",
      pending: "Pending",
      paused: "Paused",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string | null) => {
    if (!status) return "bg-purple-100 text-purple-700 border border-purple-200";
    if (status === "complete") {
      return "bg-green-100 text-green-700 border border-green-200";
    }
    return "bg-purple-100 text-purple-700 border border-purple-200";
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Clients</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">{clientName}</h1>
        <p className="text-[#64748B]">{clientEmail}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Total Projects</p>
              <p className="text-2xl font-bold text-[#0F172A]">
                {projectCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {completedProjects}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Ongoing</p>
              <p className="text-2xl font-bold text-purple-600">
                {ongoingProjects}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Payments Card */}
      {pendingPayments > 0 && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${pendingPayments.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </Card>
      )}

      {/* Projects Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Projects</h2>
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-[#64748B]">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-semibold text-[#0F172A]">
                      {project.project_name}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusClass(project.status)}`}
                      >
                        {getStatusDisplay(project.status)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Financial Summary */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-[#64748B]">From completed transactions</p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Pending Payments</h3>
            <p className={`text-3xl font-bold mb-2 ${pendingPayments > 0 ? "text-yellow-600" : "text-[#64748B]"}`}>
              ${pendingPayments.toLocaleString()}
            </p>
            <p className="text-sm text-[#64748B]">Awaiting payment</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
