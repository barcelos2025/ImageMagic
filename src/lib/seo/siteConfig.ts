export const SUPPORTED_LOCALES = ["en", "pt", "es"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const SITE_CONFIG = {
  name: "ImageMagic",
  shortName: "ImageMagic",
  defaultLocale: "en" as Locale,
  domain: "https://imagemagic.com",
  publisherName: import.meta.env.VITE_PUBLISHER_NAME || "ImageMagic",
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || "support@imagemagic.com",
  legalEmail:
    import.meta.env.VITE_LEGAL_EMAIL ||
    import.meta.env.VITE_SUPPORT_EMAIL ||
    "support@imagemagic.com",
};

export const getSiteUrl = (pathname = "/"): string => {
  const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
  const base = import.meta.env.VITE_SITE_URL || runtimeOrigin || SITE_CONFIG.domain;
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return new URL(normalized, base)
    .toString()
    .replace(/\/$/, pathname.endsWith("/") ? "/" : "");
};

export const getLocaleLabel = (locale: Locale): string => {
  switch (locale) {
    case "pt":
      return "Portuguese";
    case "es":
      return "Spanish";
    default:
      return "English";
  }
};
