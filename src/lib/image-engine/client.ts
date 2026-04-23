import type { ImageDimensions } from "@/domain/editor";

export const IMAGE_INPUT_EXTENSIONS = [
  ".png",
  ".apng",
  ".jpg",
  ".jpeg",
  ".jfif",
  ".webp",
  ".avif",
  ".bmp",
  ".gif",
  ".svg",
  ".ico",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
] as const;

export const IMAGE_INPUT_ACCEPT = {
  "image/*": [...IMAGE_INPUT_EXTENSIONS],
};

export interface EncodeImageOptions {
  mimeType: string;
  quality?: number;
  matteColor?: string;
  fallbackError?: string;
}

export interface CropCanvasOptions {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
}

export const createCanvas = ({ width, height }: ImageDimensions) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
};

export const getCanvas2DContext = (canvas: HTMLCanvasElement, errorMessage = "Canvas 2D context is not available.") => {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error(errorMessage);
  }
  return context;
};

export const loadImageElement = (src: string, decodeError: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(decodeError));
    image.src = src;
  });

export const canEncodeMimeType = (mimeType: string): Promise<boolean> =>
  new Promise((resolve) => {
    const canvas = createCanvas({ width: 1, height: 1 });
    canvas.toBlob((blob) => {
      resolve(Boolean(blob && blob.type === mimeType));
    }, mimeType);
  });

const cloneCanvasWithMatte = (canvas: HTMLCanvasElement, matteColor: string) => {
  const outputCanvas = createCanvas({ width: canvas.width, height: canvas.height });
  const context = getCanvas2DContext(outputCanvas);
  context.fillStyle = matteColor;
  context.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  context.drawImage(canvas, 0, 0);
  return outputCanvas;
};

const encodeBmp = (canvas: HTMLCanvasElement): Blob => {
  const context = getCanvas2DContext(canvas);
  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height).data;
  const rowStride = Math.ceil((width * 3) / 4) * 4;
  const pixelArraySize = rowStride * height;
  const fileSize = 54 + pixelArraySize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  let offset = 0;

  const writeUint16 = (value: number) => {
    view.setUint16(offset, value, true);
    offset += 2;
  };

  const writeUint32 = (value: number) => {
    view.setUint32(offset, value, true);
    offset += 4;
  };

  view.setUint8(offset++, 0x42);
  view.setUint8(offset++, 0x4d);
  writeUint32(fileSize);
  writeUint16(0);
  writeUint16(0);
  writeUint32(54);
  writeUint32(40);
  writeUint32(width);
  writeUint32(height);
  writeUint16(1);
  writeUint16(24);
  writeUint32(0);
  writeUint32(pixelArraySize);
  writeUint32(2835);
  writeUint32(2835);
  writeUint32(0);
  writeUint32(0);

  const bytes = new Uint8Array(buffer);
  let pixelOffset = 54;

  for (let y = height - 1; y >= 0; y -= 1) {
    const rowStart = pixelOffset;
    for (let x = 0; x < width; x += 1) {
      const sourceOffset = (y * width + x) * 4;
      const alpha = imageData[sourceOffset + 3] / 255;
      const red = Math.round(imageData[sourceOffset] * alpha + 255 * (1 - alpha));
      const green = Math.round(imageData[sourceOffset + 1] * alpha + 255 * (1 - alpha));
      const blue = Math.round(imageData[sourceOffset + 2] * alpha + 255 * (1 - alpha));

      bytes[pixelOffset++] = blue;
      bytes[pixelOffset++] = green;
      bytes[pixelOffset++] = red;
    }
    pixelOffset = rowStart + rowStride;
  }

  return new Blob([buffer], { type: "image/bmp" });
};

export const encodeCanvasToImageBlob = async (canvas: HTMLCanvasElement, options: EncodeImageOptions) => {
  const sourceCanvas = options.matteColor ? cloneCanvasWithMatte(canvas, options.matteColor) : canvas;

  if (options.mimeType === "image/bmp") {
    return encodeBmp(sourceCanvas);
  }

  return new Promise<Blob>((resolve, reject) => {
    sourceCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error(options.fallbackError ?? "Unable to encode image."));
      },
      options.mimeType,
      options.quality,
    );
  });
};

export const cropImageToCanvas = (
  source: CanvasImageSource,
  {
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight,
  }: CropCanvasOptions,
) => {
  const canvas = createCanvas({ width: targetWidth, height: targetHeight });
  const context = getCanvas2DContext(canvas);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
  return canvas;
};

export const renderImageToCanvas = (source: CanvasImageSource, dimensions: ImageDimensions, matteColor?: string) => {
  const canvas = createCanvas(dimensions);
  const context = getCanvas2DContext(canvas);
  if (matteColor) {
    context.fillStyle = matteColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
};

export const downloadBlob = (blobOrUrl: Blob | string, fileName: string) => {
  const url = typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const shouldRevoke = typeof blobOrUrl !== "string";
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (shouldRevoke) {
    URL.revokeObjectURL(url);
  }
};
