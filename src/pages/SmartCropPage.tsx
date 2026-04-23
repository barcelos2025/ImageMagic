import React, { useEffect, useMemo, useState } from "react";
import { ImageIcon, Scissors } from "@/components/icons";

import ToolHero from "@/components/ToolHero";
import { AdSlot } from "@/components/ads/AdSlot";
import {
  EditorShell,
  EditorToolbar,
  ExportControls,
  ExportPanel,
  ImageCanvasPreview,
  PresetSelector,
  ToolSidebar,
  UploadArea,
} from "@/components/editor";
import LocalProcessingNotice from "@/components/LocalProcessingNotice";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useEditorExport,
  useEditorFiles,
  useEditorJobs,
  useEditorNotifications,
  useEditorPresets,
  useEditorPreview,
  useEditorState,
} from "@/hooks/editor";
import { cropImageToCanvas, encodeCanvasToImageBlob, loadImageElement } from "@/lib/image-engine";
import { Locale } from "@/lib/seo/siteConfig";

const CROP_PRESETS = [
  {
    value: "square",
    width: 1080,
    height: 1080,
    label: { en: "Square post", pt: "Post quadrado", es: "Post cuadrado" },
    description: { en: "Feeds and product grids", pt: "Feeds e vitrines de produto", es: "Feeds y grillas de producto" },
  },
  {
    value: "story",
    width: 1080,
    height: 1920,
    label: { en: "Story / Reel", pt: "Story / Reel", es: "Story / Reel" },
    description: { en: "Vertical social format", pt: "Formato vertical para redes", es: "Formato vertical para redes" },
  },
  {
    value: "portrait",
    width: 1080,
    height: 1350,
    label: { en: "Portrait feed", pt: "Feed vertical", es: "Feed vertical" },
    description: { en: "4:5 social posts", pt: "Posts sociais em 4:5", es: "Posts sociales en 4:5" },
  },
  {
    value: "banner",
    width: 1600,
    height: 900,
    label: { en: "Wide banner", pt: "Banner amplo", es: "Banner amplio" },
    description: { en: "Web hero and landing pages", pt: "Hero web e landing pages", es: "Hero web y landing pages" },
  },
  {
    value: "thumbnail",
    width: 1280,
    height: 720,
    label: { en: "Video thumbnail", pt: "Miniatura de video", es: "Miniatura de video" },
    description: { en: "16:9 previews", pt: "Previas em 16:9", es: "Vistas previas en 16:9" },
  },
] as const;

const FOCUS_OPTIONS = [
  { value: "center", label: { en: "Center", pt: "Centro", es: "Centro" } },
  { value: "top", label: { en: "Top", pt: "Topo", es: "Arriba" } },
  { value: "bottom", label: { en: "Bottom", pt: "Base", es: "Abajo" } },
  { value: "left", label: { en: "Left", pt: "Esquerda", es: "Izquierda" } },
  { value: "right", label: { en: "Right", pt: "Direita", es: "Derecha" } },
] as const;

type CropPresetValue = (typeof CROP_PRESETS)[number]["value"] | "custom";
type FocusValue = (typeof FOCUS_OPTIONS)[number]["value"];
type CropSize = { width: number; height: number };

const CUSTOM_CROP_COOKIE = "imagemagic-smart-crop-size";
const DEFAULT_CUSTOM_SIZE: CropSize = { width: 1200, height: 1200 };

const SMART_CROP_COPY: Record<
  Locale,
  {
    heroDescription: string;
    uploadTitle: string;
    uploadDescription: string;
    dropIdle: string;
    dropActive: string;
    fileHint: string;
    originalAlt: string;
    presetLabel: string;
    focusLabel: string;
    presetHint: string;
    customLabel: string;
    customDescription: string;
    customWidth: string;
    customHeight: string;
    saveCustom: string;
    customSaved: string;
    customInvalid: string;
    action: string;
    resultTitle: string;
    resultDescription: string;
    resultAlt: string;
    emptyResult: string;
    download: string;
    resultReady: string;
    errors: {
      decodeFailed: string;
      generateFailed: string;
      genericFailed: string;
    };
  }
