export type UpscaleFactor = 1 | 2 | 4 | 8;

export interface UpscaleOptions {
  factor: UpscaleFactor;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
  patchSize?: number;
  padding?: number;
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

const MODEL_LOADERS: Record<2 | 4 | 8, () => Promise<UpscaleModelModule>> = {
  2: () => import("@upscalerjs/esrgan-thick/2x") as Promise<UpscaleModelModule>,
  4: () => import("@upscalerjs/esrgan-thick/4x") as Promise<UpscaleModelModule>,
  8: () => import("@upscalerjs/esrgan-thick/8x") as Promise<UpscaleModelModule>,
};

type UpscalerInstance = {
  upscale: (
    input: HTMLCanvasElement | HTMLImageElement | ImageData | string,
    options?: Record<string, unknown>,
  ) => Promise<HTMLCanvasElement | HTMLImageElement | ImageData | string>;
  dispose?: () => Promise<void> | void;
};

type UpscalerModule = {
  default: new (config: Record<string, unknown>) => UpscalerInstance;
};

let modulePromise: Promise<UpscalerModule> | null = null;
const upscalerCache = new Map<number, Promise<UpscalerInstance>>();
const modelDefinitionCache = new Map<number, Promise<UpscaleModelDefinition>>();

const loadUpscalerModule = async (): Promise<UpscalerModule> => {
  if (!modulePromise) {
    modulePromise = import("upscaler") as Promise<UpscalerModule>;
  }
  return modulePromise;
};

const loadModelDefinition = async (factor: 2 | 4 | 8): Promise<UpscaleModelDefinition> => {
  if (!modelDefinitionCache.has(factor)) {
    modelDefinitionCache.set(factor, MODEL_LOADERS[factor]().then((module) => module.default));
  }

  return modelDefinitionCache.get(factor)!;
};

const getUpscaler = async (factor: 2 | 4 | 8): Promise<UpscalerInstance> => {
  if (!upscalerCache.has(factor)) {
    const instancePromise = Promise.all([loadUpscalerModule(), loadModelDefinition(factor)]).then(([{ default: Upscaler }, model]) => {
      const config: Record<string, unknown> = {
        model,
        cacheKey: `esrgan-${factor}x`,
      };
      config.backend = "webgl";
      config.useWebWorker = true;
      return new Upscaler(config);
    });

    upscalerCache.set(factor, instancePromise);
  }

  return upscalerCache.get(factor)!;
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

  if (maxDimension > 7000) return 96;
  if (maxDimension > 5000) return 112;
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
  sequence: Array<2 | 4 | 8>,
  options: UpscaleOptions,
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
    const upscaler = await getUpscaler(factor);

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
      output: "canvas",
      signal: options.signal,
      tiling: { patchSize, padding },
      useWebWorker: true,
      progress: reportProgress,
      onProgress: reportProgress,
    } as Record<string, unknown>);

    reportProgress?.(1);

    working = await ensureCanvas(result);
    appliedFactor *= factor;
  }

  return [working, appliedFactor];
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

  const attemptSequences: Array<Array<2 | 4 | 8>> = [];

  if (options.factor === 2 || options.factor === 4) {
    attemptSequences.push([options.factor]);
  } else if (options.factor === 8) {
    attemptSequences.push([8], [4, 2]);
  } else {
    throw new Error(`Unsupported upscale factor: ${options.factor}`);
  }

  let lastError: unknown;

  for (const sequence of attemptSequences) {
    try {
      const [canvas, appliedFactor] = await runSequence(input, sequence, options);
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

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to upscale image with the selected settings");
};

export const clearUpscalerCache = () => {
  upscalerCache.clear();
  modelDefinitionCache.clear();
  modulePromise = null;
};
