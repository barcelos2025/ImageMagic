import { useEffect } from "react";

import { getBrowserCookie } from "@/lib/browserCookies";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const CONSENT_KEY = "imagemagic-consent";
const CONSENT_EVENT = "imagemagic-consent-accepted";

export const useAnalytics = () => {
  useEffect(() => {
    if (!GA_ID) return;
    let initialized = false;

    const initAnalytics = () => {
      if (initialized) return;
      if (typeof window === "undefined") return;

      initialized = true;
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: unknown[]) => {
        window.dataLayer?.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", GA_ID);
    };

    try {
      const storedConsent = getBrowserCookie(CONSENT_KEY) ?? window.localStorage.getItem(CONSENT_KEY);
      if (storedConsent === "accepted") {
        initAnalytics();
      }
    } catch (error) {
      console.warn("Unable to read consent preference", error);
    }

    const handleAccepted = () => initAnalytics();
    window.addEventListener(CONSENT_EVENT, handleAccepted);

    return () => {
      window.removeEventListener(CONSENT_EVENT, handleAccepted);
    };
  }, []);
};
