import React from "react";
import { Clock3, Cpu, Shield } from "@/components/icons";

import { useLanguage } from "@/contexts/LanguageContext";

const NOTICE_COPY = {
  en: {
    eyebrow: "ImageMagic",
    title: "100% local processing. 100% free.",
    description:
      "Everything runs on your device, not on our server. That removes server-side image costs, keeps the site free, and can make heavier tasks slower on low-end hardware.",
    points: [
      { label: "Runs on your device", icon: Cpu },
      { label: "No server-side image cost", icon: Shield },
      { label: "May be slower on weaker hardware", icon: Clock3 },
    ],
  },
  pt: {
    eyebrow: "ImageMagic",
    title: "Processamento 100% local. Uso 100% gratuito.",
    description:
      "Tudo roda no seu equipamento, e não no nosso servidor. Isso elimina custo de processamento de imagem em servidor, mantém o site gratuito e pode deixar tarefas pesadas mais lentas em hardware modesto.",
    points: [
      { label: "Roda no seu dispositivo", icon: Cpu },
      { label: "Sem custo de imagem no servidor", icon: Shield },
      { label: "Pode ficar mais lento em hardware fraco", icon: Clock3 },
    ],
  },
  es: {
    eyebrow: "ImageMagic",
    title: "Procesamiento 100% local. Uso 100% gratuito.",
    description:
      "Todo se ejecuta en tu dispositivo y no en nuestro servidor. Eso elimina el costo de procesamiento de imágenes en servidor, mantiene el sitio gratuito y puede hacer más lentas las tareas pesadas en hardware modesto.",
    points: [
      { label: "Se ejecuta en tu dispositivo", icon: Cpu },
      { label: "Sin costo de imagen en servidor", icon: Shield },
      { label: "Puede ir más lento en hardware débil", icon: Clock3 },
    ],
  },
} as const;

const LocalProcessingNotice: React.FC = () => {
  const { language } = useLanguage();
  const copy = NOTICE_COPY[language];

  return (
    <section className="container pb-4">
      <div className="rounded-[2rem] border border-primary/15 bg-card/90 px-5 py-5 shadow-sm md:px-7 md:py-6">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{copy.eyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">{copy.title}</h2>
          <p className="mx-auto mt-3 max-w-4xl text-sm leading-6 text-muted-foreground md:text-base">
            {copy.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {copy.points.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.label}
                  className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{point.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalProcessingNotice;
