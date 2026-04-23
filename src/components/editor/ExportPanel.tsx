import React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ExportPanelProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ title, description, children }) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);
