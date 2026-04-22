import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Eraser,
  ImageIcon,
  Leaf,
  RefreshCw,
  RotateCcw,
  Scissors,
  Sparkles,
  StretchHorizontal,
  Upload,
  Wand2,
} from "@/components/icons";

import { AdSlot } from "@/components/ads/AdSlot";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const HOME_COPY = {
  en: {
    eyebrow: "Natural browser editing",
    heroTitle: "Cultivate visual clarity with a gentle workflow.",
    heroDescription:
      "ImageMagic helps you resize, convert, remove backgrounds, upscale with AI, and clean image details without sending files through a heavy workflow.",
    primaryCta: "Start creating",
    secondaryCta: "View tools",
    toolsTitle: "Transformative tools",
    toolsDescription:
      "Compare the difference before opening a tool. Each workflow is focused on practical image cleanup and export-ready results.",
    previousLabel: "Previous tool preview",
    nextLabel: "Next tool preview",
    beforeLabel: "Before",
    afterLabel: "After",
    openTool: "Open tool",
    workflowTitle: "Local-first workflow",
    workflowDescription:
      "The main tools process images in the browser whenever possible, reducing upload friction and keeping the editing flow lightweight.",
    workflowAction: "Learn about privacy",
    fineTuneTitle: "Fine-tune adjustments",
    fineTuneDescription:
      "Practical controls for size, format, background cleanup, and high-resolution output stay close to the image.",
    roadmapTitle: "Next capabilities",
    roadmapDescription:
      "These additions fit the same calm workflow while expanding what ImageMagic can edit.",
    trustItems: ["Browser processing", "No account required", "Clear export controls"],
    stories: [
      {
        title: "Smart Resize",
        caption: "Prepare clean dimensions for publishing.",
        path: "/resize",
        scene: "photo-scene-landscape",
      },
      {
        title: "Background Eraser",
        caption: "Isolate subjects with local AI precision.",
        path: "/remove-background",
        scene: "photo-scene-product",
      },
      {
        title: "AI Upscale",
        caption: "Increase resolution from 2x to 10x.",
        path: "/resize-upscale",
        scene: "photo-scene-portrait",
      },
      {
        title: "Magic Eraser",
        caption: "Remove repeated marks and objects.",
        path: "/magic-brush",
        scene: "photo-scene-cleanup",
      },
    ],
    tools: [
      { title: "Resize", path: "/resize", icon: RotateCcw },
      { title: "Convert", path: "/convert", icon: RefreshCw },
      { title: "Remove background", path: "/remove-background", icon: Scissors },
      { title: "AI upscale", path: "/resize-upscale", icon: StretchHorizontal },
      { title: "Magic Eraser", path: "/magic-brush", icon: Eraser },
    ],
    roadmap: [
      {
        title: "Smart crop presets",
        description: "Automatic crops for marketplaces, social posts, banners, and thumbnails.",
        icon: ImageIcon,
      },
      {
        title: "Batch export queue",
        description: "Apply one setup to many images and download the results as a ZIP.",
        icon: Upload,
      },
      {
        title: "Color and light match",
        description: "Unify exposure and temperature across product photos from different sessions.",
        icon: Wand2,
      },
    ],
  },
  pt: {
    eyebrow: "Edição natural no navegador",
    heroTitle: "Cultive clareza visual com um fluxo leve.",
    heroDescription:
      "O ImageMagic ajuda a redimensionar, converter, remover fundos, ampliar com IA e limpar detalhes da imagem sem enviar arquivos por um fluxo pesado.",
    primaryCta: "Começar criação",
    secondaryCta: "Ver ferramentas",
    toolsTitle: "Ferramentas transformadoras",
    toolsDescription:
      "Compare a diferença antes de abrir uma ferramenta. Cada fluxo é focado em limpeza prática de imagem e resultado pronto para exportar.",
    previousLabel: "Prévia anterior",
    nextLabel: "Próxima prévia",
    beforeLabel: "Antes",
    afterLabel: "Depois",
    openTool: "Abrir ferramenta",
    workflowTitle: "Fluxo local primeiro",
    workflowDescription:
      "As principais ferramentas processam imagens no navegador sempre que possível, reduzindo fricção de upload e mantendo a edição leve.",
    workflowAction: "Ver privacidade",
    fineTuneTitle: "Ajustes finos",
    fineTuneDescription:
      "Controles práticos de tamanho, formato, remoção de fundo e alta resolução ficam perto da imagem.",
    roadmapTitle: "Próximos recursos",
    roadmapDescription:
      "Estas evoluções mantêm o mesmo fluxo calmo enquanto ampliam o que o ImageMagic consegue editar.",
    trustItems: ["Processamento no navegador", "Sem conta obrigatória", "Exportação clara"],
    stories: [
      {
        title: "Redimensionamento inteligente",
        caption: "Prepare medidas limpas para publicação.",
        path: "/resize",
        scene: "photo-scene-landscape",
      },
      {
        title: "Removedor de fundo",
        caption: "Isole sujeitos com precisão local por IA.",
        path: "/remove-background",
        scene: "photo-scene-product",
      },
      {
        title: "Upscale com IA",
        caption: "Amplie a resolução de 2x a 10x.",
        path: "/resize-upscale",
        scene: "photo-scene-portrait",
      },
      {
        title: "Borracha mágica",
        caption: "Remova marcas e objetos repetidos.",
        path: "/magic-brush",
        scene: "photo-scene-cleanup",
      },
    ],
    tools: [
      { title: "Redimensionar", path: "/resize", icon: RotateCcw },
      { title: "Converter", path: "/convert", icon: RefreshCw },
      { title: "Remover fundo", path: "/remove-background", icon: Scissors },
      { title: "Upscale IA", path: "/resize-upscale", icon: StretchHorizontal },
      { title: "Borracha mágica", path: "/magic-brush", icon: Eraser },
    ],
    roadmap: [
      {
        title: "Cortes inteligentes",
        description: "Crops automáticos para marketplaces, posts, banners e miniaturas.",
        icon: ImageIcon,
      },
      {
        title: "Fila de exportação em lote",
        description: "Aplique uma configuração a várias imagens e baixe os resultados em ZIP.",
        icon: Upload,
      },
      {
        title: "Igualar cor e luz",
        description: "Padronize exposição e temperatura em fotos de produtos de sessões diferentes.",
        icon: Wand2,
      },
    ],
  },
  es: {
    eyebrow: "Edición natural en el navegador",
    heroTitle: "Cultiva claridad visual con un flujo ligero.",
    heroDescription:
      "ImageMagic ayuda a redimensionar, convertir, eliminar fondos, ampliar con IA y limpiar detalles sin enviar archivos por un flujo pesado.",
    primaryCta: "Empezar creación",
    secondaryCta: "Ver herramientas",
    toolsTitle: "Herramientas transformadoras",
    toolsDescription:
      "Compara la diferencia antes de abrir una herramienta. Cada flujo se centra en limpieza práctica y resultados listos para exportar.",
    previousLabel: "Vista anterior",
    nextLabel: "Vista siguiente",
    beforeLabel: "Antes",
    afterLabel: "Después",
    openTool: "Abrir herramienta",
    workflowTitle: "Flujo local primero",
    workflowDescription:
      "Las herramientas principales procesan imágenes en el navegador siempre que sea posible, reduciendo fricción de carga y manteniendo la edición ligera.",
    workflowAction: "Ver privacidad",
    fineTuneTitle: "Ajustes finos",
    fineTuneDescription:
      "Controles prácticos de tamaño, formato, fondo y alta resolución permanecen cerca de la imagen.",
    roadmapTitle: "Próximas funciones",
    roadmapDescription:
      "Estas mejoras conservan el mismo flujo tranquilo mientras amplían lo que ImageMagic puede editar.",
    trustItems: ["Procesamiento en navegador", "Sin cuenta obligatoria", "Exportación clara"],
    stories: [
      {
        title: "Redimensionado inteligente",
        caption: "Prepara medidas limpias para publicar.",
        path: "/resize",
        scene: "photo-scene-landscape",
      },
      {
        title: "Borrador de fondo",
        caption: "Aísla sujetos con precisión local por IA.",
        path: "/remove-background",
        scene: "photo-scene-product",
      },
      {
        title: "Upscale con IA",
        caption: "Amplía resolución de 2x a 10x.",
        path: "/resize-upscale",
        scene: "photo-scene-portrait",
      },
      {
        title: "Borrador mágico",
        caption: "Elimina marcas y objetos repetidos.",
        path: "/magic-brush",
        scene: "photo-scene-cleanup",
      },
    ],
    tools: [
      { title: "Redimensionar", path: "/resize", icon: RotateCcw },
      { title: "Convertir", path: "/convert", icon: RefreshCw },
      { title: "Eliminar fondo", path: "/remove-background", icon: Scissors },
      { title: "Upscale IA", path: "/resize-upscale", icon: StretchHorizontal },
      { title: "Borrador mágico", path: "/magic-brush", icon: Eraser },
    ],
    roadmap: [
      {
        title: "Recortes inteligentes",
        description: "Crops automáticos para marketplaces, posts, banners y miniaturas.",
        icon: ImageIcon,
      },
      {
        title: "Cola de exportación por lote",
        description: "Aplica una configuración a muchas imágenes y descarga resultados como ZIP.",
        icon: Upload,
      },
      {
        title: "Igualar color y luz",
        description: "Unifica exposición y temperatura en fotos de producto de distintas sesiones.",
        icon: Wand2,
      },
    ],
  },
} as const;

