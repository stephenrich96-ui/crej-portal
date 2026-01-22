import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CREJ Staff Portal",
  description: "Internal staff portal for training, SOPs, and compliance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
