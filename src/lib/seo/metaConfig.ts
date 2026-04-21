import { Locale } from "./siteConfig";

export interface FAQEntry {
  question: Record<Locale, string>;
  answer: Record<Locale, string>;
}

export interface PageMeta {
  id: string;
  path: string;
  alternatePaths?: string[];
  titles: Record<Locale, string>;
  descriptions: Record<Locale, string>;
  keywords: Record<Locale, string[]>;
  ogImage?: string;
  type?: "website" | "article" | "product";
  faq?: FAQEntry[];
  priority?: number;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
}

export const DEFAULT_OG_IMAGE = "https://imagemagic.com/og-image.png";

export const PAGE_META: Record<string, PageMeta> = {
  home: {
    id: "home",
    path: "/",
    titles: {
      en: "ImageMagic | Online AI Image Editing Suite",
      pt: "ImageMagic | Suite Online de Edicao com IA",
      es: "ImageMagic | Suite en Linea de Edicion con IA",
    },
    descriptions: {
      en: "Use ImageMagic to resize, convert, remove backgrounds, and prepare images in the browser with transparent workflows.",
      pt: "Use o ImageMagic para redimensionar, converter, remover fundos e preparar imagens no navegador com transparência.",
      es: "Usa ImageMagic para redimensionar, convertir, quitar fondos y preparar imágenes en el navegador con transparencia.",
    },
    keywords: {
      en: ["AI image editor", "online photo tools", "image upscaler"],
      pt: ["editor de imagem IA", "ferramentas de foto online", "ampliador de imagem"],
      es: ["editor de imagen IA", "herramientas de foto en linea", "ampliador de imagen"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "website",
    priority: 1,
    changefreq: "daily",
    faq: [
      {
        question: {
          en: "Is ImageMagic free to use?",
          pt: "ImageMagic e gratuito?",
          es: "ImageMagic es gratuito?",
        },
        answer: {
          en: "The current public tools can be used directly in the browser. This site does not currently sell subscriptions or paid plans.",
          pt: "As ferramentas públicas atuais podem ser usadas diretamente no navegador. Este site não vende assinaturas ou planos pagos no momento.",
          es: "Las herramientas públicas actuales se pueden usar directamente en el navegador. Este sitio no vende suscripciones ni planes pagos por ahora.",
        },
      },
      {
        question: {
          en: "Do my images stay private?",
          pt: "Minhas imagens ficam privadas?",
          es: "Mis imagenes permanecen privadas?",
        },
        answer: {
          en: "Every operation runs locally in your browser. Files never leave your device unless you choose to share them.",
          pt: "Cada operacao acontece localmente no navegador. Os arquivos nao saem do seu dispositivo a menos que voce compartilhe.",
          es: "Cada operacion ocurre localmente en el navegador. Los archivos no salen de tu dispositivo a menos que los compartas.",
        },
      },
    ],
  },
  resize: {
    id: "resize",
    path: "/resize",
    titles: {
      en: "Resize Images Online Fast | ImageMagic",
      pt: "Redimensionar Imagens Online Rapido | ImageMagic",
      es: "Redimensionar Imagenes en Linea Rapido | ImageMagic",
    },
    descriptions: {
      en: "Change image size with smart presets, keep aspect ratio, and export high quality files inside ImageMagic.",
      pt: "Mude o tamanho das imagens com presets inteligentes, mantenha a proporcao e exporte arquivos de alta qualidade.",
      es: "Cambia el tamano de las imagenes con presets inteligentes, conserva la proporcion y exporta archivos de alta calidad.",
    },
    keywords: {
      en: ["resize images", "photo resizer", "aspect ratio"],
      pt: ["redimensionar imagens", "redimensionador online", "manter proporcao"],
      es: ["redimensionar imagenes", "redimensionador online", "mantener proporcion"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "article",
    priority: 0.9,
    changefreq: "weekly",
  },
  convert: {
    id: "convert",
    path: "/convert",
    titles: {
      en: "Convert Image Formats Instantly | ImageMagic",
      pt: "Converter Formatos de Imagem | ImageMagic",
      es: "Convertir Formatos de Imagen | ImageMagic",
    },
    descriptions: {
      en: "Convert browser-friendly raster images into JPG, PNG, or WEBP with a straightforward ImageMagic workflow.",
      pt: "Converta imagens raster compatíveis com o navegador para JPG, PNG ou WEBP com um fluxo direto do ImageMagic.",
      es: "Convierte imágenes raster compatibles con el navegador a JPG, PNG o WEBP con un flujo directo de ImageMagic.",
    },
    keywords: {
      en: ["image converter", "png to jpg", "webp to png"],
      pt: ["converter imagem", "png para jpg", "webp para png"],
      es: ["convertir imagen", "png a jpg", "webp a png"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "article",
    priority: 0.9,
    changefreq: "weekly",
  },
  removeBackground: {
    id: "removeBackground",
    path: "/remove-background",
    titles: {
      en: "Remove Image Background Online | ImageMagic",
      pt: "Remover Fundo de Imagem Online | ImageMagic",
      es: "Quitar Fondo de Imagen en Linea | ImageMagic",
    },
    descriptions: {
      en: "Erase complex backgrounds with AI segmentation, export transparent PNG, and keep subjects crisp in ImageMagic.",
      pt: "Apague fundos complexos com segmentacao IA, exporte PNG transparente e mantenha o sujeito nitido no ImageMagic.",
      es: "Elimina fondos complejos con segmentacion IA, exporta PNG transparente y mantiene el sujeto nitido en ImageMagic.",
    },
    keywords: {
      en: ["remove background", "background eraser", "transparent png"],
      pt: ["remover fundo", "borracha de fundo", "png transparente"],
      es: ["quitar fondo", "borrador de fondo", "png transparente"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "article",
    priority: 0.9,
    changefreq: "weekly",
  },
  upscale: {
    id: "upscale",
    path: "/upscale",
    titles: {
      en: "AI Image Upscaler Online | ImageMagic",
      pt: "Aumentar Imagem com IA Online | ImageMagic",
      es: "Ampliar Imagen con IA en Linea | ImageMagic",
    },
    descriptions: {
      en: "Improve photo resolution with ESRGAN super resolution inside ImageMagic and keep details sharp.",
      pt: "Melhore a resolucao das fotos com super resolucao ESRGAN no ImageMagic mantendo detalhes nitidos.",
      es: "Mejora la resolucion de las fotos con super resolucion ESRGAN en ImageMagic manteniendo detalles nitidos.",
    },
    keywords: {
      en: ["ai upscaler", "increase resolution", "esrgan"],
      pt: ["aumentar resolucao", "upscaler ia", "esrgan"],
      es: ["ampliar resolucion", "upscaler ia", "esrgan"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "article",
    priority: 0.9,
    changefreq: "weekly",
  },
  resizeUpscale: {
    id: "resizeUpscale",
    path: "/resize-upscale",
    titles: {
      en: "Resize and Upscale Images Online | ImageMagic",
      pt: "Redimensionar e Ampliar Imagens Online | ImageMagic",
      es: "Redimensionar y Ampliar Imagenes en Linea | ImageMagic",
    },
    descriptions: {
      en: "Resize, enhance, and download production ready photos in one workflow powered by ImageMagic ESRGAN.",
      pt: "Redimensione, aprimore e baixe fotos prontas para producao em um fluxo com ESRGAN do ImageMagic.",
      es: "Redimensiona, mejora y descarga fotos listas para produccion en un flujo con ESRGAN de ImageMagic.",
    },
    keywords: {
      en: ["resize and upscale", "image enhancer", "ai super resolution"],
      pt: ["redimensionar e ampliar", "melhorar imagem", "super resolucao ia"],
      es: ["redimensionar y ampliar", "mejorar imagen", "super resolucion ia"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "article",
    priority: 0.85,
    changefreq: "weekly",
  },
  objectRemoval: {
    id: "objectRemoval",
    path: "/object-removal",
    alternatePaths: ["/magic-brush"],
    titles: {
      en: "Remove Objects from Photos Online | ImageMagic",
      pt: "Remover Objetos de Fotos Online | ImageMagic",
      es: "Eliminar Objetos de Fotos en Linea | ImageMagic",
    },
    descriptions: {
      en: "Brush away unwanted elements, fill backgrounds with smart inpainting, and export polished images.",
      pt: "Remova elementos indesejados, preencha fundos com inpainting inteligente e exporte imagens polidas.",
      es: "Elimina elementos no deseados, rellena fondos con inpainting inteligente y exporta imagenes pulidas.",
    },
    keywords: {
      en: ["remove objects", "inpainting online", "magic eraser"],
      pt: ["remover objetos", "inpainting online", "borracha magica"],
      es: ["eliminar objetos", "inpainting en linea", "borrador magico"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "article",
    priority: 0.8,
    changefreq: "monthly",
  },
  pricing: {
    id: "pricing",
    path: "/pricing",
    titles: {
      en: "Pricing Plans | ImageMagic",
      pt: "Planos e Precos | ImageMagic",
      es: "Planes y Precios | ImageMagic",
    },
    descriptions: {
      en: "Review current ImageMagic availability and the absence of live paid plans, subscriptions, or checkout flows.",
      pt: "Revise a disponibilidade atual do ImageMagic e a ausência de planos pagos, assinaturas ou checkout ativo.",
      es: "Revisa la disponibilidad actual de ImageMagic y la ausencia de planes pagos, suscripciones o checkout activo.",
    },
    keywords: {
      en: ["imagemagic pricing", "ai editor plans"],
      pt: ["precos imagemagic", "planos editor ia"],
      es: ["precios imagemagic", "planes editor ia"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "article",
    priority: 0.6,
    changefreq: "monthly",
  },
  about: {
    id: "about",
    path: "/about",
    titles: {
      en: "About ImageMagic | Mission and Team",
      pt: "Sobre o ImageMagic | Missao e Equipe",
      es: "Sobre ImageMagic | Mision y Equipo",
    },
    descriptions: {
      en: "Discover how ImageMagic builds trustworthy AI photo workflows for creators and marketers.",
      pt: "Descubra como o ImageMagic cria fluxos de foto com IA confiaveis para criadores e equipes de marketing.",
      es: "Descubre como ImageMagic crea flujos de foto con IA confiables para creadores y marketing.",
    },
    keywords: {
      en: ["about imagemagic", "imagemagic team"],
      pt: ["sobre imagemagic", "time imagemagic"],
      es: ["sobre imagemagic", "equipo imagemagic"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "article",
    priority: 0.5,
    changefreq: "yearly",
  },
  contact: {
    id: "contact",
    path: "/contact",
    titles: {
      en: "Contact ImageMagic Support",
      pt: "Contato com o Suporte ImageMagic",
      es: "Contacto con Soporte ImageMagic",
    },
    descriptions: {
      en: "Reach ImageMagic for product questions, partnerships, or press requests.",
      pt: "Fale com o ImageMagic para duvidas de produto, parcerias ou imprensa.",
      es: "Contacta a ImageMagic para dudas de producto, alianzas o prensa.",
    },
    keywords: {
      en: ["contact imagemagic", "imagemagic support"],
      pt: ["contato imagemagic", "suporte imagemagic"],
      es: ["contacto imagemagic", "soporte imagemagic"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "article",
    priority: 0.4,
    changefreq: "yearly",
  },
  privacy: {
    id: "privacy",
    path: "/privacy",
    titles: {
      en: "Privacy Policy | ImageMagic",
      pt: "Politica de Privacidade | ImageMagic",
      es: "Politica de Privacidad | ImageMagic",
    },
    descriptions: {
      en: "Learn how ImageMagic handles data, cookies, and local-only processing for images.",
      pt: "Saiba como o ImageMagic trata dados, cookies e processamento local de imagens.",
      es: "Conoce como ImageMagic maneja datos, cookies y el procesamiento local de imagenes.",
    },
    keywords: {
      en: ["imagemagic privacy", "cookie policy"],
      pt: ["privacidade imagemagic", "politica de cookies"],
      es: ["privacidad imagemagic", "politica de cookies"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "article",
    priority: 0.3,
    changefreq: "yearly",
  },
  terms: {
    id: "terms",
    path: "/terms",
    titles: {
      en: "Terms of Use | ImageMagic",
      pt: "Termos de Uso | ImageMagic",
      es: "Términos de Uso | ImageMagic",
    },
    descriptions: {
      en: "Read the current public terms for using ImageMagic and its browser-based image tools.",
      pt: "Leia os termos atuais para uso público do ImageMagic e das ferramentas de imagem no navegador.",
      es: "Lee los términos actuales para usar ImageMagic y sus herramientas de imagen en el navegador.",
    },
    keywords: {
      en: ["imagemagic terms", "terms of use"],
      pt: ["termos imagemagic", "termos de uso"],
      es: ["terminos imagemagic", "términos de uso"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "article",
    priority: 0.3,
    changefreq: "yearly",
  },
  notFound: {
    id: "notFound",
    path: "/404",
    titles: {
      en: "Page Not Found | ImageMagic",
      pt: "Pagina nao encontrada | ImageMagic",
      es: "Pagina no encontrada | ImageMagic",
    },
    descriptions: {
      en: "We could not find the page you were looking for on ImageMagic.",
      pt: "Nao encontramos a pagina que voce procurava no ImageMagic.",
      es: "No encontramos la pagina que buscabas en ImageMagic.",
    },
    keywords: {
      en: ["imagemagic 404"],
      pt: ["imagemagic 404"],
      es: ["imagemagic 404"],
    },
    ogImage: DEFAULT_OG_IMAGE,
    type: "article",
    priority: 0.1,
    changefreq: "yearly",
  },
};

export type PageMetaId = keyof typeof PAGE_META;

export const getPageMetaByPath = (path: string): PageMeta | undefined => {
  const normalized = path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
  return Object.values(PAGE_META).find((meta) => {
    if (meta.path === normalized) return true;
    return meta.alternatePaths?.includes(normalized) ?? false;
  });
};
