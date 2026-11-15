import type { Metadata, Viewport } from "next";
import { Nunito_Sans, Rubik } from "next/font/google";
import "./globals.css";
import ServiceWorker from "./elements/ServiceWorker";
import TabBar from "./elements/TabBar";
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

export const viewport: Viewport = {
  themeColor: "#0B0F1A",
  viewportFit: "cover",
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
      <body className="font-sans bg-ink text-white antialiased">
        <ServiceWorker />
        <Header />
        <Background />
        {children}
        <TabBar />
      </body>
    </html>
  );
}
