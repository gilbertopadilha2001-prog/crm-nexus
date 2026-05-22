import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard Nexus — CRM Imobiliário",
  description: "Dashboard Nexus Inovações Imobiliárias — CRM com WhatsApp Business",
  icons: {
    icon: "/images/nexus-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${inter.variable} h-full antialiased`}
      style={
        {
          "--font-sans": "var(--font-inter), system-ui, sans-serif",
          "--font-display": "var(--font-dm-sans), var(--font-inter), system-ui, sans-serif",
        } as React.CSSProperties
      }
    >
      <body className="min-h-full bg-background text-foreground">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
