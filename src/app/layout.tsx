import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Url Shortener",
  description: "Make Your Url Easy to Remember",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Toaster
          richColors // makes toast more colorful
          expand // toasts don't overlap
          closeButton // toasts have a close button
          duration={8000} // toasts last 8 seconds
          toastOptions={{
            classNames: {
              title: "text-base", // toasts have a 1rem font size
            },
          }}
        />
      </body>
    </html>
  );
}
