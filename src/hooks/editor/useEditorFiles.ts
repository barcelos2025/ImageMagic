import { useCallback, useEffect, useState } from "react";

export const useEditorFiles = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");

  useEffect(() => {
    return () => {
      if (sourceUrl) {
        URL.revokeObjectURL(sourceUrl);
      }
    };
  }, [sourceUrl]);

  const clearFile = useCallback(() => {
    setFile(null);
    setSourceUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return "";
    });
  }, []);

  const setAcceptedFiles = useCallback((acceptedFiles: File[]) => {
    const nextFile = acceptedFiles[0];
    if (!nextFile) return;

    const nextUrl = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setSourceUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return nextUrl;
    });
  }, []);

  return {
    file,
    sourceUrl,
    clearFile,
    setAcceptedFiles,
  };
};
