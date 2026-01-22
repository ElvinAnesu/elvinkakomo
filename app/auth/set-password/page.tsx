"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      // Check if there's a hash in the URL (Supabase auth callback)
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");

        if (accessToken && type === "recovery") {
          // Set the session using the access token
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || "",
          });

          if (sessionError || !session) {
            setError("Invalid or expired invitation link. Please request a new one.");
            setVerifying(false);
            return;
          }

          // Get user email from session
          if (session.user?.email) {
            setEmail(session.user.email);
          }

          // Clear the hash from URL
          window.history.replaceState(null, "", window.location.pathname);
          setVerifying(false);
          return;
        }
      }

      // Check for token in query params (fallback)
      const token = searchParams.get("token");
      if (token) {
        // Try to verify the token
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "recovery",
        });

        if (verifyError) {
          setError("Invalid or expired invitation link. Please request a new one.");
          setVerifying(false);
          return;
        }

        // Get current session to extract email
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setEmail(session.user.email);
        }
      } else if (!window.location.hash) {
        // Only show error if there's no hash and no token
        setError("No invitation token found. Please check your email for the invitation link.");
      }
      
      setVerifying(false);
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      // Check if user has an active session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("Your session has expired. Please use the invitation link from your email again.");
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "Failed to set password. Please try again.");
        setLoading(false);
        return;
      }

      // Sign out the user so they can log in with their new password
      await supabase.auth.signOut();

      // Password set successfully, redirect to login
      router.push("/auth/login?message=Password set successfully. Please login with your new password.");
    } catch (err) {
      console.error("Error setting password:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#FAFAFA]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-[#64748B]">Verifying invitation...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#FAFAFA]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-md w-full px-4">
          <div className="text-center mb-8">
            <div className="inline-block mb-4 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
              <span className="text-sm font-semibold gradient-text">Set Your Password</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4">
              Welcome to the Team
            </h1>
            <p className="text-lg text-[#64748B]">
              You&apos;ve been invited to collaborate. Set your password to get started.
            </p>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#0F172A] mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 pr-10 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-[#6B21A8] transition-all text-sm"
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#64748B] mt-2">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-[#0F172A] mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 pr-10 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-[#6B21A8] transition-all text-sm"
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 gradient-purple text-white rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Setting Password..." : "Set Password &amp; Continue →"}
              </button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#FAFAFA]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-[#64748B]">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  );
}
