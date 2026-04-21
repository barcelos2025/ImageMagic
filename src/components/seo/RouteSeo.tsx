import React from "react";
import { useLocation } from "react-router-dom";

import { Seo } from "@/components/seo/Seo";
import { getPageMetaByPath, PageMetaId } from "@/lib/seo/metaConfig";

const DEFAULT_PAGE_ID: PageMetaId = "home";

const RouteSeo: React.FC = () => {
  const { pathname } = useLocation();
  const meta = getPageMetaByPath(pathname);
  const pageId = (meta?.id as PageMetaId) || DEFAULT_PAGE_ID;

  return <Seo pageId={pageId} />;
};

export default RouteSeo;
