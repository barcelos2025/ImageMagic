import { createTimer, logClientError, logClientEvent } from "@/utils/clientLogger";

export type InpaintMethod = "telea" | "ns";

export interface InpaintCanvasOptions {
  radius: number;
  method: InpaintMethod;
  dilation: number;
}

interface OpenCvFacade {
  onRuntimeInitialized?: () => void;
  imread: (source: HTMLCanvasElement) => unknown;
  cvtColor: (src: unknown, dst: unknown, code: number, dstCn?: number) => void;
  threshold: (src: unknown, dst: unknown, thresh: number, maxVal: number, type: number) => void;
  dilate: (src: unknown, dst: unknown, kernel: unknown, anchor: unknown, iterations: number) => void;
  inpaint: (src: unknown, inpaintMask: unknown, dst: unknown, inpaintRadius: number, flags: number) => void;
  imshow: (canvas: HTMLCanvasElement, src: unknown) => void;
  Mat: new () => {
    delete: () => void;
  };
  Point: new (x: number, y: number) => unknown;
  THRESH_BINARY: number;
  COLOR_RGBA2GRAY: number;
  INPAINT_TELEA: number;
  INPAINT_NS: number;
}

declare global {
  interface Window {
    cv?: OpenCvFacade | Promise<OpenCvFacade>;
  }
}

interface WorkerImagePayload {
  width: number;
  height: number;
  buffer: ArrayBuffer;
}

interface WorkerReadyMessage {
  id: number;
  type: "ready";
}

interface WorkerResultMessage {
  id: number;
  type: "result";
  image: WorkerImagePayload;
}

interface WorkerErrorMessage {
  id: number;
  type: "error";
  error: string;
}

type WorkerResponseMessage = WorkerReadyMessage | WorkerResultMessage | WorkerErrorMessage;

interface PendingWorkerRequest {
  reject: (error: Error) => void;
  resolve: (message: WorkerReadyMessage | WorkerResultMessage) => void;
}

interface PatchCandidateOffset {
  distanceSquared: number;
  dx: number;
  dy: number;
}

interface PatchCandidate {
  x: number;
  y: number;
}

const OPENCV_WORKER_URL = "/opencv-worker.js";
const DEFAULT_WORKER_REQUEST_TIMEOUT_MS = 30000;
const OPEN_CV_LOAD_TIMEOUT_MS = 8000;
const MAX_WORKER_REQUEST_TIMEOUT_MS = 120000;
const LOCAL_INPAINT_MASK_THRESHOLD = 10;
const LOCAL_INPAINT_YIELD_INTERVAL = 12000;
const LOCAL_INPAINT_MIN_SAMPLE_RADIUS = 3;
const LOCAL_INPAINT_MAX_SAMPLE_RADIUS = 18;
const LOCAL_INPAINT_MIN_PATCH_RADIUS = 3;
const LOCAL_INPAINT_MAX_PATCH_RADIUS = 9;
const LOCAL_INPAINT_MAX_PATCH_CANDIDATES = 520;
const LOCAL_INPAINT_PATCH_YIELD_INTERVAL = 40;

type OpenCvExecutionMode = "worker" | "main-thread";

let workerPromise: Promise<Worker> | null = null;
let workerReadyPromise: Promise<void> | null = null;
let nextRequestId = 0;
const pendingRequests = new Map<number, PendingWorkerRequest>();
let executionMode: OpenCvExecutionMode = "worker";
let workerUnavailable = false;

const resetWorkerState = async () => {
  if (workerPromise) {
    try {
      const worker = await workerPromise;
      worker.terminate();
    } catch {
      // Ignore worker shutdown errors.
    }
  }

  workerPromise = null;
  workerReadyPromise = null;
};

const disposeWorkerState = () => {
  const error = new Error("OpenCV worker was disposed");
  pendingRequests.forEach((pending) => pending.reject(error));
  pendingRequests.clear();
  void resetWorkerState();
};

if (import.meta.hot) {
  import.meta.hot.dispose(disposeWorkerState);
}

const setExecutionMode = (mode: OpenCvExecutionMode) => {
  executionMode = mode;
};

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const waitForBrowser = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });

const shouldUseOpenCvWorker = () => import.meta.env.VITE_MAGIC_ERASER_OPENCV === "true";

const getCanvasImageData = (canvas: HTMLCanvasElement): ImageData => {
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }

  return context.getImageData(0, 0, canvas.width, canvas.height);
};

