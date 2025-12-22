import "./globals.css";
import SiteHeader from "./ui/SiteHeader";

export const metadata = {
  title: "AquaVoyage",
  description: "Экскурсии и аренда водного транспорта",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {/* Хедер */}
        <SiteHeader />

        {/* Контент всех страниц */}
        <main style={{ paddingTop: "96px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
