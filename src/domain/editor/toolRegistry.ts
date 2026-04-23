import type { EditorToolDefinition } from "./types";

export const EDITOR_TOOLS = [
  {
    id: "resize",
    path: "/resize",
    category: "transform",
    runtime: "client",
    status: "available",
    supportsBatch: false,
    requiresModel: true,
  },
  {
    id: "smartCrop",
    path: "/smart-crop",
    category: "transform",
    runtime: "client",
    status: "available",
    supportsBatch: false,
    requiresModel: false,
  },
  {
    id: "convert",
    path: "/convert",
    category: "export",
    runtime: "client",
    status: "available",
    supportsBatch: false,
    requiresModel: false,
  },
  {
    id: "removeBackground",
    path: "/remove-background",
    category: "cleanup",
    runtime: "client",
    status: "available",
    supportsBatch: false,
    requiresModel: true,
  },
  {
    id: "resizeUpscale",
    path: "/resize-upscale",
    category: "enhance",
    runtime: "client",
    status: "available",
    supportsBatch: false,
    requiresModel: true,
  },
  {
    id: "magicBrush",
    path: "/magic-brush",
    category: "cleanup",
    runtime: "client",
    status: "available",
    supportsBatch: true,
    requiresModel: false,
  },
] as const satisfies readonly EditorToolDefinition[];

export type EditorToolId = (typeof EDITOR_TOOLS)[number]["id"];

export const getEditorToolById = (id: EditorToolId) => EDITOR_TOOLS.find((tool) => tool.id === id);
