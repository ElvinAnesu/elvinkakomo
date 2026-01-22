"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "../../../components/Card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Client {
  id: string;
  name: string;
  email: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [clientOpen, setClientOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    clientName: "",
    description: "",
    status: "pending" as "pending" | "in-progress" | "complete" | "paused" | "cancelled",
    projectType: "once-off" as "once-off" | "partnership",
  });

  // Fetch clients from Supabase
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching clients:", error);
      } else {
        setClients(data || []);
      }
    };

    fetchClients();
  }, []);

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    return clients.filter((client) =>
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [clients, clientSearch]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Save project to Supabase
      const { data, error } = await supabase
        .from("projects")
        .insert({
          project_name: formData.name,
          client: formData.clientId || null,
          description: formData.description,
          type: formData.projectType,
          status: formData.status,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating project:", error);
        alert("Failed to create project. Please try again.");
        setLoading(false);
        return;
      }

      // Navigate to the project detail page
      router.push(`/admin/projects/${data.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Projects</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Create New Project</h1>
        <p className="text-[#64748B]">Fill in the details to create a new project</p>
      </div>

      <Card className="max-w-3xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-[#0F172A]"
              >
                Project Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                placeholder="Enter project name"
              />
            </div>

            {/* Client Selection - Combobox */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0F172A]">
                Client
              </label>
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent",
                      !formData.clientName && "text-[#64748B]"
                    )}
                  >
                    <span>{formData.clientName || "Select a client"}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent mb-2"
                    />
                    <div className="max-h-[200px] overflow-y-auto">
                      {formData.clientId && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ 
                              ...formData, 
                              clientId: "",
                              clientName: ""
                            });
                            setClientOpen(false);
                            setClientSearch("");
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 text-sm font-medium mb-1"
                        >
                          Clear Selection
                        </button>
                      )}
                      {filteredClients.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-[#64748B]">
                          No clients found
                        </div>
                      ) : (
                        filteredClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setFormData({ 
                                ...formData, 
                                clientId: client.id,
                                clientName: client.name
                              });
                              setClientOpen(false);
                              setClientSearch("");
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors",
                              formData.clientId === client.id && "bg-purple-50"
                            )}
                          >
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-[#64748B]">{client.email}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Project Type */}
            <div className="space-y-2">
              <label
                htmlFor="projectType"
                className="text-sm font-medium text-[#0F172A]"
              >
                Project Type *
              </label>
              <select
                id="projectType"
                required
                value={formData.projectType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    projectType: e.target.value as "once-off" | "partnership",
                  })
                }
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
              >
                <option value="once-off">Once Off</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-[#0F172A]"
              >
                Description *
              </label>
              <textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent resize-none"
                rows={4}
                placeholder="Enter project description"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label
                htmlFor="status"
                className="text-sm font-medium text-[#0F172A]"
              >
                Status *
              </label>
              <select
                id="status"
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "pending" | "in-progress" | "complete" | "paused" | "cancelled",
                  })
                }
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="complete">Complete</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/projects")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 gradient-purple text-white"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
