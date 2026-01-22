"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardHeader() {
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();

        if (profile?.name) {
          setUserName(profile.name);
        } else {
          // Fallback to email if name not available
          setUserName(user.email?.split("@")[0] || "User");
        }
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setUserName("User");
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-white border-b border-[#E5E7EB] px-8 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold gradient-text">Project Collaboration</h1>
        </div>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E5E7EB] rounded-full animate-pulse"></div>
            <div className="w-24 h-4 bg-[#E5E7EB] rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6B21A8] to-[#9333EA] rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-[#0F172A]">{userName}</span>
          </div>
        )}
      </div>
    </header>
  );
}
