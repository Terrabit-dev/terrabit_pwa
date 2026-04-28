import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
// 1. Importamos el proveedor desde nuestra carpeta hooks
import { I18nProvider } from "@/hooks/useI18n";
import { ThemeProvider } from "@/context/ThemeContext";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Terrabit",
  description: "Gestió ramadera - Bovins i Porcins",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/terrabit_prime_sin_letra.png",
    apple: "/images/terrabit_prime_sin_letra.png",
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
      <html lang="es" suppressHydrationWarning>
      <head>
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <script
              dangerouslySetInnerHTML={{
                  __html: `(function(){try{var t=localStorage.getItem('terrabit_theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
              }}
          />
      </head>
      <body className={geist.className}>
      <I18nProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </I18nProvider>
      </body>
      </html>
  );
}