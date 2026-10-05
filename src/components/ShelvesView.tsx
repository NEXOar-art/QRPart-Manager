import React, { useState } from 'react';
import { AutoPart } from '../types/inventory';
import { SHELVES_DIRECTORY } from '../data/initialData';
import { 
  Warehouse, MapPin, QrCode, Printer, Plus, 
  ExternalLink, Car, CheckCircle2, Clock, AlertTriangle 
} from 'lucide-react';

interface ShelvesViewProps {
  parts: AutoPart[];
  onSelectPart: (part: AutoPart) => void;
  onPrintShelf: (shelfId: string) => void;
  selectedShelfId?: string | null;
}

export const ShelvesView: React.FC<ShelvesViewProps> = ({
  parts,
  onSelectPart,
  onPrintShelf,
  selectedShelfId: propSelectedShelf
}) => {
  const [activeShelfId, setActiveShelfId] = useState<string>(propSelectedShelf || 'Estante B-4');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  // Unique zones
  const zones = Array.from(new Set(SHELVES_DIRECTORY.map(s => s.nave)));

  const filteredShelves = SHELVES_DIRECTORY.filter(s => 
    selectedZone === 'all' || s.nave === selectedZone
  );

  const activeShelfInfo = SHELVES_DIRECTORY.find(s => s.id === activeShelfId) || SHELVES_DIRECTORY[0];
  
  // Parts on the active shelf
  const partsOnActiveShelf = parts.filter(p => p.ubicacion.estante === activeShelfInfo.id);

  return (
    <div className="space-y-4">
      {/* Top Banner explaining shelf QR concept */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-400/10 text-amber-400 shrink-0">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">
              Control Físico de Estanterías y Racks
            </h3>
            <p className="text-xs text-neutral-400">
              Cada estantería tiene su propio código QR físico. Al escanear el QR del estante con el móvil, el empleado visualiza el inventario completo de ese estante y detecta piezas faltantes.
            </p>
          </div>
        </div>

        <button
          onClick={() => onPrintShelf(activeShelfInfo.id)}
          className="px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir Cartel QR del Estante</span>
        </button>
      </div>

      {/* Main Shelves Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Shelf Directory List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Zone filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => setSelectedZone('all')}
              className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors ${
                selectedZone === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todos los Sectores
            </button>
            {zones.map(z => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                className={`flex-1 py-1.5 px-2 rounded-md font-medium truncate transition-colors ${
                  selectedZone === z ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {z.replace('Nave ', '')}
              </button>
            ))}
          </div>

          {/* Shelves List */}
          <div className="space-y-2">
            {filteredShelves.map(shelf => {
              const count = parts.filter(p => p.ubicacion.estante === shelf.id).length;
              const isSelected = activeShelfId === shelf.id;
              
              return (
                <div
                  key={shelf.id}
                  onClick={() => setActiveShelfId(shelf.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-amber-400/80 shadow-md ring-1 ring-amber-400/20'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">
                          {shelf.id}
                        </span>
                        {shelf.id === 'Estante B-4' && (
                          <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                            Caso Ejemplo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {shelf.descripcion}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        {shelf.nave} · {shelf.pasillo}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {count}
                      </span>
                      <span className="text-[10px] text-neutral-500 block">
                        piezas
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Shelf Contents Audit Panel */}
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          
          {/* Active Shelf Top Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>{activeShelfInfo.nave}</span>
                <span>·</span>
                <span>{activeShelfInfo.pasillo}</span>
              </div>
              <h2 className="text-xl font-bold text-white font-mono mt-0.5">
                {activeShelfInfo.id}
              </h2>
              <p className="text-xs text-neutral-300">
                {activeShelfInfo.descripcion}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">
                Total en este estante: <strong className="text-white font-mono">{partsOnActiveShelf.length}</strong> piezas
              </span>
            </div>
          </div>

          {/* Parts on this Shelf */}
          {partsOnActiveShelf.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <Warehouse className="w-10 h-10 mx-auto text-neutral-600" />
              <p className="text-sm font-medium text-white">Estantería sin piezas asignadas</p>
              <p className="text-xs text-neutral-500">
                Al registrar nuevas piezas en el inventario podés seleccionar este estante para su guardado físico.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {partsOnActiveShelf.map(part => (
                <div
                  key={part.id}
                  onClick={() => onSelectPart(part)}
                  className="p-3 bg-neutral-950/80 hover:bg-neutral-800/80 border border-neutral-800/80 hover:border-neutral-700 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    {part.fotos && part.fotos.length > 0 ? (
                      <img
                        src={part.fotos[0]}
                        alt={part.pieza}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-neutral-700 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-500">
                        <Car className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {part.id}
                        </span>
                        <h4 className="font-semibold text-white text-sm">
                          {part.pieza}
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {part.marca} {part.modelo} ({part.anio}) · <span className="text-neutral-300">{part.ubicacion.nivel || 'Bandeja'}</span>
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate max-w-sm">
                        {part.estadoPieza}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                    <div className="text-right">
                      {part.precio !== null ? (
                        <span className="font-mono font-bold text-white text-xs block">
                          $ {part.precio.toLocaleString('es-AR')}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-400 font-semibold block">
                          Consultar
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-500">
                        {part.status === 'disponible' && <span className="text-emerald-400">Disponible</span>}
                        {part.status === 'reservada' && <span className="text-amber-400">Reservada</span>}
                        {part.status === 'vendida' && <span className="text-neutral-400">Vendida</span>}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPart(part);
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-800 group-hover:bg-neutral-700 rounded transition-colors"
                    >
                      Ver Ficha
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
