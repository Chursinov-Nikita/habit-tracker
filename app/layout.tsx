import type { Metadata, Viewport } from "next";
import { Nunito_Sans, Rubik } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "./elements/Header/Header";
import Background from "./elements/Background";

const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-display",
});

const montserrat = Nunito_Sans({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Трекер",
  description:
    "Удобный трекер, который поможет контролировать прогресс, оставаться мотивированным и избавляться от вредных привычек.",
  appleWebApp: { capable: true, title: "Трекер", statusBarStyle: "black-translucent" },
};

// Цвет системной панели Android и окна установленного приложения
export const viewport: Viewport = {
  themeColor: "#0B0F1A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className={`${rubik.variable} ${montserrat.variable} scroll-smooth`}
    >
      <body className="font-sans bg-[#0B0F1A] text-white antialiased">
        <Providers>
          <Header />
          <Background />
          {children}
        </Providers>
      </body>
    </html>
  );
}
