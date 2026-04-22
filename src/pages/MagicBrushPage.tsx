import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { AlertCircle, CheckCircle2, Download, Eraser, Loader2, Paintbrush, Upload, Wand2, XCircle } from "@/components/icons";
import { useDropzone } from "react-dropzone";

import ToolHero from "@/components/ToolHero";
import { AdSlot } from "@/components/ads/AdSlot";
import LocalProcessingNotice from "@/components/LocalProcessingNotice";
import { ResultImagePreview } from "@/components/ResultImagePreview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { createTimer, logClientError, logClientEvent } from "@/utils/clientLogger";
import {
  canvasToBlob,
  drawStrokeSegment,
  imageToCanvas,
  loadImageElement,
  renderMaskFromStrokes,
  type BrushMode,
  type BrushStroke,
} from "@/utils/magicBrush";
import { inpaintCanvas, type InpaintMethod } from "@/utils/opencv";

interface BatchImageItem {
  id: string;
  file: File;
  image: HTMLImageElement;
  previewUrl: string;
  width: number;
  height: number;
  processedUrl?: string;
}

type ProcessStageStatus = "active" | "done" | "error" | "pending";

const ACCEPTED_IMAGE_TYPES = {
  "image/*": [".png", ".jpg", ".jpeg", ".webp"],
};

const MAX_EDITOR_SIDE = 1100;
const MAX_INPAINT_SIDE = 1600;
const MAX_INPAINT_REGION_SIDE = 1200;
const DEFAULT_BRUSH_SIZE = 68;
const MASK_OVERLAY_FILL = "rgba(147, 51, 234, 0.34)";
const MASK_CURSOR_FILL = "rgba(168, 85, 247, 0.18)";
const MASK_CURSOR_STROKE = "rgba(147, 51, 234, 0.95)";

const getEditorDimensions = (width: number, height: number) => {
  const maxSide = Math.max(width, height);
  if (maxSide <= MAX_EDITOR_SIDE) {
    return { width, height };
  }

  const scale = MAX_EDITOR_SIDE / maxSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

const getSafeExportType = (file: File) =>
  ["image/jpeg", "image/png", "image/webp"].includes(file.type) ? file.type : "image/png";

const getExportExtension = (mimeType: string) => {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return "png";
  }
};

const stripExtension = (filename: string) => filename.replace(/\.[^.]+$/, "");
const toRelativeBrushSize = (size: number) => size / MAX_EDITOR_SIDE;
const getRenderedBrushRadius = (width: number, height: number, relativeSize: number) =>
  Math.max(2, relativeSize * Math.max(width, height)) / 2;
const getInpaintPadding = (radius: number, dilation: number) => Math.max(64, Math.ceil(radius * 18 + dilation * 16));

interface CanvasBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MaskAnalysis {
  bounds: CanvasBounds;
  paintedPixels: number;
  totalPixels: number;
}

interface NormalizedBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DeviceEstimateProfile {
  imageScaleMultiplier: number;
  label: "balanced" | "high" | "low";
  regionScaleMultiplier: number;
  speedMultiplier: number;
}

interface ProcessingDimensions {
  height: number;
  scale: number;
  width: number;
}

interface DynamicEstimateSnapshot {
  batchEstimateMs: number;
  currentEstimateMs: number;
  maskAreaRatio: number;
  processedAreaRatio: number;
}

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const cropCanvas = (canvas: HTMLCanvasElement, bounds: CanvasBounds) => {
  const croppedCanvas = createCanvas(bounds.width, bounds.height);
  const context = croppedCanvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }

  context.drawImage(
    canvas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    0,
    0,
    bounds.width,
    bounds.height,
  );

  return croppedCanvas;
};

const analyzeMaskCanvas = (maskCanvas: HTMLCanvasElement): MaskAnalysis | null => {
  const context = maskCanvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }

  const { width, height } = maskCanvas;
  const { data } = context.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let paintedPixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha < 10) {
        continue;
      }

      paintedPixels += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return {
    bounds: {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    },
    paintedPixels,
    totalPixels: width * height,
  };
};

const expandBounds = (
  bounds: CanvasBounds,
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
): CanvasBounds => {
  const x = Math.max(0, bounds.x - padding);
  const y = Math.max(0, bounds.y - padding);
  const right = Math.min(canvasWidth, bounds.x + bounds.width + padding);
  const bottom = Math.min(canvasHeight, bounds.y + bounds.height + padding);

  return {
    x,
    y,
    width: Math.max(1, right - x),
    height: Math.max(1, bottom - y),
  };
};

const normalizeBounds = (bounds: CanvasBounds, width: number, height: number): NormalizedBounds => ({
  x: bounds.x / width,
  y: bounds.y / height,
  width: bounds.width / width,
  height: bounds.height / height,
});

const denormalizeBounds = (bounds: NormalizedBounds, width: number, height: number): CanvasBounds => {
  const x = Math.min(width - 1, Math.max(0, Math.round(bounds.x * width)));
  const y = Math.min(height - 1, Math.max(0, Math.round(bounds.y * height)));
  const right = Math.min(width, Math.max(x + 1, Math.round((bounds.x + bounds.width) * width)));
  const bottom = Math.min(height, Math.max(y + 1, Math.round((bounds.y + bounds.height) * height)));

  return {
    x,
    y,
    width: Math.max(1, right - x),
    height: Math.max(1, bottom - y),
  };
};

const waitForUi = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.setTimeout(resolve, 0);
    });
  });

interface InpaintProfile {
  imageMaxSide: number;
  label: string;
  regionMaxSide: number;
}

const BASE_INPAINT_PROFILES: InpaintProfile[] = [
  {
    imageMaxSide: MAX_INPAINT_SIDE,
    label: "default",
    regionMaxSide: MAX_INPAINT_REGION_SIDE,
  },
  {
    imageMaxSide: 1280,
    label: "fallback-medium",
    regionMaxSide: 960,
  },
  {
    imageMaxSide: 960,
    label: "fallback-fast",
    regionMaxSide: 720,
  },
];

const getDeviceEstimateProfile = (): DeviceEstimateProfile => {
  if (typeof navigator === "undefined") {
    return {
      imageScaleMultiplier: 0.9,
      label: "balanced",
      regionScaleMultiplier: 0.9,
      speedMultiplier: 1,
    };
  }

  const browserNavigator = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  const memory = browserNavigator.deviceMemory ?? 0;
  const cores = browserNavigator.hardwareConcurrency ?? 0;
  const saveData = browserNavigator.connection?.saveData ?? false;

  if (saveData || (memory > 0 && memory <= 4) || (cores > 0 && cores <= 4)) {
    return {
      imageScaleMultiplier: 0.8,
      label: "low",
      regionScaleMultiplier: 0.74,
      speedMultiplier: 1.7,
    };
  }

  if ((memory > 0 && memory >= 12) || (cores > 0 && cores >= 12)) {
    return {
      imageScaleMultiplier: 1,
      label: "high",
      regionScaleMultiplier: 1,
      speedMultiplier: 0.88,
    };
  }

  return {
    imageScaleMultiplier: 0.92,
    label: "balanced",
    regionScaleMultiplier: 0.9,
    speedMultiplier: 1.08,
  };
};

