export type EditorRuntime = "client" | "server";

export type EditorToolStatus = "available" | "beta" | "planned";

export type EditorToolCategory = "transform" | "cleanup" | "enhance" | "export";

export interface EditorToolDefinition {
  id: string;
  path: string;
  category: EditorToolCategory;
  runtime: EditorRuntime;
  status: EditorToolStatus;
  supportsBatch: boolean;
  requiresModel: boolean;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageAsset {
  file: File;
  objectUrl: string;
  dimensions?: ImageDimensions;
}

export interface ImageOperationContext {
  source: HTMLImageElement | HTMLCanvasElement;
  dimensions: ImageDimensions;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
}

export interface ImageOperationResult {
  blob: Blob;
  dimensions: ImageDimensions;
  mimeType: string;
}

export interface ImageExportFormat {
  value: string;
  label: string;
  mimeType: string;
  extension: string;
  quality?: number;
  preservesTransparency: boolean;
  runtime: EditorRuntime;
}

export interface ClientImageOperation<TOptions> {
  runtime: "client";
  execute: (context: ImageOperationContext, options: TOptions) => Promise<ImageOperationResult>;
}

export interface ServerImageOperation<TOptions> {
  runtime: "server";
  endpoint: string;
  createRequest: (context: ImageOperationContext, options: TOptions) => Promise<RequestInit>;
}

export type ImageOperation<TOptions> = ClientImageOperation<TOptions> | ServerImageOperation<TOptions>;
