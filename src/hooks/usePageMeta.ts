import { useLanguage } from "@/contexts/LanguageContext";
import { PAGE_META, PageMetaId } from "@/lib/seo/metaConfig";

export const usePageMeta = (pageId: PageMetaId) => {
  const { language } = useLanguage();
  const meta = PAGE_META[pageId];
  return {
    meta,
    language,
    title: meta.titles[language],
    description: meta.descriptions[language],
    path: meta.path,
  };
};