const buildInpaintProfiles = (deviceProfile: DeviceEstimateProfile): InpaintProfile[] =>
  BASE_INPAINT_PROFILES.map((profile) => ({
    ...profile,
    imageMaxSide: Math.max(960, Math.round(profile.imageMaxSide * deviceProfile.imageScaleMultiplier)),
    regionMaxSide: Math.max(640, Math.round(profile.regionMaxSide * deviceProfile.regionScaleMultiplier)),
  }));

const getProcessingDimensions = (item: BatchImageItem, profile: InpaintProfile): ProcessingDimensions => {
  const maxSide = Math.max(item.width, item.height);
  const scale = maxSide > profile.imageMaxSide ? profile.imageMaxSide / maxSide : 1;

  return {
    scale,
    width: Math.max(1, Math.round(item.width * scale)),
    height: Math.max(1, Math.round(item.height * scale)),
  };
};

const estimateItemProcessingTime = ({
  deviceProfile,
  dilation,
  item,
  maskAreaRatio,
  method,
  normalizedBounds,
  profile,
  radius,
}: {
  deviceProfile: DeviceEstimateProfile;
  dilation: number;
  item: BatchImageItem;
  maskAreaRatio: number;
  method: InpaintMethod;
  normalizedBounds: NormalizedBounds;
  profile: InpaintProfile;
  radius: number;
}) => {
  const { width: processingWidth, height: processingHeight } = getProcessingDimensions(item, profile);
  const padding = getInpaintPadding(radius, dilation);
  const maskBounds = denormalizeBounds(normalizedBounds, processingWidth, processingHeight);
  const expandedBounds = expandBounds(maskBounds, processingWidth, processingHeight, padding);
  const regionMaxSide = Math.max(expandedBounds.width, expandedBounds.height);
  const regionScale = regionMaxSide > profile.regionMaxSide ? profile.regionMaxSide / regionMaxSide : 1;
  const inpaintRegionWidth = Math.max(1, Math.round(expandedBounds.width * regionScale));
  const inpaintRegionHeight = Math.max(1, Math.round(expandedBounds.height * regionScale));
  const totalPixels = processingWidth * processingHeight;
  const processedAreaRatio = (expandedBounds.width * expandedBounds.height) / totalPixels;
  const regionMegapixels = (inpaintRegionWidth * inpaintRegionHeight) / 1_000_000;
  const processingMegapixels = totalPixels / 1_000_000;
  const radiusFactor = 1 + Math.max(0, radius - 4) * 0.075;
  const dilationFactor = 1 + dilation * 0.06;
  const methodFactor = method === "ns" ? 1.34 : 1;
  const baseMs = 420 + processingMegapixels * 220 + regionMegapixels * 2100 + processedAreaRatio * 520 + maskAreaRatio * 340;

  return {
    durationMs: Math.round(baseMs * radiusFactor * dilationFactor * methodFactor * deviceProfile.speedMultiplier),
    processedAreaRatio,
  };
};