const putCanvasImageData = (imageData: ImageData): HTMLCanvasElement => {
  const outputCanvas = createCanvas(imageData.width, imageData.height);
  const outputContext = outputCanvas.getContext("2d");

  if (!outputContext) {
    throw new Error("Canvas 2D context is not available");
  }

  outputContext.putImageData(imageData, 0, 0);
  return outputCanvas;
};

const dilateMask = (mask: Uint8Array, width: number, height: number, iterations: number): Uint8Array => {
  let current = mask;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const next = new Uint8Array(current);

    for (let y = 0; y < height; y += 1) {
      const top = Math.max(0, y - 1);
      const bottom = Math.min(height - 1, y + 1);
      const rowOffset = y * width;

      for (let x = 0; x < width; x += 1) {
        const index = rowOffset + x;

        if (!current[index]) {
          continue;
        }

        const left = Math.max(0, x - 1);
        const right = Math.min(width - 1, x + 1);

        for (let ny = top; ny <= bottom; ny += 1) {
          const neighborOffset = ny * width;

          for (let nx = left; nx <= right; nx += 1) {
            next[neighborOffset + nx] = 1;
          }
        }
      }
    }

    current = next;
  }

  return current;
};

const hasKnownNeighbor = (known: Uint8Array, width: number, height: number, x: number, y: number) => {
  const top = Math.max(0, y - 1);
  const bottom = Math.min(height - 1, y + 1);
  const left = Math.max(0, x - 1);
  const right = Math.min(width - 1, x + 1);

  for (let ny = top; ny <= bottom; ny += 1) {
    const neighborOffset = ny * width;

    for (let nx = left; nx <= right; nx += 1) {
      if (nx === x && ny === y) {
        continue;
      }

      if (known[neighborOffset + nx]) {
        return true;
      }
    }
  }

  return false;
};

const hasOutsideMaskNeighbor = (mask: Uint8Array, width: number, height: number, x: number, y: number) => {
  const top = Math.max(0, y - 1);
  const bottom = Math.min(height - 1, y + 1);
  const left = Math.max(0, x - 1);
  const right = Math.min(width - 1, x + 1);

  for (let ny = top; ny <= bottom; ny += 1) {
    const neighborOffset = ny * width;

    for (let nx = left; nx <= right; nx += 1) {
      if (nx === x && ny === y) {
        continue;
      }

      if (!mask[neighborOffset + nx]) {
        return true;
      }
    }
  }

  return false;
};

const sampleKnownColor = (
  pixels: Uint8ClampedArray,
  known: Uint8Array,
  originalKnown: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number,
  output: number[],
) => {
  let red = 0;
  let green = 0;
  let blue = 0;
  let alpha = 0;
  let weightTotal = 0;
  const radiusSquared = radius * radius;
  const top = Math.max(0, y - radius);
  const bottom = Math.min(height - 1, y + radius);
  const left = Math.max(0, x - radius);
  const right = Math.min(width - 1, x + radius);

  for (let ny = top; ny <= bottom; ny += 1) {
    const dy = ny - y;
    const neighborOffset = ny * width;

    for (let nx = left; nx <= right; nx += 1) {
      const dx = nx - x;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared > radiusSquared) {
        continue;
      }

      const neighborIndex = neighborOffset + nx;

      if (!known[neighborIndex]) {
        continue;
      }

      const sourceOffset = neighborIndex * 4;
      const originalWeight = originalKnown[neighborIndex] ? 1.35 : 0.85;
      const weight = originalWeight / (distanceSquared + 1);

      red += pixels[sourceOffset] * weight;
      green += pixels[sourceOffset + 1] * weight;
      blue += pixels[sourceOffset + 2] * weight;
      alpha += pixels[sourceOffset + 3] * weight;
      weightTotal += weight;
    }
  }

  if (weightTotal <= 0) {
    return false;
  }

  output[0] = red / weightTotal;
  output[1] = green / weightTotal;
  output[2] = blue / weightTotal;
  output[3] = alpha / weightTotal;
  return true;
};

