import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import Button from "../components/Button";
import { solutions } from "../lib/mockData";
import Image from "next/image";

export default function Solutions() {
  const getPricingBadgeColor = (pricing: string) => {
    switch (pricing) {
      case "Free":
        return "bg-green-100 text-green-700 border border-green-200";
      case "Paid":
        return "bg-purple-100 text-purple-700 border border-purple-200";
      case "Open Source":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

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
              <span className="text-sm font-semibold gradient-text">Ready to Use</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-6">
              Solutions{" "}
              <span className="gradient-text">Available</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#64748B] max-w-3xl mx-auto">
              Software ready for you — templates, components, and tools you can use today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solutions.map((solution) => (
              <Card key={solution.id} className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  {/* Solution Image */}
                  {solution.image && (
                    <div className="mb-4 rounded-lg overflow-hidden bg-[#FAFAFA]">
                      <Image
                        src={solution.image}
                        alt={solution.name}
                        width={600}
                        height={300}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-semibold text-[#6B21A8] uppercase tracking-wide mb-2 inline-block">
                        {solution.category}
                      </span>
                      <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
                        {solution.name}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getPricingBadgeColor(
                        solution.pricing
                      )}`}
                    >
                      {solution.pricing}
                    </span>
                  </div>
                  <p className="text-[#64748B] mb-6 leading-relaxed">
                    {solution.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {solution.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#FAFAFA] text-[#64748B] rounded-lg text-sm border border-[#E5E7EB]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  {solution.tryNow ? (
                    <Button href={solution.link || "#"} variant="primary" className="w-full">
                      Try Now →
                    </Button>
                  ) : solution.link ? (
                    <Button href={solution.link} variant="primary" className="w-full">
                      View Solution →
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
