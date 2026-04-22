import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Upload, Download, Maximize2, Loader2, AlertCircle, ImageIcon, Minus, Plus } from "@/components/icons";

import ToolHero from "@/components/ToolHero";
import { AdSlot } from "@/components/ads/AdSlot";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { upscaleCanvas, type UpscaleFactor } from "@/utils/upscale";
import {
  RESIZE_UPSCALE_COPY,
  type UpscaleCopy,
  type UpscaleCopyLocale,
  type UpscalePreset,
} from "@/content/resizeUpscaleCopy";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
const MIN_UPSCALE_FACTOR = 2;
const MAX_UPSCALE_FACTOR = 10;

const clampUpscaleFactor = (value: number): UpscaleFactor => {
  if (!Number.isFinite(value)) {
    return MIN_UPSCALE_FACTOR as UpscaleFactor;
  }

  return Math.min(MAX_UPSCALE_FACTOR, Math.max(MIN_UPSCALE_FACTOR, Math.round(value))) as UpscaleFactor;
};

const getPresetById = (presets: readonly UpscalePreset[], id: string) =>
  presets.find((preset) => preset.id === id);

const ResizeUpscalePage: React.FC = () => {
  const { t, language } = useLanguage();
  const locale = language as UpscaleCopyLocale;
  const copy: UpscaleCopy = RESIZE_UPSCALE_COPY[locale];

  const [selectedPreset, setSelectedPreset] = useState<string>(copy.presets[0].id);
  const [customWidth, setCustomWidth] = useState<string>("");
  const [customHeight, setCustomHeight] = useState<string>("");
  const [keepAspect, setKeepAspect] = useState<boolean>(true);
  const [upscaleFactor, setUpscaleFactor] = useState<UpscaleFactor>(2);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null);
  const [resultSize, setResultSize] = useState<{ width: number; height: number } | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const aspectRatio = useMemo(() => {
    if (!originalSize || originalSize.height === 0) {
      return null;
    }
    return originalSize.width / originalSize.height;
  }, [originalSize]);

  useEffect(() => {
    return () => {
      if (sourceUrl) {
        URL.revokeObjectURL(sourceUrl);
      }
      abortControllerRef.current?.abort();
    };
  }, [sourceUrl]);

  const resetResultState = useCallback(() => {
    resultCanvasRef.current = null;
    setResultSize(null);
    setIsDirty(true);
  }, []);

  const updateUpscaleFactor = useCallback(
    (value: number) => {
      setUpscaleFactor(clampUpscaleFactor(value));
      resetResultState();
    },
    [resetResultState],
  );

  const updatePreviewCanvas = useCallback((source: HTMLCanvasElement | HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const width = source instanceof HTMLCanvasElement ? source.width : source.naturalWidth || source.width;
    const height = source instanceof HTMLCanvasElement ? source.height : source.naturalHeight || source.height;

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(source, 0, 0, width, height);
  }, []);

  const validateFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
        throw new Error(copy.messages.unsupportedFormat);
      }
      if (file.size > 20 * 1024 * 1024) {
        throw new Error(copy.messages.fileTooLarge);
      }
    },
    [copy.messages.fileTooLarge, copy.messages.unsupportedFormat],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        validateFile(file);
      } catch (validationError) {
        setError(validationError instanceof Error ? validationError.message : copy.messages.unsupportedFormat);
        event.target.value = "";
        return;
      }

      setError(null);
      setInfo(null);
      setIsDirty(true);
      setFileName(file.name);
      setSelectedPreset(copy.presets[0].id);
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;

      const objectUrl = URL.createObjectURL(file);
      setSourceUrl((url) => {
        if (url) URL.revokeObjectURL(url);
        return objectUrl;
      });

      const image = new Image();
      image.onload = () => {
        imageElementRef.current = image;
        setOriginalSize({ width: image.naturalWidth, height: image.naturalHeight });
        setCustomWidth(String(image.naturalWidth));
        setCustomHeight(String(image.naturalHeight));
        setResultSize(null);
        resultCanvasRef.current = null;
        updatePreviewCanvas(image);
      };
      image.onerror = () => {
        setError(copy.messages.genericFailure);
        URL.revokeObjectURL(objectUrl);
      };
      image.src = objectUrl;
    },
    [copy, updatePreviewCanvas, validateFile],
  );

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    resetResultState();

    const preset = getPresetById(copy.presets, value);
    if (!preset) return;

    if (preset.width && preset.height) {
      setCustomWidth(String(preset.width));
      setCustomHeight(String(preset.height));
      setKeepAspect(false);
    } else if (originalSize) {
      setCustomWidth(String(originalSize.width));
      setCustomHeight(String(originalSize.height));
      setKeepAspect(true);
    }
  };

  const handleWidthChange = (value: string) => {
    setCustomWidth(value);
    resetResultState();

    if (keepAspect && aspectRatio && value) {
      const numericWidth = Number(value);
      if (!Number.isNaN(numericWidth) && numericWidth > 0) {
        setCustomHeight(String(Math.round(numericWidth / aspectRatio)));
      }
    }
  };

  const handleHeightChange = (value: string) => {
    setCustomHeight(value);
    resetResultState();

    if (keepAspect && aspectRatio && value) {
      const numericHeight = Number(value);
      if (!Number.isNaN(numericHeight) && numericHeight > 0) {
        setCustomWidth(String(Math.round(numericHeight * aspectRatio)));
      }
    }
  };

  const computeTargetDimensions = useCallback(() => {
    const image = imageElementRef.current;
    if (!image) {
      throw new Error(copy.messages.missingImage);
    }

    const fallbackWidth = image.naturalWidth;
    const fallbackHeight = image.naturalHeight;

    let width = Number(customWidth);
    let height = Number(customHeight);

    if (!Number.isFinite(width) || width <= 0) {
      width = fallbackWidth;
    }

    if (!Number.isFinite(height) || height <= 0) {
      height = fallbackHeight;
    }

    if (keepAspect && aspectRatio) {
      height = Math.round(width / aspectRatio);
    }

    return {
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    };
  }, [aspectRatio, copy.messages.missingImage, customHeight, customWidth, keepAspect]);

  const handleProcess = async () => {
    if (processing) {
      return;
    }

    setError(null);
    setInfo(null);

    const image = imageElementRef.current;
    if (!image) {
      setError(copy.messages.missingImage);
      return;
    }

    const { width, height } = computeTargetDimensions();

    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = width;
    baseCanvas.height = height;
    const context = baseCanvas.getContext("2d");

    if (!context) {
      setError(copy.messages.canvasUnsupported);
      return;
    }

    context.drawImage(image, 0, 0, width, height);
    updatePreviewCanvas(baseCanvas);

    if (upscaleFactor === 1) {
      resultCanvasRef.current = baseCanvas;
      setResultSize({ width, height });
      setIsDirty(false);
      setProgress(100);
      setInfo(copy.messages.resizedOnly);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setProcessing(true);
    setProgress(1);

    try {
      const { canvas } = await upscaleCanvas(baseCanvas, {
        factor: upscaleFactor,
        signal: controller.signal,
        onProgress: (value) => {
          if (controller.signal.aborted) return;
          setProgress(Math.max(1, Math.min(100, Math.round(value))));
        },
      });

      resultCanvasRef.current = canvas;
      setResultSize({ width: canvas.width, height: canvas.height });
      updatePreviewCanvas(canvas);
      setIsDirty(false);
      setInfo(copy.messages.upscalingComplete);
    } catch (processingError) {
      if ((processingError as Error)?.name === "AbortError") {
        setInfo(copy.messages.processingCancelled);
      } else {
        setError(
          processingError instanceof Error
            ? processingError.message
            : copy.messages.genericFailure,
        );
      }
    } finally {
      abortControllerRef.current = null;
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;

    const suggestedName = fileName ? fileName.replace(/\.[^.]+$/, "") : "upscaled-image";

    canvas.toBlob((blob) => {
      if (!blob) {
        setError(copy.messages.downloadError);
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${suggestedName}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
    }, "image/png", 1);
  };

  const resetEditor = () => {
    setSelectedPreset(copy.presets[0].id);
    setCustomWidth(originalSize ? String(originalSize.width) : "");
    setCustomHeight(originalSize ? String(originalSize.height) : "");
    setKeepAspect(true);
    setUpscaleFactor(2);
    setError(null);
    setInfo(null);
    setResultSize(null);
    setProgress(0);
    setIsDirty(true);
    resultCanvasRef.current = null;
    if (imageElementRef.current) {
      updatePreviewCanvas(imageElementRef.current);
    }
  };

  const canProcess = Boolean(imageElementRef.current) && !processing;
  const canDownload = Boolean(resultCanvasRef.current) && !processing;

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-10">
      <ToolHero
        pageId="resizeUpscale"
        icon={<Maximize2 className="h-7 w-7 text-white" />}
        title={copy.heroTitle}
        description={copy.heroDescription}
        badgeClassName="bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500"
      />

      <AdSlot slot="ad-top" className="h-28" />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader className="space-y-2">
            <CardTitle>{copy.controlsTitle}</CardTitle>
            <CardDescription>{copy.controlsDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image-upload">{copy.imageLabel}</Label>
              <Input
                id="image-upload"
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleFileChange}
                disabled={processing}
              />
              <p className="text-xs text-muted-foreground">{copy.formatHint}</p>
              {fileName && (
                <p className="text-xs text-muted-foreground">
                  {copy.selectedPrefix} {fileName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{copy.presetLabel}</Label>
              <Select value={selectedPreset} onValueChange={handlePresetChange} disabled={!originalSize || processing}>
                <SelectTrigger>
                  <SelectValue placeholder={copy.presetPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {copy.presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="custom-width">{copy.widthLabel}</Label>
                <Input
                  id="custom-width"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={customWidth}
                  onChange={(event) => handleWidthChange(event.target.value)}
                  disabled={!originalSize || processing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-height">{copy.heightLabel}</Label>
                <Input
                  id="custom-height"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={customHeight}
                  onChange={(event) => handleHeightChange(event.target.value)}
                  disabled={!originalSize || processing}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="keep-aspect"
                checked={keepAspect}
                onCheckedChange={(checked) => {
                  if (typeof checked === "boolean") {
                    setKeepAspect(checked);
                    resetResultState();
                  }
                }}
                disabled={!originalSize || processing}
              />
              <Label htmlFor="keep-aspect">{copy.keepAspectLabel}</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upscale-factor">{copy.upscaleLabel}</Label>
              <div className="grid grid-cols-[2.5rem_1fr_2.5rem] gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={copy.decreaseUpscaleLabel}
                  disabled={!originalSize || processing || upscaleFactor <= MIN_UPSCALE_FACTOR}
                  onClick={() => updateUpscaleFactor(upscaleFactor - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Input
                    id="upscale-factor"
                    type="number"
                    min={MIN_UPSCALE_FACTOR}
                    max={MAX_UPSCALE_FACTOR}
                    step={1}
                    inputMode="numeric"
                    value={upscaleFactor}
                    onChange={(event) => updateUpscaleFactor(Number(event.target.value))}
                    disabled={!originalSize || processing}
                    className="h-10 pr-9 text-center text-base font-semibold"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    ×
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={copy.increaseUpscaleLabel}
                  disabled={!originalSize || processing || upscaleFactor >= MAX_UPSCALE_FACTOR}
                  onClick={() => updateUpscaleFactor(upscaleFactor + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {copy.upscaleFactors.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={upscaleFactor === option.value ? "default" : "outline"}
                    size="sm"
                    disabled={!originalSize || processing}
                    onClick={() => updateUpscaleFactor(option.value)}
                    className="h-8 px-2 text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{copy.upscaleRangeHelp}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={resetEditor} disabled={!originalSize || processing}>
              {copy.resetButton}
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleProcess} disabled={!canProcess || !isDirty}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.processing')}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> {copy.processButton}
                  </>
                )}
              </Button>
              <Button variant="secondary" onClick={handleDownload} disabled={!canDownload}>
                <Download className="mr-2 h-4 w-4" /> {copy.downloadButton}
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className="min-h-[420px]">
            <CardHeader className="space-y-1">
              <CardTitle>{copy.previewTitle}</CardTitle>
              <CardDescription>
                {copy.previewDescription(resultSize ?? undefined, originalSize ?? undefined)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-full items-center justify-center bg-muted/30 p-4">
              <div className="relative flex w-full items-center justify-center overflow-auto rounded-lg border border-dashed border-border bg-background p-4">
                {originalSize ? (
                  <canvas ref={canvasRef} className="max-h-[520px] w-full max-w-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                    <p className="max-w-xs text-sm">{copy.previewPlaceholder}</p>
                  </div>
                )}
              </div>
            </CardContent>
            {processing || progress > 0 ? (
              <CardFooter className="flex items-center gap-3">
                <Progress value={progress} className="flex-1" />
                <span className="text-sm font-medium text-muted-foreground">{Math.min(progress, 100)}%</span>
              </CardFooter>
            ) : null}
          </Card>

          <AdSlot slot="ad-middle" className="h-28" />

          {(error || info) && (
            <Alert variant={error ? "destructive" : "default"}>
              {error ? <AlertCircle className="h-4 w-4" /> : <Loader2 className="h-4 w-4" />}
              <AlertTitle>{error ? copy.statusErrorTitle : copy.statusInfoTitle}</AlertTitle>
              <AlertDescription>{error ?? info}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

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

      <AdSlot slot="ad-bottom" className="h-28" />
    </div>
  );
};

export default ResizeUpscalePage;
