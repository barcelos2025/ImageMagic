export type UpscaleCopyLocale = 'en' | 'pt' | 'es';

export interface UpscalePreset {
  id: string;
  label: string;
  width?: number;
  height?: number;
}

export interface UpscaleFactorOption {
  label: string;
  value: number;
}

export interface UpscaleCopy {
  heroTitle: string;
  heroDescription: string;
  controlsTitle: string;
  controlsDescription: string;
  imageLabel: string;
  formatHint: string;
  selectedPrefix: string;
  presetLabel: string;
  presetPlaceholder: string;
  widthLabel: string;
  heightLabel: string;
  keepAspectLabel: string;
  upscaleLabel: string;
  resetButton: string;
  processButton: string;
  downloadButton: string;
  previewTitle: string;
  previewDescription: (
    result?: { width: number; height: number },
    original?: { width: number; height: number },
  ) => string;
  previewPlaceholder: string;
  statusErrorTitle: string;
  statusInfoTitle: string;
  tipsTitle: string;
  tipsDescription: string;
  tipsList: string[];
  presets: readonly UpscalePreset[];
  upscaleFactors: readonly UpscaleFactorOption[];
  messages: {
    unsupportedFormat: string;
    fileTooLarge: string;
    missingImage: string;
    canvasUnsupported: string;
    resizedOnly: string;
    upscalingComplete: string;
    processingCancelled: string;
    downloadError: string;
    genericFailure: string;
  };
}

const formatDimensions = (width?: number, height?: number) =>
  width && height ? `${width} × ${height}` : "-";

