"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../../../components/Card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  project_name: string;
  description: string;
  type: "once-off" | "partnership";
  status: "pending" | "in-progress" | "complete" | "paused" | "cancelled" | null;
  created_at: string;
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
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/auth/login");
        return;
      }

      // Get user profile to verify ownership
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        setError("Failed to load profile");
        setLoading(false);
        return;
      }

      // Fetch project and verify it belongs to this client
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("client", profile.id)
        .single();

      if (projectError || !projectData) {
        setError("Project not found or you don&apos;t have access to it");
        setLoading(false);
        return;
      }

      setProject(projectData);

      // Fetch milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from("project_milestones")
        .select("*")
        .eq("project", id)
        .order("created_at", { ascending: false });

      if (!milestonesError && milestonesData) {
        setMilestones(milestonesData);

        // Fetch tasks for all milestones
        if (milestonesData.length > 0) {
          const milestoneIds = milestonesData.map((m) => m.id);
          const { data: tasksData, error: tasksError } = await supabase
            .from("mileston_tasks")
            .select("*")
            .in("mileston", milestoneIds)
            .order("created_at", { ascending: false });

          if (!tasksError && tasksData) {
            setTasks(tasksData);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching project data:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

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
    if (status === "in-progress") {
      return "bg-blue-100 text-blue-700 border border-blue-200";
    }
    if (status === "paused") {
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    }
    return "bg-purple-100 text-purple-700 border border-purple-200";
  };

  // Get task status badge class
  const getTaskStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      done: "bg-green-100 text-green-700 border border-green-200",
      "in-progress": "bg-blue-100 text-blue-700 border border-blue-200",
      review: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      "to-do": "bg-gray-100 text-gray-700 border border-gray-200",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700 border border-gray-200";
  };

  // Get priority badge class
  const getPriorityClass = (priority: string) => {
    const priorityMap: Record<string, string> = {
      high: "bg-red-100 text-red-700 border border-red-200",
      normal: "bg-blue-100 text-blue-700 border border-blue-200",
      low: "bg-gray-100 text-gray-700 border border-gray-200",
    };
    return priorityMap[priority] || "bg-gray-100 text-gray-700 border border-gray-200";
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B21A8] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Projects</span>
          </Link>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-xl font-semibold text-[#0F172A] mb-2">
              {error || "Project Not Found"}
            </p>
            <p className="text-[#64748B] mb-6">
              {error || "The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it."}
            </p>
            <Link
              href="/dashboard/projects"
              className="inline-block px-6 py-2 bg-[#6B21A8] text-white rounded-lg hover:bg-[#7C3AED]"
            >
              Back to Projects
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
          <div className="mb-6">
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Projects</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
              {project.project_name}
            </h1>
            <p className="text-[#64748B]">Project Details</p>
          </div>

          <Card className="max-w-3xl mb-8">
            <div className="space-y-6">
              {/* Project Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Project Type</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      project.type === "partnership"
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {getTypeDisplay(project.type)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusClass(project.status)}`}
                  >
                    {getStatusDisplay(project.status)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-[#64748B] mb-2">Description</p>
                <p className="text-base text-[#0F172A]">
                  {project.description || "No description"}
                </p>
              </div>
            </div>
          </Card>

          {/* Milestones and Tasks Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6">
              Milestones & Tasks
            </h2>

            {milestones.length === 0 ? (
              <Card>
                <p className="text-[#64748B] text-center py-8">
                  No milestones yet. Milestones will appear here once they are created.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {milestones.map((milestone) => {
                  const milestoneTasks = tasks.filter(
                    (task) => task.mileston === milestone.id
                  );
                  const completedTasks = milestoneTasks.filter(
                    (task) => task.status === "done"
                  ).length;
                  const progress =
                    milestoneTasks.length > 0
                      ? Math.round((completedTasks / milestoneTasks.length) * 100)
                      : 0;

                  return (
                    <Card key={milestone.id} className="border-l-4 border-l-purple-500">
                      <div className="mb-4">
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
                          <p className="text-xs text-[#64748B] mb-3">
                            Due: {new Date(milestone["Due date"]).toLocaleDateString()}
                          </p>
                        )}
                        {milestoneTasks.length > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm font-semibold text-[#64748B] mb-2">
                              <span>Progress</span>
                              <span className="text-[#6B21A8]">{progress}%</span>
                            </div>
                            <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-[#6B21A8] to-[#9333EA] h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tasks for this milestone */}
                      {milestoneTasks.length > 0 ? (
                        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                          <h4 className="text-sm font-semibold text-[#0F172A] mb-3">
                            Tasks ({completedTasks}/{milestoneTasks.length})
                          </h4>
                          <div className="space-y-2">
                            {milestoneTasks.map((task) => (
                              <div
                                key={task.id}
                                className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E7EB]"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium text-[#0F172A]">
                                        {task.name}
                                      </p>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTaskStatusClass(
                                          task.status
                                        )}`}
                                      >
                                        {task.status.replace("-", " ").toUpperCase()}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityClass(
                                          task.priority
                                        )}`}
                                      >
                                        {task.priority.toUpperCase()}
                                      </span>
                                    </div>
                                    {task.description && (
                                      <p className="text-sm text-[#64748B]">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                          <p className="text-sm text-[#64748B]">
                            No tasks for this milestone yet.
                          </p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
    </div>
  );
}
