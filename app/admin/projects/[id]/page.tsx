"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Card from "../../../components/Card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, ChevronDown, X, Save, Plus, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  project_name: string;
  client: string | null;
  clientName?: string;
  description: string;
  type: "once-off" | "partnership";
  status: "pending" | "in-progress" | "complete" | "paused" | "cancelled" | null;
}

interface Milestone {
  id: string;
  project: string;
  name: string;
  description: string;
  "Due date": string;
}

interface Task {
  id: string;
  mileston: string;
  name: string;
  description: string;
  status: "to-do" | "in-progress" | "review" | "done";
  priority: "normal" | "low" | "high";
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientOpen, setClientOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newMilestoneForm, setNewMilestoneForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [newTaskForm, setNewTaskForm] = useState<{
    milestoneId: string;
    title: string;
    description: string;
    status: "to-do" | "in-progress" | "review" | "done";
    priority: "normal" | "low" | "high";
    dueDate: string;
  } | null>(null);

  const [formData, setFormData] = useState<Project>({
    id: id,
    project_name: "",
    client: null,
    clientName: "",
    description: "",
    type: "once-off",
    status: "pending",
  });

  // Fetch project, milestones, tasks, and clients
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch project
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select(`
            id,
            project_name,
            client,
            description,
            type,
            status,
            profiles:client (
              id,
              name,
              email
            )
          `)
          .eq("id", id)
          .single();

        if (projectError) {
          console.error("Error fetching project:", projectError);
          setLoading(false);
          return;
        }

