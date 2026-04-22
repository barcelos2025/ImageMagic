export type UpscaleFactor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type AiUpscaleFactor = 2 | 4 | 8;

export interface UpscaleOptions {
  factor: UpscaleFactor;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
  patchSize?: number;
  padding?: number;
  maxAiOutputSide?: number;
}

export interface UpscaleResult {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  appliedFactor: number;
}

type UpscaleModelDefinition = Record<string, unknown>;

type UpscaleModelModule = {
  default: UpscaleModelDefinition;
};

type TensorFlowModule = typeof import("@tensorflow/tfjs");
type TfBackendName = "webgl" | "cpu";

const DEFAULT_MAX_AI_OUTPUT_SIDE = 4096;

const MODEL_LOADERS: Record<AiUpscaleFactor, () => Promise<UpscaleModelModule>> = {
  2: () => import("@upscalerjs/esrgan-thick/2x") as Promise<UpscaleModelModule>,
  4: () => import("@upscalerjs/esrgan-thick/4x") as Promise<UpscaleModelModule>,
  8: () => import("@upscalerjs/esrgan-thick/8x") as Promise<UpscaleModelModule>,
};

type UpscalerInstance = {
  upscale: (
    input: HTMLCanvasElement | HTMLImageElement | ImageData | string,
    options?: Record<string, unknown>,
  ) => Promise<HTMLCanvasElement | HTMLImageElement | ImageData | string>;
  ready?: Promise<void>;
  dispose?: () => Promise<void> | void;
};

type UpscalerModule = {
  default: new (config: Record<string, unknown>) => UpscalerInstance;
};

let tfModulePromise: Promise<TensorFlowModule> | null = null;
let modulePromise: Promise<UpscalerModule> | null = null;
const upscalerCache = new Map<string, Promise<UpscalerInstance>>();
const modelDefinitionCache = new Map<number, Promise<UpscaleModelDefinition>>();
let webglCompatibilityConfigured = false;

const loadTensorFlowModule = async (): Promise<TensorFlowModule> => {
  if (!tfModulePromise) {
    tfModulePromise = import("@tensorflow/tfjs");
  }
  return tfModulePromise;
};

const loadUpscalerModule = async (): Promise<UpscalerModule> => {
  if (!modulePromise) {
    modulePromise = import("upscaler") as Promise<UpscalerModule>;
  }
  return modulePromise;
};

const loadModelDefinition = async (factor: AiUpscaleFactor): Promise<UpscaleModelDefinition> => {
  if (!modelDefinitionCache.has(factor)) {
    modelDefinitionCache.set(factor, MODEL_LOADERS[factor]().then((module) => module.default));
  }

  return modelDefinitionCache.get(factor)!;
};

const configureWebGlCompatibility = (tf: TensorFlowModule) => {
  if (webglCompatibilityConfigured) {
    return;
  }

  webglCompatibilityConfigured = true;

  try {
    tf.env().set("WEBGL_PACK", false);
  } catch (_error) {
    // The flag may already be evaluated if another TFJS feature initialized WebGL.
  }
};

const prepareTensorFlowBackend = async (backend: TfBackendName) => {
  const tf = await loadTensorFlowModule();

  if (backend === "webgl") {
    configureWebGlCompatibility(tf);
  }

  const backendReady = await tf.setBackend(backend);
  if (!backendReady) {
    throw new Error(`TensorFlow backend "${backend}" is not available`);
  }

  await tf.ready();
};

const getUpscaler = async (factor: AiUpscaleFactor, backend: TfBackendName): Promise<UpscalerInstance> => {
  const cacheKey = `${backend}:${factor}`;

  if (!upscalerCache.has(cacheKey)) {
    const instancePromise = (async () => {
      await prepareTensorFlowBackend(backend);

      const [{ default: Upscaler }, model] = await Promise.all([
        loadUpscalerModule(),
        loadModelDefinition(factor),
      ]);

      const instance = new Upscaler({ model });
      await instance.ready;
      return instance;
    })().catch((error) => {
      upscalerCache.delete(cacheKey);
      throw error;
    });

    upscalerCache.set(cacheKey, instancePromise);
  }

  return upscalerCache.get(cacheKey)!;
};

const cloneCanvas = (source: HTMLCanvasElement): HTMLCanvasElement => {
  const copy = document.createElement("canvas");
  copy.width = source.width;
  copy.height = source.height;
  const context = copy.getContext("2d");
  if (context) {
    context.drawImage(source, 0, 0);
  }
  return copy;
};

