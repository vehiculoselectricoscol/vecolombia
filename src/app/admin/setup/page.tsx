"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Key,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+57 ");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminSecretKey, setAdminSecretKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/setup-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          adminSecretKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error creando administrador");
      }

      toast.success(data.message || "¡Administrador creado con éxito!");
      setTimeout(() => {
        router.push("/admin/login");
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Error al registrar administrador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground">
            Crear Administrador de Sistema
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Configuración independiente de cuenta de administración para moderación de contenido y gestión de la plataforma VE Colombia.
          </p>
        </div>

        <Card className="p-6 border-amber-500/30 shadow-2xl bg-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                Nombre del Administrador
              </label>
              <Input
                required
                placeholder="Ej. Alejandro Ríos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  Correo Electrónico
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
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  Celular
                </label>
                <Input
                  required
                  placeholder="+57 312 456 7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Contraseña (Mín. 8 caracteres)
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

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Confirmar Contraseña
                </label>
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
              <label className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-heading">
                <Key className="w-3.5 h-3.5" />
                Clave Maestra de Autorización (ADMIN_SETUP_SECRET)
              </label>
              <Input
                required
                type="password"
                placeholder="Ingresa la clave de seguridad definida en el .env"
                value={adminSecretKey}
                onChange={(e) => setAdminSecretKey(e.target.value)}
                className="mt-1 bg-background"
              />
              <p className="text-[11px] text-muted-foreground">
                Por defecto: <code className="font-mono-spec font-bold text-foreground">vecolombia_admin_master_2024</code> o la configurada en tu <code className="font-mono-spec">.env</code>.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="electric"
              className="w-full font-bold text-sm py-2.5 mt-2"
            >
              {loading ? "Creando Administrador..." : "Crear y Asignar Rol Administrador"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-muted-foreground">
            ¿Ya tienes cuenta de administrador?{" "}
            <Link href="/admin/login" className="text-emerald-500 font-bold hover:underline">
              Iniciar Sesión en Panel de Moderación ➔
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
