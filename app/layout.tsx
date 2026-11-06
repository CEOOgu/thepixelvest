import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://thepixelvest.com.ng"),
  title: "The Pixel Vest | 1M Digital Node Grid & Brand Bounties",
  description:
    "Explore Nigeria's 1-million interactive digital node grid. Showcase brand logos, unlock instant promotional rewards, and connect via Paystack.",
  keywords: [
    "The Pixel Vest",
    "make money online",
    "election",
    "remote jobs",
    "ai earnings",
    "thepixelvest",
    "digital node grid Nigeria",
    "interactive pixel grid",
    "brand advertising grid Nigeria",
    "pixelvest.com.ng",
    "promotional rewards Nigeria",
    "PixelVest Digital Studios",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "The Pixel Vest | 1,000,000 Digital Node Grid",
    description:
      "Unlock digital nodes, showcase custom brand identities, and discover instant promotional bounties on Nigeria's #1 interactive grid.",
    url: "https://thepixelvest.com.ng",
    siteName: "The Pixel Vest",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "The Pixel Vest Official Logo",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Pixel Vest | 1M Digital Node Grid",
    description:
      "Unlock digital nodes and discover instant promotional bounties on Nigeria's interactive grid.",
    images: ["/icon.png"],
  },
  other: {
    "google-adsense-account": "ca-pub-9204985294084444",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "The Pixel Vest",
    url: "https://thepixelvest.com.ng",
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "All",
    description:
      "Interactive 1-million digital node advertising and promotional reward grid in Nigeria.",
    publisher: {
      "@type": "Organization",
      name: "PixelVest Digital Studios Ltd",
      email: "adminpixelvest@gmail.com",
    },
  };

  return (
    <html lang="en">
      <head>
        {/* Paystack Official Checkout Script */}
        <script
          src="https://js.paystack.co/v1/inline.js"
          async
        ></script>

        {/* Google AdSense Official Ownership & Ad Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9204985294084444"
          crossOrigin="anonymous"
        ></script>
        {/* AI & Search Engine Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#050505] text-white antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}