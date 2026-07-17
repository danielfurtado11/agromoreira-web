import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AdminBar } from "@/components/AdminBar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SESSION_COOKIE } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgroMoreira's · AgroFontaínhas",
  description:
    "Agricultura, ferragens, rações e produtos de limpeza — empresa familiar ao serviço da região há mais de 30 anos.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAdmin = Boolean(cookieStore.get(SESSION_COOKIE));

  return (
    <html
      lang="pt-PT"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        // The header is sticky at 89px tall; the admin bar adds another 36px
        // (h-9) on top of it when signed in. Read by CategorySidebar and
        // CatalogueView so their own sticky offsets stay correct without
        // each of them having to check the admin session themselves.
        style={
          {
            "--catalogue-offset": isAdmin ? "125px" : "89px",
          } as React.CSSProperties
        }
      >
        <AdminBar />
        <AnnouncementBar />
        <Header isAdmin={isAdmin} />
        {/* Flex column so a page can grow to fill the height above the footer
            (used e.g. by the catalogue's full-height left sidebar). */}
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
