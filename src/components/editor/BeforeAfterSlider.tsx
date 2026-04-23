import React from "react";

import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  className,
}) => (
  <div className={cn("polaroid-photo", className)}>
    <div className="photo-half photo-before" style={{ backgroundImage: `url(${beforeImage})` }}>
      <span>{beforeLabel}</span>
    </div>
    <div className="photo-half photo-after" style={{ backgroundImage: `url(${afterImage})` }}>
      <span>{afterLabel}</span>
    </div>
    <div className="photo-divider" />
    <div className="photo-handle">&lt;&gt;</div>
  </div>
);
