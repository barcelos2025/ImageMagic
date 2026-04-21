import React from "react";
import { CheckCircle2, Mail, ShieldAlert, Wallet } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { SITE_CONFIG } from "@/lib/seo/siteConfig";

const PRICING_COPY = {
  en: {
    title: "Pricing and availability",
    description:
      "This page exists to prevent misleading commercial claims. It describes what is available now and what is not.",
    currentAccess: {
      title: "Current public access",
      description: "Available on the live site today.",
      items: [
        "Resize images in the browser.",
        "Convert between browser-friendly image formats.",
        "Remove backgrounds with local AI processing.",
        "Use the combined resize and upscale workflow when supported by the browser.",
      ],
    },
    paidPlans: {
      title: "Paid plans",
      description: "Not currently sold through this website.",
      items: [
        "No checkout, recurring subscription, free trial, or enterprise contract flow is active on this site today.",
        "Any future paid offer should only be published after the purchase flow, legal terms, and support process are fully operational.",
      ],
    },
    whyItMatters: {
      title: "Why this matters",
      description: "Google policies are stricter when pricing or service availability is unclear.",
      items: [
        "Removing invented prices and unsupported claims lowers misrepresentation risk.",
        "Users and reviewers should see the same product reality the site can actually deliver.",
      ],
    },
    contactTitle: "Need a commercial conversation?",
    contactDescription: "Use email until a real sales flow exists.",
    contactBody: `Send partnership, licensing, or roadmap questions to ${SITE_CONFIG.supportEmail}.`,
    contactAction: "Contact by email",
  },
  pt: {
    title: "Preços e disponibilidade",
    description:
      "Esta página existe para evitar alegações comerciais enganosas. Ela descreve o que está disponível agora e o que ainda não está.",
    currentAccess: {
      title: "Acesso público atual",
      description: "Disponível hoje no site em produção.",
      items: [
        "Redimensionar imagens no navegador.",
        "Converter entre formatos de imagem compatíveis com navegador.",
        "Remover fundo com processamento local por IA.",
        "Usar o fluxo combinado de redimensionar e ampliar quando o navegador oferecer suporte.",
      ],
    },
    paidPlans: {
      title: "Planos pagos",
      description: "Atualmente não vendidos por este site.",
      items: [
        "Hoje não existe checkout, assinatura recorrente, teste grátis ou fluxo de contrato enterprise ativo neste site.",
        "Qualquer oferta paga futura só deve ser publicada depois que compra, termos legais e suporte estiverem totalmente operacionais.",
      ],
    },
    whyItMatters: {
      title: "Por que isso importa",
      description: "As políticas do Google ficam mais rígidas quando preço ou disponibilidade do serviço não estão claros.",
      items: [
        "Remover preços inventados e promessas sem suporte reduz risco de deturpação.",
        "Usuários e revisores precisam ver a mesma realidade de produto que o site consegue entregar.",
      ],
    },
    contactTitle: "Precisa de uma conversa comercial?",
    contactDescription: "Use email enquanto não existir um fluxo real de vendas.",
    contactBody: `Envie dúvidas sobre parceria, licenciamento ou roadmap para ${SITE_CONFIG.supportEmail}.`,
    contactAction: "Entrar em contato por email",
  },
  es: {
    title: "Precios y disponibilidad",
    description:
      "Esta página existe para evitar afirmaciones comerciales engañosas. Describe lo que está disponible ahora y lo que todavía no lo está.",
    currentAccess: {
      title: "Acceso público actual",
      description: "Disponible hoy en el sitio en producción.",
      items: [
        "Redimensionar imágenes en el navegador.",
        "Convertir entre formatos de imagen compatibles con el navegador.",
        "Eliminar fondos con procesamiento local por IA.",
        "Usar el flujo combinado de redimensionar y ampliar cuando el navegador lo soporte.",
      ],
    },
    paidPlans: {
      title: "Planes de pago",
      description: "Actualmente no se venden a través de este sitio web.",
      items: [
        "Hoy no existe checkout, suscripción recurrente, prueba gratuita ni flujo enterprise activo en este sitio.",
        "Cualquier oferta de pago futura solo debería publicarse cuando el flujo de compra, los términos legales y el soporte estén totalmente operativos.",
      ],
    },
    whyItMatters: {
      title: "Por qué esto importa",
      description: "Las políticas de Google son más estrictas cuando el precio o la disponibilidad del servicio no están claros.",
      items: [
        "Eliminar precios inventados y promesas sin soporte reduce el riesgo de tergiversación.",
        "Usuarios y revisores deben ver la misma realidad de producto que el sitio puede ofrecer de verdad.",
      ],
    },
    contactTitle: "¿Necesitas una conversación comercial?",
    contactDescription: "Usa el correo mientras no exista un flujo real de ventas.",
    contactBody: `Envía preguntas sobre alianzas, licencias o roadmap a ${SITE_CONFIG.supportEmail}.`,
    contactAction: "Contactar por correo",
  },
} as const;

const PricingPage = () => {
  const { language } = useLanguage();
  const copy = PRICING_COPY[language];

  const cards = [
    { ...copy.currentAccess, icon: CheckCircle2 },
    { ...copy.paidPlans, icon: Wallet },
    { ...copy.whyItMatters, icon: ShieldAlert },
  ];

  return (
    <div className="container space-y-8 py-12">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h1 className="text-4xl font-bold">{copy.title}</h1>
        <p className="text-lg text-muted-foreground">{copy.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {card.title}
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {card.items.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>{copy.contactTitle}</CardTitle>
          <CardDescription>{copy.contactDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.contactBody}</p>
          <Button asChild>
            <a href={`mailto:${SITE_CONFIG.supportEmail}?subject=ImageMagic%20commercial%20question`}>
              <Mail className="mr-2 h-4 w-4" />
              {copy.contactAction}
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingPage;