const getPatchCandidateOffsets = (searchRadius: number, step: number): PatchCandidateOffset[] => {
  const offsets: PatchCandidateOffset[] = [];
  const radiusSquared = searchRadius * searchRadius;

  for (let dy = -searchRadius; dy <= searchRadius; dy += step) {
    for (let dx = -searchRadius; dx <= searchRadius; dx += step) {
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared === 0 || distanceSquared > radiusSquared) {
        continue;
      }

      offsets.push({ distanceSquared, dx, dy });
    }
  }

  offsets.sort((left, right) => left.distanceSquared - right.distanceSquared);

  if (offsets.length <= LOCAL_INPAINT_MAX_PATCH_CANDIDATES) {
    return offsets;
  }

  const nearbyCount = Math.floor(LOCAL_INPAINT_MAX_PATCH_CANDIDATES * 0.45);
  const selected = offsets.slice(0, nearbyCount);
  const stride = Math.max(1, Math.floor((offsets.length - nearbyCount) / (LOCAL_INPAINT_MAX_PATCH_CANDIDATES - nearbyCount)));

  for (let index = nearbyCount; index < offsets.length && selected.length < LOCAL_INPAINT_MAX_PATCH_CANDIDATES; index += stride) {
    selected.push(offsets[index]);
  }

  return selected;
};

const getPatchDifference = (
  targetPixels: Uint8ClampedArray,
  sourcePixels: Uint8ClampedArray,
  fillMask: Uint8Array,
  known: Uint8Array,
  width: number,
  height: number,
  targetX: number,
  targetY: number,
  sourceX: number,
  sourceY: number,
  patchRadius: number,
) => {
  const sampleStep = patchRadius >= 6 ? 2 : 1;
  const minSamples = Math.max(8, Math.floor(((patchRadius * 2 + 1) ** 2) / (sampleStep * sampleStep) * 0.18));
  let score = 0;
  let sampleCount = 0;
  let weightTotal = 0;

  for (let py = -patchRadius; py <= patchRadius; py += sampleStep) {
    const targetPatchY = targetY + py;
    const sourcePatchY = sourceY + py;

    if (targetPatchY < 0 || targetPatchY >= height || sourcePatchY < 0 || sourcePatchY >= height) {
      continue;
    }

    const targetRowOffset = targetPatchY * width;
    const sourceRowOffset = sourcePatchY * width;

    for (let px = -patchRadius; px <= patchRadius; px += sampleStep) {
      const targetPatchX = targetX + px;
      const sourcePatchX = sourceX + px;

      if (targetPatchX < 0 || targetPatchX >= width || sourcePatchX < 0 || sourcePatchX >= width) {
        continue;
      }

      const targetIndex = targetRowOffset + targetPatchX;
      const sourceIndex = sourceRowOffset + sourcePatchX;

      if (!known[targetIndex] || fillMask[sourceIndex]) {
        continue;
      }

      const targetOffset = targetIndex * 4;
      const sourceOffset = sourceIndex * 4;
      const redDelta = targetPixels[targetOffset] - sourcePixels[sourceOffset];
      const greenDelta = targetPixels[targetOffset + 1] - sourcePixels[sourceOffset + 1];
      const blueDelta = targetPixels[targetOffset + 2] - sourcePixels[sourceOffset + 2];
      const alphaDelta = targetPixels[targetOffset + 3] - sourcePixels[sourceOffset + 3];
      const centerWeight = 1 / (1 + Math.abs(px) + Math.abs(py));

      score += (redDelta * redDelta + greenDelta * greenDelta + blueDelta * blueDelta + alphaDelta * alphaDelta * 0.25) * centerWeight;
      sampleCount += 1;
      weightTotal += centerWeight;
    }
  }

  if (sampleCount < minSamples || weightTotal <= 0) {
    return null;
  }

  return score / weightTotal;
};

const findBestPatchCandidate = (
  targetPixels: Uint8ClampedArray,
  sourcePixels: Uint8ClampedArray,
  fillMask: Uint8Array,
  known: Uint8Array,
  width: number,
  height: number,
  targetX: number,
  targetY: number,
  patchRadius: number,
  candidateOffsets: PatchCandidateOffset[],
): PatchCandidate | null => {
  let bestCandidate: PatchCandidate | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const offset of candidateOffsets) {
    const sourceX = targetX + offset.dx;
    const sourceY = targetY + offset.dy;

    if (
      sourceX < patchRadius ||
      sourceY < patchRadius ||
      sourceX >= width - patchRadius ||
      sourceY >= height - patchRadius
    ) {
      continue;
    }

    if (fillMask[sourceY * width + sourceX]) {
      continue;
    }

    const patchScore = getPatchDifference(
      targetPixels,
      sourcePixels,
      fillMask,
      known,
      width,
      height,
      targetX,
      targetY,
      sourceX,
      sourceY,
      patchRadius,
    );

    if (patchScore === null) {
      continue;
    }

    const score = patchScore + offset.distanceSquared * 0.015;

    if (score < bestScore) {
      bestScore = score;
      bestCandidate = { x: sourceX, y: sourceY };
    }
  }

  return bestCandidate;
};

