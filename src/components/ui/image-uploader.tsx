"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder = "vecolombia/vehicles",
  label = "Fotografía del Vehículo",
  className = "",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 10 MB");
      return;
    }

    // Local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al subir la imagen");
      }

      setPreview(data.url);
      onChange(data.url);
      toast.success("¡Fotografía cargada exitosamente!");
    } catch (err: any) {
      toast.error(err.message || "Error al subir la imagen");
      // Keep local preview if upload fails
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(undefined);
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase text-muted-foreground block flex items-center justify-between">
          <span>{label}</span>
          {preview && (
            <span className="text-[10px] text-emerald-500 font-mono-spec flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3 h-3" /> Imagen Lista
            </span>
          )}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/avif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 h-44 w-full flex items-center justify-center">
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-semibold h-8"
            >
              Cambiar Foto
            </Button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="p-2 rounded-xl bg-red-600/80 text-white hover:bg-red-600 transition-colors"
              title="Eliminar Foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              <span className="text-xs font-semibold">Subiendo imagen...</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-card hover:bg-emerald-500/5 group flex flex-col items-center justify-center gap-2"
        >
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 text-muted-foreground group-hover:text-emerald-500 group-hover:scale-110 transition-all">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-foreground">
              Haz clic para seleccionar o arrastra una fotografía
            </p>
            <p className="text-[11px] text-muted-foreground">
              PNG, JPG o WEBP (Máximo 10 MB)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1 text-xs gap-1.5 font-semibold group-hover:border-emerald-500 group-hover:text-emerald-500"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Seleccionar Archivo de Imagen
          </Button>
        </div>
      )}
    </div>
  );
}
