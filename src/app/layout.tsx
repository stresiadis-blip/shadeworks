import { Header } from "@/components/layout/Header";
import { ToastProvider } from "@/components/providers/ToastProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Italiana, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const italiana = Italiana({
  variable: "--font-italiana",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shade Works — Software Studio",
  description:
    "Premium software studio in Constanta. Full-stack web apps, e-commerce, dashboards, and landing pages.",
  metadataBase: new URL("https://shadeworks.dev"),
  openGraph: {
    title: "Shade Works — Software Studio",
    description:
      "Premium software studio in Constanta. Full-stack web apps, e-commerce, dashboards, and landing pages.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${italiana.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-bone">
        <Header />
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}