"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LoginButton from "./LoginButton";
import BecomeMemberButton from "./BecomeMemberButton";
import { Menu, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link
        href="/"
        className={pathname === "/"
          ? "text-green-600 font-bold text-[1.05rem] md:text-[1.05rem] hover:text-green-800 text-center"
          : "text-gray-600 font-bold md:font-semibold hover:text-green-800 text-center"}
      >
        Home
      </Link>
      <Link
        href="/gallery"
        className={pathname === "/gallery"
          ? "text-green-600 font-bold text-[1.05rem] md:text-[1.05rem] hover:text-green-800 text-center"
          : "text-gray-600 font-bold md:font-semibold hover:text-green-800 text-center"}
      >
        Gallery
      </Link>
      <Link
        href="/calendar"
        className={pathname === "/calendar"
          ? "text-green-600 font-bold text-[1.05rem] md:text-[1.05rem] hover:text-green-800 text-center"
          : "text-gray-600 font-bold md:font-semibold hover:text-green-800 text-center"}
      >
        Calendar
      </Link>
      <Link
        href="/members"
        className={pathname === "/members"
          ? "text-green-600 font-bold text-[1.05rem] md:text-[1.05rem] hover:text-green-800 text-center"
          : "text-gray-600 font-bold md:font-semibold hover:text-green-800 text-center"}
      >
        Chat
      </Link>
      <Link
        href="/about"
        className={pathname === "/about"
          ? "text-green-600 font-bold text-[1.05rem] md:text-[1.05rem] hover:text-green-800 text-center"
          : "text-gray-600 font-bold md:font-semibold hover:text-green-800 text-center"}
      >
        About
      </Link>
      <Link
        href="/contact"
        className={pathname === "/contact"
          ? "text-green-600 font-bold text-[1.05rem] md:text-[1.05rem] hover:text-green-800 text-center"
          : "text-gray-600 font-bold md:font-semibold hover:text-green-800 text-center"}
      >
        Contact
      </Link>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm w-full">
      <nav className="w-full px-4 sm:px-6 py-3">
        <div className="mx-auto w-full">
          {/* Top bar with logo + burger */}
          <div className="flex justify-between items-center w-full">
            {/* Mobile: Logo centered, hamburger on right */}
            <div className="md:hidden flex-1"></div>

            <Link
              href="/"
              className="gap-4 flex items-center whitespace-nowrap sm:text-2xl md:text-3xl font-semibold text-green-800"
            >
              <Image
                src="/logos/logo_ai.png"
                alt="Bonsai App Logo"
                width={60}
                height={60}
                className="transition-all duration-300 ease-in-out transform hover:scale-105"
              />
              <div className="hidden md:block text-lg sm:text-4xl md:text-4xl lg:text-4xl xl:text-4xl 2xl:text-4xl">
                West Michigan Bonsai Club
              </div>
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden flex-1 flex justify-end">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>

            {/* Desktop nav and buttons */}
            <div className="hidden md:flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-5">{navLinks}</div>
              <div className="flex items-center gap-2 ml-4">
                <BecomeMemberButton />
                <LoginButton />
              </div>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 flex flex-col items-center space-y-3 text-xl">
              <div className="flex flex-col gap-3 items-center w-full">{navLinks}</div>
              <div className="flex flex-col gap-3 items-center w-full mt-4">
                <BecomeMemberButton />
                <LoginButton />
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
