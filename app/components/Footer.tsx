import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#FAFAFA] to-white border-t border-[#E5E7EB] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold gradient-text mb-2">
              Elvin Kakomo
            </h3>
            <p className="text-[#64748B] max-w-md text-sm leading-relaxed">
              I help startups and SMEs ship real products. From idea to launch
              — web apps, mobile apps, and internal tools built fast, clean,
              and supported long-term.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-3">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/projects"
                  className="text-[#64748B] hover:text-[#6B21A8] transition-colors font-medium text-sm"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-[#64748B] hover:text-[#6B21A8] transition-colors font-medium text-sm"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions"
                  className="text-[#64748B] hover:text-[#6B21A8] transition-colors font-medium text-sm"
                >
                  Solutions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-3">
              Get Started
            </h4>
            <p className="text-[#64748B] mb-3 text-sm">
              Ready to build something great?
            </p>
            <Link
              href="/collaborate"
              className="inline-block px-5 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold"
            >
              Get Started →
            </Link>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center">
          <p className="text-[#64748B] text-sm">
            &copy; 2026 Elvin Kakomo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
