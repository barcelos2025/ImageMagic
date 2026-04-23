import { useCallback } from "react";

import { useEditorJobs } from "./useEditorJobs";
import { useEditorNotifications } from "./useEditorNotifications";

interface RunEditorJobOptions<TResult> {
  id: string;
  label: string;
  successMessage?: string;
  fallbackError: string;
  task: (helpers: { reportProgress: (progress: number, nextLabel?: string) => void }) => Promise<TResult>;
}

export const useEditorProcessing = () => {
  const jobs = useEditorJobs();
  const notifications = useEditorNotifications();

  const runJob = useCallback(
    async <TResult,>({ id, label, successMessage, fallbackError, task }: RunEditorJobOptions<TResult>) => {
      jobs.upsertJob({ id, label, progress: 5, status: "running" });

      try {
        const result = await task({
          reportProgress: (progress, nextLabel) => {
            jobs.upsertJob({
              id,
              label: nextLabel ?? label,
              progress: Math.max(0, Math.min(100, Math.round(progress))),
              status: "running",
            });
          },
        });

        jobs.upsertJob({ id, label, progress: 100, status: "done" });
        if (successMessage) {
          notifications.success(successMessage);
        }
        window.setTimeout(() => jobs.removeJob(id), 1200);
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : fallbackError;
        jobs.upsertJob({ id, label, progress: 100, status: "error", error: message });
        notifications.error(message);
        throw error;
      }
    },
    [jobs, notifications],
  );

  return {
    ...jobs,
    runJob,
  };
};
