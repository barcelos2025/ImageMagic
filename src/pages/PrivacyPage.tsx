import React from "react";
import { Cookie, Database, Eye, Shield } from "@/components/icons";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { SITE_CONFIG } from "@/lib/seo/siteConfig";

const PRIVACY_COPY = {
  en: {
    title: "Privacy Policy",
    description:
      "This policy reflects the current behavior of the site. It does not describe accounts, billing systems, or services that are not live.",
    sections: {
      uploads: {
        title: "Images and uploaded files",
        body: [
          "The main tools on this site are designed to process images locally in the browser. When you resize, convert, or remove a background, the file is intended to stay on your device unless a future feature clearly states otherwise.",
          "We do not claim server-side storage, account syncing, or payment-linked media storage on the current public site.",
        ],
      },
      consent: {
        title: "Local storage, cookies, and consent",
        body: [
          "The site stores basic preferences such as language, theme, and consent choice in the browser.",
          "If analytics is configured, it is enabled only after consent is accepted through the site banner. If no analytics identifier is configured, no analytics script is loaded.",
          "If Google ads are enabled in the future, ad-related cookies or similar technologies may be used subject to the applicable Google publisher requirements and your consent choices.",
        ],
      },
      ads: {
        title: "Advertising disclosures",
        lead: "Third-party vendors, including Google, may use cookies to serve ads based on a user's prior visits to this website or other websites when advertising is activated.",
        followUp: "Google's use of advertising cookies enables it and its partners to serve ads based on visits to this site and other sites on the Internet.",
        settingsPrefix: "Users may opt out of personalized advertising by visiting",
        settingsLabel: "Google Ads Settings",
        settingsSuffix: ". Users may also visit",
        aboutAdsLabel: "www.aboutads.info",
        aboutAdsSuffix:
          "to opt out of some third-party vendors' use of cookies for personalized advertising where available.",
      },
      exclusions: {
        title: "What is not currently collected",
        body: [
          "The current public site does not operate a user account system.",
          "The current public site does not run a checkout flow or collect card payments.",
          "This policy should be updated before any server-side upload, checkout, or login feature goes live.",
        ],
      },
      updates: {
        title: "Contact and updates",
        body: [`For privacy requests or policy questions, contact ${SITE_CONFIG.legalEmail}.`, "Last updated: April 20, 2026."],
      },
    },
  },
  pt: {
    title: "Política de privacidade",
    description:
      "Esta política reflete o comportamento atual do site. Ela não descreve contas, sistemas de cobrança ou serviços que ainda não estão ativos.",
    sections: {
      uploads: {
        title: "Imagens e arquivos enviados",
        body: [
          "As principais ferramentas deste site foram projetadas para processar imagens localmente no navegador. Quando você redimensiona, converte ou remove um fundo, o arquivo deve permanecer no seu dispositivo, salvo se um recurso futuro informar claramente o contrário.",
          "O site público atual não oferece armazenamento em servidor, sincronização de conta ou armazenamento de mídia vinculado a pagamento.",
        ],
      },
      consent: {
        title: "Armazenamento local, cookies e consentimento",
        body: [
          "O site armazena no navegador preferências básicas, como idioma, tema e escolha de consentimento.",
          "Se analytics estiver configurado, ele só é habilitado após o consentimento ser aceito pelo banner. Se não houver identificador configurado, nenhum script de analytics é carregado.",
          "Se anúncios do Google forem habilitados no futuro, cookies publicitários ou tecnologias semelhantes poderão ser usados de acordo com os requisitos aplicáveis do Google e com suas escolhas de consentimento.",
        ],
      },
      ads: {
        title: "Divulgações sobre publicidade",
        lead: "Fornecedores terceirizados, incluindo o Google, podem usar cookies para exibir anúncios com base em visitas anteriores do usuário a este site ou a outros sites quando a publicidade estiver ativa.",
        followUp: "O uso de cookies de publicidade pelo Google permite que ele e seus parceiros exibam anúncios com base em visitas a este site e a outros sites na Internet.",
        settingsPrefix: "Os usuários podem desativar a publicidade personalizada acessando",
        settingsLabel: "Configurações de anúncios do Google",
        settingsSuffix: ". Os usuários também podem acessar",
        aboutAdsLabel: "www.aboutads.info",
        aboutAdsSuffix:
          "para desativar, quando disponível, o uso de cookies de alguns fornecedores terceirizados para publicidade personalizada.",
      },
      exclusions: {
        title: "O que não é coletado atualmente",
        body: [
          "O site público atual não opera um sistema de contas de usuário.",
          "O site público atual não executa checkout nem coleta pagamentos com cartão.",
          "Esta política deve ser atualizada antes que qualquer recurso com upload em servidor, checkout ou login entre em produção.",
        ],
      },
      updates: {
        title: "Contato e atualizações",
        body: [`Para solicitações de privacidade ou dúvidas sobre esta política, entre em contato por ${SITE_CONFIG.legalEmail}.`, "Última atualização: 20 de abril de 2026."],
      },
    },
  },
  es: {
    title: "Política de privacidad",
    description:
      "Esta política refleja el comportamiento actual del sitio. No describe cuentas, sistemas de cobro ni servicios que todavía no estén activos.",
    sections: {
      uploads: {
        title: "Imágenes y archivos cargados",
        body: [
          "Las herramientas principales de este sitio están diseñadas para procesar imágenes localmente en el navegador. Cuando redimensionas, conviertes o eliminas un fondo, el archivo debe permanecer en tu dispositivo salvo que una función futura indique claramente lo contrario.",
          "El sitio público actual no ofrece almacenamiento del lado del servidor, sincronización de cuentas ni almacenamiento de medios vinculado a pagos.",
        ],
      },
      consent: {
        title: "Almacenamiento local, cookies y consentimiento",
        body: [
          "El sitio guarda en el navegador preferencias básicas como idioma, tema y elección de consentimiento.",
          "Si analytics está configurado, solo se habilita después de aceptar el consentimiento mediante el banner. Si no hay un identificador configurado, no se carga ningún script de analytics.",
          "Si los anuncios de Google se habilitan en el futuro, pueden usarse cookies publicitarias o tecnologías similares de acuerdo con los requisitos aplicables de Google y tus decisiones de consentimiento.",
        ],
      },
      ads: {
        title: "Divulgaciones publicitarias",
        lead: "Los proveedores externos, incluido Google, pueden usar cookies para mostrar anuncios basados en visitas previas del usuario a este sitio web o a otros sitios cuando la publicidad esté activada.",
        followUp: "El uso de cookies publicitarias por parte de Google permite que este y sus socios muestren anuncios basados en visitas a este sitio y a otros sitios de Internet.",
        settingsPrefix: "Los usuarios pueden desactivar la publicidad personalizada visitando",
        settingsLabel: "Configuración de anuncios de Google",
        settingsSuffix: ". Los usuarios también pueden visitar",
        aboutAdsLabel: "www.aboutads.info",
        aboutAdsSuffix:
          "para desactivar, cuando esté disponible, el uso de cookies de algunos proveedores externos para publicidad personalizada.",
      },
      exclusions: {
        title: "Qué no se recopila actualmente",
        body: [
          "El sitio público actual no opera un sistema de cuentas de usuario.",
          "El sitio público actual no ejecuta checkout ni recopila pagos con tarjeta.",
          "Esta política debe actualizarse antes de que cualquier función con subida al servidor, checkout o login entre en producción.",
        ],
      },
      updates: {
        title: "Contacto y actualizaciones",
        body: [`Para solicitudes de privacidad o preguntas sobre esta política, contacta a ${SITE_CONFIG.legalEmail}.`, "Última actualización: 20 de abril de 2026."],
      },
    },
  },
} as const;

