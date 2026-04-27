import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Affiliate Click Dashboard",
  description:
    "Monitor performance and manage your Meta Ads campaigns and affiliate redirect links.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
