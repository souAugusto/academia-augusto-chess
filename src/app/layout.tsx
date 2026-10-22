import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { ToastProvider } from "@/components/ui/Toast";
import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { BRAND } from "@/content/brand";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

// Sem o eixo "opsz" (ajuste óptico): o arquivo cai pela metade e a diferença
// nos títulos é imperceptível.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.academiafinale.site",
  ),
  title: { default: `${BRAND.fullName}`, template: `%s · ${BRAND.shortName}` },
  description: BRAND.description,
  applicationName: BRAND.shortName,
  // O Next gera "mobile-web-app-capable"; o iOS antigo ainda lê a tag da Apple.
  other: { "apple-mobile-web-app-capable": "yes" },
  appleWebApp: {
    capable: true,
    title: BRAND.shortName,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: BRAND.fullName,
    title: BRAND.fullName,
    description: BRAND.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0D12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      // O script do tema muda data-theme antes da hidratação.
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
          <PreferencesProvider>
            <ToastProvider>{children}</ToastProvider>
          </PreferencesProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
