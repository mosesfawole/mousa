import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "Mousa — a little momentum for your next post",
    template: "%s · Mousa",
  },
  description:
    "A thoughtful writing studio for X. Find an angle, shape a draft, and review your words. Explore the sample workspace without an account.",
  openGraph: {
    title: "Mousa — Less blank page. More you.",
    description: "Find an angle. Shape a draft. Keep your voice.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable}`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
