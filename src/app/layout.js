import "./globals.css";
import { StateProvider } from "./providers/StateProvider";

export const metadata = {
  title: "Techsoi BD",
  description: "Techsoi BD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StateProvider>{children}</StateProvider>
      </body>
    </html>
  );
}
