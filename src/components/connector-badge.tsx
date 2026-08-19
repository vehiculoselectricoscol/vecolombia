import React from "react";
import { ConnectorType } from "@/types";
import { CONNECTOR_METADATA } from "@/lib/utils";
import { Zap } from "lucide-react";

interface ConnectorBadgeProps {
  type: ConnectorType;
  powerKw?: number;
  showDetails?: boolean;
}

export function ConnectorBadge({ type, powerKw, showDetails = false }: ConnectorBadgeProps) {
  const meta = CONNECTOR_METADATA[type] || {
    label: type,
    short: type,
    type: "DC",
    bgClass: "bg-slate-500/10",
    borderClass: "border-slate-500/30 text-slate-400",
    textClass: "text-slate-400",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${meta.bgClass} ${meta.borderClass}`}
      title={showDetails ? meta.description : undefined}
    >
      <Zap className={`w-3 h-3 ${meta.type === "DC" ? "text-emerald-500 fill-emerald-500" : "text-blue-400"}`} />
      <span>{meta.short}</span>
      {powerKw && (
        <span className="font-mono-spec font-bold px-1.5 py-0.5 rounded bg-black/20 text-[10px] text-foreground">
          {powerKw} kW
        </span>
      )}
    </div>
  );
}
