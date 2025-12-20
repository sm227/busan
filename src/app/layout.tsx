import type { Metadata } from "next";
import "./globals.css";
import ScrollbarInit from "@/components/ScrollbarInit";
import { AppProvider } from "@/contexts/AppContext";

export const metadata: Metadata = {
  title: "빈집다방 - 당신에게 맞는 시골 생활을 찾아보세요",
  description: "AI 맞춤 추천으로 시골 집을 찾고, 스와이프로 간편하게 매칭하세요.",
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
      <body className="antialiased">
        <ScrollbarInit />
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
