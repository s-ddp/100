export const metadata = {
  title: "AquaVoyage — билеты на водные экскурсии",
  description: "Онлайн покупка билетов на водные экскурсии и круизы",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