const MagicBrushPage = () => {
  const { language, t } = useLanguage();
  const [items, setItems] = useState<BatchImageItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [strokes, setStrokes] = useState<BrushStroke[]>([]);
  const [brushMode, setBrushMode] = useState<BrushMode>("paint");
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);
  const [hardness, setHardness] = useState(82);
  const [inpaintRadius, setInpaintRadius] = useState(4);
  const [dilation, setDilation] = useState(1);
  const [method, setMethod] = useState<InpaintMethod>("telea");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [processStages, setProcessStages] = useState<string[]>([]);
  const [activeStageIndex, setActiveStageIndex] = useState(-1);
  const [failedStageIndex, setFailedStageIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewResultUrl, setPreviewResultUrl] = useState<string>("");
  const [zipUrl, setZipUrl] = useState<string>("");
  const [dynamicEstimate, setDynamicEstimate] = useState<DynamicEstimateSnapshot | null>(null);

  const copy = useMemo(() => {
    if (language === "pt") {
      return {
        heroDescription: "Pinte uma máscara compartilhada uma vez, visualize o resultado e limpe objetos repetidos em vários arquivos em lote.",
        aspectWarning:
          "Os arquivos enviados não têm a mesma proporção. A máscara compartilhada funciona melhor quando o objeto fica na mesma posição relativa.",
        loadFilesError: "Não foi possível carregar os arquivos selecionados.",
        previewError: "Não foi possível gerar a visualização.",
        batchError: "Falha no processamento em lote.",
        loadingOpenCv: "Preparando borracha...",
        renderingPreview: "Renderizando visualização...",
        previewReady: "Visualização pronta",
        processingFile: (name: string, current: number, total: number) => `Processando ${name} (${current}/${total})`,
        buildingZip: "Montando arquivo ZIP...",
        batchFinished: "Lote concluído",
        batchControlsTitle: "Controles do lote",
        batchControlsDescription:
          "Esse fluxo foi otimizado para objetos repetidos na mesma posição relativa, como logos, selos ou elementos de layout.",
        dropActive: "Solte os arquivos aqui.",
        dropIdle: "Envie uma ou várias imagens para criar uma máscara compartilhada de remoção.",
        supportedFormats: "PNG, JPG ou WEBP com até 20 MB por arquivo.",
        paintMask: "Pintar máscara",
        eraseMask: "Apagar máscara",
        brushSize: "Tamanho do pincel",
        brushHardness: "Rigidez do pincel",
        inpaintingMethod: "Método de preenchimento",
        inpaintRadius: "Raio do preenchimento",
        maskExpansion: "Expansão da máscara",
        estimateTitle: "Estimativa dinâmica",
        estimateDescription: "Atualiza em tempo real conforme a máscara cresce.",
        estimateEmpty: "Comece a pintar a máscara para ver a estimativa de processamento.",
        estimateCurrentFile: "Arquivo atual",
        estimateBatch: "Lote completo",
        estimateMaskArea: "Área mascarada",
        estimateProcessedArea: "Área enviada ao algoritmo",
        undo: "Desfazer",
        clearMask: "Limpar máscara",
        previewCurrent: "Apagar",
        processAll: "Processar todos os arquivos",
        downloadZip: "Baixar ZIP",
        aspectWarningTitle: "Aviso de proporção",
        errorTitle: "Falha na borracha mágica",
        maskEditorTitle: "Editor de máscara",
        maskEditorDescription: "Pinte a área que deve ser removida de todas as imagens. Use o modo apagar para refinar a máscara.",
        emptyMaskEditor: "Envie imagens para começar a criar a máscara compartilhada.",
        previewSample: "Imagem de amostra",
        outputsTitle: "Visualização e saídas",
        outputsDescription: "Visualize o arquivo selecionado antes de processar o lote inteiro e exportar o ZIP completo.",
        previewForFile: (name: string) => `Visualização gerada para ${name}. Se estiver correta, processe o lote completo.`,
        previewEmpty: "Crie uma máscara e gere uma visualização para inspecionar o resultado da limpeza.",
        outputsFooter:
          "O método Telea costuma funcionar melhor para elementos pequenos. Navier-Stokes pode ajudar quando a área removida cruza linhas estruturadas.",
      };
    }

    if (language === "es") {
      return {
        heroDescription: "Pinta una máscara compartida una vez, revisa el resultado y limpia objetos repetidos en varios archivos por lote.",
        aspectWarning:
          "Los archivos subidos no tienen la misma relación de aspecto. La máscara compartida funciona mejor cuando el objeto está en la misma posición relativa.",
        loadFilesError: "No se pudieron cargar los archivos seleccionados.",
        previewError: "No se pudo generar la vista previa.",
        batchError: "Falló el procesamiento por lote.",
        loadingOpenCv: "Preparando borrador...",
        renderingPreview: "Renderizando vista previa...",
        previewReady: "Vista previa lista",
        processingFile: (name: string, current: number, total: number) => `Procesando ${name} (${current}/${total})`,
        buildingZip: "Creando archivo ZIP...",
        batchFinished: "Lote completado",
        batchControlsTitle: "Controles del lote",
        batchControlsDescription:
          "Este flujo está optimizado para objetos repetidos en la misma posición relativa, como logos, sellos o elementos de diseño.",
        dropActive: "Suelta los archivos aquí.",
        dropIdle: "Sube una o varias imágenes para crear una máscara compartida de borrado.",
        supportedFormats: "PNG, JPG o WEBP de hasta 20 MB por archivo.",
        paintMask: "Pintar máscara",
        eraseMask: "Borrar máscara",
        brushSize: "Tamaño del pincel",
        brushHardness: "Dureza del pincel",
        inpaintingMethod: "Método de relleno",
        inpaintRadius: "Radio del relleno",
        maskExpansion: "Expansión de la máscara",
        estimateTitle: "Estimación dinámica",
        estimateDescription: "Se actualiza en tiempo real mientras crece la máscara.",
        estimateEmpty: "Empieza a pintar la máscara para ver la estimación de procesamiento.",
        estimateCurrentFile: "Archivo actual",
        estimateBatch: "Lote completo",
        estimateMaskArea: "Área enmascarada",
        estimateProcessedArea: "Área enviada al algoritmo",
        undo: "Deshacer",
        clearMask: "Limpiar máscara",
        previewCurrent: "Borrar",
        processAll: "Procesar todos los archivos",
        downloadZip: "Descargar ZIP",
        aspectWarningTitle: "Aviso de proporción",
        errorTitle: "Falló el borrador mágico",
        maskEditorTitle: "Editor de máscara",
        maskEditorDescription: "Pinta el área que debe eliminarse de todas las imágenes. Usa el modo borrar para recortar la máscara.",
        emptyMaskEditor: "Sube imágenes para comenzar a crear la máscara compartida.",
        previewSample: "Imagen de muestra",
        outputsTitle: "Vista previa y salidas",
        outputsDescription: "Previsualiza el archivo seleccionado antes de procesar el lote completo y exportar el ZIP.",
        previewForFile: (name: string) => `Vista previa generada para ${name}. Si se ve bien, procesa el lote completo.`,
        previewEmpty: "Crea una máscara y genera una vista previa para revisar el resultado de la limpieza.",
        outputsFooter:
          "Telea suele funcionar mejor para elementos pequeños. Navier-Stokes puede servir cuando la zona eliminada cruza líneas estructuradas.",
      };
    }

    return {
      heroDescription: "Paint a shared mask once, preview the result, and batch-clean repeated objects across many files.",
      aspectWarning:
        "The uploaded files do not share the same aspect ratio. A common mask works best when the object sits in the same relative position.",
      loadFilesError: "Unable to load the selected files.",
      previewError: "Unable to generate the preview.",
      batchError: "Batch processing failed.",
      loadingOpenCv: "Preparing eraser...",
      renderingPreview: "Rendering preview...",
      previewReady: "Preview ready",
      processingFile: (name: string, current: number, total: number) => `Processing ${name} (${current}/${total})`,
      buildingZip: "Building ZIP archive...",
      batchFinished: "Batch finished",
      batchControlsTitle: "Batch controls",
      batchControlsDescription:
        "This workflow is optimized for repeated objects in the same relative position, such as logos, badges, or layout elements.",
      dropActive: "Drop the files here.",
      dropIdle: "Upload one or many images to build a shared eraser mask.",
      supportedFormats: "PNG, JPG, or WEBP up to 20 MB each.",
      paintMask: "Paint mask",
      eraseMask: "Erase mask",
      brushSize: "Brush size",
      brushHardness: "Brush hardness",
      inpaintingMethod: "Inpainting method",
      inpaintRadius: "Inpaint radius",
      maskExpansion: "Mask expansion",
      estimateTitle: "Dynamic estimate",
      estimateDescription: "Updates in real time as the mask grows.",
      estimateEmpty: "Start painting the mask to see the processing estimate.",
      estimateCurrentFile: "Current file",
      estimateBatch: "Full batch",
      estimateMaskArea: "Masked area",
      estimateProcessedArea: "Area sent to the algorithm",
      undo: "Undo",
      clearMask: "Clear mask",
      previewCurrent: "Erase",
      processAll: "Process all files",
      downloadZip: "Download ZIP",
      aspectWarningTitle: "Aspect-ratio warning",
      errorTitle: "Magic Eraser failed",
      maskEditorTitle: "Mask editor",
      maskEditorDescription: "Paint the area that should be removed from every image. Use erase mode to trim the mask.",
      emptyMaskEditor: "Upload images to start building a shared mask.",
      previewSample: "Preview sample",
      outputsTitle: "Preview and outputs",
      outputsDescription: "Preview the currently selected file before running the batch, then export the complete ZIP.",
      previewForFile: (name: string) => `Preview generated for ${name}. If it looks correct, process the full batch.`,
      previewEmpty: "Create a mask and run a preview to inspect the cleanup result.",
      outputsFooter:
        "Telea usually works best for small elements. Navier-Stokes can be worth testing when the removed region crosses structured lines.",
    };
  }, [language]);

  const getDisplayErrorMessage = useCallback(
    (error: unknown, fallback: string) => {
      const message = error instanceof Error ? error.message : "";
      const normalizedMessage = message.toLowerCase();

      if (normalizedMessage.includes("opencv worker request timed out")) {
        if (language === "pt") {
          return "O processamento demorou mais do que o esperado no worker do navegador. A ferramenta interrompeu a tentativa para evitar travar a interface. Tente reduzir a area da mascara, processar menos arquivos por vez ou recarregar a pagina.";
        }

        if (language === "es") {
          return "El procesamiento tardo mas de lo esperado en el worker del navegador. La herramienta detuvo el intento para evitar bloquear la interfaz. Prueba con una mascara menor, menos archivos por lote o recarga la pagina.";
        }

        return "Processing took longer than expected in the browser worker. The tool stopped the attempt to avoid locking the interface. Try a smaller mask area, fewer files per batch, or reload the page.";
      }

      if (normalizedMessage.includes("opencv worker request timed out")) {
        if (language === "pt") {
          return "O processamento demorou mais do que o esperado neste dispositivo. A ferramenta tentou ajustar o worker automaticamente, mas ainda não concluiu. Tente reduzir a área da máscara ou processar menos arquivos por vez.";
        }

        if (language === "es") {
          return "El procesamiento tardó más de lo esperado en este dispositivo. La herramienta intentó ajustar el worker automáticamente, pero aún no pudo concluir. Prueba con una máscara menor o con menos archivos por lote.";
        }

        return "Processing took longer than expected on this device. The tool retried automatically, but it still could not finish. Try a smaller mask area or fewer files per batch.";
      }

      return message || fallback;
    },
    [language],
  );

  const editorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const committedMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingStrokeRef = useRef<BrushStroke | null>(null);
  const isDrawingRef = useRef(false);
  const cursorPointRef = useRef<{ x: number; y: number } | null>(null);
  const liveStrokeMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const skipCommittedMaskReplayRef = useRef(false);
  const processStageIndexRef = useRef(-1);
  const itemsRef = useRef<BatchImageItem[]>([]);
  const previewResultUrlRef = useRef("");
  const zipUrlRef = useRef("");
  const [committedMaskCanvas, setCommittedMaskCanvas] = useState<HTMLCanvasElement | null>(null);
  const deviceEstimateProfile = useMemo(() => getDeviceEstimateProfile(), []);
  const inpaintProfiles = useMemo(() => buildInpaintProfiles(deviceEstimateProfile), [deviceEstimateProfile]);

  const clearPreviewResult = useCallback(() => {
    setPreviewResultUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return "";
    });
  }, []);

  const clearZipResult = useCallback(() => {
    setZipUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return "";
    });
  }, []);

  const clearProcessedItems = useCallback(() => {
    setItems((previousItems) => {
      let changed = false;
      const nextItems = previousItems.map((item) => {
        if (!item.processedUrl) {
          return item;
        }

        changed = true;
        URL.revokeObjectURL(item.processedUrl);
        return {
          ...item,
          processedUrl: undefined,
        };
      });

      return changed ? nextItems : previousItems;
    });
  }, []);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? items[0] ?? null,
    [items, selectedItemId],
  );

  const editorDimensions = useMemo(
    () => (selectedItem ? getEditorDimensions(selectedItem.width, selectedItem.height) : null),
    [selectedItem],
  );

  const editorBaseCanvas = useMemo(() => {
    if (!selectedItem || !editorDimensions) {
      return null;
    }

    const canvas = createCanvas(editorDimensions.width, editorDimensions.height);
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas 2D context is not available");
    }

    context.drawImage(selectedItem.image, 0, 0, editorDimensions.width, editorDimensions.height);
    return canvas;
  }, [editorDimensions, selectedItem]);

  useEffect(() => {
    if (skipCommittedMaskReplayRef.current) {
      skipCommittedMaskReplayRef.current = false;
      return;
    }

    if (!editorDimensions || !strokes.length) {
      committedMaskCanvasRef.current = null;
      setCommittedMaskCanvas(null);
      return;
    }

    const nextCommittedMaskCanvas = renderMaskFromStrokes(editorDimensions.width, editorDimensions.height, strokes);
    committedMaskCanvasRef.current = nextCommittedMaskCanvas;
    setCommittedMaskCanvas(nextCommittedMaskCanvas);
  }, [editorDimensions, strokes]);

  const aspectWarning = useMemo(() => {
    if (items.length < 2) {
      return null;
    }

    const aspects = items.map((item) => item.width / item.height);
    const minAspect = Math.min(...aspects);
    const maxAspect = Math.max(...aspects);
    return Math.abs(maxAspect - minAspect) > 0.03 ? copy.aspectWarning : null;
  }, [copy.aspectWarning, items]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    previewResultUrlRef.current = previewResultUrl;
  }, [previewResultUrl]);

  useEffect(() => {
    zipUrlRef.current = zipUrl;
  }, [zipUrl]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        if (item.processedUrl) {
          URL.revokeObjectURL(item.processedUrl);
        }
      });

      if (previewResultUrlRef.current) {
        URL.revokeObjectURL(previewResultUrlRef.current);
      }

      if (zipUrlRef.current) {
        URL.revokeObjectURL(zipUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      void logClientError("magic-brush.window-error", "Unhandled window error in Magic Eraser page", event.error ?? event.message, {
        colno: event.colno,
        filename: event.filename,
        lineno: event.lineno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      void logClientError("magic-brush.unhandled-rejection", "Unhandled promise rejection in Magic Eraser page", event.reason);
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    clearPreviewResult();
    liveStrokeMaskCanvasRef.current = null;
    drawingStrokeRef.current = null;
    isDrawingRef.current = false;
    cursorPointRef.current = null;
  }, [clearPreviewResult, selectedItemId]);

  useEffect(() => {
    clearPreviewResult();
    clearZipResult();
    clearProcessedItems();
    setProgress(0);
    setProgressText("");
    cursorPointRef.current = null;
  }, [clearPreviewResult, clearProcessedItems, clearZipResult, dilation, inpaintRadius, method, strokes]);

  const buildMaskOverlayCanvas = useCallback((maskCanvas: HTMLCanvasElement) => {
    const overlayCanvas = createCanvas(maskCanvas.width, maskCanvas.height);
    const overlayContext = overlayCanvas.getContext("2d");

    if (!overlayContext) {
      throw new Error("Canvas 2D context is not available");
    }

    overlayContext.fillStyle = MASK_OVERLAY_FILL;
    overlayContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    overlayContext.globalCompositeOperation = "destination-in";
    overlayContext.drawImage(maskCanvas, 0, 0);
    overlayContext.globalCompositeOperation = "source-over";

    return overlayCanvas;
  }, []);

  const committedMaskOverlayCanvas = useMemo(
    () => (committedMaskCanvas ? buildMaskOverlayCanvas(committedMaskCanvas) : null),
    [buildMaskOverlayCanvas, committedMaskCanvas],
  );

  const renderEditor = useCallback(
    (cursorPoint: { x: number; y: number } | null = cursorPointRef.current) => {
      if (!editorBaseCanvas || !editorCanvasRef.current || !editorDimensions) {
        return;
      }

      const { width, height } = editorDimensions;
      const canvas = editorCanvasRef.current;
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.clearRect(0, 0, width, height);
      context.drawImage(editorBaseCanvas, 0, 0);

      if (liveStrokeMaskCanvasRef.current) {
        context.save();
        context.globalAlpha = 0.34;
        context.drawImage(liveStrokeMaskCanvasRef.current, 0, 0);
        context.restore();
      } else if (committedMaskOverlayCanvas) {
        context.drawImage(committedMaskOverlayCanvas, 0, 0);
      }

      if (!cursorPoint) {
        return;
      }

      const radius = getRenderedBrushRadius(width, height, toRelativeBrushSize(brushSize));
      const cursorX = cursorPoint.x * width;
      const cursorY = cursorPoint.y * height;

      context.save();
      context.fillStyle = MASK_CURSOR_FILL;
      context.strokeStyle = MASK_CURSOR_STROKE;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(cursorX, cursorY, radius, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.restore();
    },
    [brushSize, committedMaskOverlayCanvas, editorBaseCanvas, editorDimensions],
  );

  useEffect(() => {
    renderEditor();
  }, [renderEditor]);

  const calculateDynamicEstimate = useCallback(
    () => {
      if (!selectedItem || !inpaintProfiles.length) {
        setDynamicEstimate(null);
        return;
      }

      const maskCanvas = liveStrokeMaskCanvasRef.current ?? committedMaskCanvas;
      if (!maskCanvas) {
        setDynamicEstimate(null);
        return;
      }

      const primaryProfile = inpaintProfiles[0];
      const maskAnalysis = analyzeMaskCanvas(maskCanvas);

      if (!maskAnalysis) {
        setDynamicEstimate(null);
        return;
      }

      const normalizedBounds = normalizeBounds(maskAnalysis.bounds, maskCanvas.width, maskCanvas.height);
      const maskAreaRatio = maskAnalysis.paintedPixels / maskAnalysis.totalPixels;
      const currentEstimate = estimateItemProcessingTime({
        deviceProfile: deviceEstimateProfile,
        dilation,
        item: selectedItem,
        maskAreaRatio,
        method,
        normalizedBounds,
        profile: primaryProfile,
        radius: inpaintRadius,
      });
      const batchEstimateMs =
        items.reduce((total, item, index) => {
          const estimate = estimateItemProcessingTime({
            deviceProfile: deviceEstimateProfile,
            dilation,
            item,
            maskAreaRatio,
            method,
            normalizedBounds,
            profile: primaryProfile,
            radius: inpaintRadius,
          });

          return total + estimate.durationMs + (index > 0 ? 140 : 0);
        }, 0) + (items.length > 1 ? 900 + items.length * 60 : 0);

      setDynamicEstimate({
        batchEstimateMs,
        currentEstimateMs: currentEstimate.durationMs,
        maskAreaRatio,
        processedAreaRatio: currentEstimate.processedAreaRatio,
      });
    },
    [committedMaskCanvas, deviceEstimateProfile, dilation, inpaintProfiles, inpaintRadius, items, method, selectedItem],
  );

  const handleClearMask = useCallback(() => {
    drawingStrokeRef.current = null;
    isDrawingRef.current = false;
    cursorPointRef.current = null;
    setDynamicEstimate(null);
    setProgress(0);
    setProgressText("");
    setStrokes([]);
    committedMaskCanvasRef.current = null;
    skipCommittedMaskReplayRef.current = false;
    setCommittedMaskCanvas(null);
    clearPreviewResult();
    clearZipResult();
    clearProcessedItems();
    liveStrokeMaskCanvasRef.current = null;
    renderEditor(null);
  }, [clearPreviewResult, clearProcessedItems, clearZipResult, renderEditor]);

  useEffect(() => {
    calculateDynamicEstimate();
  }, [calculateDynamicEstimate]);

  const formatEstimatePercent = useCallback(
    (value: number) => {
      const locale = language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US";
      const maximumFractionDigits = value < 0.1 ? 1 : 0;
      return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits }).format(value);
    },
    [language],
  );

  const formatEstimateDuration = useCallback(
    (milliseconds: number) => {
      const lowerBoundMs = Math.max(350, Math.round(milliseconds * 0.8));
      const upperBoundMs = Math.max(lowerBoundMs + 250, Math.round(milliseconds * 1.35));

      const formatPart = (valueMs: number) => {
        if (valueMs < 1000) {
          return language === "en" ? "< 1s" : "< 1 s";
        }

        const totalSeconds = Math.max(1, Math.round(valueMs / 1000));
        if (totalSeconds < 60) {
          return language === "en" ? `${totalSeconds}s` : `${totalSeconds} s`;
        }

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        if (!seconds) {
          return language === "pt"
            ? `${minutes} min`
            : language === "es"
              ? `${minutes} min`
              : `${minutes} min`;
        }

        return language === "en" ? `${minutes}m ${seconds}s` : `${minutes} min ${seconds} s`;
      };

      return `${formatPart(lowerBoundMs)} - ${formatPart(upperBoundMs)}`;
    },
    [language],
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) {
      return;
    }

    setError(null);
    setProgress(0);
    setProgressText("");

    try {
      const stopTimer = createTimer();
      const nextItems = await Promise.all(
        acceptedFiles.map(async (file, index) => {
          const previewUrl = URL.createObjectURL(file);
          const image = await loadImageElement(file);
          return {
            id: `${file.name}-${file.size}-${index}`,
            file,
            image,
            previewUrl,
            width: image.naturalWidth || image.width,
            height: image.naturalHeight || image.height,
          } satisfies BatchImageItem;
        }),
      );

      setItems((previousItems) => {
        previousItems.forEach((item) => {
          URL.revokeObjectURL(item.previewUrl);
          if (item.processedUrl) {
            URL.revokeObjectURL(item.processedUrl);
          }
        });
        return nextItems;
      });
      setSelectedItemId(nextItems[0]?.id ?? null);
      setStrokes([]);
      clearPreviewResult();
      clearZipResult();
      void logClientEvent({
        category: "magic-brush.upload",
        details: {
          durationMs: stopTimer(),
          files: nextItems.map((item) => ({
            height: item.height,
            name: item.file.name,
            size: item.file.size,
            type: item.file.type,
            width: item.width,
          })),
          totalFiles: nextItems.length,
        },
        message: "Loaded Magic Eraser input files",
      });
    } catch (loadError) {
      console.error("Failed to load batch images", loadError);
      void logClientError("magic-brush.upload", "Failed to load Magic Eraser input files", loadError, {
        acceptedFileCount: acceptedFiles.length,
      });
      setError(loadError instanceof Error ? loadError.message : copy.loadFilesError);
    }
  }, [clearPreviewResult, clearZipResult, copy.loadFilesError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    multiple: true,
    maxSize: 20 * 1024 * 1024,
  });

  const getNormalizedPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = editorCanvasRef.current;
    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    return {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    };
  };

  const getLiveStrokeMaskContext = () => {
    if (!editorDimensions) {
      return null;
    }

    if (!liveStrokeMaskCanvasRef.current) {
      liveStrokeMaskCanvasRef.current = createCanvas(editorDimensions.width, editorDimensions.height);
      const liveMaskContext = liveStrokeMaskCanvasRef.current.getContext("2d");

      if (!liveMaskContext) {
        liveStrokeMaskCanvasRef.current = null;
        return null;
      }

      if (committedMaskCanvasRef.current) {
        liveMaskContext.drawImage(committedMaskCanvasRef.current, 0, 0);
      }

      return liveMaskContext;
    }

    return liveStrokeMaskCanvasRef.current.getContext("2d");
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selectedItem || !editorDimensions) return;

    const point = getNormalizedPoint(event);
    if (!point) return;

    cursorPointRef.current = point;
    isDrawingRef.current = true;
    drawingStrokeRef.current = {
      mode: brushMode,
      size: toRelativeBrushSize(brushSize),
      hardness: hardness / 100,
      points: [point],
    };

    const liveMaskContext = getLiveStrokeMaskContext();
    if (!liveMaskContext) {
      isDrawingRef.current = false;
      drawingStrokeRef.current = null;
      return;
    }

    drawStrokeSegment(liveMaskContext, editorDimensions.width, editorDimensions.height, drawingStrokeRef.current, point);

    event.currentTarget.setPointerCapture(event.pointerId);
    renderEditor(point);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getNormalizedPoint(event);
    if (!point) return;

    cursorPointRef.current = point;

    if (!isDrawingRef.current || !drawingStrokeRef.current) {
      renderEditor(point);
      return;
    }

    const lastPoint = drawingStrokeRef.current.points[drawingStrokeRef.current.points.length - 1];
    drawingStrokeRef.current.points.push(point);

    const liveMaskContext = getLiveStrokeMaskContext();
    if (!liveMaskContext || !editorDimensions) {
      return;
    }

    if (lastPoint) {
      drawStrokeSegment(
        liveMaskContext,
        editorDimensions.width,
        editorDimensions.height,
        drawingStrokeRef.current,
        lastPoint,
        point,
      );
    }

    renderEditor(point);
  };

  const finishStroke = (event: React.PointerEvent<HTMLCanvasElement>, keepCursor: boolean) => {
    const point = getNormalizedPoint(event);
    cursorPointRef.current = keepCursor ? point ?? cursorPointRef.current : null;

    if (!isDrawingRef.current || !drawingStrokeRef.current) {
      renderEditor(cursorPointRef.current);
      return;
    }

    if (point) {
      const lastPoint = drawingStrokeRef.current.points[drawingStrokeRef.current.points.length - 1];
      if (!lastPoint || lastPoint.x !== point.x || lastPoint.y !== point.y) {
        const liveMaskContext = getLiveStrokeMaskContext();
        if (liveMaskContext && editorDimensions) {
          drawStrokeSegment(
            liveMaskContext,
            editorDimensions.width,
            editorDimensions.height,
            drawingStrokeRef.current,
            lastPoint ?? point,
            point,
          );
        }

        drawingStrokeRef.current.points.push(point);
      }
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    isDrawingRef.current = false;

    const finishedStroke = drawingStrokeRef.current;
    drawingStrokeRef.current = null;
    const finishedMaskCanvas = liveStrokeMaskCanvasRef.current;
    liveStrokeMaskCanvasRef.current = null;

    if (finishedMaskCanvas) {
      committedMaskCanvasRef.current = finishedMaskCanvas;
      skipCommittedMaskReplayRef.current = true;
      setCommittedMaskCanvas(finishedMaskCanvas);
    }

    setStrokes((previous) => [...previous, finishedStroke]);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    finishStroke(event, true);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLCanvasElement>) => {
    finishStroke(event, false);
  };

  const runInpaintForItem = useCallback(
    async (item: BatchImageItem) => {
      const operationTimer = createTimer();

      const resizeCanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
        if (canvas.width === width && canvas.height === height) {
          return canvas;
        }

        const resizedCanvas = createCanvas(width, height);
        const resizedContext = resizedCanvas.getContext("2d");

        if (!resizedContext) {
          throw new Error("Canvas 2D context is not available");
        }

        resizedContext.imageSmoothingEnabled = true;
        resizedContext.imageSmoothingQuality = "high";
        resizedContext.drawImage(canvas, 0, 0, width, height);
        return resizedCanvas;
      };

      let lastError: unknown = null;

      for (const profile of inpaintProfiles) {
        const attemptTimer = createTimer();

        try {
          const { scale, width: processingWidth, height: processingHeight } = getProcessingDimensions(item, profile);

          const maskCanvas = renderMaskFromStrokes(processingWidth, processingHeight, strokes);
          const maskAnalysis = analyzeMaskCanvas(maskCanvas);

          if (!maskAnalysis) {
            void logClientEvent({
              category: "magic-brush.inpaint",
              details: {
                durationMs: attemptTimer(),
                fileName: item.file.name,
                height: item.height,
                profile: profile.label,
                width: item.width,
              },
              level: "warn",
              message: "Magic Eraser mask was empty; returning original image",
            });
            return imageToCanvas(item.image);
          }

          const padding = getInpaintPadding(inpaintRadius, dilation);
          const expandedBounds = expandBounds(maskAnalysis.bounds, processingWidth, processingHeight, padding);
          const maskRegionCanvas = cropCanvas(maskCanvas, expandedBounds);
          const sourceRegionCanvas = createCanvas(expandedBounds.width, expandedBounds.height);
          const sourceRegionContext = sourceRegionCanvas.getContext("2d");

          if (!sourceRegionContext) {
            throw new Error("Canvas 2D context is not available");
          }

          sourceRegionContext.drawImage(
            item.image,
            expandedBounds.x * (item.width / processingWidth),
            expandedBounds.y * (item.height / processingHeight),
            expandedBounds.width * (item.width / processingWidth),
            expandedBounds.height * (item.height / processingHeight),
            0,
            0,
            expandedBounds.width,
            expandedBounds.height,
          );

          const regionMaxSide = Math.max(expandedBounds.width, expandedBounds.height);
          const regionScale = regionMaxSide > profile.regionMaxSide ? profile.regionMaxSide / regionMaxSide : 1;
          const inpaintRegionWidth = Math.max(1, Math.round(expandedBounds.width * regionScale));
          const inpaintRegionHeight = Math.max(1, Math.round(expandedBounds.height * regionScale));

          const inpaintSourceCanvas = resizeCanvas(sourceRegionCanvas, inpaintRegionWidth, inpaintRegionHeight);
          const inpaintMaskCanvas = resizeCanvas(maskRegionCanvas, inpaintRegionWidth, inpaintRegionHeight);
          const processedRegionCanvas = await inpaintCanvas(inpaintSourceCanvas, inpaintMaskCanvas, {
            radius: Math.max(1, Math.round(inpaintRadius * regionScale)),
            method,
            dilation: dilation > 0 ? Math.max(1, Math.round(dilation * regionScale)) : 0,
          });

          const processedCanvas = createCanvas(processingWidth, processingHeight);
          const processedContext = processedCanvas.getContext("2d");

          if (!processedContext) {
            throw new Error("Canvas 2D context is not available");
          }

          processedContext.drawImage(item.image, 0, 0, processingWidth, processingHeight);
          processedContext.drawImage(
            processedRegionCanvas,
            expandedBounds.x,
            expandedBounds.y,
            expandedBounds.width,
            expandedBounds.height,
          );

          const finalCanvas =
            scale === 1
              ? processedCanvas
              : (() => {
                  const canvas = createCanvas(item.width, item.height);
                  const context = canvas.getContext("2d");

                  if (!context) {
                    throw new Error("Canvas 2D context is not available");
                  }

                  context.imageSmoothingEnabled = true;
                  context.imageSmoothingQuality = "high";
                  context.drawImage(processedCanvas, 0, 0, item.width, item.height);
                  return canvas;
                })();

          void logClientEvent({
            category: "magic-brush.inpaint",
            details: {
              bounds: expandedBounds,
              durationMs: attemptTimer(),
              fileName: item.file.name,
              maskBounds: maskAnalysis.bounds,
              method,
              originalSize: { height: item.height, width: item.width },
              profile: profile.label,
              processingSize: { height: processingHeight, width: processingWidth },
              regionScale,
              regionSize: { height: inpaintRegionHeight, width: inpaintRegionWidth },
              totalDurationMs: operationTimer(),
            },
            message: "Magic Eraser inpaint attempt succeeded",
          });

          return finalCanvas;
        } catch (error) {
          lastError = error;
          void logClientError(
            "magic-brush.inpaint",
            "Magic Eraser inpaint attempt failed",
            error,
            {
              attemptDurationMs: attemptTimer(),
              dilation,
              fileName: item.file.name,
              method,
              profile: profile.label,
              radius: inpaintRadius,
            },
          );
        }
      }

      throw lastError instanceof Error ? lastError : new Error("Magic Eraser inpaint failed after automatic retries");
    },
    [dilation, inpaintProfiles, inpaintRadius, method, strokes],
  );

  const handlePreviewCurrent = async () => {
    if (!selectedItem || !strokes.length) {
      return;
    }

    const previewTimer = createTimer();
    const itemId = selectedItem.id;
    setError(null);
    clearZipResult();
    setProgressText(copy.loadingOpenCv);
    setProcessing(true);
    setProgress(10);

    try {
      await waitForUi();
      void logClientEvent({
        category: "magic-brush.preview",
        details: {
          fileName: selectedItem.file.name,
        },
        message: "Magic Eraser preview processing started",
      });
      setProgressText(copy.renderingPreview);
      setProgress(45);
      await waitForUi();
      const renderTimer = createTimer();
      const resultCanvas = await runInpaintForItem(selectedItem);
      const exportType = getSafeExportType(selectedItem.file);
      const blob = await canvasToBlob(resultCanvas, exportType, exportType === "image/jpeg" ? 0.92 : undefined);
      const previewUrl = URL.createObjectURL(blob);
      const processedUrl = URL.createObjectURL(blob);
      setItems((previousItems) =>
        previousItems.map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          if (item.processedUrl) {
            URL.revokeObjectURL(item.processedUrl);
          }

          return {
            ...item,
            processedUrl,
          };
        }),
      );
      setPreviewResultUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return previewUrl;
      });
      setProgress(100);
      setProgressText(copy.previewReady);
      void logClientEvent({
        category: "magic-brush.preview",
        details: {
          blobSize: blob.size,
          fileName: selectedItem.file.name,
          inpaintDurationMs: renderTimer(),
          totalDurationMs: previewTimer(),
        },
        message: "Magic Eraser preview completed",
      });
    } catch (previewError) {
      console.error("Magic eraser preview failed", previewError);
      void logClientError("magic-brush.preview", "Magic Eraser preview failed", previewError, {
        fileName: selectedItem.file.name,
        totalDurationMs: previewTimer(),
      });
      setError(getDisplayErrorMessage(previewError, copy.previewError));
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessAll = async () => {
    if (items.length < 2 || !strokes.length) {
      return;
    }

    const batchTimer = createTimer();
    setError(null);
    setProcessing(true);
    setProgress(0);
    setProgressText(copy.loadingOpenCv);

    try {
      await waitForUi();
      void logClientEvent({
        category: "magic-brush.batch",
        details: {
          fileCount: items.length,
        },
        message: "Magic Eraser batch processing started",
      });
      const zip = new JSZip();
      const nextItems = items.map((item) => ({ ...item }));

      for (let index = 0; index < nextItems.length; index += 1) {
        const item = nextItems[index];
        setProgressText(copy.processingFile(item.file.name, index + 1, nextItems.length));
        setProgress(Math.round((index / nextItems.length) * 80));
        await waitForUi();

        const itemTimer = createTimer();
        const resultCanvas = await runInpaintForItem(item);
        const exportType = getSafeExportType(item.file);
        const resultBlob = await canvasToBlob(resultCanvas, exportType, exportType === "image/jpeg" ? 0.92 : undefined);
        const processedUrl = URL.createObjectURL(resultBlob);

        if (item.processedUrl) {
          URL.revokeObjectURL(item.processedUrl);
        }

        item.processedUrl = processedUrl;

        zip.file(`${stripExtension(item.file.name)}-clean.${getExportExtension(exportType)}`, resultBlob);
        void logClientEvent({
          category: "magic-brush.batch",
          details: {
            durationMs: itemTimer(),
            fileName: item.file.name,
            outputType: exportType,
            resultBlobSize: resultBlob.size,
          },
          message: "Magic Eraser processed batch file",
        });
        await waitForUi();
      }

      setItems(nextItems);
      setProgressText(copy.buildingZip);
      await waitForUi();
      const zipTimer = createTimer();
      const archiveBlob = await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        },
        (metadata) => {
          setProgress(Math.round(80 + metadata.percent * 0.2));
        },
      );

      const archiveUrl = URL.createObjectURL(archiveBlob);
      setZipUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return archiveUrl;
      });
      setProgress(100);
      setProgressText(copy.batchFinished);
      void logClientEvent({
        category: "magic-brush.batch",
        details: {
          archiveSize: archiveBlob.size,
          fileCount: nextItems.length,
          totalDurationMs: batchTimer(),
          zipDurationMs: zipTimer(),
        },
        message: "Magic Eraser batch completed",
      });
    } catch (batchError) {
      console.error("Batch magic eraser failed", batchError);
      void logClientError("magic-brush.batch", "Magic Eraser batch failed", batchError, {
        fileCount: items.length,
        totalDurationMs: batchTimer(),
      });
      setError(getDisplayErrorMessage(batchError, copy.batchError));
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadZip = () => {
    if (!zipUrl) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = zipUrl;
    anchor.download = "magic-eraser-batch.zip";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleDownloadSelectedImage = () => {
    if (!selectedItem?.processedUrl) {
      return;
    }

    const exportType = getSafeExportType(selectedItem.file);
    const anchor = document.createElement("a");
    anchor.href = selectedItem.processedUrl;
    anchor.download = `${stripExtension(selectedItem.file.name)}-clean.${getExportExtension(exportType)}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="container space-y-8 py-12">
      <ToolHero
        pageId="objectRemoval"
        icon={<Wand2 className="h-6 w-6 text-white" />}
        title={t("tools.magicBrush.title")}
        description={copy.heroDescription}
        badgeClassName="bg-gradient-to-br from-orange-500 to-red-500"
      />

      <AdSlot slot="magic-brush-top-placement" className="h-24" />

      <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{copy.batchControlsTitle}</CardTitle>
            <CardDescription>{copy.batchControlsDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive ? copy.dropActive : copy.dropIdle}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{copy.supportedFormats}</p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant={brushMode === "paint" ? "default" : "outline"}
                  className={`w-full justify-center px-3 text-center ${brushMode === "paint" ? "bg-gradient-primary text-primary-foreground" : ""}`}
                  onClick={() => setBrushMode("paint")}
                >
                  <Paintbrush className="mr-2 h-4 w-4 shrink-0" />
                  <span>{copy.paintMask}</span>
                </Button>
                <Button
                  type="button"
                  variant={brushMode === "erase" ? "default" : "outline"}
                  className="w-full justify-center px-3 text-center"
                  onClick={() => setBrushMode("erase")}
                >
                  <Eraser className="mr-2 h-4 w-4 shrink-0" />
                  <span>{copy.eraseMask}</span>
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{copy.brushSize}</span>
                  <span className="text-muted-foreground">{brushSize}px</span>
                </div>
                <Slider
                  value={[brushSize]}
                  min={10}
                  max={180}
                  step={1}
                  onValueChange={(value) => setBrushSize(value[0] ?? DEFAULT_BRUSH_SIZE)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{copy.brushHardness}</span>
                  <span className="text-muted-foreground">{hardness}%</span>
                </div>
                <Slider value={[hardness]} min={10} max={100} step={1} onValueChange={(value) => setHardness(value[0] ?? 82)} />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">{copy.inpaintingMethod}</div>
                <Select value={method} onValueChange={(value) => setMethod(value as InpaintMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telea">Telea</SelectItem>
                    <SelectItem value="ns">Navier-Stokes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{copy.inpaintRadius}</span>
                  <span className="text-muted-foreground">{inpaintRadius}px</span>
                </div>
                <Slider
                  value={[inpaintRadius]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={(value) => setInpaintRadius(value[0] ?? 4)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{copy.maskExpansion}</span>
                  <span className="text-muted-foreground">{dilation}</span>
                </div>
                <Slider value={[dilation]} min={0} max={6} step={1} onValueChange={(value) => setDilation(value[0] ?? 1)} />
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">{copy.estimateTitle}</div>
                <p className="text-xs text-muted-foreground">{copy.estimateDescription}</p>
              </div>

              {dynamicEstimate ? (
                <div className="mt-4 space-y-4">
                  <div className={`grid gap-3 ${items.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                      <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {copy.estimateCurrentFile}
                      </div>
                      <div className="mt-1 text-base font-semibold">{formatEstimateDuration(dynamicEstimate.currentEstimateMs)}</div>
                    </div>
                    {items.length > 1 ? (
                      <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          {copy.estimateBatch}
                        </div>
                        <div className="mt-1 text-base font-semibold">{formatEstimateDuration(dynamicEstimate.batchEstimateMs)}</div>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{copy.estimateMaskArea}</span>
                        <span>{formatEstimatePercent(dynamicEstimate.maskAreaRatio)}</span>
                      </div>
                      <Progress className="h-2" value={Math.min(100, dynamicEstimate.maskAreaRatio * 100)} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{copy.estimateProcessedArea}</span>
                        <span>{formatEstimatePercent(dynamicEstimate.processedAreaRatio)}</span>
                      </div>
                      <Progress className="h-2" value={Math.min(100, dynamicEstimate.processedAreaRatio * 100)} />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">{copy.estimateEmpty}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setStrokes((previous) => previous.slice(0, -1))} disabled={!strokes.length || processing}>
                {copy.undo}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearMask}
                disabled={!strokes.length || processing}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {copy.clearMask}
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Button type="button" onClick={handlePreviewCurrent} disabled={!selectedItem || !strokes.length || processing}>
                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                {copy.previewCurrent}
              </Button>
              {items.length > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleProcessAll}
                  disabled={!strokes.length || processing}
                >
                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  {copy.processAll}
                </Button>
              ) : null}
              {items.length > 1 ? (
                <Button type="button" variant="outline" onClick={handleDownloadZip} disabled={!zipUrl || processing}>
                  <Download className="mr-2 h-4 w-4" />
                  {copy.downloadZip}
                </Button>
              ) : items.length === 1 ? (
                <Button type="button" variant="outline" onClick={handleDownloadSelectedImage} disabled={!selectedItem?.processedUrl || processing}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("common.download")}
                </Button>
              ) : null}
            </div>

            {processing || progress > 0 ? (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">{progressText}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {aspectWarning ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{copy.aspectWarningTitle}</AlertTitle>
              <AlertDescription>{aspectWarning}</AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{copy.errorTitle}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{copy.maskEditorTitle}</CardTitle>
              <CardDescription>{copy.maskEditorDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-3">
                {selectedItem ? (
                  <canvas
                    ref={editorCanvasRef}
                    className="w-full cursor-none rounded-md border bg-background"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerLeave}
                    style={{ touchAction: "none", maxHeight: "620px", objectFit: "contain" }}
                  />
                ) : (
                  <div className="py-20 text-center text-muted-foreground">
                    <Wand2 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>{copy.emptyMaskEditor}</p>
                  </div>
                )}
              </div>

              {items.length ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">{copy.previewSample}</p>
                  <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedItemId(item.id)}
                        className={`overflow-hidden rounded-lg border text-left transition ${
                          item.id === selectedItem?.id ? "border-primary shadow-md" : "border-border/60"
                        }`}
                      >
                        <img src={item.previewUrl} alt={item.file.name} className="h-24 w-full object-cover" />
                        <div className="p-2 text-xs text-muted-foreground">{item.file.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{copy.outputsTitle}</CardTitle>
              <CardDescription>{copy.outputsDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewResultUrl ? (
                <div className="space-y-3">
                  <ResultImagePreview src={previewResultUrl} alt="Magic Eraser preview" className="w-full rounded-lg border" />
                  <p className="text-sm text-muted-foreground">
                    {copy.previewForFile(selectedItem?.file.name ?? "")}
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Wand2 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>{copy.previewEmpty}</p>
                </div>
              )}

              {items.some((item) => item.processedUrl) ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {items
                    .filter((item) => item.processedUrl)
                    .map((item) => (
                      <div key={`${item.id}-result`} className="overflow-hidden rounded-lg border">
                        <ResultImagePreview
                          src={item.processedUrl}
                          alt={`${item.file.name} cleaned`}
                          className="h-36 w-full object-cover"
                        />
                        <div className="p-2 text-xs text-muted-foreground">{item.file.name}</div>
                      </div>
                    ))}
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">{copy.outputsFooter}</CardFooter>
          </Card>
        </div>
      </div>

      <LocalProcessingNotice contained={false} className="pb-0" />
    </div>
  );
};

export default MagicBrushPage;
