import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: {
    default: "Style AI – Smart Comfort Meets Style",
    template: "%s | Style AI",
  },
  description:
    "Personalized fashion recommendations based on skin type, comfort and sustainability. AI stylist, skin forecast, fabric encyclopedia and Label Lens.",
  keywords: ["fashion", "AI stylist", "skin safety", "sustainable fashion", "fabric", "comfort"],
  authors: [{ name: "Style AI" }],
  openGraph: {
    title: "Style AI – Smart Comfort Meets Style",
    description: "Skin-safe, sustainable fashion powered by AI.",
    type: "website",
    siteName: "Style AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Style AI – Smart Comfort Meets Style",
    description: "Skin-safe, sustainable fashion powered by AI.",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4A90E2" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 dark:bg-[#0F172A] dark:text-[#E2E8F0]"
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>{children}</ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
