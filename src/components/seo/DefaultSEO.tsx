import { Helmet } from "react-helmet-async";

import { SITE_CONFIG, getSiteUrl } from "@/lib/seo/siteConfig";

const SOFTWARE_APPLICATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ImageMagic",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  url: getSiteUrl("/"),
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID;

const DefaultSEO = () => {
  const searchConsoleToken = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;
  const themeColor = "#1e1b4b";

  return (
    <Helmet>
      <meta name="application-name" content={SITE_CONFIG.name} />
      <meta name="theme-color" content={themeColor} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={SITE_CONFIG.shortName} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content={themeColor} />
      <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      {ADSENSE_CLIENT_ID ? <link rel="preconnect" href="https://pagead2.googlesyndication.com" /> : null}
      <link
        rel="preload"
        as="style"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
      />
      {searchConsoleToken ? <meta name="google-site-verification" content={searchConsoleToken} /> : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_APPLICATION_SCHEMA) }}
      />
    </Helmet>
  );
};

export default DefaultSEO;