const synthesizeTexturePatches = async (
  pixels: Uint8ClampedArray,
  sourcePixels: Uint8ClampedArray,
  fillMask: Uint8Array,
  known: Uint8Array,
  width: number,
  height: number,
  options: InpaintCanvasOptions,
) => {
  const patchRadius = Math.max(
    LOCAL_INPAINT_MIN_PATCH_RADIUS,
    Math.min(LOCAL_INPAINT_MAX_PATCH_RADIUS, Math.round(options.radius * 0.75 + 3)),
  );
  const copyRadius = Math.max(2, Math.floor(patchRadius * 0.72));
  const searchRadius = Math.max(32, Math.min(120, patchRadius * 12 + options.dilation * 6));
  const candidateStep = patchRadius >= 7 ? 3 : 2;
  const candidateOffsets = getPatchCandidateOffsets(searchRadius, candidateStep);
  const queued = new Uint8Array(width * height);
  const attempts = new Uint8Array(width * height);
  const queue: number[] = [];
  let queueCursor = 0;
  let filledPixels = 0;
  let processedPatches = 0;

  const enqueue = (index: number) => {
    if (!fillMask[index] || known[index] || queued[index] || attempts[index] >= 3) {
      return;
    }

    queued[index] = 1;
    queue.push(index);
  };

  const enqueueUnknownNeighbors = (x: number, y: number) => {
    const top = Math.max(0, y - 1);
    const bottom = Math.min(height - 1, y + 1);
    const left = Math.max(0, x - 1);
    const right = Math.min(width - 1, x + 1);

    for (let ny = top; ny <= bottom; ny += 1) {
      const rowOffset = ny * width;

      for (let nx = left; nx <= right; nx += 1) {
        enqueue(rowOffset + nx);
      }
    }
  };

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width;

    for (let x = 0; x < width; x += 1) {
      const index = rowOffset + x;

      if (fillMask[index] && !known[index] && hasKnownNeighbor(known, width, height, x, y)) {
        enqueue(index);
      }
    }
  }

  while (queueCursor < queue.length) {
    const index = queue[queueCursor];
    queueCursor += 1;
    queued[index] = 0;

    if (known[index]) {
      continue;
    }

    attempts[index] += 1;
    const targetY = Math.floor(index / width);
    const targetX = index - targetY * width;
    const candidate = findBestPatchCandidate(
      pixels,
      sourcePixels,
      fillMask,
      known,
      width,
      height,
      targetX,
      targetY,
      patchRadius,
      candidateOffsets,
    );

    if (!candidate) {
      continue;
    }

    for (let py = -copyRadius; py <= copyRadius; py += 1) {
      const targetPatchY = targetY + py;
      const sourcePatchY = candidate.y + py;

      if (targetPatchY < 0 || targetPatchY >= height || sourcePatchY < 0 || sourcePatchY >= height) {
        continue;
      }

      const targetRowOffset = targetPatchY * width;
      const sourceRowOffset = sourcePatchY * width;

      for (let px = -copyRadius; px <= copyRadius; px += 1) {
        if (px * px + py * py > copyRadius * copyRadius) {
          continue;
        }

        const targetPatchX = targetX + px;
        const sourcePatchX = candidate.x + px;

        if (targetPatchX < 0 || targetPatchX >= width || sourcePatchX < 0 || sourcePatchX >= width) {
          continue;
        }

        const targetIndex = targetRowOffset + targetPatchX;
        const sourceIndex = sourceRowOffset + sourcePatchX;

        if (!fillMask[targetIndex] || known[targetIndex] || fillMask[sourceIndex]) {
          continue;
        }

        const targetOffset = targetIndex * 4;
        const sourceOffset = sourceIndex * 4;
        pixels[targetOffset] = sourcePixels[sourceOffset];
        pixels[targetOffset + 1] = sourcePixels[sourceOffset + 1];
        pixels[targetOffset + 2] = sourcePixels[sourceOffset + 2];
        pixels[targetOffset + 3] = sourcePixels[sourceOffset + 3];
        known[targetIndex] = 1;
        filledPixels += 1;
        enqueueUnknownNeighbors(targetPatchX, targetPatchY);
      }
    }

    processedPatches += 1;

    if (processedPatches % LOCAL_INPAINT_PATCH_YIELD_INTERVAL === 0) {
      await waitForBrowser();
    }
  }

  return filledPixels;
};

