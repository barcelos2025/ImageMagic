import React from "react";
import { Link } from "react-router-dom";
import { Mail, Shield, Sparkles } from "@/components/icons";

import { useLanguage } from "@/contexts/LanguageContext";
import { SITE_CONFIG } from "@/lib/seo/siteConfig";

const FOOTER_COPY = {
  en: {
    tagline: "Professional image workflows",
    description:
      "Image processing runs in the browser on the user's device, which avoids server-side image costs and helps keep the tools free to use.",
    tools: "Tools",
    company: "Company",
    resizeUpscale: "Resize and upscale",
    pricingAvailability: "Pricing and availability",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    copyright: "© 2026 ImageMagic. Browser-based image tools with transparent policies.",
    adsNotice: "Ads appear only when a verified Google configuration and consent flow are enabled.",
  },
  pt: {
    tagline: "Fluxos profissionais de imagem",
    description:
      "O processamento de imagem roda no navegador, no equipamento do usuário, o que evita custos de servidor e ajuda a manter as ferramentas gratuitas.",
    tools: "Ferramentas",
    company: "Empresa",
    resizeUpscale: "Redimensionar e ampliar",
    pricingAvailability: "Preços e disponibilidade",
    privacy: "Política de privacidade",
    terms: "Termos de uso",
    copyright: "© 2026 ImageMagic. Ferramentas de imagem no navegador com políticas transparentes.",
    adsNotice: "Os anúncios só aparecem quando existe uma configuração do Google validada e um fluxo de consentimento ativo.",
  },
  es: {
    tagline: "Flujos profesionales de imagen",
    description:
      "El procesamiento de imagen se ejecuta en el navegador, en el dispositivo del usuario, lo que evita costos de servidor y ayuda a mantener las herramientas gratuitas.",
    tools: "Herramientas",
    company: "Empresa",
    resizeUpscale: "Redimensionar y ampliar",
    pricingAvailability: "Precios y disponibilidad",
    privacy: "Política de privacidad",
    terms: "Términos de uso",
    copyright: "© 2026 ImageMagic. Herramientas de imagen en el navegador con políticas transparentes.",
    adsNotice: "Los anuncios solo aparecen cuando existe una configuración de Google verificada y un flujo de consentimiento activo.",
  },
} as const;

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const copy = FOOTER_COPY[language];

  return (
    <footer className="border-t border-border/50 bg-background/70">
      <div className="container py-16">
        <div className="grid gap-10 rounded-[2rem] border border-border/70 bg-card/88 p-8 shadow-sm md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary shadow-sm">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-xl font-semibold tracking-tight text-foreground">{t("home.title")}</span>
                <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{copy.tagline}</span>
              </div>
            </div>
            <p className="max-w-md text-sm leading-7 text-muted-foreground">
              {copy.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">{copy.tools}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/resize" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.resize")}
                </Link>
              </li>
              <li>
                <Link to="/convert" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.convert")}
                </Link>
              </li>
              <li>
                <Link
                  to="/remove-background"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("nav.removeBackground")}
                </Link>
              </li>
              <li>
                <Link to="/magic-brush" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.magicBrush")}
                </Link>
              </li>
              <li>
                <Link to="/resize-upscale" className="text-muted-foreground transition-colors hover:text-foreground">
                  {copy.resizeUpscale}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">{copy.company}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
                  {copy.pricingAvailability}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                  {copy.privacy}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground transition-colors hover:text-foreground">
                  {copy.terms}
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.supportEmail}`}
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  {SITE_CONFIG.supportEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 px-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{copy.copyright}</p>
          <p className="inline-flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {copy.adsNotice}
          </p>
        </div>
      </div>
    </footer>
  );
};
