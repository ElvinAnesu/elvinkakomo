import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-[#E5E7EB] p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );
}
