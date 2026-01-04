import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto Timeline | History of Cryptocurrency",
  description:
    "Explore the complete history of cryptocurrency - from Bitcoin genesis to major hacks, milestones, and cultural moments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="timeline" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
