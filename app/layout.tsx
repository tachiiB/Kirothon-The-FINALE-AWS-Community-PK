import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Kairos",
  description: "Paste your opportunity emails. Kairos scores each one against your profile and tells you exactly what to apply to first.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-[#0A0F1E] text-white min-h-screen`}>
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
