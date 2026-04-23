import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "@/components/icons";

import ToolHero from "@/components/ToolHero";
import { AdSlot } from "@/components/ads/AdSlot";
import { EditorShell, ExportControls, ExportPanel, ImageCanvasPreview, PresetSelector, ToolSidebar, UploadArea } from "@/components/editor";
import LocalProcessingNotice from "@/components/LocalProcessingNotice";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEditorExport, useEditorFiles, useEditorJobs, useEditorNotifications, useEditorPreview, useEditorState } from "@/hooks/editor";
import { canEncodeMimeType, encodeCanvasToImageBlob, loadImageElement, renderImageToCanvas } from "@/lib/image-engine";

const OUTPUT_FORMATS = [
  { value: "png", label: "PNG", mime: "image/png", extension: "png", quality: 1, preservesTransparency: true },
  { value: "jpg", label: "JPG / JPEG", mime: "image/jpeg", extension: "jpg", quality: 0.92, preservesTransparency: false },
  { value: "webp", label: "WEBP", mime: "image/webp", extension: "webp", quality: 0.92, preservesTransparency: true },
  { value: "avif", label: "AVIF", mime: "image/avif", extension: "avif", quality: 0.9, preservesTransparency: true },
  { value: "bmp", label: "BMP", mime: "image/bmp", extension: "bmp", quality: 1, preservesTransparency: false, manualEncoder: true },
] as const;

type OutputFormat = (typeof OUTPUT_FORMATS)[number];
type OutputFormatValue = OutputFormat["value"];

const DEFAULT_OUTPUT_FORMAT: OutputFormatValue = "png";

const CONVERT_COPY = {
  en: {
    heroDescription: "Convert browser-readable images to every export format available locally.",
    uploadTitle: "Upload image",
    uploadDescription:
      "This tool is intended for browser-friendly raster formats. PDF and advanced vector conversion are not currently offered here.",
    dropIdle: "Drag and drop an image here, or click to select.",
    dropActive: "Drop the image here.",
    fileHint: "PNG, JPG, WEBP, AVIF, GIF, BMP, SVG, ICO, TIFF, HEIC/HEIF, and other browser-readable images up to 20 MB.",
    originalAlt: "Original preview",
    formatLabel: "Export format",
    availableFormatsPrefix: "Available outputs in this browser:",
    convertAction: "Convert image",
    resultTitle: "Result",
    resultDescription: "Preview the exported file before downloading it.",
    resultAlt: "Converted preview",
    emptyResult: "Upload a file and convert it to review the result here.",
    resultReady: "Converted file ready.",
    errors: {
      generateFailed: "Unable to generate the converted file.",
      decodeFailed: "The selected file could not be decoded in this browser.",
      genericFailed: "The image could not be converted with the selected output format.",
    },
  },
  pt: {
    heroDescription: "Converta imagens legíveis pelo navegador para todos os formatos de exportação disponíveis localmente.",
    uploadTitle: "Enviar imagem",
    uploadDescription:
      "Esta ferramenta é voltada para formatos raster compatíveis com navegador. Conversão de PDF e vetores avançados não está disponível aqui no momento.",
    dropIdle: "Arraste uma imagem até aqui ou clique para selecionar.",
    dropActive: "Solte a imagem aqui.",
    fileHint: "PNG, JPG, WEBP, AVIF, GIF, BMP, SVG, ICO, TIFF, HEIC/HEIF e outras imagens legíveis pelo navegador até 20 MB.",
    originalAlt: "Pré-visualização original",
    formatLabel: "Formato de saída",
    availableFormatsPrefix: "Saídas disponíveis neste navegador:",
    convertAction: "Converter imagem",
    resultTitle: "Resultado",
    resultDescription: "Visualize o arquivo exportado antes de baixá-lo.",
    resultAlt: "Pré-visualização convertida",
    emptyResult: "Envie um arquivo e converta-o para revisar o resultado aqui.",
    resultReady: "Arquivo convertido pronto.",
    errors: {
      generateFailed: "Não foi possível gerar o arquivo convertido.",
      decodeFailed: "O arquivo selecionado não pôde ser decodificado neste navegador.",
      genericFailed: "Não foi possível converter a imagem com o formato de saída escolhido.",
    },
  },
  es: {
    heroDescription: "Convierte imágenes legibles por el navegador a todos los formatos de exportación disponibles localmente.",
    uploadTitle: "Subir imagen",
    uploadDescription:
      "Esta herramienta está pensada para formatos raster compatibles con el navegador. La conversión de PDF y vectores avanzados no está disponible aquí por ahora.",
    dropIdle: "Arrastra una imagen hasta aquí o haz clic para seleccionarla.",
    dropActive: "Suelta la imagen aquí.",
    fileHint: "PNG, JPG, WEBP, AVIF, GIF, BMP, SVG, ICO, TIFF, HEIC/HEIF y otras imágenes legibles por el navegador hasta 20 MB.",
    originalAlt: "Vista previa original",
    formatLabel: "Formato de salida",
    availableFormatsPrefix: "Salidas disponibles en este navegador:",
    convertAction: "Convertir imagen",
    resultTitle: "Resultado",
    resultDescription: "Previsualiza el archivo exportado antes de descargarlo.",
    resultAlt: "Vista previa convertida",
    emptyResult: "Sube un archivo y conviértelo para revisar aquí el resultado.",
    resultReady: "Archivo convertido listo.",
    errors: {
      generateFailed: "No se pudo generar el archivo convertido.",
      decodeFailed: "El archivo seleccionado no pudo decodificarse en este navegador.",
      genericFailed: "No se pudo convertir la imagen con el formato de salida seleccionado.",
    },
  },
} as const;

