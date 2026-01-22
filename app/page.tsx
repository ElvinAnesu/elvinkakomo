import Image from "next/image";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Button from "./components/Button";
import Card from "./components/Card";
import { testimonials } from "./lib/mockData";

export default function Home() {
  const valuePropositions = [
    {
      title: "Idea → MVP",
      description: [
        "Turn raw ideas into usable products",
        "Scope, build, and launch",
      ],
    },
    {
      title: "SME Digital Products",
      description: [
        "Internal tools, dashboards, systems",
        "Replace spreadsheets &amp; WhatsApp workflows",
      ],
    },
    {
      title: "Ongoing Product Support",
      description: [
        "Continuous improvements",
        "Feature development &amp; automation",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#FAFAFA]">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
          </div>
          
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            <div className="inline-block mb-6 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
              <span className="text-sm font-semibold gradient-text">Elvin Kakomo</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0F172A] mb-8 leading-tight">
              I help startups and SMEs{" "}
              <span className="gradient-text">ship real products</span>.
            </h1>
            <p className="text-xl md:text-2xl text-[#64748B] mb-12 max-w-2xl mx-auto leading-relaxed">
              From idea to launch — web apps, mobile apps, and internal tools
              built fast, clean, and supported long-term.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/collaborate" variant="primary">
                Start Collaborating →
              </Button>
              <Button href="/projects" variant="secondary">
                View Projects
              </Button>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-16 bg-white border-y border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wide mb-2">
                Trusted By
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
                Startups &amp; SMEs I&apos;ve Worked With
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
              <div className="relative w-full h-20 transition-all duration-300 hover:opacity-80">
                <Image
                  src="/logos/grho.png"
                  alt="GRHO"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative w-full h-20 transition-all duration-300 hover:opacity-80">
                <Image
                  src="/logos/startum.png"
                  alt="Startum"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative w-full h-20 transition-all duration-300 hover:opacity-80">
                <Image
                  src="/logos/tetrafert.png"
                  alt="Tetrafert"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative w-full h-20 transition-all duration-300 hover:opacity-80">
                <Image
                  src="/logos/vamboacademy.png"
                  alt="Vambo Academy"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="bg-gradient-to-b from-[#FAFAFA] to-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
                How I Help You{" "}
                <span className="gradient-text">Ship Products</span>
              </h2>
              <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
                Three core ways I transform ideas into real, working products
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {valuePropositions.map((prop, index) => (
                <Card key={index} className="relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-12 h-12 gradient-purple rounded-xl mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-4">
                      {prop.title}
                    </h3>
                    <ul className="space-y-3">
                      {prop.description.map((item, idx) => (
                        <li key={idx} className="text-[#64748B] flex items-start">
                          <span className="text-[#6B21A8] mr-3 mt-1">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
                What Clients{" "}
                <span className="gradient-text">Say</span>
              </h2>
              <p className="text-xl text-[#64748B]">
                Real feedback from founders and teams I&apos;ve worked with
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={testimonial.id} className="relative">
                  <div className="absolute top-4 right-4 text-4xl text-purple-100 font-serif">&quot;</div>
                  <div className="relative">
                    <p className="text-[#64748B] mb-6 text-lg leading-relaxed">
                      &quot;{testimonial.feedback}&quot;
                    </p>
                    <div className="pt-6 border-t border-[#E5E7EB]">
                      <p className="font-bold text-[#0F172A] text-lg">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-[#64748B] mt-1">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
