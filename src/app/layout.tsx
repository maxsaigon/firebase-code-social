import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import MockModeNotification from "@/components/MockModeNotification";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Service Central Admin",
  description: "Admin dashboard for Service Central",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <MockModeNotification />
          {children}
        </Providers>
      </body>
    </html>
  );
}