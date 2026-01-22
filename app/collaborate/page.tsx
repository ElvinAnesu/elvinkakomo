"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import Button from "../components/Button";

export default function Collaborate() {
  const [action, setAction] = useState<"select" | "schedule" | "login">("select");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [projectOverview, setProjectOverview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleScheduleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // In a real app, this would send data to your backend/API
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSuccess(true);
      // Reset form after showing success
      setTimeout(() => {
        setEmail("");
        setPhone("");
        setProjectOverview("");
        setSuccess(false);
        setAction("select");
      }, 3000);
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#FAFAFA]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-4xl w-full px-4">
          {action === "select" && (
            <>
              <div className="text-center mb-8">
                <div className="inline-block mb-4 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
                  <span className="text-sm font-semibold gradient-text">Let&apos;s Work Together</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4">
                  Start Collaborating
                </h1>
                <p className="text-lg text-[#64748B]">
                  Choose how you&apos;d like to get started
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-[#0F172A] mb-3">
                      Schedule a Call
                    </h2>
                    <p className="text-sm text-[#64748B] mb-6">
                      Let&apos;s discuss your project and see how we can work together
                    </p>
                    <Button
                      onClick={() => setAction("schedule")}
                      className="w-full px-4 py-2.5 text-sm"
                    >
                      Schedule a Call →
                    </Button>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-[#0F172A] mb-3">
                      Already Working With Me?
                    </h2>
                    <p className="text-sm text-[#64748B] mb-6">
                      Access your dashboard to view projects and manage your collaboration
                    </p>
                    <Button
                      onClick={handleLoginClick}
                      variant="secondary"
                      className="w-full px-4 py-2.5 text-sm"
                    >
                      Login →
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          )}

          {action === "schedule" && (
            <>
              <div className="text-center mb-8">
                <button
                  onClick={() => {
                    setAction("select");
                    setError("");
                    setSuccess(false);
                  }}
                  className="text-sm text-[#64748B] hover:text-[#0F172A] mb-4 inline-flex items-center gap-2"
                >
                  ← Back
                </button>
                <div className="inline-block mb-4 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
                  <span className="text-sm font-semibold gradient-text">Schedule a Call</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4">
                  Let&apos;s Discuss Your Project
                </h1>
                <p className="text-lg text-[#64748B]">
                  Share your details and we&apos;ll get back to you soon
                </p>
              </div>

              <Card>
                {success ? (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
                      Thank You!
                    </h2>
                    <p className="text-sm text-[#64748B]">
                      We&apos;ve received your information and will contact you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleScheduleCall} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-[#0F172A] mb-2"
                      >
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-[#6B21A8] transition-all text-sm"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-[#0F172A] mb-2"
                      >
                        Phone Number *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full px-3 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-[#6B21A8] transition-all text-sm"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="projectOverview"
                        className="block text-sm font-semibold text-[#0F172A] mb-2"
                      >
                        Project Overview *
                      </label>
                      <textarea
                        id="projectOverview"
                        value={projectOverview}
                        onChange={(e) => setProjectOverview(e.target.value)}
                        required
                        rows={6}
                        className="w-full px-3 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-[#6B21A8] transition-all resize-none text-sm"
                        placeholder="Tell us about your project, goals, timeline, and any specific requirements..."
                      />
                      <p className="text-xs text-[#64748B] mt-2">
                        Please provide as much detail as possible so we can prepare for our call
                      </p>
                    </div>

                    {error && (
                      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setAction("select");
                          setError("");
                          setEmail("");
                          setPhone("");
                          setProjectOverview("");
                        }}
                        className="flex-1 px-4 py-2.5 text-sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm"
                      >
                        {loading ? "Submitting..." : "Submit →"}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
