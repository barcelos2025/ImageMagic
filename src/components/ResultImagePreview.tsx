import React from "react";

import { Maximize2 } from "@/components/icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ResultImageDialogProps {
  alt: string;
  className?: string;
  imageClassName?: string;
  imageStyle?: React.CSSProperties;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  src: string;
}

export const ResultImageDialog: React.FC<ResultImageDialogProps> = ({
  alt,
  className,
  imageClassName,
  imageStyle,
  onOpenChange,
  open,
  src,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={cn("max-h-[94vh] w-[96vw] max-w-6xl overflow-hidden border-border/40 p-3", className)}>
      <DialogTitle className="sr-only">{alt}</DialogTitle>
      <div className="flex max-h-[88vh] items-center justify-center overflow-auto rounded-md bg-muted/30 p-2">
        <img
          src={src}
          alt={alt}
          className={cn("max-h-[84vh] max-w-full rounded-md object-contain", imageClassName)}
          style={imageStyle}
        />
      </div>
    </DialogContent>
  </Dialog>
);

interface ResultImagePreviewProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  dialogClassName?: string;
  dialogImageClassName?: string;
  dialogImageStyle?: React.CSSProperties;
  triggerClassName?: string;
}

export const ResultImagePreview: React.FC<ResultImagePreviewProps> = ({
  alt = "",
  className,
  dialogClassName,
  dialogImageClassName,
  dialogImageStyle,
  src,
  style,
  triggerClassName,
  ...imageProps
}) => {
  const [open, setOpen] = React.useState(false);

  if (!src) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          "group relative block w-full overflow-hidden rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          triggerClassName,
        )}
        onClick={() => setOpen(true)}
      >
        <img src={src} alt={alt} className={className} style={style} {...imageProps} />
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/85 text-foreground opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>

      <ResultImageDialog
        alt={alt}
        className={dialogClassName}
        imageClassName={dialogImageClassName}
        imageStyle={dialogImageStyle}
        onOpenChange={setOpen}
        open={open}
        src={src}
      />
    </>
  );
};
