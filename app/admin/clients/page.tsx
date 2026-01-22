"use client";

import { useState, useEffect } from "react";
import Card from "../../components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Client {
  id: string;
  name: string;
  email: string;
  projectCount: number;
  totalRevenue: number;
  pendingInvoices: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [successDialog, setSuccessDialog] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; client: string | null }>({ open: false, client: null });
  const [deactivateDialog, setDeactivateDialog] = useState<{ open: boolean; client: string | null }>({ open: false, client: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; client: string | null }>({ open: false, client: null });

  // Fetch clients from Supabase
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        // Fetch all clients (profiles with role = 'client')
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .eq("role", "client")
          .order("name", { ascending: true });

        if (profilesError) {
          console.error("Error fetching clients:", profilesError);
          setLoading(false);
          return;
        }

        if (!profilesData || profilesData.length === 0) {
          setClients([]);
          setLoading(false);
          return;
        }

        // Fetch projects for all clients
        const clientIds = profilesData.map((p) => p.id);
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("id, client")
          .in("client", clientIds);

        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
        }

        // Fetch invoices for all clients
        const { data: invoicesData, error: invoicesError } = await supabase
          .from("invoices")
          .select(`
            id,
            client,
            is_paid,
            invoice_items (
              total
            )
          `)
          .in("client", clientIds);

        if (invoicesError) {
          console.error("Error fetching invoices:", invoicesError);
        }

        // Process data to calculate stats for each client
        const clientsWithStats: Client[] = profilesData.map((profile) => {
          // Count projects for this client
          const projectCount = projectsData?.filter((p) => p.client === profile.id).length || 0;

          // Calculate total revenue (sum of paid invoices)
          const paidInvoices = invoicesData?.filter(
            (inv) => inv.client === profile.id && inv.is_paid
          ) || [];
          const totalRevenue = paidInvoices.reduce((sum, inv) => {
            const items = inv.invoice_items as { total: number }[] | null;
            if (items && Array.isArray(items)) {
              return sum + items.reduce((itemSum, item) => {
                return itemSum + parseFloat(item.total?.toString() || "0");
              }, 0);
            }
            return sum;
          }, 0);

          // Calculate pending invoices (sum of unpaid invoices)
          const unpaidInvoices = invoicesData?.filter(
            (inv) => inv.client === profile.id && !inv.is_paid
          ) || [];
          const pendingInvoices = unpaidInvoices.reduce((sum, inv) => {
            const items = inv.invoice_items as { total: number }[] | null;
            if (items && Array.isArray(items)) {
              return sum + items.reduce((itemSum, item) => {
                return itemSum + parseFloat(item.total?.toString() || "0");
              }, 0);
            }
            return sum;
          }, 0);

          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            projectCount,
            totalRevenue,
            pendingInvoices,
          };
        });

        setClients(clientsWithStats);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleInvite = async () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      setErrorDialog({ open: true, message: "Please fill in both name and email" });
      return;
    }

    setInviting(true);

    try {
      const response = await fetch("/api/invite-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: clientName.trim(),
          email: clientEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorDialog({ open: true, message: data.error || "Failed to invite client. Please try again." });
        setInviting(false);
        return;
      }

      setSuccessDialog({ open: true, message: "Invitation sent successfully! The client will receive an email to set their password." });
      setDialogOpen(false);
      setClientName("");
      setClientEmail("");
      setInviting(false);
      
      // Refresh the clients list
      const fetchClients = async () => {
        try {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name, email")
            .eq("role", "client")
            .order("name", { ascending: true });

          if (profilesError) {
            console.error("Error fetching clients:", profilesError);
            return;
          }

          if (!profilesData || profilesData.length === 0) {
            setClients([]);
            return;
          }

          const clientIds = profilesData.map((p) => p.id);
          const { data: projectsData } = await supabase
            .from("projects")
            .select("id, client")
            .in("client", clientIds);

          const { data: invoicesData } = await supabase
            .from("invoices")
            .select(`
              id,
              client,
              is_paid,
              invoice_items (
                total
              )
            `)
            .in("client", clientIds);

          const clientsWithStats: Client[] = profilesData.map((profile) => {
            const projectCount = projectsData?.filter((p) => p.client === profile.id).length || 0;
            const paidInvoices = invoicesData?.filter(
              (inv) => inv.client === profile.id && inv.is_paid
            ) || [];
            const totalRevenue = paidInvoices.reduce((sum, inv) => {
              const items = inv.invoice_items as { total: number }[] | null;
              if (items && Array.isArray(items)) {
                return sum + items.reduce((itemSum, item) => {
                  return itemSum + parseFloat(item.total?.toString() || "0");
                }, 0);
              }
              return sum;
            }, 0);
            const unpaidInvoices = invoicesData?.filter(
              (inv) => inv.client === profile.id && !inv.is_paid
            ) || [];
            const pendingInvoices = unpaidInvoices.reduce((sum, inv) => {
              const items = inv.invoice_items as { total: number }[] | null;
              if (items && Array.isArray(items)) {
                return sum + items.reduce((itemSum, item) => {
                  return itemSum + parseFloat(item.total?.toString() || "0");
                }, 0);
              }
              return sum;
            }, 0);

            return {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              projectCount,
              totalRevenue,
              pendingInvoices,
            };
          });

          setClients(clientsWithStats);
        } catch (error) {
          console.error("Error refreshing clients:", error);
        }
      };

      fetchClients();
    } catch (error) {
      console.error("Error inviting client:", error);
      setErrorDialog({ open: true, message: "Failed to invite client. Please try again." });
      setInviting(false);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setClientName("");
    setClientEmail("");
  };

  const handleResetPassword = () => {
    // Not implemented - keeping dialog structure but not functional
    setResetPasswordDialog({ open: false, client: null });
    setOpenPopover(null);
  };

  const handleDeactivate = () => {
    // Not implemented - keeping dialog structure but not functional
    setDeactivateDialog({ open: false, client: null });
    setOpenPopover(null);
  };

  const handleDelete = () => {
    // Not implemented - keeping dialog structure but not functional
    setDeleteDialog({ open: false, client: null });
    setOpenPopover(null);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-[#64748B]">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">Clients</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <button 
              onClick={() => setDialogOpen(true)}
              className="px-5 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold"
            >
              + Invite Client
            </button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Client</DialogTitle>
                <DialogDescription>
                  Enter the client&apos;s name and email address to send them an invitation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="client-name" className="text-sm font-medium text-[#0F172A]">
                    Client Name
                  </label>
                  <input
                    id="client-name"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client name"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="client-email" className="text-sm font-medium text-[#0F172A]">
                    Email Address
                  </label>
                  <input
                    id="client-email"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                  />
                </div>
              </div>
              <DialogFooter>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-white text-[#64748B] border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#FAFAFA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={inviting}
                  className="px-4 py-2 gradient-purple text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviting ? "Inviting..." : "Invite"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
                <TableHead className="text-right">Pending Invoices</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#64748B]">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client, idx) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-bold text-[#0F172A]">
                      {client.name}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-[#0F172A]">
                        {client.projectCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-green-600">
                        ${client.totalRevenue.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${client.pendingInvoices > 0 ? "text-yellow-600" : "text-[#64748B]"}`}>
                        ${client.pendingInvoices.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Popover open={openPopover === `client-${idx}`} onOpenChange={(open) => setOpenPopover(open ? `client-${idx}` : null)}>
                        <PopoverTrigger asChild>
                          <button className="p-2 hover:bg-[#FAFAFA] rounded-lg transition-colors">
                            <MoreVertical className="h-5 w-5 text-[#64748B]" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-0" align="end">
                          <div className="py-1">
                            <Link
                              href={`/admin/clients/${client.id}`}
                              onClick={() => setOpenPopover(null)}
                              className="block w-full px-4 py-2 text-left text-sm text-[#0F172A] hover:bg-[#FAFAFA] transition-colors"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => {
                                setOpenPopover(null);
                                setResetPasswordDialog({ open: true, client: client.name });
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-[#0F172A] hover:bg-[#FAFAFA] transition-colors opacity-50 cursor-not-allowed"
                              disabled
                            >
                              Send Reset Password
                            </button>
                            <button
                              onClick={() => {
                                setOpenPopover(null);
                                setDeactivateDialog({ open: true, client: client.name });
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-[#0F172A] hover:bg-[#FAFAFA] transition-colors opacity-50 cursor-not-allowed"
                              disabled
                            >
                              Deactivate Account
                            </button>
                            <button
                              onClick={() => {
                                setOpenPopover(null);
                                setDeleteDialog({ open: true, client: client.name });
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors opacity-50 cursor-not-allowed"
                              disabled
                            >
                              Delete Account
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Reset Password Confirmation Dialog */}
        <AlertDialog open={resetPasswordDialog.open} onOpenChange={(open) => setResetPasswordDialog({ open, client: resetPasswordDialog.client })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Send Reset Password</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to send a password reset email to {resetPasswordDialog.client}? They will receive an email with instructions to reset their password.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setResetPasswordDialog({ open: false, client: null })}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetPassword}
                className="gradient-purple text-white hover:opacity-90"
              >
                Send Reset Password
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Deactivate Account Confirmation Dialog */}
        <AlertDialog open={deactivateDialog.open} onOpenChange={(open) => setDeactivateDialog({ open, client: deactivateDialog.client })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to deactivate the account for {deactivateDialog.client}? They will no longer be able to access the system. You can reactivate their account later if needed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeactivateDialog({ open: false, client: null })}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeactivate}
                className="gradient-purple text-white hover:opacity-90"
              >
                Deactivate Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Account Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, client: deleteDialog.client })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the account for {deleteDialog.client}? This action cannot be undone. All client data and associated projects will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, client: null })}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ open, message: "" })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>
                {errorDialog.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => setErrorDialog({ open: false, message: "" })}
                className="gradient-purple text-white hover:opacity-90"
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Success Dialog */}
        <AlertDialog open={successDialog.open} onOpenChange={(open) => setSuccessDialog({ open, message: "" })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Success</AlertDialogTitle>
              <AlertDialogDescription>
                {successDialog.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => setSuccessDialog({ open: false, message: "" })}
                className="gradient-purple text-white hover:opacity-90"
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