const drawCanvas = (
  source: CanvasImageSource,
  width: number,
  height: number,
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
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

const resizeCanvasWithInterpolation = (
  source: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
): HTMLCanvasElement => {
  let workingCanvas = source;
  let guard = 0;

  while ((workingCanvas.width !== targetWidth || workingCanvas.height !== targetHeight) && guard < 32) {
    const nextWidth = getNextInterpolatedSize(workingCanvas.width, targetWidth);
    const nextHeight = getNextInterpolatedSize(workingCanvas.height, targetHeight);
    workingCanvas = drawCanvas(workingCanvas, nextWidth, nextHeight);
    guard += 1;
  }

  if (workingCanvas.width !== targetWidth || workingCanvas.height !== targetHeight) {
    return drawCanvas(workingCanvas, targetWidth, targetHeight);
  }

  return workingCanvas;
};

const normalizeProgressValue = (value: unknown): number => {
  if (typeof value === "number") {
    return value > 1 ? value / 100 : value;
  }

  if (value && typeof value === "object" && "percent" in value) {
    const percent = (value as { percent?: number }).percent ?? 0;
    return percent > 1 ? percent / 100 : percent;
  }

  return 0;
};

const inferPatchSize = (width: number, height: number, factor: number): number => {
  const maxDimension = Math.max(width, height) * factor;

  if (maxDimension > 7000) return 64;
  if (maxDimension > 5000) return 96;
  if (maxDimension > 4000) return 128;
  if (maxDimension > 3000) return 160;
  if (maxDimension > 2200) return 192;
  return 256;
};

const inferPadding = (patchSize: number): number => Math.max(8, Math.round(patchSize / 8));

const toAbortError = (reason?: unknown): Error => {
  if (reason instanceof Error) {
    return reason;
  }

  try {
    return new DOMException("Operation aborted", "AbortError");
  } catch (_error) {
    const abortError = new Error("Operation aborted");
    abortError.name = "AbortError";
    return abortError;
  }
};

const ensureCanvas = async (
  value: HTMLCanvasElement | HTMLImageElement | ImageData | string,
): Promise<HTMLCanvasElement> => {
  if (value instanceof HTMLCanvasElement) {
    return value;
  }

  if (value instanceof HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = value.naturalWidth || value.width;
    canvas.height = value.naturalHeight || value.height;
    const context = canvas.getContext("2d");
    context?.drawImage(value, 0, 0);
    return canvas;
  }

  if (value instanceof ImageData) {
    const canvas = document.createElement("canvas");
    canvas.width = value.width;
    canvas.height = value.height;
    const context = canvas.getContext("2d");
    context?.putImageData(value, 0, 0);
    return canvas;
  }

  if (typeof value === "string") {
    const image = await loadImage(value);
    return ensureCanvas(image);
  }

  throw new Error("Unsupported upscaler output type");
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load upscaled image"));
    image.src = src;
  });

const runSequence = async (
  base: HTMLCanvasElement,
  sequence: AiUpscaleFactor[],
  options: UpscaleOptions,
  backend: TfBackendName,
): Promise<[HTMLCanvasElement, number]> => {
  let working = cloneCanvas(base);
  let appliedFactor = 1;

  for (let index = 0; index < sequence.length; index += 1) {
    if (options.signal?.aborted) {
      throw toAbortError(options.signal.reason);
    }

    const factor = sequence[index];
    const totalStages = sequence.length;
    const patchSize = options.patchSize ?? inferPatchSize(working.width, working.height, factor);
    const padding = options.padding ?? inferPadding(patchSize);
    const upscaler = await getUpscaler(factor, backend);

    const reportProgress = options.onProgress
      ? (progressValue: unknown) => {
          const normalized = normalizeProgressValue(progressValue);
          const stageStart = index / totalStages;
          const stageSpan = 1 / totalStages;
          const percent = (stageStart + normalized * stageSpan) * 100;
          options.onProgress?.(Math.min(100, Math.max(0, percent)));
        }
      : undefined;

    const result = await upscaler.upscale(working, {
      patchSize,
      padding,
      output: "base64",
      awaitNextFrame: true,
      signal: options.signal,
      progress: reportProgress,
    } as Record<string, unknown>);

    reportProgress?.(1);

    working = await ensureCanvas(result);
    appliedFactor *= factor;
  }

  return [working, appliedFactor];
};

