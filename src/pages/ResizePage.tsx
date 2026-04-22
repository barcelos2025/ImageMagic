import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCcw, Upload, Download, Lock, Unlock } from "@/components/icons";
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import ToolHero from '@/components/ToolHero';
import LocalProcessingNotice from '@/components/LocalProcessingNotice';
import { ResultImagePreview } from '@/components/ResultImagePreview';
import { upscaleCanvas, type UpscaleFactor } from '@/utils/upscale';
import { logClientEvent } from '@/utils/clientLogger';

const KEEP_RATIO_TRUE = true;
const AI_UPSCALE_THRESHOLD = 1.5;

type AspectRatioBasis = 'width' | 'height';

const RESIZE_COPY = {
  en: {
    uploadCardTitle: 'Upload image',
    uploadCardDescription: 'Drag and drop or click to select an image',
    dropActive: 'Drop the image here…',
    dropInactive: 'Drag & drop an image here, or click to select',
    formatHint: 'PNG, JPG, WEBP up to 20 MB.',
    selectedFilePrefix: 'Selected: ',
    resolutionPresetLabel: 'Resolution preset',
    presetPlaceholder: 'Select a preset',
    quickPresetsLabel: 'Quick presets',
    customDimensionsLabel: 'Custom dimensions',
    keepRatioLabel: 'Keep ratio',
    ratioBasisLabel: 'Size to preserve',
    ratioBasisWidth: 'Use width',
    ratioBasisHeight: 'Use height',
    ratioBasisHelp: 'When ratio is locked, presets keep this selected side and calculate the other one.',
    widthLabel: 'Width',
    heightLabel: 'Height',
    processButton: 'Process',
    resetButton: 'Reset',
    previewTitle: 'Preview',
    previewOriginal: (width: number, height: number) => `Original: ${width} × ${height}`,
    previewResult: (width: number, height: number) => `Output: ${width} × ${height}`,
    previewPlaceholder: 'Upload an image to see the resized preview here.',
    resultTitle: 'Result',
    resultDescription: 'Preview and download your resized image',
    resultLabel: (width: number, height: number) => `Resized: ${width} × ${height}`,
    resultPlaceholder: 'Upload an image and process it to view the result here',
    tipsTitle: 'Tips for best results',
    tipsDescription: 'Keep your browser tab active during processing for faster GPU acceleration.',
    tipsList: [
      'For very large images, start with 2× or 4× upscale to reduce memory usage.',
      'Close other heavy browser tabs if you encounter performance issues.',
      'Processing runs entirely on your device—no images leave your computer.',
    ],
    presets: [
      { name: 'Instagram square', width: 1080, height: 1080 },
      { name: 'Full HD', width: 1920, height: 1080 },
      { name: '4K UHD', width: 3840, height: 2160 },
      { name: '2K QHD', width: 2560, height: 1440 },
      { name: 'HD', width: 1280, height: 720 },
      { name: 'Mobile', width: 750, height: 1334 },
    ],
    messages: {
      unsupportedFormat: 'Unsupported format. Choose a JPG, PNG, or WEBP image.',
      fileTooLarge: 'File is too large. Please upload an image under 20 MB.',
      missingImage: 'Please upload an image first.',
      canvasUnsupported: 'Canvas 2D context is not available in this browser.',
      resizedOnly: 'Image resized without upscaling. Ready to download.',
      aiUpscaling: 'Improving enlarged image with AI super-resolution...',
      aiUpscaleFallback: 'AI super-resolution was unavailable, so the image was enlarged with high-quality interpolation.',
      upscalingComplete: 'Upscaling complete. You can download the result.',
      processingCancelled: 'Processing cancelled.',
      downloadError: 'Unable to create file for download.',
      genericFailure: 'Failed to process image. Please try again with smaller dimensions.',
    },
  },
  pt: {
    uploadCardTitle: 'Enviar imagem',
    uploadCardDescription: 'Arraste e solte ou clique para selecionar um arquivo',
    dropActive: 'Solte a imagem aqui…',
    dropInactive: 'Arraste e solte uma imagem ou clique para procurar',
    formatHint: 'PNG, JPG ou WEBP de até 20 MB.',
    selectedFilePrefix: 'Selecionado: ',
    resolutionPresetLabel: 'Preset de resolução',
    presetPlaceholder: 'Escolha um preset',
    quickPresetsLabel: 'Presets rápidos',
    customDimensionsLabel: 'Dimensões personalizadas',
    keepRatioLabel: 'Manter proporção',
    ratioBasisLabel: 'Tamanho para preservar',
    ratioBasisWidth: 'Usar largura',
    ratioBasisHeight: 'Usar altura',
    ratioBasisHelp: 'Com a proporção bloqueada, os presets mantêm este lado e calculam o outro.',
    widthLabel: 'Largura',
    heightLabel: 'Altura',
    processButton: 'Processar',
    resetButton: 'Redefinir',
    previewTitle: 'Pré-visualização',
    previewOriginal: (width: number, height: number) => `Original: ${width} × ${height}`,
    previewResult: (width: number, height: number) => `Saída: ${width} × ${height}`,
    previewPlaceholder: 'Envie uma imagem para visualizar o redimensionamento aqui.',
    resultTitle: 'Resultado',
    resultDescription: 'Visualize e baixe a imagem redimensionada',
    resultLabel: (width: number, height: number) => `Redimensionado: ${width} × ${height}`,
    resultPlaceholder: 'Envie e processe uma imagem para ver o resultado aqui',
    tipsTitle: 'Dicas para melhores resultados',
    tipsDescription: 'Mantenha esta aba ativa durante o processamento para aproveitar a GPU.',
    tipsList: [
      'Para imagens muito grandes, comece com ampliação em 2× ou 4× para reduzir o uso de memória.',
      'Feche abas pesadas do navegador se notar lentidão.',
      'Todo o processamento acontece no seu dispositivo — nenhum arquivo sai do computador.',
    ],
    presets: [
      { name: 'Quadrado do Instagram', width: 1080, height: 1080 },
      { name: 'Full HD', width: 1920, height: 1080 },
      { name: '4K UHD', width: 3840, height: 2160 },
      { name: '2K QHD', width: 2560, height: 1440 },
      { name: 'HD', width: 1280, height: 720 },
      { name: 'Mobile', width: 750, height: 1334 },
    ],
    messages: {
      unsupportedFormat: 'Formato não suportado. Escolha uma imagem JPG, PNG ou WEBP.',
      fileTooLarge: 'Arquivo muito grande. Envie uma imagem com menos de 20 MB.',
      missingImage: 'Envie uma imagem antes de processar.',
      canvasUnsupported: 'O contexto 2D de canvas não está disponível neste navegador.',
      resizedOnly: 'Imagem redimensionada sem ampliação. Pronta para download.',
      aiUpscaling: 'Melhorando a imagem ampliada com super-resolução por IA...',
      aiUpscaleFallback: 'A super-resolução por IA não ficou disponível, então a imagem foi ampliada com interpolação de alta qualidade.',
      upscalingComplete: 'Ampliação concluída. Você já pode baixar o resultado.',
      processingCancelled: 'Processamento cancelado.',
      downloadError: 'Não foi possível gerar o arquivo para download.',
      genericFailure: 'Não foi possível processar a imagem. Tente novamente com dimensões menores.',
    },
  },
  es: {
    uploadCardTitle: 'Subir imagen',
    uploadCardDescription: 'Arrastra y suelta o haz clic para seleccionar un archivo',
    dropActive: 'Suelta la imagen aquí…',
    dropInactive: 'Arrastra y suelta una imagen o haz clic para buscarla',
    formatHint: 'PNG, JPG o WEBP de hasta 20 MB.',
    selectedFilePrefix: 'Seleccionado: ',
    resolutionPresetLabel: 'Preset de resolución',
    presetPlaceholder: 'Elige un preset',
    quickPresetsLabel: 'Presets rápidos',
    customDimensionsLabel: 'Dimensiones personalizadas',
    keepRatioLabel: 'Mantener proporción',
    ratioBasisLabel: 'Tamaño para conservar',
    ratioBasisWidth: 'Usar ancho',
    ratioBasisHeight: 'Usar alto',
    ratioBasisHelp: 'Con la proporción bloqueada, los presets conservan este lado y calculan el otro.',
    widthLabel: 'Ancho',
    heightLabel: 'Alto',
    processButton: 'Procesar',
    resetButton: 'Restablecer',
    previewTitle: 'Vista previa',
    previewOriginal: (width: number, height: number) => `Original: ${width} × ${height}`,
    previewResult: (width: number, height: number) => `Salida: ${width} × ${height}`,
    previewPlaceholder: 'Sube una imagen para ver el redimensionado aquí.',
    resultTitle: 'Resultado',
    resultDescription: 'Previsualiza y descarga la imagen redimensionada',
    resultLabel: (width: number, height: number) => `Redimensionado: ${width} × ${height}`,
    resultPlaceholder: 'Sube y procesa una imagen para ver el resultado aquí',
    tipsTitle: 'Consejos para mejores resultados',
    tipsDescription: 'Mantén esta pestaña activa durante el procesamiento para aprovechar la GPU.',
    tipsList: [
      'Para imágenes muy grandes, comienza con una ampliación 2× o 4× para reducir el uso de memoria.',
      'Cierra otras pestañas pesadas del navegador si notas problemas de rendimiento.',
      'El procesamiento ocurre totalmente en tu dispositivo: ningún archivo sale de tu computadora.',
    ],
    presets: [
      { name: 'Cuadrado de Instagram', width: 1080, height: 1080 },
      { name: 'Full HD', width: 1920, height: 1080 },
      { name: '4K UHD', width: 3840, height: 2160 },
      { name: '2K QHD', width: 2560, height: 1440 },
      { name: 'HD', width: 1280, height: 720 },
      { name: 'Móvil', width: 750, height: 1334 },
    ],
    messages: {
      unsupportedFormat: 'Formato no compatible. Elige una imagen JPG, PNG o WEBP.',
      fileTooLarge: 'El archivo es demasiado grande. Sube una imagen menor a 20 MB.',
      missingImage: 'Sube una imagen antes de procesar.',
      canvasUnsupported: 'El contexto 2D de canvas no está disponible en este navegador.',
      resizedOnly: 'Imagen redimensionada sin ampliación. Lista para descargar.',
      aiUpscaling: 'Mejorando la imagen ampliada con superresolución por IA...',
      aiUpscaleFallback: 'La superresolución por IA no estuvo disponible, así que la imagen se amplió con interpolación de alta calidad.',
      upscalingComplete: 'Ampliación completada. Ya puedes descargar el resultado.',
      processingCancelled: 'Procesamiento cancelado.',
      downloadError: 'No se pudo crear el archivo para descargar.',
      genericFailure: 'No se pudo procesar la imagen. Intenta nuevamente con dimensiones menores.',
    },
  },
} as const;

