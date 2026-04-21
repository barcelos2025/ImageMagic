import React from "react";

import { getToolContent, ToolId } from "@/content/toolCopy";
import { useLanguage } from "@/contexts/LanguageContext";
import { Locale } from "@/lib/seo/siteConfig";

interface ToolNarrativeProps {
  toolId: ToolId;
}

const HEADLINES: Record<ToolId, Record<Locale, { title: string; subtitle: string }>> = {
  resize: {
    en: {
      title: "Expert guide to ImageMagic resize workflows",
      subtitle:
        "Structured best practices for marketers, designers, and developers who depend on predictable image dimensions.",
    },
    pt: {
      title: "Guia profissional para fluxos de redimensionar",
      subtitle:
        "Boas práticas estruturadas para equipes que precisam manter proporções coerentes em todos os canais.",
    },
    es: {
      title: "Guía profesional de flujos de redimensionado",
      subtitle:
        "Buenas prácticas para equipos que buscan dimensiones coherentes en cada canal digital.",
    },
  },
  convert: {
    en: {
      title: "Strategies for fast format conversion",
      subtitle: "Learn how to balance file size, quality, and compliance while distributing creative assets across every channel.",
    },
    pt: {
      title: "Estratégias para conversão de formatos",
      subtitle: "Equilibre tamanho de arquivo, qualidade e compliance ao distribuir criativos em vários canais.",
    },
    es: {
      title: "Estrategias para conversión de formatos",
      subtitle: "Equilibra peso, calidad y cumplimiento al distribuir creatividades en múltiples canales.",
    },
  },
  removeBackground: {
    en: {
      title: "Master background removal for ecommerce",
      subtitle: "Tactical tips for clean cutouts, consistent catalogs, and high-converting creatives.",
    },
    pt: {
      title: "Domine a remoção de fundo para ecommerce",
      subtitle: "Dicas práticas para recortes limpos, catálogos consistentes e criativos que convertem.",
    },
    es: {
      title: "Domina la eliminación de fondo para ecommerce",
      subtitle: "Consejos prácticos para recortes limpios, catálogos consistentes y creatividades de alta conversión.",
    },
  },
  upscale: {
    en: {
      title: "Super resolution playbook with ImageMagic",
      subtitle:
        "Repeatable processes to upscale legacy assets, preserve detail, and accelerate hi-res publishing.",
    },
    pt: {
      title: "Playbook de super resolução com ImageMagic",
      subtitle: "Processos replicáveis para ampliar imagens antigas, preservar detalhes e acelerar publicações em alta resolução.",
    },
    es: {
      title: "Playbook de super resolución con ImageMagic",
      subtitle: "Procesos replicables para ampliar imágenes antiguas, preservar detalles y lanzar contenido 4K rápidamente.",
    },
  },
};

const SUPPORTING_COPY: Record<Locale, string> = {
  en: "Practical guidance designed for marketers, designers, and developers who rely on predictable image workflows.",
  pt: "Orientações práticas para profissionais de marketing, design e tecnologia que dependem de fluxos previsíveis de imagem.",
  es: "Guía práctica para profesionales de marketing, diseño y desarrollo que confían en flujos de imagen predecibles.",
};

const ToolNarrative: React.FC<ToolNarrativeProps> = ({ toolId }) => {
  const { language } = useLanguage();
  const sections = getToolContent(toolId, language);
  const headline = HEADLINES[toolId][language];
  const supporting = SUPPORTING_COPY[language];

  return (
    <section className="container space-y-6 py-10" aria-labelledby={`${toolId}-guide`}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 id={`${toolId}-guide`} className="text-2xl font-bold tracking-tight sm:text-3xl">
          {headline.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{headline.subtitle}</p>
        <p className="mt-3 text-xs text-muted-foreground/80">{supporting}</p>
      </div>
      <div className="mx-auto grid max-w-5xl gap-6">
        {sections.map((section) => (
          <article key={section.heading} className="rounded-xl border border-border/60 bg-background/80 p-6 shadow-sm">
            <h3 className="text-xl font-semibold">{section.heading}</h3>
            <div className="mt-3 space-y-4 text-sm leading-relaxed text-foreground/90">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ToolNarrative;
