import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import MockModeNotification from "@/components/MockModeNotification";

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
      <body className="font-sans antialiased">
        <Providers>
          <MockModeNotification />
          {children}
        </Providers>
      </body>
    </html>
  );
}