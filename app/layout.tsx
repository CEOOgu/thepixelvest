import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Pixel Vest",
  description: "Win Cash Instantly on the Digital Grid",
  manifest: "/manifest.json", 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}