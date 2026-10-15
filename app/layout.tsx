import type { Metadata } from "next";
import { Nunito_Sans, Rubik } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
  title: "HabitTrack — трекер вредных привычек",
  description:
    "Удобный трекер, который поможет контролировать прогресс, оставаться мотивированным и избавляться от вредных привычек.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${rubik.variable} ${montserrat.variable} scroll-smooth`}
    >
      <body className="font-sans bg-[#0B0F1A] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
