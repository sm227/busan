import type { Metadata } from "next";
import "./globals.css";
import ScrollbarInit from "@/components/ScrollbarInit";
import { AppProvider } from "@/contexts/AppContext";
import PWAInstallBanner from "@/components/PWAInstallBanner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "빈집다방 - 당신에게 맞는 시골 생활을 찾아보세요",
  description: "AI 맞춤 추천으로 시골 집을 찾고, 스와이프로 간편하게 매칭하세요.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "빈집다방",
  },
  openGraph: {
    title: "빈집다방 - 당신에게 맞는 시골 생활을 찾아보세요",
    description: "AI 맞춤 추천으로 시골 집을 찾고, 스와이프로 간편하게 매칭하세요.",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "빈집다방 썸네일",
      },
    ],
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "빈집다방 - 당신에게 맞는 시골 생활을 찾아보세요",
    description: "AI 맞춤 추천으로 시골 집을 찾고, 스와이프로 간편하게 매칭하세요.",
    images: ["/thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="application-name" content="빈집다방" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="빈집다방" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#22c55e" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased">
        <ScrollbarInit />
        <PWAInstallBanner />
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
