import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Eraser,
  RefreshCw,
  RotateCcw,
  Scissors,
  Sparkles,
  StretchHorizontal,
} from "@/components/icons";

import { AdSlot } from "@/components/ads/AdSlot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const HOME_COPY = {
  en: {
    heroTitle: "Image workflows built for trust",
    heroDescription:
      "Resize, convert, remove backgrounds, and prepare images for publishing directly in the browser with clear privacy and advertising disclosures.",
    subDescription:
      "All image processing runs locally on your device rather than our server, which keeps the site free to use. On lower-end hardware, heavier AI steps can take longer.",
    primaryCta: "Open resize tool",
    secondaryCta: "Review policies",
    quickActionsTitle: "What you can do right now",
    quickActionsDescription:
      "Professional browser-first image tools with a restrained interface and clear operational scope.",
    sectionTitle: "Available tools",
    sectionDescription: "Every tool below is reachable, usable, and described in plain language.",
    trustTitle: "Why this site is ready for advertisers",
    trustDescription:
      "Clear ownership, transparent policies, honest feature availability, and content that matches the actual product.",
    openTool: "Open tool",
    tools: [
      {
        title: "Resize images",
        description:
          "Adjust width and height with presets or custom dimensions while keeping control over aspect ratio.",
        path: "/resize",
        color: "from-sky-500 to-cyan-500",
        icon: RotateCcw,
      },
      {
        title: "Convert formats",
        description: "Export browser-friendly JPG, PNG, and WEBP files from common raster image uploads.",
        path: "/convert",
        color: "from-emerald-500 to-green-500",
        icon: RefreshCw,
      },
      {
        title: "Remove backgrounds",
        description: "Run local AI segmentation and download transparent PNG output for ecommerce and creative use.",
        path: "/remove-background",
        color: "from-fuchsia-500 to-pink-500",
        icon: Scissors,
      },
      {
        title: "Resize and upscale",
        description:
          "Combine size adjustments with high-resolution export when you need a single publishing workflow.",
        path: "/resize-upscale",
        color: "from-violet-500 to-indigo-500",
        icon: StretchHorizontal,
      },
      {
        title: "Magic Eraser",
        description:
          "Paint a shared removal mask and batch-clean repeated objects across many files.",
        path: "/magic-brush",
        color: "from-orange-500 to-red-500",
        icon: Eraser,
      },
    ],
    highlights: [
      {
        title: "Honest availability",
        description: "Only active tools remain promoted in navigation, SEO, and core landing sections.",
        icon: CheckCircle2,
      },
      {
        title: "Local processing",
        description: "Core image workflows run on-device unless a future server-side feature is clearly disclosed.",
        icon: Cpu,
      },
      {
        title: "Cleaner monetization setup",
        description: "Ad placements are gated behind real configuration and consent instead of static placeholders.",
        icon: Sparkles,
      },
    ],
    trustPoints: [
      "All image processing happens locally in the browser on the user's device, not on our server.",
      "There is no paid server-side image processing cost behind the tools, which helps keep the site free to use.",
      "Performance depends on the device, so heavier AI steps may take longer on lower-end hardware.",
    ],
  },
  pt: {
    heroTitle: "Fluxos de imagem feitos para gerar confiança",
    heroDescription:
      "Redimensione, converta, remova fundos e prepare imagens para publicação direto no navegador com políticas claras de privacidade e publicidade.",
    subDescription:
      "Todo o processamento de imagem roda localmente no seu equipamento, e não no nosso servidor, o que mantém o site gratuito. Em hardware mais fraco, etapas pesadas de IA podem demorar mais.",
    primaryCta: "Abrir redimensionador",
    secondaryCta: "Ver políticas",
    quickActionsTitle: "O que você pode fazer agora",
    quickActionsDescription:
      "Ferramentas profissionais de imagem no navegador com interface limpa e escopo operacional claro.",
    sectionTitle: "Ferramentas disponíveis",
    sectionDescription: "Cada ferramenta abaixo está acessível, utilizável e descrita com linguagem objetiva.",
    trustTitle: "Por que este site está pronto para anunciantes",
    trustDescription:
      "Identidade clara, políticas transparentes, disponibilidade honesta dos recursos e conteúdo coerente com o produto real.",
    openTool: "Abrir ferramenta",
    tools: [
      {
        title: "Redimensionar imagens",
        description:
          "Ajuste largura e altura com presets ou medidas personalizadas mantendo controle da proporção.",
        path: "/resize",
        color: "from-sky-500 to-cyan-500",
        icon: RotateCcw,
      },
      {
        title: "Converter formatos",
        description: "Exporte arquivos JPG, PNG e WEBP a partir de imagens raster comuns enviadas pelo navegador.",
        path: "/convert",
        color: "from-emerald-500 to-green-500",
        icon: RefreshCw,
      },
      {
        title: "Remover fundos",
        description: "Execute segmentação local com IA e baixe PNGs transparentes para ecommerce e criação.",
        path: "/remove-background",
        color: "from-fuchsia-500 to-pink-500",
        icon: Scissors,
      },
      {
        title: "Redimensionar e ampliar",
        description: "Combine ajuste de tamanho e exportação em alta resolução em um único fluxo de publicação.",
        path: "/resize-upscale",
        color: "from-violet-500 to-indigo-500",
        icon: StretchHorizontal,
      },
      {
        title: "Borracha mágica",
        description:
          "Pinte uma máscara de remoção compartilhada e limpe objetos repetidos em vários arquivos.",
        path: "/magic-brush",
        color: "from-orange-500 to-red-500",
        icon: Eraser,
      },
    ],
    highlights: [
      {
        title: "Disponibilidade honesta",
        description: "Só ferramentas ativas continuam promovidas na navegação, no SEO e nas áreas principais.",
        icon: CheckCircle2,
      },
      {
        title: "Processamento local",
        description:
          "Os fluxos principais de imagem rodam no dispositivo, salvo quando um recurso futuro informar o contrário com clareza.",
        icon: Cpu,
      },
      {
        title: "Monetização mais limpa",
        description: "Os espaços de anúncio dependem de configuração real e consentimento, não de placeholders estáticos.",
        icon: Sparkles,
      },
    ],
    trustPoints: [
      "Todo o processamento de imagem acontece localmente no navegador, no equipamento do usuário, e não no servidor.",
      "Não existe custo de processamento de imagem em servidor por trás das ferramentas, o que ajuda a manter o site gratuito.",
      "O desempenho depende do dispositivo, então etapas mais pesadas de IA podem demorar em hardware com poucos recursos.",
    ],
  },
  es: {
    heroTitle: "Flujos de imagen hechos para generar confianza",
    heroDescription:
      "Redimensiona, convierte, elimina fondos y prepara imágenes para publicar directamente en el navegador con políticas claras de privacidad y publicidad.",
    subDescription:
      "Todo el procesamiento de imagen se ejecuta localmente en tu dispositivo y no en nuestro servidor, lo que mantiene el sitio gratuito. En hardware modesto, los pasos de IA más pesados pueden tardar más.",
    primaryCta: "Abrir redimensionador",
    secondaryCta: "Ver políticas",
    quickActionsTitle: "Lo que puedes hacer ahora",
    quickActionsDescription:
      "Herramientas profesionales de imagen en el navegador con una interfaz limpia y un alcance operativo claro.",
    sectionTitle: "Herramientas disponibles",
    sectionDescription: "Cada herramienta siguiente está accesible, se puede usar y se describe con lenguaje claro.",
    trustTitle: "Por qué este sitio está listo para anunciantes",
    trustDescription:
      "Identidad clara, políticas transparentes, disponibilidad honesta de funciones y contenido alineado con el producto real.",
    openTool: "Abrir herramienta",
    tools: [
      {
        title: "Redimensionar imágenes",
        description:
          "Ajusta el ancho y la altura con presets o medidas personalizadas manteniendo el control de la proporción.",
        path: "/resize",
        color: "from-sky-500 to-cyan-500",
        icon: RotateCcw,
      },
      {
        title: "Convertir formatos",
        description: "Exporta archivos JPG, PNG y WEBP a partir de imágenes raster comunes cargadas en el navegador.",
        path: "/convert",
        color: "from-emerald-500 to-green-500",
        icon: RefreshCw,
      },
      {
        title: "Eliminar fondos",
        description: "Ejecuta segmentación local con IA y descarga PNG transparentes para ecommerce y creatividad.",
        path: "/remove-background",
        color: "from-fuchsia-500 to-pink-500",
        icon: Scissors,
      },
      {
        title: "Redimensionar y ampliar",
        description:
          "Combina ajuste de tamaño y exportación en alta resolución en un único flujo de publicación.",
        path: "/resize-upscale",
        color: "from-violet-500 to-indigo-500",
        icon: StretchHorizontal,
      },
      {
        title: "Borrador mágico",
        description:
          "Pinta una máscara de eliminación compartida y limpia objetos repetidos en varios archivos.",
        path: "/magic-brush",
        color: "from-orange-500 to-red-500",
        icon: Eraser,
      },
    ],
    highlights: [
      {
        title: "Disponibilidad honesta",
        description: "Solo las herramientas activas siguen visibles en la navegación, el SEO y las áreas principales.",
        icon: CheckCircle2,
      },
      {
        title: "Procesamiento local",
        description:
          "Los flujos principales de imagen se ejecutan en el dispositivo salvo que una función futura indique claramente lo contrario.",
        icon: Cpu,
      },
      {
        title: "Monetización más limpia",
        description:
          "Los espacios publicitarios dependen de una configuración real y del consentimiento, no de placeholders estáticos.",
        icon: Sparkles,
      },
    ],
    trustPoints: [
      "Todo el procesamiento de imagen ocurre localmente en el navegador, en el dispositivo del usuario, y no en el servidor.",
      "No existe costo de procesamiento de imágenes en servidor detrás de las herramientas, lo que ayuda a mantener el sitio gratuito.",
      "El rendimiento depende del dispositivo, por lo que los pasos de IA más pesados pueden tardar más en hardware con pocos recursos.",
    ],
  },
} as const;

