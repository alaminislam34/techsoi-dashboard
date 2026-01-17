import "./globals.css";
import { StateProvider } from "./providers/StateProvider";
import TanstackqueryProvider from "./providers/TanstackqueryProvider";

export const metadata = {
  title: "Techsoi BD",
  description: "Techsoi BD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TanstackqueryProvider>
          <StateProvider>{children}</StateProvider>
        </TanstackqueryProvider>
      </body>
    </html>
  );
}
