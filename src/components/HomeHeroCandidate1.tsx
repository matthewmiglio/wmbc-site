"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomeHeroCandidate1() {
  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      <Image
        src="/facebook_images/fb_bonsai_28.jpg"
        alt="Beautiful Bonsai"
        fill
        style={{ objectFit: 'cover' }}
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      <div className="absolute inset-0 flex flex-col justify-center items-start px-6 md:px-24 pt-20 pb-12 md:py-0 max-w-5xl">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
          West Michigan<br />Bonsai Club
        </h1>
        <p className="text-xl md:text-2xl text-white/95 max-w-2xl mb-8 drop-shadow-lg leading-relaxed">
          Cultivating the ancient art of bonsai in West Michigan since 1985. Join our passionate community of artists and enthusiasts.
        </p>
        <div className="flex flex-col md:flex-row gap-4 mb-8 md:mb-0">
          <Link href="/contact">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 w-full md:w-auto">
              Become a Member
            </Button>
          </Link>
          <Link href="/gallery">
            <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20 text-lg px-8 py-6 w-full md:w-auto">
              View Gallery
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
