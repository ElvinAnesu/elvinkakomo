import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="text-xl font-bold gradient-text">
            Elvin Kakomo
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link
              href="/projects"
              className="text-[#64748B] hover:text-[#6B21A8] transition-colors font-medium relative group text-sm"
            >
              Projects
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#6B21A8] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/solutions"
              className="text-[#64748B] hover:text-[#6B21A8] transition-colors font-medium relative group text-sm"
            >
              Solutions
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#6B21A8] group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>
          <Link
            href="/collaborate"
            className="px-5 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold"
          >
            Collaborate
          </Link>
        </div>
      </div>
    </nav>
  );
}
