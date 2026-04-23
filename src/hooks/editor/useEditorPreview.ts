import { useCallback, useEffect, useState } from "react";

export const useEditorPreview = () => {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const clearPreview = useCallback(() => {
    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return "";
    });
  }, []);

  const setPreviewFromBlob = useCallback((blob: Blob) => {
    const nextUrl = URL.createObjectURL(blob);
    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return nextUrl;
    });
  }, []);

  return {
    previewUrl,
    clearPreview,
    setPreviewFromBlob,
  };
};
