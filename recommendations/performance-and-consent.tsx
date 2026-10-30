// Fixes PERF-01, PERF-02, PERF-05 and PRV-01. app/layout.tsx (excerpt)
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PERF-01 option A (best): remove Material Symbols entirely and use inline SVG icons (lucide-react).
            PERF-01 option B: request ONLY the glyphs used. icon_names must be alphabetical, axes fixed:
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=arrow_forward,auto_fix,hub,terminal&display=swap" />
            This cuts ~1.1 MB to a few KB. Self-hosting via next/font removes the render-blocking third-party CSS. */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /> {/* PERF-05 */}

        {/* PRV-01: Consent Mode defaults to denied until the user opts in */}
        <Script id="consent-default" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments)}
          gtag('consent','default',{
            ad_storage:'denied', analytics_storage:'denied',
            ad_user_data:'denied', ad_personalization:'denied', wait_for_update:500
          });
        `}</Script>
      </head>
      <body>
        {children}
        {/* PERF-02: @next/third-parties loads GA after hydration, off the critical path */}
        <GoogleAnalytics gaId="G-LK6CQWCWX0" />
        {/* On accept: gtag('consent','update',{ analytics_storage:'granted' }) */}
      </body>
    </html>
  );
}

// PERF-03: stop shipping legacy polyfills. In package.json:
// "browserslist": ["chrome >= 100", "edge >= 100", "firefox >= 100", "safari >= 15.4"]