const smoothMaskBoundary = async (
  pixels: Uint8ClampedArray,
  fillMask: Uint8Array,
  width: number,
  height: number,
) => {
  const previous = new Uint8ClampedArray(pixels);
  let visited = 0;

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width;

    for (let x = 0; x < width; x += 1) {
      const index = rowOffset + x;

      if (!fillMask[index] || !hasOutsideMaskNeighbor(fillMask, width, height, x, y)) {
        continue;
      }

      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;
      let count = 0;
      const top = Math.max(0, y - 1);
      const bottom = Math.min(height - 1, y + 1);
      const left = Math.max(0, x - 1);
      const right = Math.min(width - 1, x + 1);

      for (let ny = top; ny <= bottom; ny += 1) {
        const neighborOffset = ny * width;

        for (let nx = left; nx <= right; nx += 1) {
          const pixelOffset = (neighborOffset + nx) * 4;
          red += previous[pixelOffset];
          green += previous[pixelOffset + 1];
          blue += previous[pixelOffset + 2];
          alpha += previous[pixelOffset + 3];
          count += 1;
        }
      }

      const pixelOffset = index * 4;
      pixels[pixelOffset] = previous[pixelOffset] * 0.72 + (red / count) * 0.28;
      pixels[pixelOffset + 1] = previous[pixelOffset + 1] * 0.72 + (green / count) * 0.28;
      pixels[pixelOffset + 2] = previous[pixelOffset + 2] * 0.72 + (blue / count) * 0.28;
      pixels[pixelOffset + 3] = previous[pixelOffset + 3] * 0.72 + (alpha / count) * 0.28;
      visited += 1;

      if (visited % LOCAL_INPAINT_YIELD_INTERVAL === 0) {
        await waitForBrowser();
      }
    }
  }
};

const inpaintCanvasLocally = async (
  sourceCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  options: InpaintCanvasOptions,
): Promise<HTMLCanvasElement> => {
  const sourceImageData = getCanvasImageData(sourceCanvas);
  const maskImageData = getCanvasImageData(maskCanvas);
  const originalPixels = new Uint8ClampedArray(sourceImageData.data);
  const { width, height } = sourceImageData;
  const pixelCount = width * height;

  if (maskImageData.width !== width || maskImageData.height !== height) {
    throw new Error("Source and mask canvases must have the same dimensions");
  }

  const initialMask = new Uint8Array(pixelCount);
  const maskPixels = maskImageData.data;
  let maskedPixels = 0;

  for (let index = 0; index < pixelCount; index += 1) {
    if (maskPixels[index * 4 + 3] > LOCAL_INPAINT_MASK_THRESHOLD) {
      initialMask[index] = 1;
      maskedPixels += 1;
    }
  }

  if (maskedPixels === 0) {
    return putCanvasImageData(sourceImageData);
  }

  const fillMask = dilateMask(initialMask, width, height, Math.max(0, options.dilation));
  const known = new Uint8Array(pixelCount);
  const originalKnown = new Uint8Array(pixelCount);
  let knownPixels = 0;

  for (let index = 0; index < pixelCount; index += 1) {
    if (!fillMask[index]) {
      known[index] = 1;
      originalKnown[index] = 1;
      knownPixels += 1;
    }
  }

  if (knownPixels === 0) {
    return putCanvasImageData(sourceImageData);
  }

  const queue = new Int32Array(pixelCount);
  const queued = new Uint8Array(pixelCount);
  let queueStart = 0;
  let queueEnd = 0;

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width;

    for (let x = 0; x < width; x += 1) {
      const index = rowOffset + x;

      if (!fillMask[index] || !hasKnownNeighbor(known, width, height, x, y)) {
        continue;
      }

      queued[index] = 1;
      queue[queueEnd] = index;
      queueEnd += 1;
    }
  }

  if (queueEnd === 0) {
    return putCanvasImageData(sourceImageData);
  }

  await synthesizeTexturePatches(sourceImageData.data, originalPixels, fillMask, known, width, height, options);

  queueStart = 0;
  queueEnd = 0;
  queued.fill(0);

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width;

    for (let x = 0; x < width; x += 1) {
      const index = rowOffset + x;

      if (!fillMask[index] || known[index] || !hasKnownNeighbor(known, width, height, x, y)) {
        continue;
      }

      queued[index] = 1;
      queue[queueEnd] = index;
      queueEnd += 1;
    }
  }

  const outputColor = [0, 0, 0, 255];
  const methodRadiusMultiplier = options.method === "ns" ? 2 : 1.6;
  const sampleRadius = Math.max(
    LOCAL_INPAINT_MIN_SAMPLE_RADIUS,
    Math.min(LOCAL_INPAINT_MAX_SAMPLE_RADIUS, Math.round(options.radius * methodRadiusMultiplier + 2)),
  );
  let filledPixels = 0;

  while (queueStart < queueEnd) {
    const index = queue[queueStart];
    queueStart += 1;
    queued[index] = 0;

    if (known[index]) {
      continue;
    }

    const y = Math.floor(index / width);
    const x = index - y * width;

    if (!sampleKnownColor(sourceImageData.data, known, originalKnown, width, height, x, y, sampleRadius, outputColor)) {
      continue;
    }

    const pixelOffset = index * 4;
    sourceImageData.data[pixelOffset] = outputColor[0];
    sourceImageData.data[pixelOffset + 1] = outputColor[1];
    sourceImageData.data[pixelOffset + 2] = outputColor[2];
    sourceImageData.data[pixelOffset + 3] = outputColor[3];
    known[index] = 1;
    filledPixels += 1;

    const top = Math.max(0, y - 1);
    const bottom = Math.min(height - 1, y + 1);
    const left = Math.max(0, x - 1);
    const right = Math.min(width - 1, x + 1);

    for (let ny = top; ny <= bottom; ny += 1) {
      const neighborOffset = ny * width;

      for (let nx = left; nx <= right; nx += 1) {
        const neighborIndex = neighborOffset + nx;

        if (!fillMask[neighborIndex] || known[neighborIndex] || queued[neighborIndex]) {
          continue;
        }

        queued[neighborIndex] = 1;
        queue[queueEnd] = neighborIndex;
        queueEnd += 1;
      }
    }

    if (filledPixels % LOCAL_INPAINT_YIELD_INTERVAL === 0) {
      await waitForBrowser();
    }
  }

  await smoothMaskBoundary(sourceImageData.data, fillMask, width, height);
  return putCanvasImageData(sourceImageData);
};

