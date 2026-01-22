import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  const baseClasses = "px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-sm";
  const variantClasses =
    variant === "primary"
      ? "gradient-purple text-white hover:opacity-90"
      : "bg-white text-[#6B21A8] border-2 border-[#6B21A8] hover:bg-gradient-to-r hover:from-[#6B21A8] hover:to-[#9333EA] hover:text-white hover:border-transparent";

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-lg"
    : "";

  const classes = `${baseClasses} ${variantClasses} ${disabledClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
