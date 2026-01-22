"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../../components/Card";
import ProjectCard from "../../components/ProjectCard";
import { Project, ProjectStatus } from "../../lib/mockData";
import { supabase } from "@/lib/supabase";

// Map database status to UI status
const mapStatusToUI = (dbStatus: string | null): ProjectStatus => {
  if (!dbStatus) return "Planning";
  const statusMap: Record<string, ProjectStatus> = {
    pending: "Planning",
    "in-progress": "Building",
    complete: "Complete",
    paused: "Review",
    cancelled: "Planning",
  };
  return statusMap[dbStatus] || "Planning";
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
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

      // Get user profile to get client ID
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

      const clientId = profile.id;

      // Fetch projects for this client
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select(
          `
          *,
          project_milestones (
            id,
            mileston_tasks (
              id,
              status
            )
          )
        `
        )
        .eq("client", clientId)
        .order("created_at", { ascending: false });

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        setError("Failed to load projects");
      } else {
        // Transform projects data
        const transformedProjects: Project[] = (projectsData || []).map((project: any) => {
          // Calculate progress from tasks
          let totalTasks = 0;
          let completedTasks = 0;

          if (project.project_milestones) {
            project.project_milestones.forEach((milestone: any) => {
              if (milestone.mileston_tasks) {
                totalTasks += milestone.mileston_tasks.length;
                completedTasks += milestone.mileston_tasks.filter(
                  (task: any) => task.status === "done"
                ).length;
              }
            });
          }

          const progress =
            totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return {
            id: project.id,
            name: project.project_name,
            status: mapStatusToUI(project.status),
            progress,
            lastUpdated: formatDate(project.created_at),
          };
        });

        setProjects(transformedProjects);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B21A8] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <Card className="max-w-md">
          <h2 className="text-xl font-semibold text-[#0F172A] mb-4">Error</h2>
          <p className="text-[#64748B] mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-[#6B21A8] text-white rounded-lg hover:bg-[#7C3AED]"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-8">Projects</h1>
      {projects.length === 0 ? (
        <Card>
          <p className="text-[#64748B] text-center py-8">
            No projects found. Your projects will appear here once they are created.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <ProjectCard project={project} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