const ConvertPage = () => {
  const { language, t } = useLanguage();
  const copy = CONVERT_COPY[language];
  const { file, sourceUrl, setAcceptedFiles } = useEditorFiles();
  const { previewUrl, clearPreview, setPreviewFromBlob } = useEditorPreview();
  const { exportFile } = useEditorExport();
  const notifications = useEditorNotifications();
  const { jobs, upsertJob, removeJob } = useEditorJobs();
  const editor = useEditorState({ outputFormat: DEFAULT_OUTPUT_FORMAT as OutputFormatValue });
  const { syncSettings } = editor;
  const [availableOutputFormats, setAvailableOutputFormats] = useState<OutputFormat[]>(() =>
    OUTPUT_FORMATS.filter((format) => format.value !== "avif"),
  );
  const [error, setError] = useState<string | null>(null);
  const activeJob = jobs.find((job) => job.status === "running") ?? null;

  useEffect(() => {
    let isMounted = true;

    const detectFormats = async () => {
      const availability = await Promise.all(
        OUTPUT_FORMATS.map(async (format) => {
          if ("manualEncoder" in format && format.manualEncoder) {
            return [format.value, true] as const;
          }

          return [format.value, await canEncodeMimeType(format.mime)] as const;
        }),
      );

      if (!isMounted) {
        return;
      }

      const availableValues = new Set(availability.filter(([, supported]) => supported).map(([value]) => value));
      const nextFormats = OUTPUT_FORMATS.filter((format) => availableValues.has(format.value));
      setAvailableOutputFormats(nextFormats);
      syncSettings((current) => ({
        ...current,
        outputFormat: availableValues.has(current.outputFormat) ? current.outputFormat : nextFormats[0]?.value ?? DEFAULT_OUTPUT_FORMAT,
      }));
    };

    void detectFormats();

    return () => {
      isMounted = false;
    };
  }, [syncSettings]);

  const onDrop = (acceptedFiles: File[]) => {
    setAcceptedFiles(acceptedFiles);
    clearPreview();
    setError(null);
  };

  const convertImage = async () => {
    if (!file || !sourceUrl) {
      return;
    }

    setError(null);
    upsertJob({ id: "convert", label: copy.convertAction, progress: 20, status: "running" });

    try {
      const selectedFormat =
        availableOutputFormats.find((format) => format.value === editor.settings.outputFormat) ?? availableOutputFormats[0] ?? OUTPUT_FORMATS[0];
      const sourceImage = await loadImageElement(sourceUrl, copy.errors.decodeFailed);
      upsertJob({ id: "convert", label: copy.convertAction, progress: 55, status: "running" });
      const canvas = renderImageToCanvas(
        sourceImage,
        { width: sourceImage.naturalWidth, height: sourceImage.naturalHeight },
        selectedFormat.preservesTransparency ? undefined : "#ffffff",
      );
      const convertedBlob = await encodeCanvasToImageBlob(canvas, {
        mimeType: selectedFormat.mime,
        quality: selectedFormat.quality,
        fallbackError: copy.errors.generateFailed,
      });

      setPreviewFromBlob(convertedBlob);
      upsertJob({ id: "convert", label: copy.convertAction, progress: 100, status: "done" });
      notifications.success(copy.resultReady);
      window.setTimeout(() => removeJob("convert"), 1200);
    } catch (conversionError) {
      console.error("Error converting image:", conversionError);
      const message = conversionError instanceof Error ? conversionError.message : copy.errors.genericFailed;
      setError(message);
      upsertJob({ id: "convert", label: copy.convertAction, progress: 100, status: "error", error: message });
      notifications.error(message);
    }
  };

  const downloadImage = () => {
    if (!previewUrl) {
      return;
    }

    const selectedFormat =
      availableOutputFormats.find((format) => format.value === editor.settings.outputFormat) ?? availableOutputFormats[0] ?? OUTPUT_FORMATS[0];
    exportFile(previewUrl, `converted-${Date.now()}.${selectedFormat.extension}`);
  };

  const currentOutputFormat =
    availableOutputFormats.find((format) => format.value === editor.settings.outputFormat) ?? availableOutputFormats[0] ?? OUTPUT_FORMATS[0];
  const formatOptions = useMemo(
    () => availableOutputFormats.map((format) => ({ value: format.value, label: format.label })),
    [availableOutputFormats],
  );

  return (
    <EditorShell
      hero={
        <ToolHero
          pageId="convert"
          icon={<RefreshCw className="h-6 w-6 text-white" />}
          title={t("tools.convert.title")}
          description={copy.heroDescription}
          badgeClassName="bg-gradient-to-br from-green-500 to-emerald-500"
        />
      }
      topSlot={<AdSlot slot="convert-top-placement" className="h-24" />}
      sidebar={
        <ToolSidebar
          title={copy.uploadTitle}
          description={copy.uploadDescription}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          onUndo={() => {
            editor.undo();
            clearPreview();
          }}
          onRedo={() => {
            editor.redo();
            clearPreview();
          }}
          undoLabel={t("common.undo")}
          redoLabel={t("common.redo")}
        >
          <UploadArea idleLabel={copy.dropIdle} activeLabel={copy.dropActive} hint={copy.fileHint} onFilesAccepted={onDrop} />

          {sourceUrl ? (
            <div className="space-y-3">
              <ImageCanvasPreview
                imageSrc={sourceUrl}
                alt={copy.originalAlt}
                imageClassName="w-full rounded-lg border"
                imageStyle={{ maxHeight: "220px", objectFit: "contain" }}
              />
              <p className="text-center text-xs text-muted-foreground">{file?.name}</p>
            </div>
          ) : null}

          <PresetSelector
            label={copy.formatLabel}
            options={formatOptions}
            value={editor.settings.outputFormat}
            hint={`${copy.availableFormatsPrefix} ${availableOutputFormats.map((format) => format.label).join(", ")}.`}
            onValueChange={(value) => {
              editor.updateSettings({ outputFormat: value as OutputFormatValue });
              clearPreview();
            }}
          />

          <Button onClick={convertImage} disabled={!file || Boolean(activeJob)} className="w-full bg-gradient-primary text-primary-foreground">
            {activeJob ? t("common.processing") : copy.convertAction}
          </Button>

          {activeJob ? (
            <p className="text-xs text-muted-foreground">
              {activeJob.label} - {activeJob.progress}%
            </p>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </ToolSidebar>
      }
      preview={
        <ExportPanel title={copy.resultTitle} description={copy.resultDescription}>
          {previewUrl ? (
            <div className="space-y-4">
              <ImageCanvasPreview
                imageSrc={previewUrl}
                alt={copy.resultAlt}
                imageClassName="w-full rounded-lg border"
                imageStyle={{ maxHeight: "220px", objectFit: "contain" }}
              />
              <ExportControls label={`${t("common.download")} ${currentOutputFormat.label}`} onDownload={downloadImage} />
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground">
              <RefreshCw className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>{copy.emptyResult}</p>
            </div>
          )}
        </ExportPanel>
      }
      footer={<LocalProcessingNotice contained={false} className="pb-0" />}
    />
  );
};

export default ConvertPage;
