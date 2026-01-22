import { Project } from "../lib/mockData";
import Badge from "./Badge";
import Card from "./Card";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-[#0F172A]">
            {project.name}
          </h3>
          <Badge status={project.status} />
        </div>
        <div className="mb-6">
          <div className="flex justify-between text-sm font-semibold text-[#64748B] mb-3">
            <span>Progress</span>
            <span className="text-[#6B21A8]">{project.progress}%</span>
          </div>
          <div className="w-full bg-[#E5E7EB] rounded-full h-3 overflow-hidden">
            <div
              className="gradient-purple h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center text-sm text-[#64748B]">
          <span className="mr-2">📅</span>
          <span>Last updated: {project.lastUpdated}</span>
        </div>
      </div>
    </Card>
  );
}
