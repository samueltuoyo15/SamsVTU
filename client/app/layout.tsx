import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/auth-context"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwiftBills",
  description: "A high-performance VTU (Virtual Top-Up) web application built with Next Js, Golang backend, and Monnify API integration. This platform enables users to buy airtime/data, pay bills e.t.c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} select-none`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