const Index = () => {
  const { language } = useLanguage();
  const copy = HOME_COPY[language];

  return (
    <div className="space-y-16 pb-16 pt-6">
      <section className="container">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-primary shadow-sm">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-medium uppercase tracking-[0.2em] text-foreground/80">ImageMagic</span>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">{copy.heroTitle}</h1>
                  <p className="max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">{copy.heroDescription}</p>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground">{copy.subDescription}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="min-w-[220px]">
                    <Link to="/resize">
                      {copy.primaryCta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="min-w-[180px]">
                    <Link to="/privacy">{copy.secondaryCta}</Link>
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {copy.highlights.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="space-y-3">
                <CardTitle className="text-xl">{copy.quickActionsTitle}</CardTitle>
                <CardDescription>{copy.quickActionsDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {copy.tools.slice(0, 4).map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-4 transition-colors hover:border-primary/35 hover:bg-accent"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{tool.title}</div>
                          <div className="text-sm text-muted-foreground">{tool.description}</div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            <AdSlot slot="home-featured-placement" className="h-40 rounded-[2rem] border border-border/70 bg-card/90 shadow-sm" />
          </div>
        </div>
      </section>

      <section className="container">
        <div className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{copy.sectionTitle}</h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">{copy.sectionDescription}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {copy.tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.path} className="tool-card">
                  <CardHeader className="space-y-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{tool.title}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full justify-between">
                      <Link to={tool.path}>
                        {copy.openTool}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container">
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl">{copy.trustTitle}</CardTitle>
            <CardDescription className="max-w-3xl text-base">{copy.trustDescription}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {copy.trustPoints.map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/80 p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-sm leading-6 text-muted-foreground">{point}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