        if (projectData) {
        const clientInfo = projectData.profiles && typeof projectData.profiles === 'object' && !Array.isArray(projectData.profiles) && 'name' in projectData.profiles
          ? (projectData.profiles as { name: string; id: string })
          : null;

          setFormData({
            id: projectData.id,
            project_name: projectData.project_name || "",
            client: projectData.client,
            clientName: clientInfo?.name || "",
            description: projectData.description || "",
            type: projectData.type || "once-off",
            status: projectData.status || "pending",
          });

          // Fetch milestones
          const { data: milestonesData, error: milestonesError } = await supabase
            .from("project_milestones")
            .select("*")
            .eq("project", id)
            .order("created_at", { ascending: false });

          if (!milestonesError && milestonesData) {
            setMilestones(milestonesData);
          }

          // Fetch tasks for all milestones
          if (milestonesData && milestonesData.length > 0) {
            const milestoneIds = milestonesData.map((m) => m.id);
            const { data: tasksData, error: tasksError } = await supabase
              .from("mileston_tasks")
              .select("*")
              .in("mileston", milestoneIds);

            if (!tasksError && tasksData) {
              setTasks(tasksData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .order("name", { ascending: true });

      if (!error && data) {
        setClients(data);
      }
    };

    fetchClients();
  }, []);

  // Filter clients based on search - MUST be called before any conditional returns
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    return clients.filter((client) =>
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [clients, clientSearch]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-[#64748B]">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!formData.project_name && !isEditing) {
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
        <Card>
          <div className="text-center py-12">
            <p className="text-xl font-semibold text-[#0F172A] mb-2">
              Project Not Found
            </p>
            <p className="text-[#64748B] mb-6">
              The project you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button
              onClick={() => router.push("/admin/projects")}
              className="gradient-purple text-white"
            >
              Back to Projects
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Map database status to display format
  const getStatusDisplay = (status: string | null) => {
    if (!status) return "Pending";
    const statusMap: Record<string, string> = {
      complete: "Complete",
      "in-progress": "In Progress",
      pending: "Pending",
      paused: "Paused",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  // Map database type to display format
  const getTypeDisplay = (type: string) => {
    return type === "partnership" ? "Partnership" : "Once Off";
  };

  // Get status badge class
  const getStatusClass = (status: string | null) => {
    if (!status) return "bg-purple-100 text-purple-700 border border-purple-200";
    if (status === "complete") {
      return "bg-green-100 text-green-700 border border-green-200";
    }
    return "bg-purple-100 text-purple-700 border border-purple-200";
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          project_name: formData.project_name,
          client: formData.client || null,
          description: formData.description,
          type: formData.type,
          status: formData.status,
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating project:", error);
        alert("Failed to update project. Please try again.");
        return;
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Please try again.");
    }
  };

  const handleCancel = () => {
    // Reload project data
    const reloadProject = async () => {
      const { data } = await supabase
        .from("projects")
        .select(`
          id,
          project_name,
          client,
          description,
          type,
          status,
          profiles:client (
            id,
            name,
            email
          )
        `)
        .eq("id", id)
        .single();

      if (data) {
        const clientInfo = data.profiles && typeof data.profiles === 'object' && !Array.isArray(data.profiles) && 'name' in data.profiles
          ? (data.profiles as { name: string; id: string })
          : null;

        setFormData({
          id: data.id,
          project_name: data.project_name || "",
          client: data.client,
          clientName: clientInfo?.name || "",
          description: data.description || "",
          type: data.type || "once-off",
          status: data.status || "pending",
        });
      }
    };

    reloadProject();
    setIsEditing(false);
  };

  // Milestone functions
  const addMilestone = async () => {
    if (!newMilestoneForm.title || !newMilestoneForm.dueDate) {
      alert("Please fill in milestone title and due date");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("project_milestones")
        .insert({
          project: id,
          name: newMilestoneForm.title,
          description: newMilestoneForm.description || "",
          "Due date": newMilestoneForm.dueDate,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating milestone:", error);
        alert("Failed to create milestone. Please try again.");
        return;
      }

      if (data) {
        setMilestones([...milestones, data]);
        setAddingMilestone(false);
        setNewMilestoneForm({
          title: "",
          description: "",
          dueDate: "",
        });
      }
    } catch (error) {
      console.error("Error creating milestone:", error);
      alert("Failed to create milestone. Please try again.");
    }
  };

  const updateMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from("project_milestones")
        .update({
          name: newMilestoneForm.title,
          description: newMilestoneForm.description || "",
          "Due date": newMilestoneForm.dueDate,
        })
        .eq("id", milestoneId);

      if (error) {
        console.error("Error updating milestone:", error);
        alert("Failed to update milestone. Please try again.");
        return;
      }

      setMilestones(
        milestones.map((m) =>
          m.id === milestoneId
            ? {
                ...m,
                name: newMilestoneForm.title,
                description: newMilestoneForm.description || "",
                "Due date": newMilestoneForm.dueDate,
              }
            : m
        )
      );
      setEditingMilestone(null);
      setAddingMilestone(false);
      setNewMilestoneForm({
        title: "",
        description: "",
        dueDate: "",
      });
    } catch (error) {
      console.error("Error updating milestone:", error);
      alert("Failed to update milestone. Please try again.");
    }
  };

  const deleteMilestone = async (milestoneId: string) => {
    if (!confirm("Are you sure you want to delete this milestone? All tasks will also be deleted.")) {
      return;
    }

    try {
      // Delete tasks first
      await supabase
        .from("mileston_tasks")
        .delete()
        .eq("mileston", milestoneId);

      // Delete milestone
      const { error } = await supabase
        .from("project_milestones")
        .delete()
        .eq("id", milestoneId);

      if (error) {
        console.error("Error deleting milestone:", error);
        alert("Failed to delete milestone. Please try again.");
        return;
      }

      setMilestones(milestones.filter((m) => m.id !== milestoneId));
      setTasks(tasks.filter((t) => t.mileston !== milestoneId));
    } catch (error) {
      console.error("Error deleting milestone:", error);
      alert("Failed to delete milestone. Please try again.");
    }
  };

  const startEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone.id);
    setNewMilestoneForm({
      title: milestone.name,
      description: milestone.description || "",
      dueDate: milestone["Due date"] ? new Date(milestone["Due date"]).toISOString().split('T')[0] : "",
    });
  };

  // Task functions
  const addTask = async (milestoneId: string) => {
    if (!newTaskForm || !newTaskForm.title) {
      alert("Please fill in task title");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("mileston_tasks")
        .insert({
          mileston: milestoneId,
          name: newTaskForm.title,
          description: newTaskForm.description || "",
          status: newTaskForm.status,
          priority: newTaskForm.priority,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating task:", error);
        alert("Failed to create task. Please try again.");
        return;
      }

      if (data) {
        setTasks([...tasks, data]);
        setNewTaskForm(null);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const updateTask = async (taskId: string) => {
    if (!newTaskForm) return;

    try {
      const { error } = await supabase
        .from("mileston_tasks")
        .update({
          name: newTaskForm.title,
          description: newTaskForm.description || "",
          status: newTaskForm.status,
          priority: newTaskForm.priority,
        })
        .eq("id", taskId);

      if (error) {
        console.error("Error updating task:", error);
        alert("Failed to update task. Please try again.");
        return;
      }

      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                name: newTaskForm.title,
                description: newTaskForm.description || "",
                status: newTaskForm.status,
                priority: newTaskForm.priority,
              }
            : t
        )
      );
      setEditingTask(null);
      setNewTaskForm(null);
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("mileston_tasks")
        .delete()
        .eq("id", taskId);

      if (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task. Please try again.");
        return;
      }

      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  const startEditTask = (task: Task) => {
    setEditingTask(task.id);
    setNewTaskForm({
      milestoneId: task.mileston,
      title: task.name,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: "",
    });
  };

  const getTasksForMilestone = (milestoneId: string) => {
    return tasks.filter((t) => t.mileston === milestoneId);
  };

  // Map task status to display format
  const getTaskStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      "to-do": "Todo",
      "in-progress": "In Progress",
      review: "Review",
      done: "Done",
    };
    return statusMap[status] || status;
  };

  // Map task priority to display format
  const getTaskPriorityDisplay = (priority: string) => {
    const priorityMap: Record<string, string> = {
      normal: "Medium",
      low: "Low",
      high: "High",
    };
    return priorityMap[priority] || priority;
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

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            {isEditing ? "Edit Project" : formData.project_name}
          </h1>
          {!isEditing && (
            <p className="text-[#64748B]">Project Details</p>
          )}
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="gradient-purple text-white"
          >
            Edit Project
          </Button>
        )}
      </div>

      <Card className="max-w-3xl">
        {isEditing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
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
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData({ ...formData, project_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                />
              </div>

              {/* Client Selection */}
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
                      {formData.client && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, client: null, clientName: "" });
                            setClientOpen(false);
                            setClientSearch("");
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 text-sm font-medium mb-1"
                        >
                          Clear Selection
                        </button>
                      )}
                      <div className="max-h-[200px] overflow-y-auto">
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
                                setFormData({ ...formData, client: client.id, clientName: client.name });
                                setClientOpen(false);
                                setClientSearch("");
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors",
                                formData.client === client.id && "bg-purple-50"
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
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "once-off" | "partnership",
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
                  value={formData.status || "pending"}
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
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gradient-purple text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Client</p>
                <p className="text-lg font-semibold text-[#0F172A]">
                  {formData.clientName || "No client assigned"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#64748B] mb-1">Project Type</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    formData.type === "partnership"
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}
                >
                  {getTypeDisplay(formData.type)}
                </span>
              </div>
              <div>
                <p className="text-sm text-[#64748B] mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusClass(formData.status)}`}
                >
                  {getStatusDisplay(formData.status)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-[#64748B] mb-2">Description</p>
              <p className="text-base text-[#0F172A]">{formData.description || "No description"}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Milestones and Tasks Section */}
      {!isEditing && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#0F172A]">Milestones & Tasks</h2>
            <Button
              onClick={() => {
                setAddingMilestone(true);
                setNewMilestoneForm({
                  title: "",
                  description: "",
                  dueDate: "",
                });
                setEditingMilestone(null);
              }}
              className="gradient-purple text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </div>

          {/* Add/Edit Milestone Form */}
          {(editingMilestone || addingMilestone) && (
            <Card className="mb-6">
              <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
                {editingMilestone ? "Edit Milestone" : "New Milestone"}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0F172A]">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newMilestoneForm.title}
                      onChange={(e) =>
                        setNewMilestoneForm({ ...newMilestoneForm, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                      placeholder="Milestone title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0F172A]">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={newMilestoneForm.dueDate}
                      onChange={(e) =>
                        setNewMilestoneForm({ ...newMilestoneForm, dueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0F172A]">
                    Description
                  </label>
                  <textarea
                    value={newMilestoneForm.description}
                    onChange={(e) =>
                      setNewMilestoneForm({ ...newMilestoneForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Milestone description"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      if (editingMilestone) {
                        updateMilestone(editingMilestone);
                      } else {
                        addMilestone();
                      }
                    }}
                    className="gradient-purple text-white"
                  >
                    {editingMilestone ? "Update Milestone" : "Add Milestone"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingMilestone(null);
                      setAddingMilestone(false);
                      setNewMilestoneForm({
                        title: "",
                        description: "",
                        dueDate: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Milestones List */}
          <div className="space-y-6">
            {milestones.map((milestone) => (
              <Card key={milestone.id} className="border-l-4 border-l-purple-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-[#0F172A]">
                        {milestone.name}
                      </h3>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-[#64748B] mb-2">
                        {milestone.description}
                      </p>
                    )}
                    {milestone["Due date"] && (
                      <p className="text-xs text-[#64748B]">
                        Due: {new Date(milestone["Due date"]).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => startEditMilestone(milestone)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteMilestone(milestone.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Tasks for this milestone */}
                <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-[#0F172A]">Tasks</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewTaskForm({
                          milestoneId: milestone.id,
                          title: "",
                          description: "",
                          status: "to-do",
                          priority: "normal",
                          dueDate: "",
                        });
                        setEditingTask(null);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Task
                    </Button>
                  </div>

                  {/* Add/Edit Task Form */}
                  {newTaskForm && newTaskForm.milestoneId === milestone.id && (
                    <Card className="mb-4 bg-[#FAFAFA]">
                      <h5 className="text-sm font-semibold text-[#0F172A] mb-3">
                        {editingTask ? "Edit Task" : "New Task"}
                      </h5>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-[#0F172A]">
                              Title *
                            </label>
                            <input
                              type="text"
                              value={newTaskForm.title}
                              onChange={(e) =>
                                setNewTaskForm({ ...newTaskForm, title: e.target.value })
                              }
                              className="w-full px-2 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                              placeholder="Task title"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[#0F172A]">
                            Description
                          </label>
                          <textarea
                            value={newTaskForm.description}
                            onChange={(e) =>
                              setNewTaskForm({ ...newTaskForm, description: e.target.value })
                            }
                            className="w-full px-2 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent resize-none"
                            rows={2}
                            placeholder="Task description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-[#0F172A]">
                              Status
                            </label>
                            <select
                              value={newTaskForm.status}
                              onChange={(e) =>
                                setNewTaskForm({
                                  ...newTaskForm,
                                  status: e.target.value as "to-do" | "in-progress" | "review" | "done",
                                })
                              }
                              className="w-full px-2 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                            >
                              <option value="to-do">Todo</option>
                              <option value="in-progress">In Progress</option>
                              <option value="review">Review</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-[#0F172A]">
                              Priority
                            </label>
                            <select
                              value={newTaskForm.priority}
                              onChange={(e) =>
                                setNewTaskForm({
                                  ...newTaskForm,
                                  priority: e.target.value as "normal" | "low" | "high",
                                })
                              }
                              className="w-full px-2 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                            >
                              <option value="normal">Normal</option>
                              <option value="low">Low</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              if (editingTask) {
                                updateTask(editingTask);
                              } else {
                                addTask(milestone.id);
                              }
                            }}
                            className="gradient-purple text-white"
                          >
                            {editingTask ? "Update Task" : "Add Task"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewTaskForm(null);
                              setEditingTask(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Tasks List */}
                  <div className="space-y-2">
                    {getTasksForMilestone(milestone.id).length === 0 ? (
                      <p className="text-sm text-[#64748B] py-2">No tasks yet</p>
                    ) : (
                      getTasksForMilestone(milestone.id).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E7EB]"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-[#0F172A]">{task.name}</h5>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  task.status === "done"
                                    ? "bg-green-100 text-green-700"
                                    : task.status === "in-progress"
                                    ? "bg-blue-100 text-blue-700"
                                    : task.status === "review"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {getTaskStatusDisplay(task.status)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  task.priority === "high"
                                    ? "bg-red-100 text-red-700"
                                    : task.priority === "normal"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {getTaskPriorityDisplay(task.priority)}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-xs text-[#64748B] mb-1">{task.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => startEditTask(task)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => deleteTask(task.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {milestones.length === 0 && (
              <Card>
                <p className="text-center text-[#64748B] py-8">
                  No milestones yet. Click &quot;Add Milestone&quot; to get started.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
