"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ui/image-uploader";
import { LogIn, UserPlus, Zap, Lock, Mail, User, Phone, ShieldCheck, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: (user: any) => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({
  open,
  onOpenChange,
  onAuthSuccess,
  defaultTab = "login",
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regImage, setRegImage] = useState("");

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: window.location.href });
    } catch (err: any) {
      toast.error("Error al conectar con Google");
      setGoogleLoading(false);
    }
  };

  // Secure Email/Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail.trim() || !loginEmail.includes("@")) {
      toast.error("Ingresa un correo electrónico válido");
      return;
    }
    if (!loginPassword) {
      toast.error("Ingresa tu contraseña");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success(data.message || "¡Sesión iniciada con éxito!");
      if (onAuthSuccess) onAuthSuccess(data.user);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Secure Register Form
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (regName.trim().length < 3) {
      toast.error("El nombre debe tener al menos 3 caracteres");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      toast.error("Ingresa un correo electrónico válido");
      return;
    }
    if (regPhone.trim().length < 7) {
      toast.error("Ingresa un número de celular válido");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          password: regPassword,
          image: regImage,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success(data.message || "¡Cuenta creada exitosamente!");
      if (onAuthSuccess) onAuthSuccess(data.user);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setLoginEmail("admin@vecolombia.com");
    setLoginPassword("AdminVecolombia2024*");
    toast.info("Credenciales de Administrador cargadas");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-5 h-5 fill-emerald-400" />
          </div>
          <div>
            <DialogTitle>
              {tab === "login" ? "Iniciar Sesión en VE Colombia" : "Crear Cuenta de Propietario"}
            </DialogTitle>
            <DialogDescription>
              {tab === "login"
                ? "Accede a tu garaje, gestiona tus vehículos y comparte trayectos."
                : "Regístrate para calificar electrolineras, subir bitácoras y participar."}
            </DialogDescription>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mt-3">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === "login"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === "register"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Registrarse
          </button>
        </div>
      </DialogHeader>

      <div className="space-y-4 pt-1">
        {/* 1-Click Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-60"
        >
          {/* Official Google Color SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{googleLoading ? "Conectando con Google..." : "Continuar con Google"}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-wider font-mono-spec shrink-0">
            o con tu correo
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block font-heading">
                Correo Electrónico
              </label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  placeholder="propietario@correo.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-9 text-xs h-9 bg-slate-950/70 border-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block font-heading">
                Contraseña
              </label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-9 text-xs h-9 bg-slate-950/70 border-slate-800"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="electric"
              disabled={loading}
              className="w-full font-bold text-xs gap-1.5 h-9 shadow-md shadow-emerald-500/20 mt-1"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Validando credenciales..." : "Ingresar a mi Cuenta"}
            </Button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleFillAdmin}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Autocompletar Administrador Demo</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block font-heading">
                Nombre Completo
              </label>
              <div className="relative mt-1">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Ej. Juan Pérez"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="pl-9 text-xs h-9 bg-slate-950/70 border-slate-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block font-heading">
                  Correo Electrónico
                </label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    placeholder="juan@correo.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="pl-9 text-xs h-9 bg-slate-950/70 border-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block font-heading">
                  Celular
                </label>
                <div className="relative mt-1">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="+57 300 123 4567"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="pl-9 text-xs h-9 bg-slate-950/70 border-slate-800"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block font-heading">
                Contraseña
              </label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="pl-9 text-xs h-9 bg-slate-950/70 border-slate-800"
                  required
                />
              </div>
            </div>

            <div className="pt-1">
              <ImageUploader
                value={regImage}
                onChange={setRegImage}
                label="Foto de Perfil (Opcional)"
                folder="vecolombia/users"
              />
            </div>

            <Button
              type="submit"
              variant="electric"
              disabled={loading}
              className="w-full font-bold text-xs gap-1.5 h-9 mt-2 shadow-md shadow-emerald-500/20"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Creando cuenta..." : "Crear Cuenta de Propietario"}
            </Button>
          </form>
        )}
      </div>
    </Dialog>
  );
}
