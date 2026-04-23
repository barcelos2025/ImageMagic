import React from "react";

import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ children, className }) => (
  <div className={cn("grid gap-4 md:grid-cols-2", className)}>{children}</div>
);
