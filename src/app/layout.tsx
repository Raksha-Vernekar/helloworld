import type { Metadata } from "next";
import { Nunito, Baloo_2 } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Konkani Quest — Learn Konkani the fun way",
  description:
    "A cheerful, Duolingo-style app for learning Konkani words with mnemonics, streaks, and fun facts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${baloo.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-sand text-ink">{children}</body>
    </html>
  );
}
