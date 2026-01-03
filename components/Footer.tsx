import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 mt-16 py-8 bg-[#0a0a0a]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side: Copyright */}
          <div className="text-sm text-gray-500">
            <p>&copy; {currentYear} Error Code Reference. All rights reserved.</p>
          </div>

          {/* Right side: Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link
              href="/about"
              className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-200"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-200"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

