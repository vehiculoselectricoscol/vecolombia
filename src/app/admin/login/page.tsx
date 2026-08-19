"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Credenciales inválidas");
      }

      toast.success(data.message || "¡Acceso concedido al panel de administración!");
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground">
            Acceso Administrativo
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa a la consola de moderación y administración nacional de VE Colombia.
          </p>
        </div>

        <Card className="p-6 border-amber-500/20 shadow-2xl bg-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                Correo de Administrador
              </label>
              <Input
                required
                type="email"
                placeholder="admin@vecolombia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                Contraseña
              </label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="electric"
              className="w-full font-bold text-sm py-2.5 mt-2"
            >
              {loading ? "Verificando..." : "Ingresar al Panel de Moderación"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 text-center text-xs text-muted-foreground">
            <Link href="/admin/setup" className="text-amber-500 font-bold hover:underline flex items-center justify-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              ¿Primera vez? Crear cuenta de Administrador ➔
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground pt-1">
              Volver al inicio público
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
