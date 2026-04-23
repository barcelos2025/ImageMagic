import { useCallback, useMemo, useState } from "react";

export interface EditorJob {
  id: string;
  label: string;
  progress: number;
  status: "pending" | "running" | "done" | "error";
  error?: string;
}

export const useEditorJobs = () => {
  const [jobs, setJobs] = useState<EditorJob[]>([]);

  const upsertJob = useCallback((job: EditorJob) => {
    setJobs((current) => {
      const index = current.findIndex((item) => item.id === job.id);
      if (index < 0) {
        return [...current, job];
      }
      const nextJobs = [...current];
      nextJobs[index] = job;
      return nextJobs;
    });
  }, []);

  const removeJob = useCallback((jobId: string) => {
    setJobs((current) => current.filter((job) => job.id !== jobId));
  }, []);

  const clearJobs = useCallback(() => setJobs([]), []);

  const activeJob = useMemo(() => jobs.find((job) => job.status === "running") ?? null, [jobs]);

  return {
    jobs,
    activeJob,
    upsertJob,
    removeJob,
    clearJobs,
  };
};
