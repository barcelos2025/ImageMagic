import React from "react";
import { Share2, Linkedin, Twitter, Link } from "@/components/icons";

import { useLanguage } from "@/contexts/LanguageContext";
import { getSiteUrl } from "@/lib/seo/siteConfig";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ShareButtonsProps {
  title: string;
  description: string;
  path: string;
}

const openShareWindow = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=540");
};

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, description, path }) => {
  const { t } = useLanguage();
  const canonical = getSiteUrl(path);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(canonical);
      toast({ description: t("share.copied") });
    } catch (error) {
      console.error("Failed to copy share link", error);
      toast({ variant: "destructive", description: t("share.error") });
    }
  };

  const shareHandlers = {
    twitter: () =>
      openShareWindow(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(title)}`,
      ),
    linkedin: () =>
      openShareWindow(
        `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(canonical)}&title=${encodeURIComponent(
          title,
        )}&summary=${encodeURIComponent(description)}`,
      ),
  };

  const supportsNavigatorShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleNativeShare = async () => {
    if (!supportsNavigatorShare) return;
    try {
      await navigator.share({ title, text: description, url: canonical });
    } catch (error) {
      console.error("Native share cancelled", error);
      toast({ description: t("share.cancelled") });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {supportsNavigatorShare ? (
        <Button variant="outline" size="sm" onClick={handleNativeShare} aria-label={t("share.native")}>
          <Share2 className="mr-2 h-4 w-4" /> {t("share.native")}
        </Button>
      ) : null}
      <Button variant="outline" size="sm" onClick={shareHandlers.twitter} aria-label={t("share.twitter")}>
        <Twitter className="mr-2 h-4 w-4" /> {t("share.twitter")}
      </Button>
      <Button variant="outline" size="sm" onClick={shareHandlers.linkedin} aria-label={t("share.linkedin")}>
        <Linkedin className="mr-2 h-4 w-4" /> {t("share.linkedin")}
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopy} aria-label={t("share.copy")}>
        <Link className="mr-2 h-4 w-4" /> {t("share.copy")}
      </Button>
    </div>
  );
};

export default ShareButtons;
