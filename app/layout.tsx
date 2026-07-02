import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-store";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

// FONT OPTIMIZATION (next/font):
// - Fonts are self-hosted at build time (no runtime request to Google, no
//   render-blocking third-party round trip).
// - `display: "swap"` avoids invisible text (FOIT).
// - next/font computes fallback metrics automatically, so swapping from the
//   fallback to the web font causes ~zero layout shift (protects CLS).
// - Each face is exposed as a CSS variable consumed by tailwind.config.ts.
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-display",
});
const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kiln.example"),
  title: { default: "Kiln — handmade ceramics", template: "%s · Kiln" },
  description: "A marketplace for handmade ceramics and homegoods, thrown by independent studios.",
  openGraph: { type: "website", siteName: "Kiln" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">
        {/* CartProvider is a Client Component; everything inside can still be
            Server Components — the provider only hydrates the interactive bits. */}
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
