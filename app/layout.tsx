import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Omnigraph Lance cache limits: unofficial demo",
  description:
    "An environment setting for the Lance cache sizes from issue 702, with measurements of when a cap helps and when it hurts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
