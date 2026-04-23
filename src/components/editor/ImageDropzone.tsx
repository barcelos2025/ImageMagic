import React from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "@/components/icons";

import { IMAGE_INPUT_ACCEPT } from "@/lib/image-engine";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  idleLabel: string;
  activeLabel: string;
  hint: string;
  maxSize?: number;
  multiple?: boolean;
  className?: string;
  onFilesAccepted: (files: File[]) => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  idleLabel,
  activeLabel,
  hint,
  maxSize = 20 * 1024 * 1024,
  multiple = false,
  className,
  onFilesAccepted,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFilesAccepted,
    accept: IMAGE_INPUT_ACCEPT,
    multiple,
    maxSize,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        className,
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{isDragActive ? activeLabel : idleLabel}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
};
