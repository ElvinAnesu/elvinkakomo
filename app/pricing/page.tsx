import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import Button from "../components/Button";

type PricingTier = {
  title: string;
  description: string;
  features: string[];
  prices: { label: string; value: string }[];
  cta: string;
  badge?: string;
};

const oneTimeProjects: PricingTier[] = [
  {
    title: "MVP Build",
    description: "Turn your idea into a working product quickly.",
    features: [
      "Break down and structure your idea",
      "Design simple, usable interfaces",
      "Build a fully working system",
      "Testing and deployment",
    ],
    prices: [
      { label: "Web App", value: "$350 - $700" },
      { label: "Mobile App", value: "$400 - $500" },
    ],
    cta: "Build My Idea",
    badge: "Popular",
  },
  {
    title: "Production Build",
    description: "For well-defined systems that need clean, reliable execution.",
    features: [
      "Work from clear specs or designs",
      "Build stable, production-ready systems",
      "Ensure everything works seamlessly",
      "Prepare for real-world use",
    ],
    prices: [
      { label: "Web App", value: "$700 - $1,800+" },
      { label: "Mobile App", value: "$1,000 - $2,500+" },
    ],
    cta: "Build My System",
  },
  {
    title: "Vibe Coded Apps Finishing",
    description:
      "For people who started vibe coding their app but got stuck before finishing.",
    features: [
      "Review your current progress",
      "Identify what&apos;s blocking completion",
      "Fix broken or incomplete parts",
      "Finish and stabilize the app",
      "Prepare it for real use",
    ],
    prices: [{ label: "Projects", value: "Starting from $500+" }],
    cta: "Finish My App",
    badge: "High Demand",
  },
];

const longTermEngagements: PricingTier[] = [
  {
    title: "Ongoing Support",
    description: "Continuous updates and maintenance.",
    features: [
      "Regular task execution",
      "System maintenance",
      "Ongoing improvements",
    ],
    prices: [
      { label: "Web", value: "Custom" },
      { label: "Mobile", value: "Custom" },
    ],
    cta: "Get Support",
  },
  {
    title: "Dedicated Developer",
    description: "Work with me as part of your team.",
    features: [
      "Ongoing collaboration",
      "Ownership of features",
      "Consistent delivery",
    ],
    prices: [
      { label: "Web", value: "Custom" },
      { label: "Mobile", value: "Custom" },
    ],
    cta: "Work With Me",
  },
  {
    title: "Product Partner",
    description: "Strategy + execution for serious products.",
    features: [
      "Product decision support",
      "System structuring",
      "Priority execution",
    ],
    prices: [
      { label: "Web", value: "Custom" },
      { label: "Mobile", value: "Custom" },
    ],
    cta: "Discuss Partnership",
    badge: "Premium",
  },
];

function PricingSection({
  title,
  subtitle,
  tiers,
}: {
  title: string;
  subtitle: string;
  tiers: PricingTier[];
}) {
  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2">{title}</h2>
        <p className="text-[#64748B] text-lg">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <Card key={tier.title} className="relative h-full flex flex-col">
            {tier.badge && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide gradient-purple text-white">
                {tier.badge}
              </div>
            )}

            <h3 className="text-2xl font-bold text-[#0F172A] mb-3 pr-24">{tier.title}</h3>
            <p className="text-[#64748B] leading-relaxed mb-6">{tier.description}</p>

            <ul className="space-y-3 mb-6 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="text-[#64748B] flex items-start">
                  <span className="text-[#6B21A8] mr-3 mt-1">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mb-6 space-y-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              {tier.prices.map((price) => (
                <div key={`${tier.title}-${price.label}`} className="flex justify-between gap-4">
                  <span className="text-[#64748B] font-medium">{price.label}</span>
                  <span className="text-[#0F172A] font-bold text-right">{price.value}</span>
                </div>
              ))}
            </div>

            <Button href="/collaborate" className="w-full">
              {tier.cta}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#FAFAFA]">
      <Navbar />
      <main className="flex-1">
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-15"></div>
          </div>

          <div className="text-center mb-16">
            <div className="inline-block mb-6 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
              <span className="text-sm font-semibold gradient-text">Simple and Transparent</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-6">
              Pricing That Fits{" "}
              <span className="gradient-text">Your Product Stage</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#64748B] max-w-3xl mx-auto">
              From idea to working products - or finishing apps that got stuck halfway.
            </p>
          </div>

          <PricingSection
            title="One-Time Projects"
            subtitle="Build, fix, and launch with clear outcomes."
            tiers={oneTimeProjects}
          />

          <PricingSection
            title="Long-Term Engagements"
            subtitle="Continuous support when your product needs steady momentum."
            tiers={longTermEngagements}
          />

          <section className="text-center py-6">
            <p className="text-[#64748B] text-lg mb-4">
              Not sure where your project fits?
            </p>
            <div className="inline-flex">
              <Button href="/collaborate">Book a Call</Button>
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
