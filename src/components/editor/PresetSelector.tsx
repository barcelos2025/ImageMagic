import React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface PresetOption {
  value: string;
  label: string;
  description?: string;
}

interface PresetSelectorProps {
  label: string;
  options: PresetOption[];
  value: string;
  hint?: string;
  onValueChange: (value: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ label, options, value, hint, onValueChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">{label}</label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
  </div>
);
