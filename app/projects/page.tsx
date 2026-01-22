"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import { ownProducts, OwnProduct } from "../lib/mockData";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Projects() {
  const [selectedProduct, setSelectedProduct] = useState<OwnProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMoreClick = (product: OwnProduct) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
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
              <span className="text-sm font-semibold gradient-text">My Creations</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-6">
              Projects I{" "}
              <span className="gradient-text">Delivered</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#64748B] max-w-3xl mx-auto">
              Software I&apos;ve created for clients — tools and applications that solve real business problems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ownProducts.map((product) => (
              <Card key={product.id} className="relative overflow-hidden group flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex flex-col flex-1">
                  {/* Project Image */}
                  {product.image && (
                    <div className="mb-4 rounded-lg overflow-hidden bg-[#FAFAFA]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
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
                  
                  {/* More Button */}
                  <div className="mt-auto pt-4">
                    <button
                      onClick={() => handleMoreClick(product)}
                      className="w-full px-4 py-2 bg-[#6B21A8] text-white rounded-lg hover:bg-[#7C3AED] transition-colors font-medium"
                    >
                      More...
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />

      {/* Project Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-4">
                  <DialogTitle className="text-2xl font-bold text-[#0F172A]">
                    {selectedProduct.name}
                  </DialogTitle>
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                      selectedProduct.status === "Active"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    }`}
                  >
                    {selectedProduct.status}
                  </span>
                </div>
              </DialogHeader>

              {/* Description */}
              <DialogDescription className="text-base text-[#64748B] leading-relaxed mb-6">
                {selectedProduct.description}
              </DialogDescription>

              {/* Technologies */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#0F172A] mb-3 uppercase">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#FAFAFA] text-[#64748B] rounded-lg text-sm border border-[#E5E7EB]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-[#E5E7EB]">
                {selectedProduct.tryNow ? (
                  <button className="w-full px-6 py-3 bg-[#6B21A8] text-white rounded-lg hover:bg-[#7C3AED] transition-colors font-medium">
                    Try Now
                  </button>
                ) : selectedProduct.isDemo ? (
                  <button className="w-full px-6 py-3 bg-[#6B21A8] text-white rounded-lg hover:bg-[#7C3AED] transition-colors font-medium">
                    Request for Demo
                  </button>
                ) : selectedProduct.link ? (
                  <Link
                    href={selectedProduct.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-6 py-3 bg-[#6B21A8] text-white rounded-lg hover:bg-[#7C3AED] transition-colors font-medium text-center"
                  >
                    Visit Website
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
