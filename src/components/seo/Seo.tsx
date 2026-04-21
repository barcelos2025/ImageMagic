import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

import { useLanguage } from "@/contexts/LanguageContext";
import { SITE_CONFIG, Locale, getSiteUrl } from "@/lib/seo/siteConfig";
import { PAGE_META, PageMetaId } from "@/lib/seo/metaConfig";

const LOCALE_TO_OG: Record<Locale, string> = {
  en: "en_US",
  pt: "pt_BR",
  es: "es_ES",
};

export interface StructuredDataDescriptor {
  id: string;
  data: Record<string, unknown>;
}

export interface SeoProps {
  pageId: PageMetaId;
  titleOverride?: string;
  descriptionOverride?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  structuredData?: StructuredDataDescriptor[];
  additionalMeta?: Array<{ name?: string; property?: string; content: string }>;
}

const createWebPageSchema = (
  locale: Locale,
  url: string,
  title: string,
  description: string,
) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  url,
  inLanguage: locale,
  description,
  isPartOf: {
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: getSiteUrl("/"),
  },
});

const createFAQSchema = (
  locale: Locale,
  entries: NonNullable<(typeof PAGE_META)[keyof typeof PAGE_META]["faq"]>,
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: entries.map((item) => ({
    "@type": "Question",
    name: item.question[locale],
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer[locale],
    },
  })),
});

export const Seo: React.FC<SeoProps> = ({
  pageId,
  titleOverride,
  descriptionOverride,
  canonicalPath,
  noIndex,
  structuredData,
  additionalMeta,
}) => {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const meta = PAGE_META[pageId];

  const canonical = canonicalPath || meta.path || pathname;
  const canonicalUrl = getSiteUrl(canonical);

  const { title, description, keywords } = useMemo(
    () => ({
      title: titleOverride || meta.titles[language],
      description: descriptionOverride || meta.descriptions[language],
      keywords: meta.keywords[language].join(", "),
    }),
    [descriptionOverride, language, meta.descriptions, meta.keywords, meta.titles, titleOverride],
  );

  const mergedStructuredData: StructuredDataDescriptor[] = [
    { id: "webpage", data: createWebPageSchema(language, canonicalUrl, title, description) },
    ...(meta.faq?.length ? [{ id: "faq", data: createFAQSchema(language, meta.faq) }] : []),
    ...(structuredData ?? []),
  ];

  return (
    <Helmet>
      <html lang={language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={meta.type || "website"} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      {meta.ogImage ? <meta property="og:image" content={meta.ogImage} /> : null}
      <meta property="og:locale" content={LOCALE_TO_OG[language]} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {meta.ogImage ? <meta name="twitter:image" content={meta.ogImage} /> : null}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      {additionalMeta?.map((metaItem, index) => (
        <meta key={`${metaItem.name || metaItem.property}-${index}`} {...metaItem} />
      ))}
      {mergedStructuredData.map((entry) => (
        <script
          key={entry.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry.data) }}
        />
      ))}
    </Helmet>
  );
};
