@'
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import SiteHeader from "./ui/SiteHeader";
import SiteFooter from "./ui/SiteFooter";

export const metadata: Metadata = {
  title: "Билеты на водные экскурсии",
  description: "AquaVoyage — билеты на водные экскурсии",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
'@ | Set-Content -Encoding utf8 "app\layout.tsx"
