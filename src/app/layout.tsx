import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import BackToTop from "@/components/BackToTop";
import { MotionProvider } from "@/components/Motion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getGames, getSite } from "@/lib/content";
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
  const [site, games] = await Promise.all([getSite(), getGames()]);
  const gameKeywords = games.flatMap((game) => [game.name, game.shortName]);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${site.name} — ${site.tagline}`,
      template: `%s · ${site.name}`,
    },
    description: site.description,
    keywords: [
      "ARPG",
      "builds",
      "guias",
      "farms",
      "MalakaTV",
      "ARPG pt-BR",
      ...gameKeywords,
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
    },
    twitter: {
      card: "summary_large_image",
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
      sameAs: [
        site.youtube,
        site.discord,
        site.twitch,
        site.instagram,
        site.facebook,
        site.kick,
      ].filter(Boolean),
    },
  };

  const themeScript = `(function(){try{if(localStorage.getItem('malaka-theme')==='dark'){var d=document.documentElement;d.classList.add('dark');d.style.colorScheme='dark';}}catch(e){}})();`;

  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <MotionProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-on-primary focus:shadow-lg"
          >
            Pular para o conteúdo
          </a>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
          <BackToTop />
        </MotionProvider>
      </body>
    </html>
  );
}
