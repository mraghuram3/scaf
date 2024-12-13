import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import React, {Suspense} from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthContentProvider } from "@/hooks/auth-provider";
import { CSPostHogProvider } from "./providers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
export const metadata: Metadata = {
  title: "Scaffold - Free and Open-Source Scaffolding Tool",
  description:
    "Scaffold is a free and open-source scaffolding tool to bootstrap your next project.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <CSPostHogProvider>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <Suspense>
            <AuthContentProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                disableTransitionOnChange
              >
                <SiteHeader />
                <main className="mx-auto flex-1 overflow-hidden">{children}</main>
                <SiteFooter />
                <Toaster />
              </ThemeProvider>
            </AuthContentProvider>
          </Suspense>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