export const RESIZE_UPSCALE_COPY: Record<UpscaleCopyLocale, UpscaleCopy> = {
  en: {
    heroTitle: "Image Resize & Upscale",
    heroDescription:
      "Resize images, preserve aspect ratios, and apply ESRGAN super-resolution without leaving your browser.",
    controlsTitle: "Controls",
    controlsDescription: "Upload an image, choose the output size, and pick an upscaling factor.",
    imageLabel: "Image",
    formatHint: "JPG, PNG, or WEBP up to 20 MB.",
    selectedPrefix: "Selected:",
    presetLabel: "Resolution preset",
    presetPlaceholder: "Select a preset",
    widthLabel: "Width (px)",
    heightLabel: "Height (px)",
    keepAspectLabel: "Keep aspect ratio",
    upscaleLabel: "Upscale factor",
    resetButton: "Reset",
    processButton: "Process",
    downloadButton: "Download",
    previewTitle: "Preview",
    previewDescription: (result, original) => {
      if (result) {
        return `Output: ${formatDimensions(result.width, result.height)}`;
      }
      if (original) {
        return `Original: ${formatDimensions(original.width, original.height)}`;
      }
      return "Upload an image to preview.";
    },
    previewPlaceholder: "Upload an image to see the resized and upscaled preview here.",
    statusErrorTitle: "Something went wrong",
    statusInfoTitle: "Status",
    tipsTitle: "Tips for best results",
    tipsDescription: "Keep your browser tab active during processing for faster GPU acceleration.",
    tipsList: [
      "For very large images, start with 2× or 4× upscale to reduce memory usage.",
      "Close other heavy browser tabs if you encounter performance issues.",
      "Processing runs entirely on your device—no images leave your computer.",
    ],
    presets: [
      { id: "original", label: "Original" },
      { id: "1080x1080", label: "1080 × 1080", width: 1080, height: 1080 },
      { id: "1920x1080", label: "1920 × 1080", width: 1920, height: 1080 },
      { id: "2560x1440", label: "2560 × 1440", width: 2560, height: 1440 },
      { id: "3840x2160", label: "3840 × 2160", width: 3840, height: 2160 },
    ],
    upscaleFactors: [
      { label: "1× (no upscale)", value: 1 },
      { label: "2×", value: 2 },
      { label: "4×", value: 4 },
      { label: "8×", value: 8 },
    ],
    messages: {
      unsupportedFormat: "Unsupported format. Choose a JPG, PNG, or WEBP image.",
      fileTooLarge: "File is too large. Please upload an image under 20 MB.",
      missingImage: "Please upload an image first.",
      canvasUnsupported: "Canvas 2D context is not available in this browser.",
      resizedOnly: "Image resized without upscaling. Ready to download.",
      upscalingComplete: "Upscaling complete. You can download the result.",
      processingCancelled: "Processing cancelled.",
      downloadError: "Unable to create file for download.",
      genericFailure: "Failed to process image. Please try again with smaller dimensions.",
    },
  },
  pt: {
    heroTitle: "Redimensionar e ampliar imagens",
    heroDescription:
      "Redimensione imagens, preserve proporções e aplique super-resolução ESRGAN diretamente no navegador.",
    controlsTitle: "Controles",
    controlsDescription: "Envie uma imagem, escolha o tamanho final e selecione o fator de ampliação.",
    imageLabel: "Imagem",
    formatHint: "JPG, PNG ou WEBP de até 20 MB.",
    selectedPrefix: "Selecionado:",
    presetLabel: "Preset de resolução",
    presetPlaceholder: "Escolha um preset",
    widthLabel: "Largura (px)",
    heightLabel: "Altura (px)",
    keepAspectLabel: "Manter proporção",
    upscaleLabel: "Fator de ampliação",
    resetButton: "Redefinir",
    processButton: "Processar",
    downloadButton: "Baixar",
    previewTitle: "Pré-visualização",
    previewDescription: (result, original) => {
      if (result) {
        return `Saída: ${formatDimensions(result.width, result.height)}`;
      }
      if (original) {
        return `Original: ${formatDimensions(original.width, original.height)}`;
      }
      return "Envie uma imagem para visualizar aqui.";
    },
    previewPlaceholder: "Envie uma imagem para visualizar o redimensionamento e a ampliação aqui.",
    statusErrorTitle: "Algo deu errado",
    statusInfoTitle: "Status",
    tipsTitle: "Dicas para melhores resultados",
    tipsDescription: "Mantenha esta aba ativa durante o processamento para aproveitar a GPU.",
    tipsList: [
      "Para imagens muito grandes, comece com ampliação em 2× ou 4× para reduzir o uso de memória.",
      "Feche outras abas pesadas do navegador se notar lentidão.",
      "Todo o processamento ocorre no seu dispositivo — nenhum arquivo sai do computador.",
    ],
    presets: [
      { id: "original", label: "Original" },
      { id: "1080x1080", label: "1080 × 1080", width: 1080, height: 1080 },
      { id: "1920x1080", label: "1920 × 1080", width: 1920, height: 1080 },
      { id: "2560x1440", label: "2560 × 1440", width: 2560, height: 1440 },
      { id: "3840x2160", label: "3840 × 2160", width: 3840, height: 2160 },
    ],
    upscaleFactors: [
      { label: "1× (sem ampliação)", value: 1 },
      { label: "2×", value: 2 },
      { label: "4×", value: 4 },
      { label: "8×", value: 8 },
    ],
    messages: {
      unsupportedFormat: "Formato não suportado. Escolha uma imagem JPG, PNG ou WEBP.",
      fileTooLarge: "Arquivo muito grande. Envie uma imagem com menos de 20 MB.",
      missingImage: "Envie uma imagem antes de processar.",
      canvasUnsupported: "O contexto 2D de canvas não está disponível neste navegador.",
      resizedOnly: "Imagem redimensionada sem ampliação. Pronta para download.",
      upscalingComplete: "Ampliação concluída. Você já pode baixar o resultado.",
      processingCancelled: "Processamento cancelado.",
      downloadError: "Não foi possível criar o arquivo para download.",
      genericFailure: "Não foi possível processar a imagem. Tente novamente com dimensões menores.",
    },
  },
  es: {
    heroTitle: "Redimensionar y ampliar imágenes",
    heroDescription:
      "Redimensiona imágenes, preserva proporciones y aplica super resolución ESRGAN directamente en el navegador.",
    controlsTitle: "Controles",
    controlsDescription: "Sube una imagen, elige el tamaño final y selecciona el factor de ampliación.",
    imageLabel: "Imagen",
    formatHint: "JPG, PNG o WEBP de hasta 20 MB.",
    selectedPrefix: "Seleccionado:",
    presetLabel: "Preset de resolución",
    presetPlaceholder: "Elige un preset",
    widthLabel: "Ancho (px)",
    heightLabel: "Alto (px)",
    keepAspectLabel: "Mantener proporción",
    upscaleLabel: "Factor de ampliación",
    resetButton: "Restablecer",
    processButton: "Procesar",
    downloadButton: "Descargar",
    previewTitle: "Vista previa",
    previewDescription: (result, original) => {
      if (result) {
        return `Salida: ${formatDimensions(result.width, result.height)}`;
      }
      if (original) {
        return `Original: ${formatDimensions(original.width, original.height)}`;
      }
      return "Sube una imagen para previsualizar el resultado.";
    },
    previewPlaceholder: "Sube una imagen para ver aquí el redimensionado y la ampliación.",
    statusErrorTitle: "Ocurrió un problema",
    statusInfoTitle: "Estado",
    tipsTitle: "Consejos para mejores resultados",
    tipsDescription: "Mantén esta pestaña activa durante el procesamiento para aprovechar la GPU.",
    tipsList: [
      "Para imágenes muy grandes, comienza con ampliación 2× o 4× para reducir el uso de memoria.",
      "Cierra otras pestañas pesadas del navegador si notas problemas de rendimiento.",
      "El procesamiento ocurre por completo en tu dispositivo; ningún archivo sale de tu computadora.",
    ],
    presets: [
      { id: "original", label: "Original" },
      { id: "1080x1080", label: "1080 × 1080", width: 1080, height: 1080 },
      { id: "1920x1080", label: "1920 × 1080", width: 1920, height: 1080 },
      { id: "2560x1440", label: "2560 × 1440", width: 2560, height: 1440 },
      { id: "3840x2160", label: "3840 × 2160", width: 3840, height: 2160 },
    ],
    upscaleFactors: [
      { label: "1× (sin ampliación)", value: 1 },
      { label: "2×", value: 2 },
      { label: "4×", value: 4 },
      { label: "8×", value: 8 },
    ],
    messages: {
      unsupportedFormat: "Formato no compatible. Elige una imagen JPG, PNG o WEBP.",
      fileTooLarge: "El archivo es demasiado grande. Sube una imagen menor a 20 MB.",
      missingImage: "Sube una imagen antes de procesar.",
      canvasUnsupported: "El contexto 2D de canvas no está disponible en este navegador.",
      resizedOnly: "Imagen redimensionada sin ampliación. Lista para descargar.",
      upscalingComplete: "Ampliación completada. Ya puedes descargar el resultado.",
      processingCancelled: "Procesamiento cancelado.",
      downloadError: "No se pudo crear el archivo para descargar.",
      genericFailure: "No se pudo procesar la imagen. Intenta nuevamente con dimensiones menores.",
    },
  },
};
