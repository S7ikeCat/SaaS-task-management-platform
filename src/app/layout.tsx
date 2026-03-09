import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/widgets/navbar/ui/navbar";
import { ScrollRestoration } from "@/shared/ui/scroll-restoration";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <ScrollRestoration />
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}