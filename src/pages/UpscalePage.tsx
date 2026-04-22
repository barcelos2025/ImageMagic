import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "@/components/icons";

import LocalProcessingNotice from "@/components/LocalProcessingNotice";
import ToolHero from "@/components/ToolHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const UPSCALE_COPY = {
  en: {
    heroDescription: "The standalone upscale route now points users to the maintained resize plus upscale workflow.",
    cardTitle: "Use the maintained workflow",
    cardDescription:
      "To reduce thin content and keep destination pages aligned with the actual product, the supported path is the combined resize and upscale page.",
    action: "Open resize and upscale",
  },
  pt: {
    heroDescription: "A rota isolada de ampliação agora direciona o usuário para o fluxo mantido de redimensionar e ampliar.",
    cardTitle: "Use o fluxo mantido",
    cardDescription:
      "Para reduzir conteúdo raso e manter as páginas coerentes com o produto real, o caminho suportado é a página combinada de redimensionar e ampliar.",
    action: "Abrir redimensionar e ampliar",
  },
  es: {
    heroDescription: "La ruta aislada de ampliación ahora dirige al usuario al flujo mantenido de redimensionar y ampliar.",
    cardTitle: "Usa el flujo mantenido",
    cardDescription:
      "Para reducir contenido superficial y mantener las páginas alineadas con el producto real, la ruta soportada es la página combinada de redimensionar y ampliar.",
    action: "Abrir redimensionar y ampliar",
  },
} as const;

const UpscalePage = () => {
  const { language, t } = useLanguage();
  const copy = UPSCALE_COPY[language];

  return (
    <div className="container space-y-8 py-12">
      <ToolHero
        pageId="upscale"
        icon={<TrendingUp className="h-6 w-6 text-white" />}
        title={t("tools.upscale.title")}
        description={copy.heroDescription}
        badgeClassName="bg-gradient-to-br from-indigo-500 to-purple-500"
      />

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>{copy.cardTitle}</CardTitle>
          <CardDescription>{copy.cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-gradient-primary text-primary-foreground">
            <Link to="/resize-upscale">{copy.action}</Link>
          </Button>
        </CardContent>
      </Card>

      <LocalProcessingNotice contained={false} className="pb-0" />
    </div>
  );
};

export default UpscalePage;
