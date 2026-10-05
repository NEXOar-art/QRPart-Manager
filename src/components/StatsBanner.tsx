import React from 'react';
import { AutoPart } from '../types/inventory';
import { AlertCircle, CheckCircle2, Clock, PackageCheck, QrCode } from 'lucide-react';

interface StatsBannerProps {
  parts: AutoPart[];
  onSelectSample: (id: string) => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ parts, onSelectSample }) => {
  const total = parts.length;
  const disponibles = parts.filter(p => p.status === 'disponible').length;
  const reservadas = parts.filter(p => p.status === 'reservada').length;
  const vendidas = parts.filter(p => p.status === 'vendida').length;

  return (
    <div className="space-y-3">
      {/* Example practical highlight card as requested in user prompt */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-400/10 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-0.5">
              <span className="font-semibold text-neutral-200">Caso Práctico de Referencia</span>
              <span>·</span>
              <span className="font-mono text-amber-400 font-medium">QR: DES-0248</span>
              <span>·</span>
              <span>Estante B-4</span>
            </div>
            <p className="text-sm text-neutral-200">
              <strong className="text-white font-medium">Óptica delantera derecha</strong> — Volkswagen Gol Trend 2014 (Usada, sin fisuras).
              <span className="hidden sm:inline text-neutral-400 text-xs ml-1.5">
                Al escanear el QR se accede al instante para reservar o registrar venta.
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={() => onSelectSample('DES-0248')}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Ver Ficha & Escanear</span>
          </button>
        </div>
      </div>

      {/* Operational Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">Total en Registro</p>
            <p className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">{total}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Piezas codificadas con QR</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">Disponibles en Depósito</p>
            <p className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5">{disponibles}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Listas para despacho inmediato</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">Reservadas</p>
            <p className="text-xl font-bold text-amber-400 font-mono tabular-nums mt-0.5">{reservadas}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Con seña o cliente asignado</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">Vendidas</p>
            <p className="text-xl font-bold text-neutral-300 font-mono tabular-nums mt-0.5">{vendidas}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Historial con baja registrada</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
