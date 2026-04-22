import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StackBuilder AI",
  description: "Your personalised supplement stack, built by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}