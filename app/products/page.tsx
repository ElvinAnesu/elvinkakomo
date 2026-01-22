import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import { ownProducts } from "../lib/mockData";

export default function Products() {
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
              <span className="text-sm font-semibold gradient-text">My Creations</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-6">
              Products I{" "}
              <span className="gradient-text">Built</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#64748B] max-w-3xl mx-auto">
              Software I&apos;ve created for users — tools and applications that solve real problems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ownProducts.map((product) => (
              <Card key={product.id} className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-[#0F172A]">
                      {product.name}
                    </h3>
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                        product.status === "Active"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                  <p className="text-[#64748B] mb-6 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#FAFAFA] text-[#64748B] rounded-lg text-xs border border-[#E5E7EB]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  {product.users && (
                    <div className="text-sm text-[#64748B]">
                      <span className="font-semibold">Users:</span> {product.users}
                    </div>
                  )}
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
