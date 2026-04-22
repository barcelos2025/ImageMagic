import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { AlertCircle, Download, Scissors, Sparkles, Upload, Wand2 } from "@/components/icons";

import ToolHero from "@/components/ToolHero";
import { AdSlot } from "@/components/ads/AdSlot";
import LocalProcessingNotice from "@/components/LocalProcessingNotice";
import { ResultImagePreview } from "@/components/ResultImagePreview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BACKGROUND_REMOVAL_MODELS,
  loadImage,
  removeBackground,
  type BackgroundRemovalModelKey,
  type RemoveBackgroundProgressStep,
} from "@/utils/backgroundRemoval";

const REMOVE_BACKGROUND_COPY = {
  en: {
    heroDescription: "Use a dedicated background-removal model and export a transparent PNG at full size.",
    uploadTitle: "Upload image",
    uploadDescription:
      "BEN2 is the default model. If the edge quality is weak on a specific file, switch to ORMBG and run it again.",
    dropIdle: "Drag and drop an image here, or click to select.",
    dropActive: "Drop the image here.",
    fileHint: "PNG, JPG, or WEBP up to 20 MB.",
    modelLabel: "Background removal model",
    originalAlt: "Original preview",
    actionLabel: "Remove background",
    resultTitle: "Result",
    resultDescription: "Review the transparent PNG output before downloading it.",
    resultAlt: "Background removed preview",
    failedTitle: "Background removal failed",
    genericError: "The background could not be removed from this image.",
    completed: "Completed",
    emptyResult: "Upload an image and run the tool to see the cutout result here.",
    eraserTitle: "Need to remove a repeated object?",
    eraserDescription:
      "Use Magic Eraser to paint a shared removal area and process several files in a single batch.",
    eraserAction: "Open Magic Eraser",
    guidanceTitle: "Practical guidance",
    guidanceDescription:
      "Dedicated background-removal models outperform the previous semantic segmentation pipeline.",
    guidancePoints: [
      "Start with BEN2 for general cutouts.",
      "If BEN2 leaves background fragments or misses fine separation, run the same image again with ORMBG.",
      "For recurring cleanup such as logos, badges, or repeated objects, use Magic Eraser instead of forcing the background remover.",
    ],
    progress: {
      prepare: "Preparing image...",
      "load-model": "Loading background removal model...",
      "extract-mask": "Running AI mask extraction...",
      "compat-retry": "Retrying with compatibility backend...",
      "extract-mask-compat": "Running AI mask extraction in compatibility mode...",
      "rebuild-output": "Rebuilding full-size transparent output...",
      finalize: "Finalizing PNG...",
    } satisfies Record<RemoveBackgroundProgressStep, string>,
    modelDescriptions: {
      ben2: "General-purpose model with strong edge handling for products, people, and mixed scenes.",
      ormbg: "Alternative model for difficult backgrounds and cases where BEN2 misses fine separations.",
    } satisfies Record<BackgroundRemovalModelKey, string>,
  },
  pt: {
    heroDescription: "Use um modelo dedicado de remoção de fundo e exporte um PNG transparente em tamanho integral.",
    uploadTitle: "Enviar imagem",
    uploadDescription:
      "BEN2 é o modelo padrão. Se a qualidade da borda não ficar boa em um arquivo específico, mude para ORMBG e rode novamente.",
    dropIdle: "Arraste uma imagem até aqui ou clique para selecionar.",
    dropActive: "Solte a imagem aqui.",
    fileHint: "PNG, JPG ou WEBP de até 20 MB.",
    modelLabel: "Modelo de remoção de fundo",
    originalAlt: "Pré-visualização original",
    actionLabel: "Remover fundo",
    resultTitle: "Resultado",
    resultDescription: "Revise o PNG transparente antes de baixá-lo.",
    resultAlt: "Pré-visualização sem fundo",
    failedTitle: "Falha ao remover o fundo",
    genericError: "Não foi possível remover o fundo desta imagem.",
    completed: "Concluído",
    emptyResult: "Envie uma imagem e execute a ferramenta para ver o recorte aqui.",
    eraserTitle: "Precisa remover um objeto repetido?",
    eraserDescription:
      "Use a Borracha mágica para pintar uma área de remoção compartilhada e processar vários arquivos em lote.",
    eraserAction: "Abrir Borracha mágica",
    guidanceTitle: "Orientações práticas",
    guidanceDescription:
      "Modelos dedicados de remoção de fundo entregam resultados melhores do que o pipeline semântico anterior.",
    guidancePoints: [
      "Comece com BEN2 para recortes gerais.",
      "Se o BEN2 deixar fragmentos do fundo ou falhar em separações finas, rode a mesma imagem novamente com ORMBG.",
      "Para limpezas recorrentes, como logos, selos ou objetos repetidos, use a Borracha mágica em vez de forçar o removedor de fundo.",
    ],
    progress: {
      prepare: "Preparando imagem...",
      "load-model": "Carregando modelo de remoção de fundo...",
      "extract-mask": "Executando extração de máscara com IA...",
      "compat-retry": "Tentando novamente com backend de compatibilidade...",
      "extract-mask-compat": "Executando extração de máscara em modo de compatibilidade...",
      "rebuild-output": "Reconstruindo a saída transparente em tamanho integral...",
      finalize: "Finalizando PNG...",
    } satisfies Record<RemoveBackgroundProgressStep, string>,
    modelDescriptions: {
      ben2: "Modelo de uso geral com bom tratamento de bordas para produtos, pessoas e cenas mistas.",
      ormbg: "Modelo alternativo para fundos difíceis e casos em que o BEN2 perde separações finas.",
    } satisfies Record<BackgroundRemovalModelKey, string>,
  },
  es: {
    heroDescription: "Usa un modelo dedicado de eliminación de fondo y exporta un PNG transparente en tamaño completo.",
    uploadTitle: "Subir imagen",
    uploadDescription:
      "BEN2 es el modelo predeterminado. Si la calidad del borde es débil en un archivo específico, cambia a ORMBG y ejecútalo de nuevo.",
    dropIdle: "Arrastra una imagen hasta aquí o haz clic para seleccionarla.",
    dropActive: "Suelta la imagen aquí.",
    fileHint: "PNG, JPG o WEBP de hasta 20 MB.",
    modelLabel: "Modelo de eliminación de fondo",
    originalAlt: "Vista previa original",
    actionLabel: "Eliminar fondo",
    resultTitle: "Resultado",
    resultDescription: "Revisa el PNG transparente antes de descargarlo.",
    resultAlt: "Vista previa sin fondo",
    failedTitle: "Fallo al eliminar el fondo",
    genericError: "No se pudo eliminar el fondo de esta imagen.",
    completed: "Completado",
    emptyResult: "Sube una imagen y ejecuta la herramienta para ver aquí el recorte.",
    eraserTitle: "¿Necesitas eliminar un objeto repetido?",
    eraserDescription:
      "Usa el Borrador mágico para pintar un área de eliminación compartida y procesar varios archivos en un solo lote.",
    eraserAction: "Abrir Borrador mágico",
    guidanceTitle: "Guía práctica",
    guidanceDescription:
      "Los modelos dedicados de eliminación de fondo ofrecen mejores resultados que el pipeline semántico anterior.",
    guidancePoints: [
      "Empieza con BEN2 para recortes generales.",
      "Si BEN2 deja fragmentos del fondo o falla en separaciones finas, vuelve a ejecutar la misma imagen con ORMBG.",
      "Para limpiezas recurrentes, como logos, sellos u objetos repetidos, usa el Borrador mágico en lugar de forzar el eliminador de fondo.",
    ],
    progress: {
      prepare: "Preparando imagen...",
      "load-model": "Cargando modelo de eliminación de fondo...",
      "extract-mask": "Ejecutando extracción de máscara con IA...",
      "compat-retry": "Reintentando con backend de compatibilidad...",
      "extract-mask-compat": "Ejecutando extracción de máscara en modo de compatibilidad...",
      "rebuild-output": "Reconstruyendo la salida transparente a tamaño completo...",
      finalize: "Finalizando PNG...",
    } satisfies Record<RemoveBackgroundProgressStep, string>,
    modelDescriptions: {
      ben2: "Modelo de uso general con buen manejo de bordes para productos, personas y escenas mixtas.",
      ormbg: "Modelo alternativo para fondos difíciles y casos en los que BEN2 pierde separaciones finas.",
    } satisfies Record<BackgroundRemovalModelKey, string>,
  },
} as const;