type ResizeCopy = (typeof RESIZE_COPY)[keyof typeof RESIZE_COPY];

type Preset = ResizeCopy['presets'][number];

const getPresetArea = (preset: Preset) => preset.width * preset.height;

const sortPresetsBySize = (presets: readonly Preset[]) =>
  [...presets].sort((left, right) => {
    const areaDifference = getPresetArea(left) - getPresetArea(right);

    if (areaDifference !== 0) {
      return areaDifference;
    }

    return left.width - right.width || left.height - right.height;
  });

const getCanvasContext = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  return context;
};

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
};

const getNextInterpolatedSize = (current: number, target: number) => {
  if (current === target) {
    return target;
  }

  if (current < target) {
    return Math.min(target, Math.max(current + 1, Math.ceil(current * 1.5)));
  }

  return Math.max(target, Math.min(current - 1, Math.floor(current * 0.5)));
};

const getAutomaticUpscaleFactor = (
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): UpscaleFactor => {
  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);

  if (scale < AI_UPSCALE_THRESHOLD) {
    return 1;
  }

  if (scale <= 2) {
    return 2;
  }

  if (scale <= 4) {
    return 4;
  }

  return 8;
};

const drawInterpolatedCanvas = (
  source: CanvasImageSource,
  width: number,
  height: number,
) => {
  const canvas = createCanvas(width, height);
  const context = getCanvasContext(canvas);
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const resizeSourceWithInterpolation = (
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
) => {
  let workingCanvas = drawInterpolatedCanvas(source, sourceWidth, sourceHeight);
  let guard = 0;

  while ((workingCanvas.width !== targetWidth || workingCanvas.height !== targetHeight) && guard < 32) {
    const nextWidth = getNextInterpolatedSize(workingCanvas.width, targetWidth);
    const nextHeight = getNextInterpolatedSize(workingCanvas.height, targetHeight);
    workingCanvas = drawInterpolatedCanvas(workingCanvas, nextWidth, nextHeight);
    guard += 1;
  }

  if (workingCanvas.width !== targetWidth || workingCanvas.height !== targetHeight) {
    return drawInterpolatedCanvas(workingCanvas, targetWidth, targetHeight);
  }

  return workingCanvas;
};

const resizeImageWithInterpolation = (
  image: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
) =>
  resizeSourceWithInterpolation(
    image,
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    targetWidth,
    targetHeight,
  );

const ResizePage = () => {
  const { t, language } = useLanguage();
  const copy = RESIZE_COPY[language];

  const [image, setImage] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [keepAspectRatio, setKeepAspectRatio] = useState(KEEP_RATIO_TRUE);
  const [aspectRatioBasis, setAspectRatioBasis] = useState<AspectRatioBasis>('width');
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [resizedImage, setResizedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const presets = sortPresetsBySize(copy.presets as readonly Preset[]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      validateFile(file, copy);
    } catch (validationError) {
      setImage(null);
      setImageUrl('');
      setFileName('');
      setResizedImage('');
      setProgress(0);
      setOriginalDimensions({ width: 0, height: 0 });
      setError(validationError instanceof Error ? validationError.message : copy.messages.unsupportedFormat);
      return;
    }

    setError(null);
    setInfo(null);
    setImage(file);
    setFileName(file.name);

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResizedImage('');
    setProgress(0);

    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      setDimensions({ width: img.width, height: img.height });
    };
    img.src = url;
  }, [copy]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif'],
    },
    multiple: false,
  });

  const getDimensionsWithAspectRatio = useCallback(
    (nextDimensions: { width: number; height: number }, basis: AspectRatioBasis) => {
      if (originalDimensions.width <= 0 || originalDimensions.height <= 0) {
        return nextDimensions;
      }

      const aspectRatio = originalDimensions.width / originalDimensions.height;

      if (basis === 'width') {
        return {
          width: nextDimensions.width,
          height: Math.max(1, Math.round(nextDimensions.width / aspectRatio)),
        };
      }

      return {
        width: Math.max(1, Math.round(nextDimensions.height * aspectRatio)),
        height: nextDimensions.height,
      };
    },
    [originalDimensions.height, originalDimensions.width],
  );

  const applyPreset = (preset: Preset) => {
    setDimensions(keepAspectRatio ? getDimensionsWithAspectRatio(preset, aspectRatioBasis) : preset);
    setResizedImage('');
    setProgress(0);
    setInfo(null);
  };

  const handleKeepAspectRatioChange = (checked: boolean) => {
    setKeepAspectRatio(checked);

    if (checked) {
      setDimensions((currentDimensions) => getDimensionsWithAspectRatio(currentDimensions, aspectRatioBasis));
    }
  };

  const handleAspectRatioBasisChange = (basis: AspectRatioBasis) => {
    setAspectRatioBasis(basis);
    if (keepAspectRatio) {
      setDimensions((currentDimensions) => getDimensionsWithAspectRatio(currentDimensions, basis));
    }
    setResizedImage('');
    setProgress(0);
    setInfo(null);
  };

  const handleDimensionChange = (field: 'width' | 'height', value: number) => {
    const safeValue = Math.max(1, value || 1);

    if (keepAspectRatio && originalDimensions.width > 0 && originalDimensions.height > 0) {
      setAspectRatioBasis(field);
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      if (field === 'width') {
        const newHeight = Math.max(1, Math.round(safeValue / aspectRatio));
        setDimensions({ width: safeValue, height: newHeight });
      } else {
        const newWidth = Math.max(1, Math.round(safeValue * aspectRatio));
        setDimensions({ width: newWidth, height: safeValue });
      }
    } else {
      setDimensions((prev) => ({ ...prev, [field]: safeValue }));
    }

    setResizedImage('');
    setProgress(0);
    setInfo(null);
  };

  const resizeImage = async () => {
    if (!image) {
      setError(copy.messages.missingImage);
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setInfo(null);
    setError(null);

    try {
      const img = new Image();
      img.onload = async () => {
        try {
          const targetWidth = Math.max(1, Math.round(dimensions.width));
          const targetHeight = Math.max(1, Math.round(dimensions.height));
          const sourceWidth = img.naturalWidth || img.width;
          const sourceHeight = img.naturalHeight || img.height;
          const upscaleFactor = getAutomaticUpscaleFactor(sourceWidth, sourceHeight, targetWidth, targetHeight);
          let resizedCanvas: HTMLCanvasElement;

          if (upscaleFactor === 1) {
            resizedCanvas = resizeImageWithInterpolation(img, targetWidth, targetHeight);
          } else {
            try {
              setInfo(copy.messages.aiUpscaling);
              setProgress(5);
              const sourceCanvas = drawInterpolatedCanvas(img, sourceWidth, sourceHeight);
              const { canvas: upscaledCanvas } = await upscaleCanvas(sourceCanvas, {
                factor: upscaleFactor,
                onProgress: (percent) => {
                  setProgress(Math.round(5 + Math.min(100, Math.max(0, percent)) * 0.9));
                },
              });

              resizedCanvas = resizeSourceWithInterpolation(
                upscaledCanvas,
                upscaledCanvas.width,
                upscaledCanvas.height,
                targetWidth,
                targetHeight,
              );
            } catch (upscaleError) {
              if (import.meta.env.DEV) {
                void logClientEvent({
                  category: 'resize.upscale',
                  details: {
                    factor: upscaleFactor,
                    sourceHeight,
                    sourceWidth,
                    targetHeight,
                    targetWidth,
                  },
                  level: 'debug',
                  message: 'AI upscaling fallback used during resize',
                });
              }
              resizedCanvas = resizeImageWithInterpolation(img, targetWidth, targetHeight);
              setInfo(copy.messages.aiUpscaleFallback);
            }
          }

          const resizedDataUrl = resizedCanvas.toDataURL('image/png', 0.95);
          const isUpscaling = targetWidth > sourceWidth || targetHeight > sourceHeight;

          setResizedImage(resizedDataUrl);
          setInfo((currentInfo) =>
            currentInfo === copy.messages.aiUpscaleFallback
              ? currentInfo
              : isUpscaling
                ? copy.messages.upscalingComplete
                : copy.messages.resizedOnly,
          );
          setProgress(100);
        } catch (resizeError) {
          console.error('Error resizing image:', resizeError);
          setError(copy.messages.canvasUnsupported);
          setProgress(0);
        } finally {
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setError(copy.messages.genericFailure);
        setIsProcessing(false);
      };
      img.src = imageUrl;
    } catch (processingError) {
      console.error('Error resizing image:', processingError);
      setError(copy.messages.genericFailure);
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!resizedImage) return;

    const link = document.createElement('a');
    link.href = resizedImage;
    link.download = `resized-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const originalLabel =
    originalDimensions.width && originalDimensions.height
      ? copy.previewOriginal(originalDimensions.width, originalDimensions.height)
      : null;
  const resultLabel = resizedImage ? copy.resultLabel(dimensions.width, dimensions.height) : null;

  return (
    <div className="container py-12 space-y-8">
        <ToolHero
          pageId="resize"
          icon={<RotateCcw className="h-6 w-6 text-white" />}
          title={t('tools.resize.title')}
          description={t('tools.resize.description')}
          badgeClassName="bg-gradient-to-br from-blue-500 to-cyan-500"
        />

        <div className="flex justify-center">
          <div className="flex h-24 w-full max-w-4xl items-center justify-center rounded-lg border-2 border-dashed border-border/30 bg-muted/30 text-xs text-muted-foreground">
            {t('ads.banner.label')}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{copy.uploadCardTitle}</CardTitle>
                <CardDescription>{copy.uploadCardDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  {isDragActive ? (
                    <p className="text-primary">{copy.dropActive}</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{copy.dropInactive}</p>
                      <p className="text-xs text-muted-foreground">{copy.formatHint}</p>
                    </div>
                  )}
                </div>

                {imageUrl && (
                  <div className="mt-4 space-y-2">
                    <img
                      src={imageUrl}
                      srcSet={`${imageUrl} 1x`}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      alt="Uploaded preview"
                      className="w-full rounded-lg border"
                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {copy.selectedFilePrefix}
                      {fileName}
                    </p>
                    {originalLabel ? (
                      <p className="text-xs text-muted-foreground text-center">{originalLabel}</p>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{copy.resolutionPresetLabel}</CardTitle>
                <CardDescription>{copy.customDimensionsLabel}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>{copy.quickPresetsLabel}</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {presets.map((preset) => (
                      <Button
                        type="button"
                        key={`${preset.name}-${preset.width}-${preset.height}`}
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset(preset)}
                        className="justify-start"
                      >
                        {preset.name} ({preset.width} × {preset.height})
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label>{copy.customDimensionsLabel}</Label>
                    <div className="flex items-center space-x-2">
                      {keepAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      <Switch checked={keepAspectRatio} onCheckedChange={handleKeepAspectRatioChange} />
                      <span className="text-xs text-muted-foreground">{copy.keepRatioLabel}</span>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {copy.ratioBasisLabel}
                      </Label>
                      <div className="grid grid-cols-2 gap-1 rounded-lg bg-background/80 p-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={aspectRatioBasis === 'width' ? 'default' : 'ghost'}
                          className="h-8 px-3 text-xs"
                          disabled={!keepAspectRatio}
                          onClick={() => handleAspectRatioBasisChange('width')}
                        >
                          {copy.ratioBasisWidth}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={aspectRatioBasis === 'height' ? 'default' : 'ghost'}
                          className="h-8 px-3 text-xs"
                          disabled={!keepAspectRatio}
                          onClick={() => handleAspectRatioBasisChange('height')}
                        >
                          {copy.ratioBasisHeight}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{copy.ratioBasisHelp}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">{copy.widthLabel}</Label>
                      <Input
                        id="width"
                        type="number"
                        min={1}
                        value={dimensions.width}
                        onChange={(e) => handleDimensionChange('width', parseInt(e.target.value, 10) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">{copy.heightLabel}</Label>
                      <Input
                        id="height"
                        type="number"
                        min={1}
                        value={dimensions.height}
                        onChange={(e) => handleDimensionChange('height', parseInt(e.target.value, 10) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (originalDimensions.width && originalDimensions.height) {
                        setDimensions(originalDimensions);
                      } else {
                        setDimensions({ width: 1920, height: 1080 });
                      }
                      setKeepAspectRatio(KEEP_RATIO_TRUE);
                      setAspectRatioBasis('width');
                      setResizedImage('');
                      setProgress(0);
                      setInfo(null);
                    }}
                    disabled={!image || isProcessing}
                  >
                    {copy.resetButton}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-gradient-primary text-primary-foreground"
                    onClick={resizeImage}
                    disabled={!image || isProcessing}
                  >
                    {isProcessing ? t('common.processing') : copy.processButton}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{copy.previewTitle}</CardTitle>
                <CardDescription>{resultLabel ?? originalLabel ?? copy.previewPlaceholder}</CardDescription>
              </CardHeader>
              <CardContent>
                {resizedImage ? (
                  <div className="space-y-4">
                    <ResultImagePreview
                      src={resizedImage}
                      srcSet={`${resizedImage} 1x`}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      alt="Resized preview"
                      className="w-full rounded-lg border"
                      style={{ maxHeight: '200px', objectFit: 'contain' }}
                      loading="lazy"
                    />
                    <Button
                      onClick={downloadImage}
                      className="w-full bg-gradient-success text-success-foreground"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t('common.download')}
                    </Button>
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <RotateCcw className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>{copy.previewPlaceholder}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {(error || info) && (
          <div className="space-y-3 rounded-lg border border-border/40 bg-muted/40 p-4 text-sm">
            <p className={error ? 'text-destructive' : 'text-muted-foreground'}>{error ?? info}</p>
            {!error && isProcessing && progress > 0 ? (
              <div className="flex items-center gap-3">
                <Progress value={progress} className="flex-1" />
                <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
              </div>
            ) : null}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{copy.tipsTitle}</CardTitle>
            <CardDescription>{copy.tipsDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {copy.tipsList.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <LocalProcessingNotice contained={false} className="pb-0" />
      </div>
  );
};

const validateFile = (file: File, copy: ResizeCopy) => {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    throw new Error(copy.messages.unsupportedFormat);
  }

  if (file.size > 20 * 1024 * 1024) {
    throw new Error(copy.messages.fileTooLarge);
  }
};

export default ResizePage;
