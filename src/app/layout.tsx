import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { BRAND } from "@/content/brand";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const fraunces = Fraunces({
  axes: ["opsz"],
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://academia-augusto-chess.vercel.app",
  ),
  title: { default: `${BRAND.fullName}`, template: `%s · ${BRAND.shortName}` },
  description: BRAND.description,
  applicationName: BRAND.shortName,
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
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
