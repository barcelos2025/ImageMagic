import React from "react";

import ShareButtons from "@/components/seo/ShareButtons";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PageMetaId } from "@/lib/seo/metaConfig";
import { cn } from "@/lib/utils";

interface ToolHeroProps {
  pageId: PageMetaId;
  icon: React.ReactNode;
  title: string;
  description: string;
  badgeClassName?: string;
}

const ToolHero: React.FC<ToolHeroProps> = ({ pageId, icon, title, description, badgeClassName }) => {
  const { title: shareTitle, description: shareDescription, path } = usePageMeta(pageId);

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/90 px-6 py-8 shadow-sm backdrop-blur-sm md:px-8 md:py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm",
                badgeClassName || "bg-gradient-primary",
              )}
            >
              {icon}
            </div>
            <span className="font-medium uppercase tracking-[0.18em] text-foreground/80">ImageMagic</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{description}</p>
          </div>
        </div>

        <div className="md:max-w-sm md:pl-6">
          <ShareButtons title={shareTitle} description={shareDescription} path={path} />
        </div>
      </div>
    </section>
  );
};

export default ToolHero;
