type LogLevel = "debug" | "info" | "warn" | "error";

interface ClientLogPayload {
  category: string;
  details?: Record<string, unknown>;
  level?: LogLevel;
  message: string;
}

const LOG_ENDPOINT = "/__debug/client-log";

const getSessionId = () => {
  const existing = sessionStorage.getItem("imagemagic-debug-session");
  if (existing) {
    return existing;
  }

  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem("imagemagic-debug-session", next);
  return next;
};

const normalizeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return {
    value: String(error),
  };
};

export const createTimer = () => {
  const start = performance.now();
  return () => Math.round(performance.now() - start);
};

export const logClientEvent = async ({
  category,
  details,
  level = "info",
  message,
}: ClientLogPayload) => {
  const payload = {
    category,
    details,
    level,
    message,
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  const consoleMethod =
    level === "error" ? console.error : level === "warn" ? console.warn : level === "debug" ? console.debug : console.info;

  consoleMethod("[magic-brush]", message, details ?? {});

  try {
    await fetch(LOG_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.warn("Client log endpoint is unavailable.", normalizeError(error));
  }
};

export const logClientError = async (
  category: string,
  message: string,
  error: unknown,
  details?: Record<string, unknown>,
) =>
  logClientEvent({
    category,
    details: {
      ...details,
      error: normalizeError(error),
    },
    level: "error",
    message,
  });
