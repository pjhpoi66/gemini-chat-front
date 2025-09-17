// src/app/layout.tsx

import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/contexts/AuthContext"; // AuthProvider 임포트

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "캐릭터 챗",
  description: "Gemini API를 이용한 캐릭터 챗봇",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="ko">
      <body className={inter.className}>
      <AuthProvider> {/* AuthProvider로 자식 컴포넌트들을 감쌉니다 */}
        {children}
      </AuthProvider>
      </body>
      </html>
  );
}