const PROGRESS_ORDER: RemoveBackgroundProgressStep[] = [
  "prepare",
  "load-model",
  "extract-mask",
  "compat-retry",
  "extract-mask-compat",
  "rebuild-output",
  "finalize",
];

const RemoveBackgroundPage = () => {
  const { language, t } = useLanguage();
  const copy = REMOVE_BACKGROUND_COPY[language];
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [processedImageUrl, setProcessedImageUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState<RemoveBackgroundProgressStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<BackgroundRemovalModelKey>("ben2");

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [imageUrl, processedImageUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImage(file);
    setImageUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return objectUrl;
    });
    setProcessedImageUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return "";
    });
    setError(null);
    setProgress(0);
    setProgressStep(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp"],
    },
    multiple: false,
    maxSize: 20 * 1024 * 1024,
  });

  const progressText = useMemo(
    () => (progressStep ? copy.progress[progressStep] : ""),
    [copy.progress, progressStep],
  );

  const handleRemoveBackground = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(5);
    setProgressStep("prepare");
    setError(null);

    try {
      const imageElement = await loadImage(image);
      const processedBlob = await removeBackground(imageElement, {
        model: selectedModel,
        onProgress: (status) => {
          setProgressStep(status);
          const index = PROGRESS_ORDER.indexOf(status);
          const normalizedIndex = index >= 0 ? index : PROGRESS_ORDER.length - 1;
          setProgress(Math.min(100, 10 + normalizedIndex * 22));
        },
      });

      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImageUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return processedUrl;
      });
      setProgress(100);
      setProgressStep(null);
    } catch (processingError) {
      console.error("Error processing image:", processingError);
      setError(processingError instanceof Error ? processingError.message : copy.genericError);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProcessedImage = () => {
    if (!processedImageUrl) return;

    const link = document.createElement("a");
    link.href = processedImageUrl;
    link.download = `background-removed-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeModel = BACKGROUND_REMOVAL_MODELS.find((model) => model.key === selectedModel);

  return (
    <div className="container space-y-8 py-12">
      <ToolHero
        pageId="removeBackground"
        icon={<Scissors className="h-6 w-6 text-white" />}
        title={t("tools.removeBackground.title")}
        description={copy.heroDescription}
        badgeClassName="bg-gradient-to-br from-purple-500 to-pink-500"
      />

      <AdSlot slot="remove-background-top-placement" className="h-24" />

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {copy.uploadTitle}
            </CardTitle>
            <CardDescription>{copy.uploadDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{isDragActive ? copy.dropActive : copy.dropIdle}</p>
                <p className="text-xs text-muted-foreground">{copy.fileHint}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{copy.modelLabel}</label>
              <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as BackgroundRemovalModelKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BACKGROUND_REMOVAL_MODELS.map((model) => (
                    <SelectItem key={model.key} value={model.key}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeModel ? <p className="text-xs text-muted-foreground">{copy.modelDescriptions[activeModel.key]}</p> : null}
            </div>

            {imageUrl ? (
              <div className="space-y-4">
                <img
                  src={imageUrl}
                  alt={copy.originalAlt}
                  className="w-full rounded-lg border"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
                <p className="text-center text-xs text-muted-foreground">{image?.name}</p>
                <Button
                  onClick={handleRemoveBackground}
                  disabled={isProcessing}
                  className="w-full bg-gradient-primary text-primary-foreground"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      {progressText || t("common.processing")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Scissors className="h-4 w-4" />
                      {copy.actionLabel}
                    </span>
                  )}
                </Button>

                {isProcessing ? (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-center text-xs text-muted-foreground">
                      {progressText} ({progress}%)
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{copy.failedTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{copy.resultTitle}</CardTitle>
            <CardDescription>{copy.resultDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {processedImageUrl ? (
              <div className="space-y-4">
                <ResultImagePreview
                  src={processedImageUrl}
                  alt={copy.resultAlt}
                  className="w-full rounded-lg border"
                  dialogImageStyle={{
                    background:
                      "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px",
                  }}
                  style={{
                    maxHeight: "300px",
                    objectFit: "contain",
                    background:
                      "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px",
                  }}
                />
                <Button onClick={downloadProcessedImage} className="w-full bg-gradient-success text-success-foreground">
                  <Download className="mr-2 h-4 w-4" />
                  {t("common.download")} PNG
                </Button>
              </div>
            ) : (
              <div className="space-y-6 py-10 text-center text-muted-foreground">
                <div>
                  <Scissors className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>{copy.emptyResult}</p>
                </div>
                <div className="rounded-lg border border-dashed border-border/60 p-4 text-left text-sm">
                  <p className="font-medium text-foreground">{copy.eraserTitle}</p>
                  <p className="mt-2 text-muted-foreground">{copy.eraserDescription}</p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/magic-brush">
                      <Wand2 className="mr-2 h-4 w-4" />
                      {copy.eraserAction}
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{copy.guidanceTitle}</CardTitle>
          <CardDescription>{copy.guidanceDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {copy.guidancePoints.map((point) => (
            <p key={point}>{point}</p>
          ))}
          {!isProcessing && progress === 100 ? <p>{copy.completed}</p> : null}
        </CardContent>
      </Card>

      <LocalProcessingNotice contained={false} className="pb-0" />
    </div>
  );
};

export default RemoveBackgroundPage;