const PrivacyPage = () => {
  const { language } = useLanguage();
  const copy = PRIVACY_COPY[language];

  const sections = [
    { ...copy.sections.uploads, icon: Eye },
    { ...copy.sections.consent, icon: Cookie },
    { ...copy.sections.ads, icon: Database },
    { ...copy.sections.exclusions, icon: Shield },
  ];

  return (
    <div className="container space-y-8 py-12">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <div className="flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">{copy.title}</h1>
        <p className="text-lg text-muted-foreground">{copy.description}</p>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {"body" in section ? (
                  section.body.map((item) => <p key={item}>{item}</p>)
                ) : (
                  <>
                    <p>{section.lead}</p>
                    <p>{section.followUp}</p>
                    <p>
                      {section.settingsPrefix}{" "}
                      <a
                        className="text-primary underline underline-offset-4"
                        href="https://www.google.com/settings/ads"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {section.settingsLabel}
                      </a>
                      {section.settingsSuffix}{" "}
                      <a
                        className="text-primary underline underline-offset-4"
                        href="https://www.aboutads.info"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {section.aboutAdsLabel}
                      </a>{" "}
                      {section.aboutAdsSuffix}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}

        <Card>
          <CardHeader>
            <CardTitle>{copy.sections.updates.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {copy.sections.updates.body.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPage;
