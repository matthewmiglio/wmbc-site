"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactMeetingSchedule() {
  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold text-green-800 mb-6">Meeting Schedule</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">When We Meet</h3>
              <p className="text-gray-600">Monthly meetings from March to December</p>
              <p className="text-sm text-gray-500 mt-1">Third Tuesday of each month, 7:00 PM</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <MapPin className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Where We Meet</h3>
              <p className="text-gray-600">Frederik Meijer Gardens & Sculpture Park</p>
              <p className="text-sm text-gray-500 mt-1">1000 East Beltline Ave NE, Grand Rapids, MI 49525</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">First Meeting Free</h3>
              <p className="text-gray-600">Visitors are welcome to attend their first meeting at no charge</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
