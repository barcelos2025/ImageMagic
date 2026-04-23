import React from "react";

interface EditorShellProps {
  hero: React.ReactNode;
  topSlot?: React.ReactNode;
  sidebar: React.ReactNode;
  preview: React.ReactNode;
  footer?: React.ReactNode;
}

export const EditorShell: React.FC<EditorShellProps> = ({ hero, topSlot, sidebar, preview, footer }) => (
  <div className="container space-y-8 py-12">
    {hero}
    {topSlot}
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div>{sidebar}</div>
      <div>{preview}</div>
    </div>
    {footer}
  </div>
);
