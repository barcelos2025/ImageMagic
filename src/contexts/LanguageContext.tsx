import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'pt' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.resize': 'Resize',
    'nav.convert': 'Convert',
    'nav.removeBackground': 'Remove Background',
    'nav.magicBrush': 'Magic Eraser',
    'nav.upscale': 'Upscale',
    'nav.pricing': 'Pricing',
    'nav.about': 'About',
    'nav.contact': 'Contact',

    'home.title': 'ImageMagic',
    'home.subtitle': 'Professional AI-Powered Image Editing Suite',
    'home.description': 'Prepare images in the browser with resize, format conversion, background removal, and high-resolution export workflows.',
    'home.getStarted': 'Get Started',
    'home.learnMore': 'Learn More',

    'tools.resize.title': 'Image Resize',
    'tools.resize.description': 'Resize images with smart presets or custom dimensions while maintaining quality',
    'tools.convert.title': 'Format Conversion',
    'tools.convert.description': 'Convert common browser-friendly image formats such as PNG, JPG, and WEBP',
    'tools.removeBackground.title': 'AI Background Removal',
    'tools.removeBackground.description': 'Remove backgrounds automatically using advanced AI models',
    'tools.magicBrush.title': 'Magic Eraser',
    'tools.magicBrush.description': 'Remove unwanted objects from images with intelligent inpainting',
    'tools.upscale.title': 'AI Upscaler',
    'tools.upscale.description': 'Enhance image resolution with 2x, 4x, or 8x AI upscaling',

    'common.tryNow': 'Try Now',
    'common.upload': 'Upload Image',
    'common.download': 'Download',
    'common.processing': 'Processing...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.convertImage': 'Convert Image',

    'share.native': 'Share',
    'share.twitter': 'Share on X',
    'share.linkedin': 'Share on LinkedIn',
    'share.copy': 'Copy link',
    'share.copied': 'Link copied to clipboard',
    'share.error': 'Unable to copy the link',
    'share.cancelled': 'Sharing cancelled',

    'consent.title': 'We value your privacy',
    'consent.body': 'ImageMagic uses essential cookies to remember language preferences and to measure anonymous product usage when you allow analytics. Review our privacy policy for details.',
    'consent.decline': 'Decline',
    'consent.accept': 'Accept',
    'consent.policy': 'Privacy Policy',

    'ads.banner.label': 'Sponsored placement',
  },
  pt: {
    'nav.home': 'Início',
    'nav.resize': 'Redimensionar',
    'nav.convert': 'Converter',
    'nav.removeBackground': 'Remover fundo',
    'nav.magicBrush': 'Borracha mágica',
    'nav.upscale': 'Ampliar',
    'nav.pricing': 'Preços',
    'nav.about': 'Sobre',
    'nav.contact': 'Contato',

    'home.title': 'ImageMagic',
    'home.subtitle': 'Suíte profissional de edição de imagens com IA',
    'home.description': 'Prepare imagens no navegador com redimensionamento, conversão de formato, remoção de fundo e exportação em alta resolução.',
    'home.getStarted': 'Começar agora',
    'home.learnMore': 'Saiba mais',

    'tools.resize.title': 'Redimensionar imagem',
    'tools.resize.description': 'Redimensione imagens com presets inteligentes ou dimensões personalizadas mantendo a qualidade',
    'tools.convert.title': 'Converter formatos',
    'tools.convert.description': 'Converta formatos comuns de imagem do navegador, como PNG, JPG e WEBP',
    'tools.removeBackground.title': 'Remover fundo com IA',
    'tools.removeBackground.description': 'Remova fundos automaticamente com modelos avançados de IA',
    'tools.magicBrush.title': 'Borracha mágica',
    'tools.magicBrush.description': 'Remova objetos indesejados com preenchimento inteligente',
    'tools.upscale.title': 'Ampliar com IA',
    'tools.upscale.description': 'Melhore a resolução com aumento em 2x, 4x ou 8x usando IA',

    'common.tryNow': 'Experimente agora',
    'common.upload': 'Enviar imagem',
    'common.download': 'Baixar',
    'common.processing': 'Processando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.convertImage': 'Converter imagem',

    'share.native': 'Compartilhar',
    'share.twitter': 'Compartilhar no X',
    'share.linkedin': 'Compartilhar no LinkedIn',
    'share.copy': 'Copiar link',
    'share.copied': 'Link copiado para a área de transferência',
    'share.error': 'Não foi possível copiar o link',
    'share.cancelled': 'Compartilhamento cancelado',

    'consent.title': 'Nós valorizamos sua privacidade',
    'consent.body': 'O ImageMagic usa cookies essenciais para lembrar o idioma escolhido e medir o uso anônimo do produto quando você permite analytics. Consulte nossa política de privacidade para saber mais.',
    'consent.decline': 'Recusar',
    'consent.accept': 'Aceitar',
    'consent.policy': 'Política de privacidade',

    'ads.banner.label': 'Espaço patrocinado',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.resize': 'Redimensionar',
    'nav.convert': 'Convertir',
    'nav.removeBackground': 'Quitar fondo',
    'nav.magicBrush': 'Borrador mágico',
    'nav.upscale': 'Ampliar',
    'nav.pricing': 'Precios',
    'nav.about': 'Acerca de',
    'nav.contact': 'Contacto',

    'home.title': 'ImageMagic',
    'home.subtitle': 'Suite profesional de edición de imágenes con IA',
    'home.description': 'Prepara imágenes en el navegador con redimensionado, conversión de formato, eliminación de fondo y exportación en alta resolución.',
    'home.getStarted': 'Comenzar',
    'home.learnMore': 'Aprender más',

    'tools.resize.title': 'Redimensionar imagen',
    'tools.resize.description': 'Redimensiona imágenes con presets inteligentes o dimensiones personalizadas manteniendo la calidad',
    'tools.convert.title': 'Convertir formatos',
    'tools.convert.description': 'Convierte formatos comunes de imagen del navegador, como PNG, JPG y WEBP',
    'tools.removeBackground.title': 'Eliminar fondo con IA',
    'tools.removeBackground.description': 'Elimina fondos automáticamente con modelos avanzados de IA',
    'tools.magicBrush.title': 'Borrador mágico',
    'tools.magicBrush.description': 'Elimina objetos no deseados con relleno inteligente',
    'tools.upscale.title': 'Ampliar con IA',
    'tools.upscale.description': 'Mejora la resolución en 2x, 4x u 8x usando IA',

    'common.tryNow': 'Probar ahora',
    'common.upload': 'Subir imagen',
    'common.download': 'Descargar',
    'common.processing': 'Procesando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.convertImage': 'Convertir imagen',

    'share.native': 'Compartir',
    'share.twitter': 'Compartir en X',
    'share.linkedin': 'Compartir en LinkedIn',
    'share.copy': 'Copiar enlace',
    'share.copied': 'Enlace copiado al portapapeles',
    'share.error': 'No se pudo copiar el enlace',
    'share.cancelled': 'Compartido cancelado',

    'consent.title': 'Valoramos tu privacidad',
    'consent.body': 'ImageMagic usa cookies esenciales para recordar el idioma elegido y medir el uso anónimo del producto cuando permites analytics. Consulta nuestra política de privacidad para más información.',
    'consent.decline': 'Rechazar',
    'consent.accept': 'Aceptar',
    'consent.policy': 'Política de privacidad',

    'ads.banner.label': 'Espacio patrocinado',
  },
};

type TranslationMap = typeof translations;

type TranslationKeys = keyof TranslationMap['en'];

const fallbackLanguage: Language = 'en';

const translate = (language: Language, key: string): string => {
  const dictionary = translations[language];
  if ((dictionary as Record<string, string>)[key]) {
    return (dictionary as Record<string, string>)[key];
  }
  const fallback = translations[fallbackLanguage];
  return (fallback as Record<string, string>)[key] || key;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('imagemagic-language');
    if (saved === 'en' || saved === 'pt' || saved === 'es') return saved;

    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'pt' || browserLang === 'es') return browserLang as Language;
    return 'en';
  });

  const t = (key: TranslationKeys | string): string => translate(language, key);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('imagemagic-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
