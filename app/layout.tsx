import type { Metadata, Viewport } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "our little universe",
  description: "A small something, just for you.",
};

export const viewport: Viewport = {
  // Dark by default (the journey); the hub keeps the theme <meta> in step with
  // its own light/dark choice at runtime — see `theme-context.tsx`, which also
  // flips `color-scheme` via `<html data-theme>` when the hub goes light.
  themeColor: "#0d0912",
  colorScheme: "dark",
  // Let the layout paint under the notch / home indicator.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
