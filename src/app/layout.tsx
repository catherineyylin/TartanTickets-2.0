import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tartan Tickets | Find your next favorite thing",
  description: "Discover upcoming events around Carnegie Mellon University.",
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
