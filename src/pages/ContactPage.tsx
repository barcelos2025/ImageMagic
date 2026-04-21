import React from "react";
import { Briefcase, Clock3, Mail, Shield } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { SITE_CONFIG } from "@/lib/seo/siteConfig";

const CONTACT_COPY = {
  en: {
    title: "Contact",
    description:
      "This page provides real contact routes for support, privacy, and business questions. No non-functional form is shown here.",
    cards: {
      support: {
        title: "Support",
        description: "Questions about tools, downloads, errors, or browser compatibility.",
        action: "Email support",
      },
      legal: {
        title: "Privacy and legal",
        description: "Requests about privacy, consent, personal data, or policy clarification.",
        action: "Email privacy desk",
      },
      business: {
        title: "Business inquiries",
        description: "Partnerships, licensing discussions, and publisher-related requests.",
        action: "Email business contact",
      },
    },
    checklistTitle: "Before you contact us",
    checklistDescription: "Including basic context reduces back-and-forth and speeds up triage.",
    checklist: [
      "Include the page URL, browser name and version, device type, and a short description of the issue.",
      "For privacy requests, specify the request type and the email you want us to use for follow-up.",
      "For business questions, explain the intended use case and whether the request is editorial, commercial, or technical.",
    ],
  },
  pt: {
    title: "Contato",
    description:
      "Esta página oferece canais reais para suporte, privacidade e dúvidas comerciais. Não existe formulário fictício aqui.",
    cards: {
      support: {
        title: "Suporte",
        description: "Dúvidas sobre ferramentas, downloads, erros ou compatibilidade com o navegador.",
        action: "Enviar email ao suporte",
      },
      legal: {
        title: "Privacidade e jurídico",
        description: "Solicitações sobre privacidade, consentimento, dados pessoais ou esclarecimento de políticas.",
        action: "Enviar email à equipe de privacidade",
      },
      business: {
        title: "Assuntos comerciais",
        description: "Parcerias, licenciamento e solicitações relacionadas a publishers.",
        action: "Enviar email comercial",
      },
    },
    checklistTitle: "Antes de entrar em contato",
    checklistDescription: "Incluir contexto básico reduz retrabalho e acelera a triagem.",
    checklist: [
      "Inclua a URL da página, o navegador e sua versão, o tipo de dispositivo e uma descrição curta do problema.",
      "Para solicitações de privacidade, informe o tipo de pedido e o email que deve ser usado no retorno.",
      "Para questões comerciais, explique o caso de uso e se a demanda é editorial, comercial ou técnica.",
    ],
  },
  es: {
    title: "Contacto",
    description:
      "Esta página ofrece canales reales para soporte, privacidad y consultas comerciales. No se muestra aquí ningún formulario sin funcionamiento.",
    cards: {
      support: {
        title: "Soporte",
        description: "Preguntas sobre herramientas, descargas, errores o compatibilidad del navegador.",
        action: "Enviar correo a soporte",
      },
      legal: {
        title: "Privacidad y legal",
        description: "Solicitudes sobre privacidad, consentimiento, datos personales o aclaración de políticas.",
        action: "Enviar correo al equipo de privacidad",
      },
      business: {
        title: "Consultas comerciales",
        description: "Alianzas, licencias y solicitudes relacionadas con publishers.",
        action: "Enviar correo comercial",
      },
    },
    checklistTitle: "Antes de contactarnos",
    checklistDescription: "Incluir contexto básico reduce idas y vueltas y acelera la revisión.",
    checklist: [
      "Incluye la URL de la página, el navegador y su versión, el tipo de dispositivo y una descripción breve del problema.",
      "Para solicitudes de privacidad, indica el tipo de petición y el correo que debemos usar para responder.",
      "Para preguntas comerciales, explica el caso de uso y si la solicitud es editorial, comercial o técnica.",
    ],
  },
} as const;

const ContactPage = () => {
  const { language } = useLanguage();
  const copy = CONTACT_COPY[language];
  const supportMail = `mailto:${SITE_CONFIG.supportEmail}?subject=ImageMagic%20support`;
  const legalMail = `mailto:${SITE_CONFIG.legalEmail}?subject=ImageMagic%20privacy%20request`;
  const businessMail = `mailto:${SITE_CONFIG.supportEmail}?subject=ImageMagic%20business%20inquiry`;

  return (
    <div className="container space-y-8 py-12">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h1 className="text-4xl font-bold">{copy.title}</h1>
        <p className="text-lg text-muted-foreground">{copy.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {copy.cards.support.title}
            </CardTitle>
            <CardDescription>{copy.cards.support.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{SITE_CONFIG.supportEmail}</p>
            <Button asChild className="w-full bg-gradient-primary text-primary-foreground">
              <a href={supportMail}>{copy.cards.support.action}</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {copy.cards.legal.title}
            </CardTitle>
            <CardDescription>{copy.cards.legal.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{SITE_CONFIG.legalEmail}</p>
            <Button asChild variant="outline" className="w-full">
              <a href={legalMail}>{copy.cards.legal.action}</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {copy.cards.business.title}
            </CardTitle>
            <CardDescription>{copy.cards.business.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{SITE_CONFIG.supportEmail}</p>
            <Button asChild variant="outline" className="w-full">
              <a href={businessMail}>{copy.cards.business.action}</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock3 className="h-5 w-5" />
            {copy.checklistTitle}
          </CardTitle>
          <CardDescription>{copy.checklistDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {copy.checklist.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactPage;
