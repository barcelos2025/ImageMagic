import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { getBrowserCookie, setBrowserCookie } from "@/lib/browserCookies";

const CONSENT_KEY = "imagemagic-consent";
const CONSENT_EVENT = "imagemagic-consent-accepted";

const ConsentBanner: React.FC = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = getBrowserCookie(CONSENT_KEY) ?? localStorage.getItem(CONSENT_KEY);
      if (!stored) {
        setVisible(true);
      }
    } catch (error) {
      console.warn("Unable to read consent value", error);
    }
  }, []);

  const handleChoice = (value: "accepted" | "declined") => {
    try {
      setBrowserCookie(CONSENT_KEY, value, 180);
      localStorage.setItem(CONSENT_KEY, value);
      if (value === "accepted") {
        window.dispatchEvent(new Event(CONSENT_EVENT));
      }
    } catch (error) {
      console.warn("Unable to save consent value", error);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-background/95 p-4 shadow-lg backdrop-blur">
      <div className="container mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{t("consent.title")}</p>
          <p className="text-xs text-muted-foreground">{t("consent.body")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleChoice("declined")}>
            {t("consent.decline")}
          </Button>
          <Button size="sm" onClick={() => handleChoice("accepted")}>
            {t("consent.accept")}
          </Button>
          <Button variant="link" size="sm" className="text-xs" asChild>
            <Link to="/privacy">{t("consent.policy")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
