import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    FB: any;
  }
}

const FacebookFeed: React.FC = () => {
  const fbPageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Size the embed to its container so it never overflows the viewport on
  // mobile. Clamp to Facebook's supported range [180, 500].
  const [fbWidth, setFbWidth] = useState(500);

  useEffect(() => {
    const measure = () => {
      const w = containerRef.current?.clientWidth ?? 500;
      setFbWidth(Math.max(180, Math.min(500, Math.floor(w))));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Re-render the embed when its target width changes.
  useEffect(() => {
    if (window.FB) window.FB.XFBML.parse();
  }, [fbWidth]);

  useEffect(() => {
    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.appendChild(fbRoot);
    }

    if (!window.FB) {
      const script = document.createElement("script");
      script.src =
        "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v21.0&appId=1980405622369674";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (window.FB) {
          window.FB.XFBML.parse();
        }
      };
      document.body.appendChild(script);
    } else {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
      <div className="p-6 bg-gradient-to-r from-green-700 to-green-800 text-white">
        <h2 className="text-2xl font-semibold mb-2 flex items-center">
          <Facebook className="mr-2" />
          Branch Out on Facebook!
        </h2>
        <p className="text-sm opacity-90">
          Root for our latest updates and leaf through our bonsai adventures!
        </p>
      </div>

      <div ref={containerRef} className="p-4 max-w-full overflow-hidden">
        <div id="fb-root"></div>
        <div
          ref={fbPageRef}
          className="fb-page max-w-full"
          data-href="https://www.facebook.com/West.Michigan.Bonsai.Club/"
          data-tabs="timeline"
          data-width={String(fbWidth)}
          data-height="500"
          data-small-header="false"
          data-adapt-container-width="true"
          data-hide-cover="false"
          data-show-facepile="true"
        >
          <blockquote
            cite="https://www.facebook.com/West.Michigan.Bonsai.Club/"
            className="fb-xfbml-parse-ignore"
          >
            <a href="https://www.facebook.com/West.Michigan.Bonsai.Club/">
              Loading Facebook feed...
            </a>
          </blockquote>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <Button
          variant="default"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() =>
            window.open(
              "https://www.facebook.com/West.Michigan.Bonsai.Club/",
              "_blank"
            )
          }
        >
          <Facebook className="mr-2 h-4 w-4" /> Visit Our Facebook Page
        </Button>
      </div>
    </div>
  );
};

export default FacebookFeed;
