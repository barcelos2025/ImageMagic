import React from "react";
import { Link } from "react-router-dom";
import { Building2, FileCheck2, Shield, Sparkles } from "@/components/icons";

import { AdSlot } from "@/components/ads/AdSlot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { SITE_CONFIG } from "@/lib/seo/siteConfig";

const ABOUT_COPY = {
  en: {
    title: "About ImageMagic",
    description:
      "ImageMagic is a browser-first image utility site focused on straightforward publishing workflows and transparent product disclosures.",
    offerTitle: "What the site currently offers",
    offerDescription: "Only actively maintained tools are promoted across navigation and landing pages.",
    offerParagraphs: [
      "The public site currently focuses on image resize, format conversion, background removal, and a combined resize plus upscale workflow. These pages are intended to provide useful standalone value rather than act as placeholders for future products.",
      "Features that are not yet ready for public use are no longer advertised as available offers. That change is important for both user trust and Google destination quality reviews.",
    ],
    principles: [
      {
        title: "Privacy by default",
        description: "The core image tools are designed to run in the browser so uploaded files stay on the device.",
        icon: Shield,
      },
      {
        title: "Honest site claims",
        description: "Pricing, contact, and policy pages now describe only what the site actually offers today.",
        icon: FileCheck2,
      },
      {
        title: "Publisher-ready structure",
        description:
          "Contact details, legal pages, and ad handling are set up to support Google review and monetization workflows.",
        icon: Building2,
      },
    ],
    commitmentsTitle: "Transparency commitments",
    commitmentsDescription: "These commitments reduce approval risks for Google Ads and AdSense reviews.",
    commitments: [
      "Policy pages are accessible from the footer on every page.",
      "Advertising placeholders no longer appear when no verified ad setup is configured.",
      "Contact information is visible and uses a working email channel.",
      "No fake free trials, fake pricing tiers, or unsupported enterprise promises remain on the public pages.",
    ],
    contactAction: `Contact ${SITE_CONFIG.publisherName}`,
  },
  pt: {
    title: "Sobre o ImageMagic",
    description:
      "O ImageMagic é um site utilitário de imagem focado em fluxos de publicação diretos no navegador e em divulgação transparente do produto.",
    offerTitle: "O que o site oferece hoje",
    offerDescription: "Apenas ferramentas ativamente mantidas são promovidas na navegação e nas páginas principais.",
    offerParagraphs: [
      "O site público hoje se concentra em redimensionamento de imagens, conversão de formato, remoção de fundo e em um fluxo combinado de redimensionar e ampliar. Essas páginas existem para entregar valor real, e não para servir de placeholder de produtos futuros.",
      "Recursos que ainda não estão prontos para uso público deixaram de ser anunciados como ofertas disponíveis. Essa mudança é importante para a confiança do usuário e para a avaliação de qualidade do destino pelo Google.",
    ],
    principles: [
      {
        title: "Privacidade por padrão",
        description: "As ferramentas principais foram projetadas para rodar no navegador, mantendo os arquivos no dispositivo.",
        icon: Shield,
      },
      {
        title: "Promessas honestas",
        description: "As páginas de preços, contato e políticas descrevem apenas o que o site realmente entrega hoje.",
        icon: FileCheck2,
      },
      {
        title: "Estrutura pronta para publishers",
        description:
          "Detalhes de contato, páginas legais e tratamento de anúncios foram organizados para suportar revisão e monetização.",
        icon: Building2,
      },
    ],
    commitmentsTitle: "Compromissos de transparência",
    commitmentsDescription: "Esses compromissos reduzem risco de reprovação em revisões do Google Ads e AdSense.",
    commitments: [
      "As páginas de política estão acessíveis no rodapé de todas as páginas.",
      "Placeholders de publicidade não aparecem mais quando não existe uma configuração validada de anúncios.",
      "As informações de contato estão visíveis e usam um canal de email funcional.",
      "Não restam testes grátis falsos, faixas de preço inventadas ou promessas empresariais sem suporte nas páginas públicas.",
    ],
    contactAction: `Falar com ${SITE_CONFIG.publisherName}`,
  },
  es: {
    title: "Acerca de ImageMagic",
    description:
      "ImageMagic es un sitio utilitario de imagen centrado en flujos de publicación directos en el navegador y en una divulgación transparente del producto.",
    offerTitle: "Lo que ofrece hoy el sitio",
    offerDescription: "Solo las herramientas mantenidas activamente se promocionan en la navegación y en las páginas principales.",
    offerParagraphs: [
      "El sitio público se centra hoy en redimensionado de imágenes, conversión de formato, eliminación de fondo y en un flujo combinado de redimensionar y ampliar. Estas páginas buscan aportar valor real y no servir como placeholders de productos futuros.",
      "Las funciones que todavía no están listas para uso público ya no se anuncian como disponibles. Ese cambio es importante tanto para la confianza del usuario como para la revisión de calidad del destino por parte de Google.",
    ],
    principles: [
      {
        title: "Privacidad por defecto",
        description: "Las herramientas principales están pensadas para ejecutarse en el navegador y mantener los archivos en el dispositivo.",
        icon: Shield,
      },
      {
        title: "Promesas honestas",
        description: "Las páginas de precios, contacto y políticas describen solo lo que el sitio ofrece realmente hoy.",
        icon: FileCheck2,
      },
      {
        title: "Estructura lista para publishers",
        description:
          "Los datos de contacto, las páginas legales y la gestión publicitaria están organizados para apoyar revisión y monetización.",
        icon: Building2,
      },
    ],
    commitmentsTitle: "Compromisos de transparencia",
    commitmentsDescription: "Estos compromisos reducen el riesgo de rechazo en revisiones de Google Ads y AdSense.",
    commitments: [
      "Las páginas de políticas están accesibles desde el pie de página en todo el sitio.",
      "Los placeholders publicitarios ya no aparecen cuando no existe una configuración de anuncios verificada.",
      "La información de contacto es visible y utiliza un canal de correo funcional.",
      "Ya no quedan pruebas gratuitas falsas, precios inventados ni promesas empresariales sin soporte en las páginas públicas.",
    ],
    contactAction: `Contactar con ${SITE_CONFIG.publisherName}`,
  },
} as const;

const AboutPage = () => {
  const { language } = useLanguage();
  const copy = ABOUT_COPY[language];

  return (
    <div className="container space-y-10 py-12">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">
          <span className="gradient-text">{copy.title}</span>
        </h1>
        <p className="text-lg text-muted-foreground">{copy.description}</p>
      </div>

      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>{copy.offerTitle}</CardTitle>
          <CardDescription>{copy.offerDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          {copy.offerParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {copy.principles.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AdSlot slot="about-page-placement" className="h-24" />

      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>{copy.commitmentsTitle}</CardTitle>
          <CardDescription>{copy.commitmentsDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {copy.commitments.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link to={`mailto:${SITE_CONFIG.supportEmail}`}>{copy.contactAction}</Link>
        </Button>
      </div>
    </div>
  );
};

export default AboutPage;
