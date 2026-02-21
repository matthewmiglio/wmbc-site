import Header from "../components/Header";
import HomeHeroCandidate1 from "../components/HomeHeroCandidate1";
import WhatWereAbout from "../components/WhatWereAbout";
import FacebookFeed from "../components/Facebook";
import Footer from "../components/Footer";
import Gallery from "../components/GalleryComponent";
import SignUpAdCandidate2 from "../components/SignUpAdCandidate2";

import UpcomingEvents from "../components/UpcomingEvents";
import "../styles/globals.css";

export default function Home() {
  return (
    <div className="min-w-full">
      <Header />
      <main>
        {/* Hero */}
        <HomeHeroCandidate1 />

        {/* What We're About */}
        <WhatWereAbout />

        {/* Original Gallery and Facebook Feed */}
        <section className="container mx-auto px-4 py-12 bg-white max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <Gallery />
            <FacebookFeed />
          </div>
        </section>

        {/* Upcoming Events with glass cards */}
        <UpcomingEvents />

        {/* Sign Up CTA */}
        <SignUpAdCandidate2 />
      </main>
      <Footer />
    </div>
  );
}
