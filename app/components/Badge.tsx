import { ProjectStatus } from "../lib/mockData";

interface BadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusColors: Record<ProjectStatus, string> = {
  Planning: "bg-blue-100 text-blue-700 border border-blue-200",
  Building: "bg-purple-100 text-purple-700 border border-purple-200",
  Review: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Complete: "bg-green-100 text-green-700 border border-green-200",
};

export default function Badge({ status, className = "" }: BadgeProps) {
  return (
    <span
      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${statusColors[status]} ${className}`}
    >
      {status}
    </span>
  );
}
