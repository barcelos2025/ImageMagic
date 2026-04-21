import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import type { Plugin } from "vite";

const debugLogPlugin = (): Plugin => {
  const logDir = path.resolve(__dirname, "runtime-logs");
  const logFile = path.join(logDir, "magic-brush.log");

  const ensureLogDir = async () => {
    await fs.promises.mkdir(logDir, { recursive: true });
  };

  const handleLogRequest = async (req: NodeJS.ReadableStream, res: NodeJS.WritableStream & { setHeader: (name: string, value: string) => void; statusCode: number; end: (chunk?: string) => void }) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        await ensureLogDir();
        await fs.promises.appendFile(logFile, `${JSON.stringify(payload)}\n`, "utf8");
        res.statusCode = 204;
        res.end();
      } catch (error) {
        await ensureLogDir();
        await fs.promises.appendFile(
          logFile,
          `${JSON.stringify({
            category: "logger",
            level: "error",
            message: "Failed to parse client log payload",
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
            rawBody: body,
          })}\n`,
          "utf8",
        );
        res.statusCode = 400;
        res.end("invalid log payload");
      }
    });
  };

  const registerMiddleware = (middlewares: { use: (path: string, handler: (req: NodeJS.ReadableStream, res: NodeJS.WritableStream & { setHeader: (name: string, value: string) => void; statusCode: number; end: (chunk?: string) => void }) => void) => void }) => {
    middlewares.use("/__debug/client-log", (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      const method = (req as { method?: string }).method ?? "GET";

      if (method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (method !== "POST") {
        res.statusCode = 405;
        res.end("method not allowed");
        return;
      }

      void handleLogRequest(req, res);
    });
  };

  return {
    configurePreviewServer(server) {
      registerMiddleware(server.middlewares);
    },
    configureServer(server) {
      registerMiddleware(server.middlewares);
    },
    name: "debug-log-plugin",
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), debugLogPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
