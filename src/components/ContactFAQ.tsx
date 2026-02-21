"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "What does membership include?",
      answer:
        "Membership gives you access to meetings, workshops, garden tours, and exclusive exhibits, plus opportunities to join special programs and workshops with bonsai professionals. Your support helps grow the art of bonsai in our region.",
    },
    {
      question: "How often do you meet?",
      answer:
        "We meet monthly from March to December at Frederik Meijer Gardens and Sculpture Park. Meetings are held on the third Tuesday of each month at 7:00 PM.",
    },
    {
      question: "I'm a complete beginner. Is this club for me?",
      answer:
        "Absolutely! We welcome all skill levels and provide guidance for beginners through classes and workshops. Many of our members started with no experience at all.",
    },
    {
      question: "How much does membership cost?",
      answer:
        "Individual membership is $30 per year, and family membership (up to 2 adults plus children) is $40 per year. Your first meeting is free to attend as a visitor.",
    },
    {
      question: "Do I need to bring my own bonsai tree?",
      answer:
        "No, you don't need to own a bonsai to join! Many members start by learning techniques before acquiring their first tree. However, if you do have a bonsai, feel free to bring it for advice and demonstrations.",
    },
    {
      question: "What happens at a typical meeting?",
      answer:
        "Meetings typically include a featured presentation or demonstration by an expert, member show-and-tell, discussions about upcoming events, and time to socialize with fellow enthusiasts. Refreshments are usually provided.",
    },
    {
      question: "Can I visit before becoming a member?",
      answer:
        "Yes! Visitors are welcome to attend their first meeting at no charge. This is a great way to experience our community and see if the club is right for you before committing to membership.",
    },
    {
      question: "Do you offer workshops or classes?",
      answer:
        "Yes, we regularly offer workshops led by experienced bonsai artists and professionals. Topics range from basic care and styling to advanced techniques. Members receive discounted rates on all workshops.",
    },
    {
      question: "Where can I buy bonsai trees and supplies?",
      answer:
        "We can recommend local nurseries and online suppliers. The club also holds periodic plant swaps and sales where members can acquire trees, pots, and tools at reasonable prices.",
    },
    {
      question: "How can I get involved beyond attending meetings?",
      answer:
        "There are many ways to participate! You can volunteer to help with events, join our social media team, contribute to our newsletter, assist with demonstrations, or serve on committees. We're always looking for enthusiastic members to help grow our community.",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full">
      <h2 className="text-3xl font-bold text-green-800 mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 pr-4">
                {faq.question}
              </h3>
              <ChevronDown
                className={`h-5 w-5 text-gray-600 flex-shrink-0 transition-transform duration-200 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? "max-h-96" : "max-h-0"
              }`}
            >
              <p className="p-4 pt-0 text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
