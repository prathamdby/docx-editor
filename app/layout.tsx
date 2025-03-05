import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "DocX Editor - Generate Beautiful Practical Documents",
  description:
    "Create professionally formatted practical documents with our intelligent document generator. Features live preview, multiple practicals support, and beautiful formatting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${roboto.variable} min-h-screen bg-gradient-to-b from-black via-pink-950/80 to-black font-sans text-white antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
