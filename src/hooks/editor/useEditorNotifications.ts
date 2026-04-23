import { useMemo } from "react";
import { toast } from "sonner";

export const useEditorNotifications = () =>
  useMemo(
    () => ({
      success: (message: string) => toast.success(message),
      error: (message: string) => toast.error(message),
      progress: (message: string) => toast(message),
    }),
    [],
  );
