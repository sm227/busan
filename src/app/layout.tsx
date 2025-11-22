import type { Metadata } from "next";
import "./globals.css";
import ScrollbarInit from "@/components/ScrollbarInit";
import { AppProvider } from "@/contexts/AppContext";

export const metadata: Metadata = {
  title: "빈집다방 - 당신에게 맞는 시골 생활을 찾아보세요",
  description: "AI 맞춤 추천으로 시골 집을 찾고, 스와이프로 간편하게 매칭하세요.",
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
