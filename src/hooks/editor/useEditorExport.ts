import { useCallback } from "react";

import { downloadBlob } from "@/lib/image-engine";

export const useEditorExport = () => {
  const exportFile = useCallback((blobOrUrl: Blob | string, fileName: string) => {
    downloadBlob(blobOrUrl, fileName);
  }, []);

  return {
    exportFile,
  };
};
