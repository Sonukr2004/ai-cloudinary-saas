import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CloudCraft Studio",
  description:
    "Compress videos and create social-ready images with Cloudinary and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="cloudcraft">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
