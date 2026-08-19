"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Zap,
  Compass,
  Wrench,
  BookOpen,
  Car,
  ShoppingBag,
  Sun,
  Moon,
  ShieldCheck,
  User as UserIcon,
  Menu,
  X,
  PlusCircle,
  LogIn,
  LogOut,
  KeyRound,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout, openLoginModal, openRegisterModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/rutas", label: "Rutas 3D", icon: Compass },
    { href: "/electrolineras", label: "Electrolineras", icon: Zap },
    { href: "/talleres", label: "Talleres EV", icon: Wrench },
    { href: "/manuales", label: "Manuales", icon: BookOpen },
    { href: "/vehiculos", label: "Catálogo", icon: Car },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  ];

  const getInitials = (name?: string | null) => {
    if (!name) return "VE";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleLabel = (role?: string) => {
    if (role === "ADMIN") return "Administrador";
    if (role === "MODERATOR") return "Moderador";
    return "Propietario EV";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black font-heading tracking-tight flex items-center gap-1">
              VE<span className="text-emerald-500">COLOMBIA</span>
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest -mt-1">
              Comunidad EV
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-500" : "text-muted-foreground"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/marketplace">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
              Publicar Venta
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cambiar Modo Claro/Oscuro"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Auth Avatar / Login Buttons */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-emerald-500/50 transition-all cursor-pointer"
              >
                <Avatar
                  src={user.image || undefined}
                  fallback={getInitials(user.name)}
                  className="w-9 h-9 border-2 border-emerald-500 shadow-sm"
                />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    <p className="text-xs font-bold text-foreground">{user.name || "Usuario VE"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-mono-spec font-bold text-emerald-500">
                        Rol: {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-emerald-500" />
                    Panel de Usuario & Garaje
                  </Link>

                  {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      Panel de Administrador
                    </Link>
                  )}

                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin/setup"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <KeyRound className="w-4 h-4 text-cyan-400" />
                      Crear Nuevo Administrador
                    </Link>
                  )}

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    type="button"
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openLoginModal}
                className="gap-1 text-xs font-semibold h-8"
              >
                <LogIn className="w-3.5 h-3.5" />
                Ingresar
              </Button>
              <Button
                variant="electric"
                size="sm"
                onClick={openRegisterModal}
                className="gap-1 text-xs font-bold h-8 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Registrarse
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-card px-4 pt-2 pb-6 space-y-2">
          {/* User profile or login in mobile */}
          {user ? (
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <Avatar src={user.image || undefined} fallback={getInitials(user.name)} className="w-9 h-9" />
                <div>
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <p className="text-[10px] text-emerald-400 font-mono-spec">Rol: {getRoleLabel(user.role)}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={logout} className="text-xs h-7 text-red-400 border-red-950">
                Salir
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-2">
              <Button variant="outline" size="sm" onClick={() => { setMobileMenuOpen(false); openLoginModal(); }} className="flex-1 text-xs">
                Iniciar Sesión
              </Button>
              <Button variant="electric" size="sm" onClick={() => { setMobileMenuOpen(false); openRegisterModal(); }} className="flex-1 text-xs font-bold">
                Registrarse
              </Button>
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-500 font-bold"
                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-500" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-foreground"
            >
              <UserIcon className="w-4 h-4 text-emerald-500" />
              Panel de Usuario & Garaje
            </Link>
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-amber-500"
              >
                <ShieldCheck className="w-4 h-4" />
                Panel de Administrador
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