const runLocalInpaintFallback = async (
  sourceCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  options: InpaintCanvasOptions,
  details: Record<string, unknown>,
) => {
  const fallbackTimer = createTimer();
  const result = await inpaintCanvasLocally(sourceCanvas, maskCanvas, options);
  const reason = typeof details.reason === "string" ? details.reason : "";
  const isDefaultLocalInpaint = reason === "local-inpaint-default";

  void logClientEvent({
    category: "magic-brush.inpaint",
    details: {
      ...details,
      durationMs: fallbackTimer(),
      maskHeight: maskCanvas.height,
      maskWidth: maskCanvas.width,
      method: options.method,
      radius: options.radius,
      sourceHeight: sourceCanvas.height,
      sourceWidth: sourceCanvas.width,
    },
    level: isDefaultLocalInpaint ? "info" : "warn",
    message: isDefaultLocalInpaint
      ? "Magic Eraser used local patch-fill inpaint"
      : "Magic Eraser used local patch-fill fallback",
  });

  return result;
};

const getCanvasImagePayload = (canvas: HTMLCanvasElement): WorkerImagePayload => {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  return {
    width: imageData.width,
    height: imageData.height,
    buffer: imageData.data.buffer,
  };
};

const payloadToCanvas = (payload: WorkerImagePayload) => {
  const canvas = createCanvas(payload.width, payload.height);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }

  const imageData = new ImageData(new Uint8ClampedArray(payload.buffer), payload.width, payload.height);
  context.putImageData(imageData, 0, 0);
  return canvas;
};

const createWorker = (): Worker => {
  const worker = new Worker(OPENCV_WORKER_URL);

  worker.onmessage = (event: MessageEvent<WorkerResponseMessage>) => {
    const message = event.data;
    const pending = pendingRequests.get(message.id);

    if (!pending) {
      return;
    }

    pendingRequests.delete(message.id);

    if (message.type === "error") {
      pending.reject(new Error(message.error));
      return;
    }

    pending.resolve(message);
  };

  worker.onerror = (event) => {
    const error = new Error(event.message || "OpenCV worker failed");
    pendingRequests.forEach((pending) => pending.reject(error));
    pendingRequests.clear();
    worker.terminate();
    void resetWorkerState();
  };

  return worker;
};

const getWorker = async (): Promise<Worker> => {
  if (!workerPromise) {
    workerPromise = Promise.resolve(createWorker());
  }

  return workerPromise;
};

const postWorkerMessage = async <
  TResponse extends WorkerReadyMessage | WorkerResultMessage,
