import "./globals.css";

export const metadata = {
  title: "Techsoi BD",
  description: "Techsoi BD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
