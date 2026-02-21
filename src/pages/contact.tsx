import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactHeroCandidate3 from "../components/ContactHeroCandidate3";
import ContactMeetingSchedule from "../components/ContactMeetingSchedule";
import ContactQuickLinks from "../components/ContactQuickLinks";
import ContactTestimonials from "../components/ContactTestimonials";
import ContactFAQ from "../components/ContactFAQ";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Facebook, Instagram, MapPin } from "lucide-react";
import Link from "next/link";
import "../styles/globals.css";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      {/* Hero */}
      <ContactHeroCandidate3 />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Contact Info and Social Media Cards (Original) */}
          <div className="grid md:grid-cols-2 gap-6 w-full">
            <Card className="bg-white shadow-lg w-full">
              <CardContent className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold text-green-700 mb-4 md:mb-6">
                  Contact Information
                </h2>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="bg-green-100 p-2 md:p-3 rounded-full flex-shrink-0">
                      <Mail className="h-5 w-5 md:h-6 md:w-6 text-green-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 text-sm md:text-base">Email</h3>
                      <a
                        href="mailto:westmichiganbonsaiclub@gmail.com"
                        className="text-gray-600 hover:text-green-700 transition-colors text-sm md:text-base break-words"
                      >
                        westmichiganbonsaiclub@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="bg-green-100 p-2 md:p-3 rounded-full flex-shrink-0">
                      <MapPin className="h-5 w-5 md:h-6 md:w-6 text-green-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 text-sm md:text-base">Location</h3>
                      <p className="text-gray-600 text-sm md:text-base break-words">
                        West Michigan - Frederik Meijer Gardens
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg w-full">
              <CardContent className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold text-green-700 mb-4 md:mb-6">
                  Connect With Us
                </h2>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="bg-blue-100 p-2 md:p-3 rounded-full flex-shrink-0">
                      <Facebook className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 text-sm md:text-base">Facebook</h3>
                      <Link
                        href="https://www.facebook.com/West.Michigan.Bonsai.Club"
                        target="_blank"
                        className="text-gray-600 hover:text-blue-600 transition-colors text-sm md:text-base break-words"
                      >
                        West Michigan Bonsai Club
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="bg-pink-100 p-2 md:p-3 rounded-full flex-shrink-0">
                      <Instagram className="h-5 w-5 md:h-6 md:w-6 text-pink-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 text-sm md:text-base">Instagram</h3>
                      <Link
                        href="https://www.instagram.com/westmichiganbonsaiclub/"
                        target="_blank"
                        className="text-gray-600 hover:text-pink-600 transition-colors text-sm md:text-base break-words"
                      >
                        @westmichiganbonsaiclub
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meeting Schedule */}
          <ContactMeetingSchedule />

          {/* Testimonials */}
          <ContactTestimonials />

          {/* Quick Links */}
          <ContactQuickLinks />

          {/* FAQ */}
          <ContactFAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
}
