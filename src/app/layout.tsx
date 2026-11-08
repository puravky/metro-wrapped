import type { Metadata, Viewport } from "next";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/noto-sans-devanagari";
import "./globals.css";
import { FeedbackButton } from "@/components/feedback-button";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://metrowrapped.vercel.app"),
  title: "MetroWrapped",
  description:
    "Turn your everyday Delhi Metro ride into a playful, shareable year in review.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3edde",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}<FeedbackButton /></body>
    </html>
  );
}