>(
  message: object,
  transfer: Transferable[] = [],
  timeoutMs = DEFAULT_WORKER_REQUEST_TIMEOUT_MS,
): Promise<TResponse> => {
  const worker = await getWorker();
  const id = ++nextRequestId;

  return new Promise<TResponse>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pendingRequests.delete(id);
      void resetWorkerState();
      reject(new Error(`OpenCV worker request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    const rejectWithCleanup = (error: Error) => {
      window.clearTimeout(timeout);
      reject(error);
    };

    pendingRequests.set(id, {
      reject: rejectWithCleanup,
      resolve: (response) => {
        window.clearTimeout(timeout);
        resolve(response as TResponse);
      },
    });

    worker.postMessage({ id, ...message }, transfer);
  });
};

const isWorkerSupported = () => typeof Worker !== "undefined";

const toError = (error: unknown, fallback: string) =>
  error instanceof Error ? error : new Error(fallback);

const getInpaintWorkerTimeoutMs = (
  sourceCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  options: InpaintCanvasOptions,
) => {
  const sourceMegapixels = (sourceCanvas.width * sourceCanvas.height) / 1_000_000;
  const maskMegapixels = (maskCanvas.width * maskCanvas.height) / 1_000_000;
  const megapixels = Math.max(sourceMegapixels, maskMegapixels);
  const radiusCostMs = Math.max(0, options.radius - 4) * 1200;
  const dilationCostMs = Math.max(0, options.dilation) * 800;
  const methodMultiplier = options.method === "ns" ? 1.2 : 1;

  return Math.min(
    MAX_WORKER_REQUEST_TIMEOUT_MS,
    Math.round((DEFAULT_WORKER_REQUEST_TIMEOUT_MS + megapixels * 16000 + radiusCostMs + dilationCostMs) * methodMultiplier),
  );
};

const isReadyOpenCv = (maybeCv: Window["cv"] | undefined): maybeCv is OpenCvFacade =>
  Boolean(maybeCv && typeof maybeCv === "object" && "imread" in maybeCv);

const resolveOpenCvInstance = async (): Promise<OpenCvFacade> => {
  const existing = window.cv;
  if (!existing) {
    throw new Error("OpenCV did not initialize");
  }

  if (typeof (existing as Promise<OpenCvFacade>)?.then === "function") {
    const resolved = await (existing as Promise<OpenCvFacade>);
    if (!isReadyOpenCv(resolved)) {
      throw new Error("OpenCV resolved without required APIs");
    }
    return resolved;
  }

  if (isReadyOpenCv(existing)) {
    return existing;
  }

  return new Promise((resolve, reject) => {
    const instance = existing as unknown as OpenCvFacade;
    const timeout = window.setTimeout(() => reject(new Error("OpenCV initialization timed out")), 45000);
    const previous = instance.onRuntimeInitialized;
    instance.onRuntimeInitialized = () => {
      window.clearTimeout(timeout);
      previous?.();
      resolve(instance);
    };
  });
};

const loadOpenCvOnMainThread = async (): Promise<OpenCvFacade> => {
  if (!window.cv) {
    await new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-opencv-loader="true"]');
      if (existingScript) {
        if (existingScript.dataset.loaded === "true") {
          resolve();
          return;
        }

        if (existingScript.dataset.failed === "true") {
          reject(new Error("Failed to load OpenCV"));
          return;
        }

        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Failed to load OpenCV")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "/vendor/opencv.js";
      script.async = true;
      script.dataset.opencvLoader = "true";
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = () => {
        script.dataset.failed = "true";
        reject(new Error("Failed to load OpenCV"));
      };
      document.head.appendChild(script);
    });
  }

  return resolveOpenCvInstance();
};

const switchToMainThread = async (details?: Record<string, unknown>) => {
  const modeChanged = executionMode !== "main-thread";
  await resetWorkerState();
  setExecutionMode("main-thread");
  await loadOpenCvOnMainThread();

  if (modeChanged) {
    void logClientEvent({
      category: "magic-brush.opencv",
      level: "warn",
      details: {
        ...details,
        mode: "main-thread",
      },
      message: "Using main-thread OpenCV fallback",
    });
  }
};

const inpaintCanvasOnMainThread = async (
  sourceCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  options: InpaintCanvasOptions,
): Promise<HTMLCanvasElement> => {
  const cv = await loadOpenCvOnMainThread();

  const sourceMat = cv.imread(sourceCanvas);
  const maskRgba = cv.imread(maskCanvas);
  const maskGray = new cv.Mat();
  const maskBinary = new cv.Mat();
  const dilatedMask = new cv.Mat();
  const destination = new cv.Mat();
  const kernel = new cv.Mat();

  try {
    cv.cvtColor(maskRgba, maskGray, cv.COLOR_RGBA2GRAY);
    cv.threshold(maskGray, maskBinary, 10, 255, cv.THRESH_BINARY);

    if (options.dilation > 0) {
      cv.dilate(maskBinary, dilatedMask, kernel, new cv.Point(-1, -1), options.dilation);
    } else {
      cv.threshold(maskGray, dilatedMask, 10, 255, cv.THRESH_BINARY);
    }

    cv.inpaint(
      sourceMat,
      dilatedMask,
      destination,
      options.radius,
      options.method === "ns" ? cv.INPAINT_NS : cv.INPAINT_TELEA,
    );

    const outputCanvas = createCanvas(sourceCanvas.width, sourceCanvas.height);
    cv.imshow(outputCanvas, destination);
    return outputCanvas;
  } finally {
    (sourceMat as { delete?: () => void }).delete?.();
    (maskRgba as { delete?: () => void }).delete?.();
    maskGray.delete();
    maskBinary.delete();
    dilatedMask.delete();
    destination.delete();
    kernel.delete();
  }
};

export const loadOpenCv = async (): Promise<void> => {
  if (!isWorkerSupported()) {
    throw new Error("OpenCV worker is not supported in this browser");
  }

  if (workerUnavailable) {
    throw new Error("OpenCV worker is unavailable in this session");
  }

  if (executionMode !== "worker") {
    throw new Error("OpenCV worker execution is disabled");
  }

  if (!workerReadyPromise) {
    workerReadyPromise = (async () => {
      const loadTimer = createTimer();

      try {
        await postWorkerMessage<WorkerReadyMessage>({ type: "load" }, [], OPEN_CV_LOAD_TIMEOUT_MS);
        void logClientEvent({
          category: "magic-brush.opencv",
          details: {
            durationMs: loadTimer(),
            mode: "worker",
          },
          message: "OpenCV worker initialized",
        });
        return;
      } catch (initialError) {
        const normalizedInitialError = toError(initialError, "OpenCV worker initialization failed");
        void logClientError(
          "magic-brush.opencv",
          "OpenCV worker initialization failed",
          normalizedInitialError,
          {
            durationMs: loadTimer(),
            timeoutMs: OPEN_CV_LOAD_TIMEOUT_MS,
          },
        );
        await resetWorkerState();
        workerUnavailable = true;
        throw normalizedInitialError;
      }
    })().catch((error) => {
      workerReadyPromise = null;
      throw error;
    });
  }

  await workerReadyPromise;
};

export const inpaintCanvas = async (
  sourceCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  options: InpaintCanvasOptions,
): Promise<HTMLCanvasElement> => {
  if (!shouldUseOpenCvWorker()) {
    return runLocalInpaintFallback(sourceCanvas, maskCanvas, options, {
      reason: "local-inpaint-default",
    });
  }

  if (!isWorkerSupported() || executionMode !== "worker") {
    return runLocalInpaintFallback(sourceCanvas, maskCanvas, options, {
      reason: isWorkerSupported() ? "opencv-worker-disabled" : "worker-unsupported",
    });
  }

  const initialTimeoutMs = getInpaintWorkerTimeoutMs(sourceCanvas, maskCanvas, options);
  const runWorkerRequest = async () => {
    const sourcePayload = getCanvasImagePayload(sourceCanvas);
    const maskPayload = getCanvasImagePayload(maskCanvas);

    return postWorkerMessage<WorkerResultMessage>(
      {
        type: "inpaint",
        image: sourcePayload,
        mask: maskPayload,
        options,
      },
      [sourcePayload.buffer, maskPayload.buffer],
      initialTimeoutMs,
    );
  };

  try {
    await loadOpenCv();
    const response = await runWorkerRequest();
    return payloadToCanvas(response.image);
  } catch (error) {
    void logClientError("magic-brush.opencv", "OpenCV worker request failed", error, {
      computedTimeoutMs: initialTimeoutMs,
      maskHeight: maskCanvas.height,
      maskWidth: maskCanvas.width,
      method: options.method,
      radius: options.radius,
      sourceHeight: sourceCanvas.height,
      sourceWidth: sourceCanvas.width,
    });

    await resetWorkerState();
    workerUnavailable = true;
    return runLocalInpaintFallback(sourceCanvas, maskCanvas, options, {
      computedTimeoutMs: initialTimeoutMs,
      errorMessage: toError(error, "OpenCV worker request failed").message,
      reason: "opencv-worker-failed",
    });
  }
};
