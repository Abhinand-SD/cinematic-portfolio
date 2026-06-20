import type { Metadata, Viewport } from "next";
import { Sora, Inter, Kanit } from "next/font/google";
import "./globals.css";

const display = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

// Used by the ported projects section to preserve harsh-portfolio's typography.
const accent = Kanit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abhinand SD - Creative Developer & Designer",
  description:
    "Building immersive, cinematic web experiences with React, Three.js & motion design.",
  manifest: "/favicon/site.webmanifest",
  icons: {
    // Modern browsers pick the PNG; favicon.ico is the legacy fallback.
    icon: [
      { url: "/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    shortcut: [{ url: "/favicon/favicon.ico" }],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    title: "Abhinand SD",
  },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${accent.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
