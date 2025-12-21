import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AquaVoyage — билеты на водные экскурсии",
  description: "Билеты на водные экскурсии и прогулки",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
