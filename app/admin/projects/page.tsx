import Link from "next/link";
import Card from "../../components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase-server";

export default async function ProjectsPage() {
  // Fetch projects from Supabase with client information
  const { data: projects, error } = await supabaseServer
    .from("projects")
    .select(`
      id,
      project_name,
      description,
      type,
      status,
      created_at,
      profiles:client (
        id,
        name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
  }

  // Map database status to display format
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

  // Map database type to display format
  const getTypeDisplay = (type: string) => {
    return type === "partnership" ? "Partnership" : "One Time";
  };

  // Get status badge class
  const getStatusClass = (status: string | null) => {
    if (!status) return "bg-purple-100 text-purple-700 border border-purple-200";
    if (status === "complete") {
      return "bg-green-100 text-green-700 border border-green-200";
    }
    return "bg-purple-100 text-purple-700 border border-purple-200";
  };

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">Projects Management</h1>
          <Link href="/admin/projects/new">
            <button className="px-5 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold">
              + New Project
            </button>
          </Link>
        </div>

        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects && projects.length > 0 ? (
                projects.map((project) => {
                  const clientName = project.profiles && typeof project.profiles === 'object' && 'name' in project.profiles 
                    ? (project.profiles as { name: string }).name 
                    : "Unknown Client";
                  
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-semibold text-[#0F172A]">
                        {project.project_name}
                      </TableCell>
                      <TableCell className="text-[#6B21A8] font-medium">
                        {clientName}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            project.type === "partnership"
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {getTypeDisplay(project.type)}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#64748B] max-w-md">
                        {project.description && project.description.length > 30
                          ? `${project.description.substring(0, 30)}...`
                          : project.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusClass(project.status)}`}
                        >
                          {getStatusDisplay(project.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/projects/${project.id}`}>
                          <button className="px-3 py-1.5 bg-[#6B21A8] text-white rounded-lg text-xs font-medium hover:opacity-90">
                            View
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[#64748B] py-8">
                    No projects found. Create your first project to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
    </div>
  );
}
