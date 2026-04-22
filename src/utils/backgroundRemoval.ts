const MAX_INFERENCE_DIMENSION = 1600;

export type BackgroundRemovalModelKey = "ben2" | "ormbg";

export const BACKGROUND_REMOVAL_MODELS = [
  {
    key: "ben2",
    id: "onnx-community/BEN2-ONNX",
    label: "BEN2",
    description: "General-purpose model with strong edge handling for products, people, and mixed scenes.",
  },
  {
    key: "ormbg",
    id: "onnx-community/ormbg-ONNX",
    label: "ORMBG",
    description: "Alternative model for difficult backgrounds and cases where BEN2 misses fine separations.",
  },
] as const satisfies ReadonlyArray<{
  key: BackgroundRemovalModelKey;
  id: string;
  label: string;
  description: string;
}>;

type RawImageLike = {
  width: number;
  height: number;
  channels: number;
  data: Uint8ClampedArray | Uint8Array;
  toCanvas: () => HTMLCanvasElement;
};

type BackgroundRemovalPipeline = (input: string) => Promise<RawImageLike[]>;

type TransformersFacade = {
  env: {
    allowLocalModels: boolean;
    useBrowserCache: boolean;
  };
  pipeline: (
    task: "background-removal",
    model: string,
    options: { device: "webgpu" | "wasm" },
  ) => Promise<BackgroundRemovalPipeline>;
};

type PipelineDevice = "webgpu" | "wasm";

let transformersModulePromise: Promise<typeof import("@huggingface/transformers")> | null = null;
const pipelineCache = new Map<string, Promise<BackgroundRemovalPipeline>>();

const MODEL_BY_KEY = Object.fromEntries(
  BACKGROUND_REMOVAL_MODELS.map((model) => [model.key, model.id]),
) as Record<BackgroundRemovalModelKey, string>;

const loadTransformersModule = async (): Promise<TransformersFacade> => {
  if (!transformersModulePromise) {
    transformersModulePromise = import("@huggingface/transformers");
  }

  return (await transformersModulePromise) as unknown as TransformersFacade;
};

const getPipelineCacheKey = (model: BackgroundRemovalModelKey, device: PipelineDevice) => `${model}:${device}`;

const getBackgroundRemovalPipeline = async (
  model: BackgroundRemovalModelKey,
  device: PipelineDevice,
): Promise<BackgroundRemovalPipeline> => {
  const cacheKey = getPipelineCacheKey(model, device);

  if (!pipelineCache.has(cacheKey)) {
    const pipelinePromise = (async () => {
      const { pipeline, env } = await loadTransformersModule();
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      return pipeline("background-removal", MODEL_BY_KEY[model], { device });
    })();

    pipelineCache.set(cacheKey, pipelinePromise);
  }

  return pipelineCache.get(cacheKey)!;
};

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const drawImageToCanvas = (
  imageElement: HTMLImageElement,
  width: number,
  height: number,
): HTMLCanvasElement => {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }

  context.drawImage(imageElement, 0, 0, width, height);
  return canvas;
};

const getInferenceDimensions = (width: number, height: number) => {
  const maxSide = Math.max(width, height);
  if (maxSide <= MAX_INFERENCE_DIMENSION) {
    return { width, height };
  }

  const scale = MAX_INFERENCE_DIMENSION / maxSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Unable to create blob from canvas"));
        }
      },
      type,
      quality,
    );
  });

export interface RemoveBackgroundOptions {
  model?: BackgroundRemovalModelKey;
  onProgress?: (status: RemoveBackgroundProgressStep) => void;
}

export type RemoveBackgroundProgressStep =
  | "prepare"
  | "load-model"
  | "extract-mask"
  | "compat-retry"
  | "extract-mask-compat"
  | "rebuild-output"
  | "finalize";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

const shouldRetryWithCompatibilityBackend = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("maxpool") ||
    message.includes("ceil()") ||
    message.includes("shape computation") ||
    message.includes("webgpu") ||
    message.includes("unsupported")
  );
};

const getModelFallbackPlan = (model: BackgroundRemovalModelKey): BackgroundRemovalModelKey[] =>
  model === "ben2" ? ["ben2"] : [model, "ben2"];

export const removeBackground = async (
  imageElement: HTMLImageElement,
  options: RemoveBackgroundOptions = {},
): Promise<Blob> => {
  const model = options.model ?? "ben2";

  try {
    const originalWidth = imageElement.naturalWidth || imageElement.width;
    const originalHeight = imageElement.naturalHeight || imageElement.height;
    const { width: inferenceWidth, height: inferenceHeight } = getInferenceDimensions(originalWidth, originalHeight);

    options.onProgress?.("prepare");
    const sourceCanvas = drawImageToCanvas(imageElement, originalWidth, originalHeight);
    const inferenceCanvas =
      inferenceWidth === originalWidth && inferenceHeight === originalHeight
        ? sourceCanvas
        : drawImageToCanvas(imageElement, inferenceWidth, inferenceHeight);

    const inputDataUrl = inferenceCanvas.toDataURL("image/png");
    const preferredDevices: PipelineDevice[] = ["webgpu", "wasm"];
    const modelFallbackPlan = getModelFallbackPlan(model);
    let resultCanvas: HTMLCanvasElement | null = null;
    let lastError: unknown = null;

    for (const modelCandidate of modelFallbackPlan) {
      for (let index = 0; index < preferredDevices.length; index += 1) {
        const device = preferredDevices[index];
        const isCompatibilityRetry = index > 0 || modelCandidate !== model;

        options.onProgress?.(
          isCompatibilityRetry
            ? "compat-retry"
            : "load-model",
        );

        try {
          const remover = await getBackgroundRemovalPipeline(modelCandidate, device);
          options.onProgress?.(
            isCompatibilityRetry
              ? "extract-mask-compat"
              : "extract-mask",
          );
          const outputs = await remover(inputDataUrl);
          resultCanvas = outputs[0]?.toCanvas() ?? null;

          if (!resultCanvas) {
            throw new Error("Background removal did not return a usable image");
          }

          break;
        } catch (error) {
          lastError = error;

          if (device === "webgpu" && shouldRetryWithCompatibilityBackend(error)) {
            if (import.meta.env.DEV) {
              console.debug(`Retrying background removal in WASM compatibility mode for ${modelCandidate}`, error);
            }
            continue;
          }

          if (modelCandidate !== "ben2") {
            if (import.meta.env.DEV) {
              console.debug(`Falling back to BEN2 after ${modelCandidate} failed`, error);
            }
            break;
          }

          throw error;
        }
      }

      if (resultCanvas) {
        break;
      }
    }

    if (!resultCanvas) {
      throw lastError instanceof Error ? lastError : new Error("Background removal did not return a usable image");
    }

    options.onProgress?.("rebuild-output");
    const finalCanvas = createCanvas(originalWidth, originalHeight);
    const finalContext = finalCanvas.getContext("2d");

    if (!finalContext) {
      throw new Error("Canvas 2D context is not available");
    }

    finalContext.drawImage(sourceCanvas, 0, 0);
    finalContext.globalCompositeOperation = "destination-in";
    finalContext.drawImage(resultCanvas, 0, 0, originalWidth, originalHeight);
    finalContext.globalCompositeOperation = "source-over";

    options.onProgress?.("finalize");
    return await canvasToBlob(finalCanvas, "image/png", 1);
  } catch (error) {
    console.error("Error removing background", error);
    throw error instanceof Error ? error : new Error("Unexpected background removal error");
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to load image"));
    };
    image.src = objectUrl;
  });
};
