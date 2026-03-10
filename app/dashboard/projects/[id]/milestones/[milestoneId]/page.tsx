"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Card from "../../../../../components/Card";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ id: string; milestoneId: string }>;
}

interface Project {
  id: string;
  project_name: string;
  description: string;
}

interface Milestone {
  id: string;
  project: string;
  name: string;
  description: string;
  "Due date": string;
}

type TaskStatus = "to-do" | "in-progress" | "review" | "done";
type TaskPriority = "normal" | "low" | "high";

interface Task {
  id: string;
  mileston: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
}

const STATUS_COLUMNS: { key: TaskStatus; label: string; dotClass: string }[] = [
  { key: "to-do", label: "To Do", dotClass: "bg-gray-400" },
  { key: "in-progress", label: "In Progress", dotClass: "bg-blue-500" },
  { key: "review", label: "Review", dotClass: "bg-yellow-500" },
  { key: "done", label: "Done", dotClass: "bg-green-500" },
];

const getPriorityClass = (priority: TaskPriority): string => {
  if (priority === "high") return "bg-red-100 text-red-700 border border-red-200";
  if (priority === "normal") return "bg-blue-100 text-blue-700 border border-blue-200";
  return "bg-gray-100 text-gray-700 border border-gray-200";
};

const getPriorityLabel = (priority: TaskPriority): string => {
  if (priority === "high") return "High";
  if (priority === "normal") return "Medium";
  return "Low";
};

export default function MilestoneDetailsPage({ params }: PageProps) {
  const { id, milestoneId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMilestoneDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/auth/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          setError("Failed to load profile");
          setLoading(false);
          return;
        }

        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("id, project_name, description")
          .eq("id", id)
          .eq("client", profile.id)
          .single();

        if (projectError || !projectData) {
          setError("Project not found or access denied");
          setLoading(false);
          return;
        }

        const { data: milestoneData, error: milestoneError } = await supabase
          .from("project_milestones")
          .select("*")
          .eq("id", milestoneId)
          .eq("project", id)
          .single();

        if (milestoneError || !milestoneData) {
          setError("Milestone not found");
          setLoading(false);
          return;
        }

        const { data: tasksData, error: tasksError } = await supabase
          .from("mileston_tasks")
          .select("id, mileston, name, description, status, priority")
          .eq("mileston", milestoneId)
          .order("created_at", { ascending: true });

        if (tasksError) {
          setError("Failed to load milestone tasks");
          setLoading(false);
          return;
        }

        setProject(projectData);
        setMilestone(milestoneData);
        setTasks(tasksData || []);
      } catch (fetchError) {
        console.error("Error loading milestone details:", fetchError);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMilestoneDetails();
  }, [id, milestoneId, router]);

  const tasksByStatus = useMemo(() => {
    return STATUS_COLUMNS.reduce<Record<TaskStatus, Task[]>>(
      (acc, column) => {
        acc[column.key] = tasks.filter((task) => task.status === column.key);
        return acc;
      },
      {
        "to-do": [],
        "in-progress": [],
        review: [],
        done: [],
      }
    );
  }, [tasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const previousTasks = tasks;
    setUpdatingTaskId(taskId);
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
            }
          : task
      )
    );

    try {
      const { error: updateError } = await supabase
        .from("mileston_tasks")
        .update({ status: newStatus })
        .eq("id", taskId)
        .eq("mileston", milestoneId);

      if (updateError) {
        setTasks(previousTasks);
      }
    } catch (updateError) {
      console.error("Error updating task status:", updateError);
      setTasks(previousTasks);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B21A8] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading milestone details...</p>
        </div>
      </div>
    );
  }

  if (error || !project || !milestone) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link
            href={`/dashboard/projects/${id}`}
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Project</span>
          </Link>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-xl font-semibold text-[#0F172A] mb-2">
              {error || "Milestone Not Found"}
            </p>
            <p className="text-[#64748B] mb-6">
              The milestone you requested could not be loaded.
            </p>
            <Link
              href={`/dashboard/projects/${id}`}
              className="inline-block px-6 py-2 bg-[#6B21A8] text-white rounded-lg hover:bg-[#7C3AED]"
            >
              Back to Project
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const completedTasks = tasksByStatus.done.length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${id}`}
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Project</span>
        </Link>
      </div>

      <div className="mb-8">
        <p className="text-sm text-[#64748B] mb-2">{project.project_name}</p>
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">{milestone.name}</h1>
        {milestone.description && (
          <p className="text-[#64748B] mb-3">{milestone.description}</p>
        )}
        {milestone["Due date"] && (
          <p className="text-sm text-[#64748B]">
            Due: {new Date(milestone["Due date"]).toLocaleDateString()}
          </p>
        )}
      </div>

      <Card className="mb-8">
        <div className="flex justify-between text-sm font-semibold text-[#64748B] mb-2">
          <span>Milestone Progress</span>
          <span className="text-[#6B21A8]">
            {completedTasks}/{tasks.length} tasks completed ({progress}%)
          </span>
        </div>
        <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#6B21A8] to-[#9333EA] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {STATUS_COLUMNS.map((column) => (
          <Card key={column.key} className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#FAFAFA]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${column.dotClass}`} />
                  <h2 className="text-sm font-semibold text-[#0F172A]">{column.label}</h2>
                </div>
                <span className="text-xs font-semibold text-[#64748B]">
                  {tasksByStatus[column.key].length}
                </span>
              </div>
            </div>

            <div className="p-3 space-y-3 min-h-[220px]">
              {tasksByStatus[column.key].length === 0 ? (
                <div className="text-xs text-[#94A3B8] border border-dashed border-[#CBD5E1] rounded-lg p-3">
                  No tasks in this column
                </div>
              ) : (
                tasksByStatus[column.key].map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-[#0F172A] leading-tight">
                        {task.name}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getPriorityClass(task.priority)}`}
                      >
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#64748B] mb-3">{task.description}</p>
                    )}

                    <label className="block text-[10px] font-semibold text-[#64748B] uppercase tracking-wide mb-1">
                      Move Task
                    </label>
                    <select
                      value={task.status}
                      onChange={(event) =>
                        handleStatusChange(task.id, event.target.value as TaskStatus)
                      }
                      disabled={updatingTaskId === task.id}
                      className="w-full px-2 py-1.5 text-xs border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent bg-white disabled:opacity-60"
                    >
                      {STATUS_COLUMNS.map((statusOption) => (
                        <option key={statusOption.key} value={statusOption.key}>
                          {statusOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
