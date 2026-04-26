import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "StackBuilder AI",
  description: "Your personalised supplement stack and workout plan, built by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="pt-14">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}