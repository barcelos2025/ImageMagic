import React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { SITE_CONFIG } from "@/lib/seo/siteConfig";

const TERMS_COPY = {
  en: {
    title: "Terms of Use",
    description:
      "These terms describe the current public use of ImageMagic and should be updated before any paid checkout or account system is released.",
    sections: [
      {
        title: "Acceptable use",
        description: "Use the site only for lawful content and lawful purposes.",
        body: [
          "You are responsible for the files you process through the site.",
          "Do not use the site in connection with illegal content, fraudulent activity, or infringement of third-party rights.",
        ],
      },
      {
        title: "Tool availability",
        description: "The public site does not guarantee continuous access to every experimental workflow.",
        body: [
          "ImageMagic may add, remove, or limit features to maintain quality, security, or policy compliance.",
          "Paid subscriptions are not currently sold through this site.",
        ],
      },
      {
        title: "Advertising and third-party services",
        description: "Some pages may contain advertising or analytics integrations when properly configured.",
        body: [
          "Third-party services may be subject to their own terms and privacy requirements.",
          "Advertising must remain consistent with the site's disclosures, consent choices, and applicable Google policies.",
        ],
      },
      {
        title: "No warranty",
        body: [
          "The site is provided on an as-available basis. Compatibility and output quality may vary by browser and device.",
          "You should review exported files before using them in production or paid media campaigns.",
        ],
      },
      {
        title: "Contact",
        body: [`Questions about these terms can be sent to ${SITE_CONFIG.legalEmail}.`, "Last updated: April 20, 2026."],
      },
    ],
  },
  pt: {
    title: "Termos de uso",
    description:
      "Estes termos descrevem o uso público atual do ImageMagic e devem ser atualizados antes do lançamento de checkout pago ou sistema de contas.",
    sections: [
      {
        title: "Uso aceitável",
        description: "Use o site apenas para conteúdo e finalidades lícitas.",
        body: [
          "Você é responsável pelos arquivos processados por meio do site.",
          "Não use o site em conexão com conteúdo ilegal, atividade fraudulenta ou violação de direitos de terceiros.",
        ],
      },
      {
        title: "Disponibilidade das ferramentas",
        description: "O site público não garante acesso contínuo a todos os fluxos experimentais.",
        body: [
          "O ImageMagic pode adicionar, remover ou limitar recursos para manter qualidade, segurança ou conformidade com políticas.",
          "Assinaturas pagas não são vendidas por este site atualmente.",
        ],
      },
      {
        title: "Publicidade e serviços de terceiros",
        description: "Algumas páginas podem conter integrações de publicidade ou analytics quando estiverem corretamente configuradas.",
        body: [
          "Serviços de terceiros podem estar sujeitos aos próprios termos e requisitos de privacidade.",
          "A publicidade deve permanecer coerente com as divulgações do site, as escolhas de consentimento e as políticas aplicáveis do Google.",
        ],
      },
      {
        title: "Sem garantia",
        body: [
          "O site é fornecido conforme disponibilidade. Compatibilidade e qualidade de saída podem variar conforme navegador e dispositivo.",
          "Revise os arquivos exportados antes de usá-los em produção ou em campanhas de mídia paga.",
        ],
      },
      {
        title: "Contato",
        body: [`Dúvidas sobre estes termos podem ser enviadas para ${SITE_CONFIG.legalEmail}.`, "Última atualização: 20 de abril de 2026."],
      },
    ],
  },
  es: {
    title: "Términos de uso",
    description:
      "Estos términos describen el uso público actual de ImageMagic y deben actualizarse antes de lanzar checkout de pago o un sistema de cuentas.",
    sections: [
      {
        title: "Uso aceptable",
        description: "Usa el sitio solo para contenido y fines lícitos.",
        body: [
          "Eres responsable de los archivos que procesas a través del sitio.",
          "No uses el sitio en relación con contenido ilegal, actividad fraudulenta o infracción de derechos de terceros.",
        ],
      },
      {
        title: "Disponibilidad de las herramientas",
        description: "El sitio público no garantiza acceso continuo a todos los flujos experimentales.",
        body: [
          "ImageMagic puede añadir, retirar o limitar funciones para mantener calidad, seguridad o cumplimiento de políticas.",
          "Las suscripciones de pago no se venden actualmente a través de este sitio.",
        ],
      },
      {
        title: "Publicidad y servicios de terceros",
        description: "Algunas páginas pueden contener integraciones publicitarias o de analytics cuando estén correctamente configuradas.",
        body: [
          "Los servicios de terceros pueden estar sujetos a sus propios términos y requisitos de privacidad.",
          "La publicidad debe mantenerse coherente con las divulgaciones del sitio, las decisiones de consentimiento y las políticas aplicables de Google.",
        ],
      },
      {
        title: "Sin garantía",
        body: [
          "El sitio se ofrece según disponibilidad. La compatibilidad y la calidad de salida pueden variar según el navegador y el dispositivo.",
          "Debes revisar los archivos exportados antes de usarlos en producción o en campañas de medios pagados.",
        ],
      },
      {
        title: "Contacto",
        body: [`Las preguntas sobre estos términos pueden enviarse a ${SITE_CONFIG.legalEmail}.`, "Última actualización: 20 de abril de 2026."],
      },
    ],
  },
} as const;

const TermsPage = () => {
  const { language } = useLanguage();
  const copy = TERMS_COPY[language];

  return (
    <div className="container space-y-8 py-12">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h1 className="text-4xl font-bold">{copy.title}</h1>
        <p className="text-lg text-muted-foreground">{copy.description}</p>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {copy.sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              {"description" in section ? <CardDescription>{section.description}</CardDescription> : null}
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {section.body.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TermsPage;
