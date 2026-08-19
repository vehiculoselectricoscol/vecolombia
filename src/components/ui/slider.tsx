"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  className?: string;
  label?: string;
  valueDisplay?: string;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
  label,
  valueDisplay,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full space-y-2", className)}>
      {(label || valueDisplay) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-semibold text-muted-foreground">{label}</span>}
          {valueDisplay && (
            <span className="font-mono-spec font-bold text-emerald-500">{valueDisplay}</span>
          )}
        </div>
      )}
      <div className="relative flex items-center select-none touch-none w-full h-5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
          style={{
            background: `linear-gradient(to right, #10b981 ${percentage}%, #334155 ${percentage}%)`,
          }}
        />
      </div>
    </div>
  );
}
