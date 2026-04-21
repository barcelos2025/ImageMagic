import { Locale } from "@/lib/seo/siteConfig";

export type ToolId = "resize" | "convert" | "removeBackground" | "upscale";

export interface ToolSection {
  heading: string;
  paragraphs: string[];
}

type ToolCopy = Record<ToolId, Record<Locale, ToolSection[]>>;

export const TOOL_CONTENT: ToolCopy = {
  resize: {
    en: [
      {
        heading: "Why accurate image resizing matters",
        paragraphs: [
          "Every channel where you publish visuals has strict pixel guidelines. The ImageMagic resizer keeps product shots crisp for marketplaces, optimizes hero banners for responsive websites, and prepares social media graphics for auto-cropping algorithms. By preserving aspect ratios and giving you explicit control over pixel density, the workflow protects compositions from soft edges, mismatched white space, and brand guideline violations.",
          "Behind the scenes we apply high quality interpolation with color-managed canvases, so gradients stay smooth even at aggressive downscales. Designers can prepare one master asset and confidently deliver mobile, tablet, and widescreen versions without opening a desktop suite. Marketing teams save hours on feedback loops because exported files already match campaign specs.",
        ],
      },
      {
        heading: "Speed up delivery for omnichannel campaigns",
        paragraphs: [
          "Teams often lose time hunting for the right preset inside legacy software. ImageMagic keeps the most requested resolutions at your fingertips: Instagram square, HD, 4K, ad placements, and newsletter banners. You can build custom presets for launch templates and share them with collaborators, so every iteration begins with approved dimensions and compression settings.",
          "Bulk creators appreciate that the browser resizer is optimized for keyboard navigation and drag-and-drop. Drop an asset, pick the right preset, export, and move to the next task. Because the app runs locally, there are no upload queues or privacy concerns. That agility supports fast-paced growth experiments and global localization programs.",
        ],
      },
      {
        heading: "Keep your visual library consistent",
        paragraphs: [
          "The history panel highlights your most recent dimensions, making it easy to repeat specs without human error. Use standardized download names to speed up classification across DAMs and collaborative clouds. Add internal notes about channels or campaigns so new teammates understand the context behind each file before they read the creative brief.",
          "Combined with the ImageMagic upscaler, you can revive legacy imagery by enhancing it to 4K, adjusting the crop, and republishing to modern media. That extends the life of expensive productions, reduces the need for reshoots, and keeps brand visuals aligned across regions and languages.",
        ],
      },
    ],
    pt: [
      {
        heading: "Por que a precisão no redimensionamento importa",
        paragraphs: [
          "Cada canal digital trabalha com regras rígidas de pixels. O redimensionador do ImageMagic mantém fotos de produto nítidas para marketplaces, otimiza hero banners para sites responsivos e prepara artes para redes sociais que cortam imagens automaticamente. Ao preservar proporções e permitir controle sobre densidade de pixels, o fluxo evita bordas borradas, espaços em branco desalinhados e violações de identidade visual.",
          "Nos bastidores aplicamos interpolação de alta qualidade em canvases com gerenciamento de cor, garantindo degradês suaves mesmo em reduções agressivas. Designers podem preparar um único ativo master e entregar versões para mobile, tablet e telas ultrawide sem abrir suítes pesadas. Equipes de marketing economizam horas porque os arquivos exportados já chegam dentro das especificações da campanha.",
        ],
      },
      {
        heading: "Entregue campanhas omnicanal em menos tempo",
        paragraphs: [
          "Muitos times perdem tempo procurando o preset correto em softwares legados. O ImageMagic mantém as resoluções mais pedidas à vista: quadrado do Instagram, HD, 4K, formatos de anúncios e banners de newsletter. Você pode criar presets personalizados para lançamentos e compartilhá-los com colegas, garantindo que cada iteração comece com dimensões aprovadas e compressão adequada.",
          "Criadores que trabalham em volume aproveitam a navegação por teclado e o arrastar e soltar direto no navegador. Solte o arquivo, escolha o preset, exporte e avance para a próxima tarefa. Como tudo roda localmente, não há filas de upload nem risco de privacidade. Essa agilidade sustenta experimentos de crescimento e programas de localização em vários mercados.",
        ],
      },
      {
        heading: "Mantenha a biblioteca visual consistente",
        paragraphs: [
          "O painel de histórico mostra suas dimensões mais recentes, facilitando repetir especificações sem erro humano. Use nomes padronizados no download para acelerar a organização em DAMs e nuvens colaborativas. Adicione notas internas sobre canais ou campanhas para que novos integrantes entendam o contexto antes mesmo de abrir o briefing.",
          "Em conjunto com o upscaler do ImageMagic, você pode resgatar imagens antigas, ampliá-las para 4K, ajustar o enquadramento e republicar nos canais modernos. Isso prolonga a vida útil de conteúdos caros, reduz a necessidade de novas produções e mantém a identidade visual alinhada entre países e idiomas.",
        ],
      },
    ],
    es: [
      {
        heading: "Por qué el redimensionado preciso importa",
        paragraphs: [
          "Cada canal digital impone medidas estrictas. El redimensionador de ImageMagic mantiene nítidas las fotos de producto para marketplaces, optimiza banners para sitios responsivos y prepara gráficos sociales que se recortan automáticamente. Al preservar proporciones y ofrecer control sobre la densidad de píxeles, el flujo evita bordes suaves, espacios vacíos y errores de identidad de marca.",
          "Detrás de escena aplicamos interpolación de alta calidad en lienzos con gestión de color, de modo que los degradados permanecen suaves incluso con reducciones agresivas. Los creativos preparan un único master y entregan versiones para móvil, tablet y pantallas anchas sin recurrir a suites pesadas. Los equipos de marketing ahorran horas porque los archivos exportados ya coinciden con las especificaciones de campaña.",
        ],
      },
      {
        heading: "Entrega campañas omnicanal con rapidez",
        paragraphs: [
          "Muchos equipos pierden tiempo buscando presets en software heredado. ImageMagic deja a la mano las resoluciones más solicitadas: cuadrado de Instagram, HD, 4K, ubicaciones de anuncios y banners de newsletter. Puedes crear presets propios para lanzamientos y compartirlos con colaboradores, de modo que cada iteración comience con dimensiones aprobadas y compresión ideal.",
          "Los creadores que trabajan con grandes volúmenes disfrutan la navegación por teclado y el arrastrar y soltar en el navegador. Suelta un recurso, elige el preset, exporta y continúa al siguiente. Como todo ocurre localmente, no existen colas de subida ni riesgos de privacidad. Esa agilidad respalda experimentos de crecimiento y programas de localización global.",
        ],
      },
      {
        heading: "Mantén tu biblioteca visual consistente",
        paragraphs: [
          "El panel de historial muestra las dimensiones recientes, ayudando a repetir especificaciones sin errores humanos. Usa nombres estandarizados al descargar para acelerar la organización en repositorios digitales y nubes colaborativas. Agrega notas internas sobre canales o campañas para que los nuevos integrantes comprendan el contexto antes de leer el brief.",
          "Combinado con el upscaler de ImageMagic, es posible revitalizar imágenes antiguas, ampliarlas a 4K, ajustar el encuadre y redistribuirlas en medios modernos. Así prolongas la vida útil de producciones costosas, reduces la necesidad de nuevas sesiones y mantienes la identidad visual alineada entre regiones e idiomas.",
        ],
      },
    ],
  },
  convert: {
    en: [
      {
        heading: "Convert formats without breaking workflows",
        paragraphs: [
          "ImageMagic handles PNG, JPG, WEBP, SVG, and PDF conversions using deterministic pipelines that respect color profiles and transparency. Marketing teams can transform banner suites into lightweight WEBP assets for faster Core Web Vitals, while still generating legacy JPG fallbacks for email clients. Motion designers easily extract poster frames from PDF decks and save crisp PNG sprites for social media stories.",
          "Because everything runs inside the browser, there is no upload bottleneck or vendor lock-in. Drag files from shared drives, convert them side by side, and download a single zip package ready for deployment. Built-in metadata preservation keeps copyright info intact, helping agencies stay compliant during customer handoffs.",
        ],
      },
      {
        heading: "Balance quality and performance",
        paragraphs: [
          "Our adaptive compression profiles evaluate the content of each image. Product shots with solid backgrounds receive transparent WEBP output, while illustrations with fine lines remain vector friendly through SVG exports. Teams can preview file size savings before downloading, making it easy to choose the right format for landing pages, ecommerce listings, or mobile apps.",
          "Combined with resize and upscale workflows, the converter becomes a finishing station for asset delivery. Prepare AVIF or WEBP files for next-gen browsers, create lightweight JPEGs for marketplaces, and feed the same source into the background remover when you need transparent hero images. Everything happens in seconds without switching tools.",
        ],
      },
      {
        heading: "Automate catalog naming and organization",
        paragraphs: [
          "Use preset naming patterns that include channel, dimension, and format to accelerate product catalog creation. Pair the converter with CMS upload scripts to reduce manual errors and rework. With ImageMagic queues you can process several assets while the team writes copy or translations, keeping campaigns on schedule.",
          "Alert panels warn when a format does not support transparency or when a PDF exceeds recommended size. That guidance prevents feedback loops and ensures every delivery reaches clients with professional polish.",
        ],
      },
    ],
    pt: [
      {
        heading: "Converta formatos sem quebrar o fluxo de trabalho",
        paragraphs: [
          "O ImageMagic trata conversões entre PNG, JPG, WEBP, SVG e PDF com pipelines determinísticos que respeitam perfis de cor e transparência. Equipes de marketing transformam conjuntos de banners em ativos WEBP leves para melhorar Core Web Vitals e ainda geram versões JPG legadas para clientes de e-mail. Designers extraem quadros de apresentações em PDF e salvam sprites PNG nítidos para stories e reels.",
          "Como tudo acontece no navegador, não há gargalos de upload nem dependência de fornecedor. Arraste arquivos de drives compartilhados, converta lado a lado e baixe um pacote zip pronto para publicação. A preservação de metadados mantém créditos e direitos autorais intactos, ajudando agências a cumprir obrigações contratuais.",
        ],
      },
      {
        heading: "Equilibre qualidade e desempenho",
        paragraphs: [
          "Perfis adaptativos de compressão avaliam o conteúdo de cada imagem. Fotos de produto com fundo sólido recebem saída WEBP transparente, enquanto ilustrações com linhas finas permanecem fiéis graças às exportações em SVG. A equipe visualiza a economia de tamanho antes de baixar, escolhendo o formato ideal para landing pages, catálogos de ecommerce ou apps mobile.",
          "Combinado aos fluxos de redimensionar e ampliar, o conversor se torna uma estação final de entrega. Gere arquivos AVIF ou WEBP para navegadores modernos, crie JPEGs leves para marketplaces e encaminhe a mesma fonte para a remoção de fundo quando precisar de heróis transparentes. Tudo acontece em poucos segundos sem alternar de ferramenta.",
        ],
      },
      {
        heading: "Automatize catálogos e organização",
        paragraphs: [
          "Use padrões de nomenclatura com canal, dimensão e formato para acelerar a criação de catálogos de produto. Integre o conversor a scripts de upload no CMS ou loja virtual, reduzindo erros manuais e retrabalho. Com as filas do ImageMagic você processa vários arquivos enquanto o time escreve descrições ou traduções, mantendo o cronograma em dia.",
          "Alertas informam quando um formato não suporta transparência ou quando um PDF ultrapassa o limite recomendado, orientando ajustes antes de compartilhar com o cliente. Assim você evita idas e vindas e entrega materiais prontos para publicação.",
        ],
      },
    ],
    es: [
      {
        heading: "Convierte formatos sin romper el flujo",
        paragraphs: [
          "ImageMagic realiza conversiones entre PNG, JPG, WEBP, SVG y PDF mediante pipelines deterministas que respetan perfiles de color y transparencia. Los equipos de marketing transforman series de banners en activos WEBP ligeros para mejorar Core Web Vitals y generan versiones JPG heredadas para clientes de correo electrónico. Los diseñadores extraen cuadros de presentaciones PDF y guardan sprites PNG nítidos para historias o reels.",
          "Como todo sucede en el navegador, no hay cuellos de botella de subida ni dependencia de proveedores. Arrastra archivos desde unidades compartidas, conviértelos en paralelo y descarga un paquete zip listo para publicar. La preservación de metadatos mantiene los créditos intactos, ayudando a las agencias a cumplir con los acuerdos de entrega.",
        ],
      },
      {
        heading: "Equilibra calidad y rendimiento",
        paragraphs: [
          "Nuestros perfiles de compresión adaptativa analizan el contenido de cada imagen. Las fotos de producto con fondo sólido generan salidas WEBP transparentes, mientras que las ilustraciones con líneas finas conservan fidelidad gracias a las exportaciones SVG. El equipo visualiza el ahorro de peso antes de descargar, eligiendo el formato adecuado para landing pages, catálogos de ecommerce o aplicaciones móviles.",
          "Combinado con los flujos de redimensionar y ampliar, el conversor se convierte en la estación final de entrega. Prepara archivos AVIF o WEBP para navegadores modernos, crea JPEG ligeros para marketplaces y dirige la misma fuente al removedor de fondo cuando necesitas héroes transparentes. Todo sucede en segundos sin cambiar de herramienta.",
        ],
      },
      {
        heading: "Automatiza catálogos y archivado",
        paragraphs: [
          "Aplica patrones de nombres que incluyan canal, dimensión y formato para acelerar la creación de catálogos. Integra el conversor con scripts de carga en CMS y tiendas en línea, reduciendo errores manuales y reprocesos. Con las colas de ImageMagic procesas varios archivos mientras el equipo redacta copys o traducciones, manteniendo los lanzamientos en calendario.",
          "Los avisos informan cuando un formato no admite transparencia o cuando un PDF supera el límite recomendado, guiando ajustes antes de compartir con el cliente. Así evitas devoluciones y entregas activos listos para producción.",
        ],
      },
    ],
  },
  removeBackground: {
    en: [
      {
        heading: "Cut backgrounds with pixel-perfect masks",
        paragraphs: [
          "The ImageMagic remover uses transformer-based segmentation to separate subjects from complex backgrounds without uploading files to external servers. Portrait photographers preserve flyaway hair and soft edges, while ecommerce teams create transparent PNGs ready for marketplaces that demand white or custom backgrounds. Shadow and reflection options help lifestyle shots remain natural even after retouching.",
          "Quality controls show the confidence of every mask, letting you refine selections before exporting. Overlay toggles highlight areas detected as background so you can touch up directly in the preview canvas. Because the workflow is non-destructive you can roll back steps and iterate without restarting.",
        ],
      },
      {
        heading: "Accelerate product listing preparation",
        paragraphs: [
          "Merchandisers use preset templates to place isolated products over branded gradients, seasonal colors, or grid layouts that match storefront guidelines. You can generate hero, thumbnail, and zoom variations in a single session, ensuring that catalog pages load fast while still providing detail on hover.",
          "Freelancers appreciate that processed images stay on the device, meeting privacy clauses in many retail contracts. The optional batch mode keeps previously processed masks in cache, so you can reapply settings when new colorways drop. Combined with the converter and resizer, the remover becomes the backbone of a repeatable listing pipeline.",
        ],
      },
      {
        heading: "Elevate creative storytelling",
        paragraphs: [
          "Pair the clean cuts with generative backdrops, gradient overlays, or ready-made mockups. Smooth masks eliminate jagged edges in stories, reels, and display ads. You can produce multiple variations for A/B tests and keep campaign visuals consistent without relying on heavyweight desktop suites.",
          "Since everything runs locally, you can work with embargoed launches, prototypes, or sensitive lifestyle photography without compliance risks. That makes ImageMagic a reliable partner for D2C brands, in-house studios, and agencies handling confidential campaigns.",
        ],
      },
    ],
    pt: [
      {
        heading: "Corte fundos com máscaras precisas",
        paragraphs: [
          "O removedor do ImageMagic usa segmentação baseada em transformers para separar sujeito e fundo sem enviar arquivos para servidores externos. Fotógrafos preservam fios de cabelo e bordas suaves, enquanto equipes de ecommerce geram PNGs transparentes prontos para marketplaces que exigem fundo branco ou vitrines personalizadas. Opções de sombra e reflexão deixam fotos lifestyle naturais mesmo após o retoque.",
          "Controles de qualidade exibem a confiança de cada máscara, permitindo refinar a seleção antes da exportação. Sobreposições destacam as áreas identificadas como fundo para que você retoque direto no canvas de pré-visualização. Como o fluxo é não destrutivo, dá para desfazer etapas e iterar sem recomeçar do zero.",
        ],
      },
      {
        heading: "Prepare fichas de produto com agilidade",
        paragraphs: [
          "Merchandisers usam templates prontos para posicionar produtos isolados sobre degradês de marca, cores sazonais ou grids que seguem as diretrizes da vitrine. Gere variações de imagem hero, miniatura e zoom em uma única sessão, garantindo catálogos leves sem perder detalhes ao passar o mouse.",
          "Freelancers valorizam o processamento local, que atende cláusulas de privacidade comuns em contratos de varejo. O modo em lote opcional guarda máscaras no cache para reutilizar configurações quando novas cores chegarem. Em conjunto com o conversor e o redimensionador, o removedor vira a espinha dorsal de um pipeline repetível.",
        ],
      },
      {
        heading: "Eleve narrativas criativas em segundos",
        paragraphs: [
          "Combine o recorte limpo com fundos gerados por IA, gradientes dinâmicos ou mockups prontos. Máscaras suaves evitam serrilhados em stories, reels e anúncios display. É fácil produzir variações para testes A/B e manter a identidade visual das campanhas sem depender de suítes pesadas.",
          "Como tudo acontece no seu dispositivo, você pode trabalhar com lançamentos embargados, protótipos ou ensaios sensíveis sem riscos de conformidade. Isso torna o ImageMagic um parceiro seguro para marcas D2C, estúdios internos e agências que lidam com campanhas confidenciais.",
        ],
      },
    ],
    es: [
      {
        heading: "Recorta fondos con máscaras precisas",
        paragraphs: [
          "El removedor de ImageMagic utiliza segmentación basada en transformers para separar sujetos y fondos sin subir archivos a servidores externos. Los fotógrafos preservan cabellos sueltos y bordes suaves, mientras que los equipos de ecommerce generan PNG transparentes listos para marketplaces que exigen fondo blanco o vitrinas personalizadas. Las opciones de sombra y reflejo mantienen las escenas naturales incluso después del retoque.",
          "Los controles de calidad muestran el nivel de confianza de cada máscara, permitiendo refinar la selección antes de exportar. Las superposiciones resaltan las zonas detectadas como fondo para retocar directamente en el lienzo. Al ser un flujo no destructivo, puedes revertir pasos e iterar sin empezar de cero.",
        ],
      },
      {
        heading: "Acelera la preparación de catálogos",
        paragraphs: [
          "Los merchandisers aprovechan plantillas para ubicar productos recortados sobre degradados de marca, colores de temporada o rejillas alineadas a las guías de la tienda. Genera variaciones hero, miniatura y zoom en una sola sesión, asegurando páginas rápidas sin sacrificar detalle.",
          "Los freelancers agradecen que el procesamiento permanezca en el dispositivo, satisfaciendo cláusulas de privacidad frecuentes en contratos minoristas. El modo por lotes opcional guarda máscaras en caché para reutilizarlas cuando llegan nuevas variantes. Unido al conversor y al redimensionador, el removedor se convierte en la columna vertebral de un pipeline confiable.",
        ],
      },
      {
        heading: "Refuerza tu narrativa creativa",
        paragraphs: [
          "Combina los recortes limpios con fondos generados, gradientes dinámicos o mockups listos. Máscaras suaves eliminan bordes dentados en stories, reels y anuncios display. Es sencillo producir variaciones para pruebas A/B y mantener la consistencia visual sin recurrir a suites pesadas.",
          "Como todo sucede localmente, puedes trabajar con lanzamientos embargados, prototipos o sesiones sensibles sin riesgos de cumplimiento. ImageMagic se vuelve un aliado confiable para marcas D2C, estudios internos y agencias que gestionan campañas confidenciales.",
        ],
      },
    ],
  },
  upscale: {
    en: [
      {
        heading: "Restore resolution with ESRGAN",
        paragraphs: [
          "ImageMagic integrates UpscalerJS with ESRGAN models to enhance images up to 8x without the watercolor artifacts common in older upscalers. Photographers rescue archival shoots for large format prints, while game studios upscale textures for remastered releases. Adaptive tiling avoids GPU memory crashes, so even laptop users can process poster grade graphics.",
          "Each pass respects fine edges and typography, making enlarged screenshots and UI mockups publication ready. Noise reduction settings help sharpen portraits without introducing halos. The preview canvas shows before and after comparisons, giving stakeholders confidence before committing to downloads.",
        ],
      },
      {
        heading: "Repurpose legacy assets for modern channels",
        paragraphs: [
          "Social media managers breathe new life into blog illustrations, turning 800px graphics into crisp 4K carousels. Ecommerce teams upscale supplier photos, freeing designers from chasing new hero shots. Publishers restore scanned catalogs so they can re-sell back issues in digital marketplaces.",
          "Because the ESRGAN pipeline runs locally, confidential product renders never leave your device. Finish the workflow with the resize and converter tools to ship optimized assets for web, mobile, and print. The result is a continuous production chain that saves budget while elevating visual quality.",
        ],
      },
      {
        heading: "Scale quality without sacrificing detail",
        paragraphs: [
          "Set presets at 2x, 4x, and 8x for different channels and automate content relaunches. Combine the upscaler with the background remover to build high resolution product mockups in minutes. Batch processing tests multiple variants to find the sweet spot between clarity and file size.",
          "Progress indicators surface every stage of the enhancement, and error messages guide you when the source image is too small. You avoid surprises and deliver consistent results even when working with older or limited assets.",
        ],
      },
    ],
    pt: [
      {
        heading: "Recupere resolução com ESRGAN",
        paragraphs: [
          "O ImageMagic integra o UpscalerJS com modelos ESRGAN para ampliar imagens em até 8x sem os artefatos aquarelados de ampliadores antigos. Fotógrafos resgatam ensaios de arquivo para impressões em grande formato, enquanto estúdios de jogos ampliam texturas para relançamentos remasterizados. O fracionamento adaptativo evita travamentos de memória GPU, permitindo que até notebooks processem gráficos em qualidade de pôster.",
          "Cada passada respeita bordas finas e tipografia, deixando capturas de tela e mockups de interface prontos para publicação. Controles de redução de ruído ajudam a definir retratos sem criar halos. O canvas de pré-visualização mostra comparações antes e depois, dando segurança aos aprovadores antes do download.",
        ],
      },
      {
        heading: "Reaproveite ativos legados em canais modernos",
        paragraphs: [
          "Gestores de social transformam ilustrações antigas de blog em carrosséis 4K nítidos. Equipes de ecommerce ampliam fotos de fornecedores, liberando designers para focar em criações novas. Editoras restauram catálogos digitalizados e voltam a vender edições antigas em marketplaces digitais.",
          "Como o pipeline ESRGAN roda localmente, renders confidenciais nunca saem do dispositivo. Finalize o fluxo com as ferramentas de redimensionar e converter para entregar arquivos otimizados para web, mobile e impressão. O resultado é uma cadeia de produção contínua que economiza orçamento e eleva a qualidade visual.",
        ],
      },
      {
        heading: "Ganhe escala sem perder detalhe",
        paragraphs: [
          "Crie presets com fatores 2x, 4x e 8x para diferentes canais e automatize relançamentos de conteúdo. Combine o upscaler com a remoção de fundo para gerar mockups de produto em alta resolução em minutos. O processamento em lote testa variantes até encontrar o equilíbrio certo entre nitidez e tamanho de arquivo.",
          "Indicadores de progresso exibem cada etapa da melhoria, enquanto mensagens de erro orientam ajustes quando a imagem de origem é pequena demais. Assim você evita surpresas e entrega resultados consistentes mesmo com materiais antigos ou limitados.",
        ],
      },
    ],
    es: [
      {
        heading: "Restaura resolución con ESRGAN",
        paragraphs: [
          "ImageMagic integra UpscalerJS con modelos ESRGAN para ampliar imágenes hasta 8x sin los artefactos acuarelados de ampliadores antiguos. Los fotógrafos recuperan sesiones de archivo para impresiones de gran formato, mientras los estudios de videojuegos amplían texturas para relanzamientos remasterizados. El teselado adaptativo evita fallos de memoria GPU, permitiendo que incluso portátiles procesen gráficos de calidad póster.",
          "Cada pasada respeta bordes finos y tipografía, dejando listas las capturas de pantalla y los mockups de interfaz para publicación. Los controles de reducción de ruido afinan retratos sin crear halos. El lienzo de vista previa muestra comparaciones antes y después, dando confianza a los responsables de aprobación.",
        ],
      },
      {
        heading: "Reutiliza activos heredados en canales modernos",
        paragraphs: [
          "Los gestores de redes sociales revitalizan ilustraciones antiguas al convertirlas en carruseles 4K nítidos. Los equipos de ecommerce amplían fotos de proveedores y liberan a los diseñadores para proyectos nuevos. Las editoriales restauran catálogos escaneados y vuelven a vender ediciones atrasadas en tiendas digitales.",
          "Como el pipeline ESRGAN se ejecuta localmente, los renders confidenciales nunca abandonan el dispositivo. Completa el flujo con las herramientas de redimensionado y conversión para entregar archivos optimizados para web, móvil e impresión. El resultado es una cadena de producción continua que ahorra presupuesto y eleva la calidad visual.",
        ],
      },
      {
        heading: "Escala sin sacrificar detalle",
        paragraphs: [
          "Crea presets con factores 2x, 4x y 8x para distintos canales y automatiza relanzamientos de contenido. Combina el upscaler con el removedor de fondos para generar mockups de producto en alta resolución en minutos. El procesamiento por lotes prueba múltiples variantes hasta encontrar el punto ideal entre nitidez y peso.",
          "Los indicadores de progreso muestran cada fase de la mejora y los mensajes de error guían ajustes cuando la imagen original es demasiado pequeña. Así evitas sorpresas y entregas resultados consistentes incluso trabajando con materiales heredados.",
        ],
      },
    ],
  },
};

export const getToolContent = (toolId: ToolId, locale: Locale): ToolSection[] => {
  return TOOL_CONTENT[toolId][locale];
};
