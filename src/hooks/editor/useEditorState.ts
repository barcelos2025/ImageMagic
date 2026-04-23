import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface EditorBatchItem {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "processing" | "done" | "error";
}

interface UseEditorStateResult<TSettings> {
  settings: TSettings;
  canUndo: boolean;
  canRedo: boolean;
  batchQueue: EditorBatchItem[];
  syncSettings: (next: TSettings | ((current: TSettings) => TSettings)) => void;
  updateSettings: (updater: Partial<TSettings> | ((current: TSettings) => TSettings)) => void;
  replaceSettings: (next: TSettings) => void;
  undo: () => void;
  redo: () => void;
  setBatchQueue: (items: EditorBatchItem[]) => void;
}

export const useEditorState = <TSettings>(initialSettings: TSettings): UseEditorStateResult<TSettings> => {
  const [settings, setSettings] = useState(initialSettings);
  const [past, setPast] = useState<TSettings[]>([]);
  const [future, setFuture] = useState<TSettings[]>([]);
  const [batchQueue, setBatchQueue] = useState<EditorBatchItem[]>([]);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const pushHistory = useCallback((next: TSettings) => {
    const current = settingsRef.current;
    setPast((history) => [...history.slice(-49), current]);
    setFuture([]);
    settingsRef.current = next;
    setSettings(next);
  }, []);

  const replaceSettings = useCallback(
    (next: TSettings) => {
      pushHistory(next);
    },
    [pushHistory],
  );

  const syncSettings = useCallback((next: TSettings | ((current: TSettings) => TSettings)) => {
    setSettings((current) => {
      const resolved = typeof next === "function" ? (next as (value: TSettings) => TSettings)(current) : next;
      settingsRef.current = resolved;
      return resolved;
    });
  }, []);

  const updateSettings = useCallback(
    (updater: Partial<TSettings> | ((current: TSettings) => TSettings)) => {
      const current = settingsRef.current;
      const nextSettings =
        typeof updater === "function"
          ? (updater as (value: TSettings) => TSettings)(current)
          : ({ ...current, ...updater } as TSettings);

      pushHistory(nextSettings);
    },
    [pushHistory],
  );

  const undo = useCallback(() => {
    setPast((history) => {
      if (!history.length) {
        return history;
      }

      const previous = history[history.length - 1];
      setFuture((queued) => [settingsRef.current, ...queued]);
      settingsRef.current = previous;
      setSettings(previous);
      return history.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((queued) => {
      if (!queued.length) {
        return queued;
      }

      const [next, ...rest] = queued;
      setPast((history) => [...history.slice(-49), settingsRef.current]);
      settingsRef.current = next;
      setSettings(next);
      return rest;
    });
  }, []);

  return useMemo(
    () => ({
      settings,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      batchQueue,
      syncSettings,
      updateSettings,
      replaceSettings,
      undo,
      redo,
      setBatchQueue,
    }),
    [batchQueue, future.length, past.length, redo, replaceSettings, settings, syncSettings, undo, updateSettings],
  );
};
