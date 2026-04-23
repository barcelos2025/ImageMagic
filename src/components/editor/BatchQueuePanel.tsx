import React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface BatchQueueItemView {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "processing" | "done" | "error";
}

interface BatchQueuePanelProps {
  title: string;
  description?: string;
  items: BatchQueueItemView[];
  emptyLabel: string;
}

const STATUS_STYLES: Record<BatchQueueItemView["status"], string> = {
  pending: "bg-muted text-muted-foreground",
  processing: "bg-primary/10 text-primary",
  done: "bg-emerald-500/10 text-emerald-600",
  error: "bg-destructive/10 text-destructive",
};

export const BatchQueuePanel: React.FC<BatchQueuePanelProps> = ({ title, description, items, emptyLabel }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>
      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-border/70 px-3 py-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">{item.title}</p>
                {item.description ? <p className="text-xs text-muted-foreground">{item.description}</p> : null}
              </div>
              <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]", STATUS_STYLES[item.status])}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )}
    </CardContent>
  </Card>
);
