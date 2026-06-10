import type { Metadata } from "next";
import { Geist, Geist_Mono, Italiana, Archivo_Black } from "next/font/google";
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

const archivo = Archivo_Black({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shade Works — You Think It. We Shade It Into Reality.",
  description:
    "Custom software. App architecture. Business control panels. Digital marketing pipelines. All built from nothing. No templates. No shortcuts. Just raw execution at machine speed.",
  metadataBase: new URL("https://shadeworks.dev"),
  openGraph: {
    title: "Shade Works",
    description:
      "Custom software, business control panels, and marketing pipelines — built from nothing at machine speed.",
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
      className={`${geistSans.variable} ${geistMono.variable} ${italiana.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink text-bone">{children}</body>
    </html>
  );
}
