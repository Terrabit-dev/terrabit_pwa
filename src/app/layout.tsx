import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
// 1. Importamos el proveedor desde nuestra carpeta hooks
import { I18nProvider } from "@/hooks/useI18n"; 

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Terrabit",
  description: "Gestió ramadera - Bovins i Porcins",
  manifest: "/manifest.json",
  icons: {
    icon: "/public/images/terrabit_prime_sin_letra.png",
    apple: "/public/images/terrabit_prime_sin_letra.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Terrabit",
  },
};

export const viewport: Viewport = {
  themeColor: "#2E7D32",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning style={{ colorScheme: "light" }}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={geist.className}>
        {/* 2. Envolvemos a los hijos con el I18nProvider */}
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}