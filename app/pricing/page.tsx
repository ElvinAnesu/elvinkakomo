import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PricingCard from "../components/PricingCard";
import { pricingPlans } from "../lib/mockData";

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#FAFAFA]">
      <Navbar />
      <main className="flex-1">
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-15"></div>
          </div>

          <div className="text-center mb-20">
            <div className="inline-block mb-6 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
              <span className="text-sm font-semibold gradient-text">Simple Pricing</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-6">
              Choose Your{" "}
              <span className="gradient-text">Partnership</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#64748B] max-w-3xl mx-auto">
              Transparent pricing for every stage of your product journey. All plans include
              access to the collaboration portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>

          <div className="text-center">
            <div className="inline-block px-6 py-3 bg-purple-50 rounded-full border border-purple-100">
              <p className="text-[#64748B] font-medium">
                ✨ All plans include access to the collaboration portal
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
