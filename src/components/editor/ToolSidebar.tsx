import React from "react";

import { ArrowLeft, ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ToolSidebarProps {
  title: string;
  description?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  undoLabel?: string;
  redoLabel?: string;
  children: React.ReactNode;
}

export const ToolSidebar: React.FC<ToolSidebarProps> = ({
  title,
  description,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  undoLabel = "Undo",
  redoLabel = "Redo",
  children,
}) => (
  <Card className="h-full">
    <CardHeader className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {(onUndo || onRedo) ? (
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onUndo} disabled={!canUndo}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {undoLabel}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onRedo} disabled={!canRedo}>
              <ArrowRight className="mr-2 h-4 w-4" />
              {redoLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </CardHeader>
    <CardContent className="space-y-5">{children}</CardContent>
  </Card>
);