const getVisibleStories = <T,>(items: readonly T[], startIndex: number) => {
  const first = items[startIndex % items.length];
  const second = items[(startIndex + 1) % items.length];
  return [first, second] as const;
};

const Index = () => {
  const { language } = useLanguage();
  const copy = HOME_COPY[language];
  const [storyIndex, setStoryIndex] = React.useState(0);
  const visibleStories = getVisibleStories(copy.stories, storyIndex);

  const previousStory = () => {
    setStoryIndex((current) => (current - 1 + copy.stories.length) % copy.stories.length);
  };

  const nextStory = () => {
    setStoryIndex((current) => (current + 1) % copy.stories.length);
  };

  return (
    <div className="home-nature overflow-hidden pb-16">
      <section className="container grid min-h-[calc(100vh-4rem)] items-center gap-12 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:py-20">
        <div className="max-w-2xl space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <Leaf className="h-4 w-4" />
            {copy.eyebrow}
          </div>

          <div className="space-y-5">
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="max-w-xl text-base leading-8 text-muted-foreground md:text-lg">{copy.heroDescription}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-primary px-7 text-primary-foreground hover:bg-primary/90">
              <Link to="/resize">
                {copy.primaryCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-full px-7">
              <a href="#tools">{copy.secondaryCta}</a>
            </Button>
          </div>

          <div className="grid gap-3 pt-3 sm:grid-cols-3">
            {copy.trustItems.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 flex-none text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="nature-hero-image min-h-[360px] lg:min-h-[520px]" aria-hidden="true" />
      </section>

      <section id="tools" className="bg-secondary/40 py-16 md:py-24">
        <div className="container space-y-12">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{copy.toolsTitle}</h2>
            <p className="text-base leading-7 text-muted-foreground">{copy.toolsDescription}</p>
          </div>

          <div className="relative mx-auto grid max-w-5xl gap-10 md:grid-cols-2" aria-live="polite">
            {visibleStories.map((story, index) => (
              <article
                key={`${story.title}-${storyIndex}`}
                className={`polaroid-card ${index === 0 ? "md:-rotate-3" : "md:rotate-3 md:translate-y-4"}`}
              >
                <div className={`polaroid-photo ${story.scene}`}>
                  <div className="photo-half photo-before">
                    <span>{copy.beforeLabel}</span>
                  </div>
                  <div className="photo-half photo-after">
                    <span>{copy.afterLabel}</span>
                  </div>
                  <div className="photo-divider" />
                  <div className="photo-handle">‹›</div>
                </div>
                <div className="px-2 pt-5 text-center">
                  <h3 className="text-xl font-semibold tracking-tight text-primary">{story.title}</h3>
                  <p className="mt-2 text-sm italic leading-6 text-muted-foreground">{story.caption}</p>
                  <Button asChild variant="ghost" size="sm" className="mt-3 rounded-full text-primary">
                    <Link to={story.path}>
                      {copy.openTool}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}

            <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 md:flex">
              <Button
                variant="secondary"
                size="sm"
                className="h-10 w-10 rounded-full p-0 shadow-sm"
                onClick={previousStory}
                aria-label={copy.previousLabel}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-10 w-10 rounded-full p-0 shadow-sm"
                onClick={nextStory}
                aria-label={copy.nextLabel}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-center gap-3 md:hidden">
            <Button variant="secondary" size="sm" className="h-10 w-10 rounded-full p-0" onClick={previousStory} aria-label={copy.previousLabel}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" className="h-10 w-10 rounded-full p-0" onClick={nextStory} aria-label={copy.nextLabel}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
            {copy.tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/70 px-4 py-2 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-background"
                >
                  <Icon className="h-4 w-4" />
                  {tool.title}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container grid gap-6 py-16 lg:grid-cols-[1.5fr_0.72fr]">
        <div className="grid overflow-hidden rounded-[16px] bg-secondary/70 p-8 md:grid-cols-[1fr_0.58fr] md:p-10">
          <div className="max-w-xl self-center space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{copy.workflowTitle}</h2>
            <p className="text-sm leading-7 text-muted-foreground md:text-base">{copy.workflowDescription}</p>
            <Button asChild variant="ghost" className="rounded-full px-0 text-primary hover:bg-transparent">
              <Link to="/privacy">
                {copy.workflowAction}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex min-h-48 items-center justify-center rounded-[14px] bg-background/55 md:mt-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Cpu className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="rounded-[16px] bg-secondary/70 p-8 md:p-10">
          <Sparkles className="h-7 w-7 text-primary" />
          <div className="mt-20 space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">{copy.fineTuneTitle}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{copy.fineTuneDescription}</p>
          </div>
        </div>
      </section>

      <section className="container grid gap-8 pb-10 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{copy.roadmapTitle}</h2>
          <p className="text-sm leading-7 text-muted-foreground md:text-base">{copy.roadmapDescription}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {copy.roadmap.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-[14px] bg-background/70 p-5 shadow-sm">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-8 text-base font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="container">
        <AdSlot slot="home-featured-placement" className="min-h-24 rounded-[14px] border border-primary/10 bg-secondary/45 shadow-sm" />
      </div>
    </div>
  );
};

export default Index;