const getLargestSafeAiFactor = (
  factor: UpscaleFactor,
  width: number,
  height: number,
  maxOutputSide: number,
): 1 | AiUpscaleFactor => {
  if (factor <= 1) {
    return 1;
  }

  const candidates = [8, 4, 2].filter((candidate) => candidate <= factor) as AiUpscaleFactor[];
  return candidates.find((candidate) => width * candidate <= maxOutputSide && height * candidate <= maxOutputSide) ?? 1;
};

const getAttemptSequences = (factor: 1 | AiUpscaleFactor): AiUpscaleFactor[][] => {
  if (factor === 8) {
    return [[8], [4, 2], [2, 2, 2]];
  }

  if (factor === 4) {
    return [[4], [2, 2]];
  }

  if (factor === 2) {
    return [[2]];
  }

  return [];
};

export const upscaleCanvas = async (
  input: HTMLCanvasElement,
  options: UpscaleOptions,
): Promise<UpscaleResult> => {
  if (!input) {
    throw new Error("Input canvas is required for upscaling");
  }

  if (options.factor === 1) {
    const canvas = cloneCanvas(input);
    options.onProgress?.(100);
    return { canvas, width: canvas.width, height: canvas.height, appliedFactor: 1 };
  }

  const requestedWidth = Math.max(1, Math.round(input.width * options.factor));
  const requestedHeight = Math.max(1, Math.round(input.height * options.factor));
  const maxAiOutputSide = options.maxAiOutputSide ?? DEFAULT_MAX_AI_OUTPUT_SIDE;
  const aiFactor = getLargestSafeAiFactor(options.factor, input.width, input.height, maxAiOutputSide);

  if (aiFactor === 1) {
    const canvas = resizeCanvasWithInterpolation(input, requestedWidth, requestedHeight);
    options.onProgress?.(100);
    return { canvas, width: canvas.width, height: canvas.height, appliedFactor: 1 };
  }

  const attemptSequences = getAttemptSequences(aiFactor);

  if (!attemptSequences.length) {
    throw new Error(`Unsupported upscale factor: ${options.factor}`);
  }

  let lastError: unknown;

  for (const backend of ["webgl", "cpu"] as const) {
    for (const sequence of attemptSequences) {
      try {
        const [aiCanvas, appliedFactor] = await runSequence(input, sequence, options, backend);
        const canvas =
          appliedFactor === options.factor
            ? aiCanvas
            : resizeCanvasWithInterpolation(aiCanvas, requestedWidth, requestedHeight);

        options.onProgress?.(100);
        return {
          canvas,
          width: canvas.width,
          height: canvas.height,
          appliedFactor,
        };
      } catch (error) {
        lastError = error;

        if (options.signal?.aborted) {
          throw toAbortError(options.signal.reason);
        }
      }
    }

    if (options.signal?.aborted) {
      throw toAbortError(options.signal.reason);
    }
  }

  if (aiFactor < options.factor) {
    try {
      const lowerFactor = getLargestSafeAiFactor(aiFactor, input.width, input.height, Math.max(2, Math.floor(maxAiOutputSide / 1.5)));
      const lowerSequences = getAttemptSequences(lowerFactor);

      for (const sequence of lowerSequences) {
        const [aiCanvas, appliedFactor] = await runSequence(input, sequence, options, "cpu");
        const canvas = resizeCanvasWithInterpolation(aiCanvas, requestedWidth, requestedHeight);

        options.onProgress?.(100);
        return {
          canvas,
          width: canvas.width,
          height: canvas.height,
          appliedFactor,
        };
      }
    } catch (error) {
      lastError = error;

      if (options.signal?.aborted) {
        throw toAbortError(options.signal.reason);
      }
    }
  }

  try {
    const canvas = resizeCanvasWithInterpolation(input, requestedWidth, requestedHeight);
    options.onProgress?.(100);
    return {
      canvas,
      width: canvas.width,
      height: canvas.height,
      appliedFactor: 1,
    };
  } catch (_fallbackError) {
    throw lastError instanceof Error
      ? lastError
      : new Error("Unable to upscale image with the selected settings");
  }
};

export const clearUpscalerCache = () => {
  for (const instancePromise of upscalerCache.values()) {
    void instancePromise.then((instance) => instance.dispose?.()).catch(() => undefined);
  }

  upscalerCache.clear();
  modelDefinitionCache.clear();
  modulePromise = null;
  tfModulePromise = null;
  webglCompatibilityConfigured = false;
};
