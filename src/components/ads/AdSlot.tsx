import React, { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AdSlotProps {
  slot?: string;
  className?: string;
}

const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID;
const CONSENT_KEY = "imagemagic-consent";
const CONSENT_EVENT = "imagemagic-consent-accepted";

export const AdSlot: React.FC<AdSlotProps> = ({ slot = "ad-slot", className }) => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncConsentState = () => {
      try {
        setHasConsent(window.localStorage.getItem(CONSENT_KEY) === "accepted");
      } catch (_error) {
        setHasConsent(false);
      }
    };

    syncConsentState();
    window.addEventListener(CONSENT_EVENT, syncConsentState);

    return () => {
      window.removeEventListener(CONSENT_EVENT, syncConsentState);
    };
  }, []);

  if (!ADSENSE_CLIENT_ID || !hasConsent) {
    return null;
  }

  return (
    <Card
      role="complementary"
      aria-label={slot}
      className={cn(
        "flex h-24 items-center justify-center border border-border/60 bg-muted/30 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground",
        className,
      )}
    >
      <span>{slot.replace(/-/g, " ")}</span>
    </Card>
  );
};

export default AdSlot;