> = {
  en: {
    heroDescription: "Crop images into production-ready ratios for social, ecommerce, thumbnails, and banners.",
    uploadTitle: "Upload image",
    uploadDescription: "Choose a preset and the focal area. ImageMagic crops locally and keeps the exported result ready for use.",
    dropIdle: "Drag and drop an image here, or click to select.",
    dropActive: "Drop the image here.",
    fileHint: "PNG, JPG, WEBP, AVIF, GIF, BMP, SVG, and browser-readable images up to 20 MB.",
    originalAlt: "Original image preview",
    presetLabel: "Crop preset",
    focusLabel: "Keep focus on",
    presetHint: "The output uses the exact preset dimensions shown in the selector.",
    customLabel: "Custom size",
    customDescription: "Saved locally in a browser cookie for your next visits.",
    customWidth: "Width",
    customHeight: "Height",
    saveCustom: "Save custom size",
    customSaved: "Custom crop size saved locally.",
    customInvalid: "Use values between 64 and 8000 pixels.",
    action: "Create crop",
    resultTitle: "Result",
    resultDescription: "Click the preview to inspect the crop before downloading.",
    resultAlt: "Cropped image preview",
    emptyResult: "Upload an image and create a crop to review the result here.",
    download: "Download PNG",
    resultReady: "Crop ready.",
    errors: {
      decodeFailed: "The selected image could not be decoded in this browser.",
      generateFailed: "Unable to generate the cropped image.",
      genericFailed: "The crop could not be generated.",
    },
  },
  pt: {
    heroDescription: "Corte imagens em proporções prontas para redes sociais, ecommerce, miniaturas e banners.",
    uploadTitle: "Enviar imagem",
    uploadDescription: "Escolha um preset e a área de foco. O ImageMagic corta localmente e deixa o resultado pronto para uso.",
    dropIdle: "Arraste uma imagem até aqui ou clique para selecionar.",
    dropActive: "Solte a imagem aqui.",
    fileHint: "PNG, JPG, WEBP, AVIF, GIF, BMP, SVG e imagens legíveis pelo navegador até 20 MB.",
    originalAlt: "Pré-visualização da imagem original",
    presetLabel: "Preset de corte",
    focusLabel: "Manter foco em",
    presetHint: "A saída usa exatamente as dimensões exibidas no seletor.",
    customLabel: "Tamanho personalizado",
    customDescription: "Salvo localmente em um cookie do navegador para suas próximas visitas.",
    customWidth: "Largura",
    customHeight: "Altura",
    saveCustom: "Salvar tamanho",
    customSaved: "Tamanho personalizado salvo localmente.",
    customInvalid: "Use valores entre 64 e 8000 pixels.",
    action: "Criar corte",
    resultTitle: "Resultado",
    resultDescription: "Clique na prévia para conferir o corte antes de baixar.",
    resultAlt: "Pré-visualização da imagem cortada",
    emptyResult: "Envie uma imagem e crie um corte para revisar o resultado aqui.",
    download: "Baixar PNG",
    resultReady: "Corte pronto.",
    errors: {
      decodeFailed: "A imagem selecionada não pôde ser decodificada neste navegador.",
      generateFailed: "Não foi possível gerar a imagem cortada.",
      genericFailed: "Não foi possível gerar o corte.",
    },
  },
  es: {
    heroDescription: "Recorta imágenes en proporciones listas para redes sociales, ecommerce, miniaturas y banners.",
    uploadTitle: "Subir imagen",
    uploadDescription: "Elige un preset y el área de foco. ImageMagic recorta localmente y deja el resultado listo para usar.",
    dropIdle: "Arrastra una imagen hasta aquí o haz clic para seleccionarla.",
    dropActive: "Suelta la imagen aquí.",
    fileHint: "PNG, JPG, WEBP, AVIF, GIF, BMP, SVG e imágenes legibles por el navegador hasta 20 MB.",
    originalAlt: "Vista previa de la imagen original",
    presetLabel: "Preset de recorte",
    focusLabel: "Mantener foco en",
    presetHint: "La salida usa exactamente las dimensiones mostradas en el selector.",
    customLabel: "Tamaño personalizado",
    customDescription: "Guardado localmente en una cookie del navegador para tus próximas visitas.",
    customWidth: "Ancho",
    customHeight: "Alto",
    saveCustom: "Guardar tamaño",
    customSaved: "Tamaño personalizado guardado localmente.",
    customInvalid: "Usa valores entre 64 y 8000 píxeles.",
    action: "Crear recorte",
    resultTitle: "Resultado",
    resultDescription: "Haz clic en la vista previa para revisar el recorte antes de descargar.",
    resultAlt: "Vista previa de la imagen recortada",
    emptyResult: "Sube una imagen y crea un recorte para revisar el resultado aquí.",
    download: "Descargar PNG",
    resultReady: "Recorte listo.",
    errors: {
      decodeFailed: "La imagen seleccionada no pudo decodificarse en este navegador.",
      generateFailed: "No se pudo generar la imagen recortada.",
      genericFailed: "No se pudo generar el recorte.",
    },
  },
};

