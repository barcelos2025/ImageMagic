export type BrushMode = "paint" | "erase";

export interface BrushPoint {
  x: number;
  y: number;
}

export interface BrushStroke {
  mode: BrushMode;
  size: number;
  hardness: number;
  points: BrushPoint[];
}

const getStrokeRadius = (width: number, height: number, size: number) =>
  Math.max(2, size * Math.max(width, height)) / 2;

const getStrokeSpacing = (radius: number) => Math.max(1, radius / 3);

const stampBrush = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  hardness: number,
  mode: BrushMode,
) => {
  const clampedHardness = Math.min(1, Math.max(0.05, hardness));
  // Keep a small feather band so a 100% hardness brush still produces a valid radial gradient.
  const featherWidth = Math.max(0.5, radius * (1 - clampedHardness));
  const innerRadius = Math.max(0, radius - featherWidth);
  const gradient = context.createRadialGradient(x, y, innerRadius, x, y, radius);

  if (mode === "paint") {
    context.globalCompositeOperation = "source-over";
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
  } else {
    context.globalCompositeOperation = "destination-out";
    gradient.addColorStop(0, "rgba(0,0,0,1)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
  }

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
};

const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount;

export const drawStrokeSegment = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  stroke: Pick<BrushStroke, "hardness" | "mode" | "size">,
  startPoint: BrushPoint,
  endPoint?: BrushPoint,
) => {
  const radius = getStrokeRadius(width, height, stroke.size);
  const spacing = getStrokeSpacing(radius);
  const x = startPoint.x * width;
  const y = startPoint.y * height;

  stampBrush(context, x, y, radius, stroke.hardness, stroke.mode);

  if (!endPoint) {
    return;
  }

  const nextX = endPoint.x * width;
  const nextY = endPoint.y * height;
  const distance = Math.hypot(nextX - x, nextY - y);
  const steps = Math.max(1, Math.ceil(distance / spacing));

  for (let step = 1; step <= steps; step += 1) {
    const amount = step / steps;
    stampBrush(
      context,
      lerp(x, nextX, amount),
      lerp(y, nextY, amount),
      radius,
      stroke.hardness,
      stroke.mode,
    );
  }
};

export const renderMaskFromStrokes = (
  width: number,
  height: number,
  strokes: BrushStroke[],
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }

  context.clearRect(0, 0, width, height);

  for (const stroke of strokes) {
    if (!stroke.points.length) {
      continue;
    }

    for (let index = 0; index < stroke.points.length; index += 1) {
      const point = stroke.points[index];
      const nextPoint = stroke.points[index + 1];
      drawStrokeSegment(context, width, height, stroke, point, nextPoint);
    }
  }

  context.globalCompositeOperation = "source-over";
  return canvas;
};

export const loadImageElement = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to decode ${file.name}`));
    };
    image.src = objectUrl;
  });

export const imageToCanvas = (image: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
};

export const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Unable to export canvas"));
        }
      },
      type,
      quality,
    );
  });
