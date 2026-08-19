import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-900/40 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Mission */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
              <Zap className="h-4 w-4 fill-slate-950 text-slate-950" />
            </div>
            <span className="text-base font-black font-heading tracking-tight text-white">
              VE<span className="text-emerald-400">COLOMBIA</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Comunidad y plataforma colaborativa abierta para usuarios de vehículos 100% eléctricos e híbridos enchufables en Colombia. Información técnica confiable, rutas 3D y red nacional de carga.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono-spec">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Red Nacional Activa 2024
          </div>
        </div>

        {/* Col 2: Exploración */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading">
            Exploración Nacional
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <Link href="/rutas" className="hover:text-emerald-400 transition-colors">
                Rutas 3D & Perfiles de Elevación
              </Link>
            </li>
            <li>
              <Link href="/electrolineras" className="hover:text-emerald-400 transition-colors">
                Mapa Nacional de Electrolineras (CCS2 / GB-T)
              </Link>
            </li>
            <li>
              <Link href="/talleres" className="hover:text-emerald-400 transition-colors">
                Talleres Especializados en Alta Tensión
              </Link>
            </li>
            <li>
              <Link href="/manuales" className="hover:text-emerald-400 transition-colors">
                Manuales de Rescate y Diagramas BMS
              </Link>
            </li>
            <li>
              <Link href="/vehiculos" className="hover:text-emerald-400 transition-colors">
                Catálogo de Vehículos Eléctricos
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Comunidad & Aportes */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading">
            Comunidad & Moderación
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                Panel de Usuario & Mi Garaje EV
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Panel de Moderación
              </Link>
            </li>
            <li>
              <Link href="/dashboard?action=new-station" className="hover:text-emerald-400 transition-colors">
                Reportar Nueva Electrolinera
              </Link>
            </li>
            <li>
              <Link href="/dashboard?action=new-workshop" className="hover:text-emerald-400 transition-colors">
                Registrar Taller Especializado
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Información de la Red */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading">
            Red Eléctrica Nacional
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Plataforma comunitaria con cobertura nacional de estaciones de carga rápida, compatibilidad multimarca y simulación topográfica de rutas andinas.
          </p>
          <div className="pt-2 text-[11px] text-slate-500 flex flex-col gap-1">
            <span>• Cobertura nacional en tiempo real</span>
            <span>• Directorio técnico especializado</span>
            <span>• Comunidad activa de propietarios</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} VE Colombia. Hecho por y para la comunidad eléctrica.</p>
        <div className="flex items-center gap-4">
          <span>Bogotá • Medellín • Cali • Eje Cafetero • Costa Caribe</span>
        </div>
      </div>
    </footer>
  );
}
