import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import BackToTop from "@/components/BackToTop";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSite } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

const display = Manrope({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const ogImage = site.leagueImage || "/images/malaka-profile.jpg";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${site.name} — ${site.tagline}`,
      template: `%s · ${site.name}`,
    },
    description: site.description,
    keywords: [
      "Path of Exile",
      "Path of Exile 1",
      "PoE",
      "builds PoE",
      "league starter",
      "MalakaTV",
      "guias Path of Exile",
      "PoE pt-BR",
      "farms PoE",
      "Path of Exile 2",
      "Hero Siege",
    ],
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: `${site.name} — ${site.tagline}`,
      description: site.description,
      type: "website",
      locale: "pt_BR",
      siteName: site.name,
      url: SITE_URL,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: SITE_URL,
    inLanguage: "pt-BR",
    description: site.description,
    publisher: {
      "@type": "Person",
      name: site.name,
      sameAs: [site.youtube, site.discord].filter(Boolean),
    },
  };

  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteHeader />
        <main className="animate-fade-up">{children}</main>
        <SiteFooter />
        <BackToTop />
      </body>
    </html>
  );
}
