import React from "react";
import { Download } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExportControlsProps {
  label: string;
  disabled?: boolean;
  className?: string;
  onDownload: () => void;
}

export const ExportControls: React.FC<ExportControlsProps> = ({ label, disabled, className, onDownload }) => (
  <Button
    onClick={onDownload}
    disabled={disabled}
    className={cn("w-full bg-gradient-success text-success-foreground", className)}
  >
    <Download className="mr-2 h-4 w-4" />
    {label}
  </Button>
);
