import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Affiliate Click Dashboard",
  description:
    "Monitor performance and manage your Meta Ads campaigns and affiliate redirect links.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const pixelId = settings?.meta_pixel_id?.trim() || null;
  const ga4Id = settings?.ga4_measurement_id?.trim() || null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.add(t);}catch(e){}})()` }} />
      </head>
      <body className="min-h-screen font-sans">
        {children}

        {/* Meta Pixel */}
        {pixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
          </Script>
        )}

        {/* Google Analytics 4 */}
        {ga4Id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4Id}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
