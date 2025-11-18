import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollbarInit from "@/components/ScrollbarInit";
import { AppProvider } from "@/contexts/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrollbarInit />
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