const isValidCropSize = ({ width, height }: CropSize) =>
  Number.isFinite(width) && Number.isFinite(height) && width >= 64 && height >= 64 && width <= 8000 && height <= 8000;

const getFocusedOffset = (available: number, focus: FocusValue, axis: "x" | "y") => {
  if (available <= 0) return 0;
  if (axis === "x" && focus === "left") return 0;
  if (axis === "x" && focus === "right") return available;
  if (axis === "y" && focus === "top") return 0;
  if (axis === "y" && focus === "bottom") return available;
  return available / 2;
};

const SmartCropPage = () => {
  const { language, t } = useLanguage();
  const copy = SMART_CROP_COPY[language];
  const { file, sourceUrl, setAcceptedFiles } = useEditorFiles();
  const { previewUrl, clearPreview, setPreviewFromBlob } = useEditorPreview();
  const { exportFile } = useEditorExport();
  const notifications = useEditorNotifications();
  const { jobs, upsertJob, removeJob } = useEditorJobs();
  const presetStorage = useEditorPresets<CropSize>(CUSTOM_CROP_COOKIE, DEFAULT_CUSTOM_SIZE);
  const editor = useEditorState({
    preset: "square" as CropPresetValue,
    focus: "center" as FocusValue,
    customSize: DEFAULT_CUSTOM_SIZE,
  });
  const { syncSettings } = editor;
  const [error, setError] = useState<string | null>(null);
  const [customStatus, setCustomStatus] = useState("");
  const activeJob = jobs.find((job) => job.status === "running") ?? null;

  useEffect(() => {
    syncSettings((current) => ({ ...current, customSize: presetStorage.value }));
  }, [presetStorage.value, syncSettings]);

  const selectedPreset = useMemo(
    () => CROP_PRESETS.find((item) => item.value === editor.settings.preset) ?? CROP_PRESETS[0],
    [editor.settings.preset],
  );

  const selectedSize =
    editor.settings.preset === "custom"
      ? editor.settings.customSize
      : { width: selectedPreset.width, height: selectedPreset.height };

  const presetOptions = useMemo(
    () => [
      ...CROP_PRESETS.map((item) => ({
        value: item.value,
        label: `${item.label[language]} - ${item.width}x${item.height}`,
      })),
      {
        value: "custom",
        label: `${copy.customLabel} - ${editor.settings.customSize.width}x${editor.settings.customSize.height}`,
      },
    ],
    [copy.customLabel, editor.settings.customSize.height, editor.settings.customSize.width, language],
  );

  const focusOptions = useMemo(
    () => FOCUS_OPTIONS.map((item) => ({ value: item.value, label: item.label[language] })),
    [language],
  );

  const saveCustomSize = () => {
    if (!isValidCropSize(editor.settings.customSize)) {
      setCustomStatus(copy.customInvalid);
      notifications.error(copy.customInvalid);
      return;
    }

    presetStorage.saveValue(editor.settings.customSize);
    setCustomStatus(copy.customSaved);
    notifications.success(copy.customSaved);
    clearPreview();
  };

  const onDrop = (acceptedFiles: File[]) => {
    setAcceptedFiles(acceptedFiles);
    clearPreview();
    setError(null);
  };

  const createCrop = async () => {
    if (!sourceUrl) {
      return;
    }

    setError(null);
    upsertJob({ id: "smart-crop", label: copy.action, progress: 15, status: "running" });

    try {
      const source = await loadImageElement(sourceUrl, copy.errors.decodeFailed);

      if (!isValidCropSize(selectedSize)) {
        throw new Error(copy.customInvalid);
      }

      const targetRatio = selectedSize.width / selectedSize.height;
      let sourceWidth = source.naturalWidth;
      let sourceHeight = sourceWidth / targetRatio;

      if (sourceHeight > source.naturalHeight) {
        sourceHeight = source.naturalHeight;
        sourceWidth = sourceHeight * targetRatio;
      }

      const maxX = source.naturalWidth - sourceWidth;
      const maxY = source.naturalHeight - sourceHeight;
      const sourceX = getFocusedOffset(maxX, editor.settings.focus, "x");
      const sourceY = getFocusedOffset(maxY, editor.settings.focus, "y");

      upsertJob({ id: "smart-crop", label: copy.action, progress: 55, status: "running" });

      const canvas = cropImageToCanvas(source, {
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        targetWidth: selectedSize.width,
        targetHeight: selectedSize.height,
      });

      const blob = await encodeCanvasToImageBlob(canvas, {
        mimeType: "image/png",
        fallbackError: copy.errors.generateFailed,
      });

      setPreviewFromBlob(blob);
      upsertJob({ id: "smart-crop", label: copy.action, progress: 100, status: "done" });
      notifications.success(copy.resultReady);
      window.setTimeout(() => removeJob("smart-crop"), 1200);
    } catch (cropError) {
      console.error("Error creating crop:", cropError);
      const message = cropError instanceof Error ? cropError.message : copy.errors.genericFailed;
      setError(message);
      upsertJob({ id: "smart-crop", label: copy.action, progress: 100, status: "error", error: message });
      notifications.error(message);
    }
  };

  const downloadCrop = () => {
    if (!previewUrl) {
      return;
    }

    exportFile(previewUrl, `smart-crop-${selectedSize.width}x${selectedSize.height}-${Date.now()}.png`);
  };

  return (
    <EditorShell
      hero={
        <ToolHero
          pageId="smartCrop"
          icon={<Scissors className="h-6 w-6 text-white" />}
          title={t("tools.smartCrop.title")}
          description={copy.heroDescription}
          badgeClassName="bg-gradient-to-br from-lime-600 to-emerald-600"
        />
      }
      topSlot={<AdSlot slot="smart-crop-top-placement" className="h-24" />}
      sidebar={
        <ToolSidebar
          title={copy.uploadTitle}
          description={copy.uploadDescription}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          onUndo={() => {
            editor.undo();
            clearPreview();
            setCustomStatus("");
          }}
          onRedo={() => {
            editor.redo();
            clearPreview();
            setCustomStatus("");
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
                imageStyle={{ maxHeight: "240px", objectFit: "contain" }}
              />
              <p className="text-center text-xs text-muted-foreground">{file?.name}</p>
            </div>
          ) : null}

          <EditorToolbar>
            <PresetSelector
              label={copy.presetLabel}
              options={presetOptions}
              value={editor.settings.preset}
              hint={editor.settings.preset === "custom" ? copy.customDescription : selectedPreset.description[language]}
              onValueChange={(value) => {
                editor.updateSettings({ preset: value as CropPresetValue });
                setCustomStatus("");
                clearPreview();
              }}
            />
            <PresetSelector
              label={copy.focusLabel}
              options={focusOptions}
              value={editor.settings.focus}
              hint={copy.presetHint}
              onValueChange={(value) => {
                editor.updateSettings({ focus: value as FocusValue });
                clearPreview();
              }}
            />
          </EditorToolbar>

          {editor.settings.preset === "custom" ? (
            <div className="rounded-lg border border-border/70 bg-background/70 p-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{copy.customWidth}</label>
                  <Input
                    type="number"
                    min={64}
                    max={8000}
                    value={editor.settings.customSize.width}
                    onChange={(event) => {
                      editor.updateSettings((current) => ({
                        ...current,
                        customSize: { ...current.customSize, width: Number(event.target.value) },
                      }));
                      setCustomStatus("");
                      clearPreview();
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{copy.customHeight}</label>
                  <Input
                    type="number"
                    min={64}
                    max={8000}
                    value={editor.settings.customSize.height}
                    onChange={(event) => {
                      editor.updateSettings((current) => ({
                        ...current,
                        customSize: { ...current.customSize, height: Number(event.target.value) },
                      }));
                      setCustomStatus("");
                      clearPreview();
                    }}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={saveCustomSize}>
                  {copy.saveCustom}
                </Button>
              </div>
              {customStatus ? <p className="mt-3 text-xs text-muted-foreground">{customStatus}</p> : null}
            </div>
          ) : null}

          <Button onClick={createCrop} disabled={!file || Boolean(activeJob)} className="w-full bg-gradient-primary text-primary-foreground">
            {activeJob ? t("common.processing") : copy.action}
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
                imageStyle={{ maxHeight: "320px", objectFit: "contain" }}
              />
              <ExportControls label={copy.download} onDownload={downloadCrop} />
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>{copy.emptyResult}</p>
            </div>
          )}
        </ExportPanel>
      }
      footer={<LocalProcessingNotice contained={false} className="pb-0" />}
    />
  );
};

export default SmartCropPage;
