import React from "react";

import { ResultImagePreview } from "@/components/ResultImagePreview";
import { cn } from "@/lib/utils";

interface ImageCanvasPreviewProps {
  alt: string;
  className?: string;
  emptyState?: React.ReactNode;
  imageClassName?: string;
  imageSrc?: string;
  imageStyle?: React.CSSProperties;
}

export const ImageCanvasPreview: React.FC<ImageCanvasPreviewProps> = ({
  alt,
  className,
  emptyState,
  imageClassName,
  imageSrc,
  imageStyle,
}) => {
  if (!imageSrc) {
    return (
      <div className={cn("rounded-lg border border-border/70 bg-muted/20", className)}>
        {emptyState}
      </div>
    );
  }

  return (
    <ResultImagePreview
      src={imageSrc}
      alt={alt}
      className={cn("w-full rounded-lg border", imageClassName)}
      style={imageStyle}
      triggerClassName={className}
    />
  );
};
