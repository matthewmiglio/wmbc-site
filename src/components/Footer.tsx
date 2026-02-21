import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Logo and Description */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <Image
              src="/logos/logo_ai_bg_green.png"
              alt="West Michigan Bonsai Club Logo"
              width={100}
              height={100}
              className="mb-2"
            />
            <p className="text-sm text-green-100 text-center md:text-left leading-relaxed max-w-xs">
              Cultivating the art of bonsai in West Michigan since 1985.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-lg mb-6 text-white">Quick Links</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <Link href="/" className="text-green-100 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/gallery" className="text-green-100 hover:text-white transition-colors">
                Gallery
              </Link>
              <Link href="/calendar" className="text-green-100 hover:text-white transition-colors">
                Calendar
              </Link>
              <Link href="/members" className="text-green-100 hover:text-white transition-colors">
                Members
              </Link>
              <Link href="/about" className="text-green-100 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-green-100 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-lg mb-6 text-white">Connect With Us</h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/West.Michigan.Bonsai.Club/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Visit us on Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/westmichiganbonsaiclub/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Follow us on Instagram"
              >
                <Instagram size={20} />
              </a>
              <Link
                href="/contact"
                className="w-12 h-12 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Contact us via email"
              >
                <Mail size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-green-700 pt-8 text-center">
          <p className="text-green-200 text-sm">
            &copy; 1985 West Michigan Bonsai Club. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

