"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to projects page
    router.replace("/dashboard/projects");
  }, [router]);

  return null;
}
