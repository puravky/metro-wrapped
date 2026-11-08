import type { Metadata, Viewport } from "next";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/noto-sans-devanagari";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { FeedbackButton } from "@/components/feedback-button";

const socialPreview = "/og/metro-pass-collage-og-v2.png";
const socialPreviewAlt = "MetroWrapped — Your year, between stations. A playful Delhi Metro year in review.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://metrowrapped.vercel.app"),
  title: "MetroWrapped",
  description:
    "Turn your everyday Delhi Metro ride into a playful, shareable year in review.",
  openGraph: {
    title: "MetroWrapped",
    description: "Your year, between stations.",
    type: "website",
    images: [{ url: socialPreview, width: 1200, height: 630, alt: socialPreviewAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MetroWrapped",
    description: "Your year, between stations.",
    images: [{ url: socialPreview, alt: socialPreviewAlt }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3edde",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}<FeedbackButton /><Analytics /></body>
    </html>
  );
}
