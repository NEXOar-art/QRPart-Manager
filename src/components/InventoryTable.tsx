import React, { useState, useMemo } from 'react';
import { AutoPart, PartStatus } from '../types/inventory';
import { 
  Search, Filter, QrCode, Printer, MapPin, 
  ExternalLink, LayoutList, LayoutGrid, CheckCircle2, 
  Clock, AlertOctagon, Download, Car, Eye
} from 'lucide-react';

interface InventoryTableProps {
  parts: AutoPart[];
  onSelectPart: (part: AutoPart) => void;
  onQuickStatusChange: (partId: string, newStatus: PartStatus) => void;
  onPrintSingle: (part: AutoPart) => void;
  onEditPart: (part: AutoPart) => void;
  onExportCsv: () => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  parts,
  onSelectPart,
  onQuickStatusChange,
  onPrintSingle,
  onEditPart,
  onExportCsv
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PartStatus>('all');
  const [shelfFilter, setShelfFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Extract unique shelves for filter dropdown
  const uniqueShelves = useMemo(() => {
    const set = new Set<string>();
    parts.forEach(p => {
      if (p.ubicacion?.estante) set.add(p.ubicacion.estante);
    });
    return Array.from(set).sort();
  }, [parts]);

  // Filtered parts
  const filteredParts = useMemo(() => {
    return parts.filter(p => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesShelf = shelfFilter === 'all' || p.ubicacion?.estante === shelfFilter;
      
      const query = searchTerm.toLowerCase().trim();
      if (!query) return matchesStatus && matchesShelf;

      const matchesSearch = 
        p.id.toLowerCase().includes(query) ||
        p.pieza.toLowerCase().includes(query) ||
        p.marca.toLowerCase().includes(query) ||
        p.modelo.toLowerCase().includes(query) ||
        p.anio.toString().includes(query) ||
        p.ubicacion.estante.toLowerCase().includes(query) ||
        p.ubicacion.nave.toLowerCase().includes(query) ||
        (p.numeroMotor && p.numeroMotor.toLowerCase().includes(query)) ||
        (p.numeroChasis && p.numeroChasis.toLowerCase().includes(query));

      return matchesStatus && matchesShelf && matchesSearch;
    });
  }, [parts, searchTerm, statusFilter, shelfFilter]);

  const getStatusBadge = (status: PartStatus) => {
    switch (status) {
      case 'disponible':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Disponible
          </span>
        );
      case 'reservada':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Reservada
          </span>
        );
      case 'vendida':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
            Vendida
          </span>
        );
      case 'en_revision':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
            En Revisión
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código (ej. DES-0248), pieza, Gol Trend, estante B-4, motor o chasis..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-neutral-300"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Shelves Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={shelfFilter}
                onChange={(e) => setShelfFilter(e.target.value)}
                className="appearance-none bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-medium py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:border-amber-500/50"
              >
                <option value="all">Todas las Estanterías</option>
                {uniqueShelves.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">
                ▼
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('table')}
                title="Vista Planilla"
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Vista Cuadrícula"
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'cards' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV button */}
            <button
              onClick={onExportCsv}
              title="Exportar a planilla CSV"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Status Tab Filters (Zero-pill button controls with counts) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-800/60">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-950/70 border border-neutral-800/80 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Todas ({parts.length})
            </button>
            <button
              onClick={() => setStatusFilter('disponible')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'disponible'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Disponibles ({parts.filter(p => p.status === 'disponible').length})
            </button>
            <button
              onClick={() => setStatusFilter('reservada')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'reservada'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Reservadas ({parts.filter(p => p.status === 'reservada').length})
            </button>
            <button
              onClick={() => setStatusFilter('vendida')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'vendida'
                  ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Vendidas ({parts.filter(p => p.status === 'vendida').length})
            </button>
          </div>

          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <span>Mostrando <span className="font-mono font-semibold text-white tabular-nums">{filteredParts.length}</span> piezas</span>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Cards View */}
      {filteredParts.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No se encontraron piezas</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            No hay resultados para los filtros seleccionados. Probá modificando el término de búsqueda o cambiando el estado.
          </p>
          {(searchTerm || statusFilter !== 'all' || shelfFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setShelfFilter('all');
              }}
              className="mt-4 px-3.5 py-1.5 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-500/20 rounded-lg hover:bg-amber-400/20 transition-colors"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* High-density Planilla / Spreadsheet View */
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950/80 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th scope="col" className="py-3 px-4">Código QR</th>
                  <th scope="col" className="py-3 px-4">Pieza & Categoría</th>
                  <th scope="col" className="py-3 px-4">Vehículo de Origen</th>
                  <th scope="col" className="py-3 px-4">Ubicación Física</th>
                  <th scope="col" className="py-3 px-4">Estado Pieza</th>
                  <th scope="col" className="py-3 px-4 text-right">Precio</th>
                  <th scope="col" className="py-3 px-4 text-center">Disponibilidad</th>
                  <th scope="col" className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {filteredParts.map((part) => {
                  return (
                    <tr
                      key={part.id}
                      className="hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectPart(part)}
                    >
                      {/* Código QR */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {part.id}
                          </span>
                        </div>
                      </td>

                      {/* Pieza & Categoría */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {part.fotos && part.fotos.length > 0 ? (
                            <img
                              src={part.fotos[0]}
                              alt={part.pieza}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded object-cover border border-neutral-700/80 shrink-0 bg-neutral-800"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-neutral-800 border border-neutral-700/80 flex items-center justify-center shrink-0 text-neutral-500">
                              <Car className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate max-w-xs">{part.pieza}</p>
                            <p className="text-[11px] text-neutral-400">{part.categoria}</p>
                          </div>
                        </div>
                      </td>

                      {/* Vehículo */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-neutral-200">
                          {part.marca} {part.modelo}
                        </p>
                        <p className="text-xs text-neutral-400 font-mono tabular-nums">
                          Año {part.anio} {part.versionMotor ? `· ${part.versionMotor}` : ''}
                        </p>
                      </td>

                      {/* Ubicación Física */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-200">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-semibold text-white">{part.ubicacion.estante}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 pl-5">
                          {part.ubicacion.nave} {part.ubicacion.nivel ? `· ${part.ubicacion.nivel}` : ''}
                        </p>
                      </td>

                      {/* Estado de la pieza */}
                      <td className="py-3 px-4 text-xs text-neutral-300 max-w-xs truncate">
                        {part.estadoPieza}
                      </td>

                      {/* Precio */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {part.precio !== null ? (
                          <span className="font-mono font-semibold text-white tabular-nums">
                            $ {part.precio.toLocaleString('es-AR')}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-400 font-medium">Consultar</span>
                        )}
                      </td>

                      {/* Disponibilidad */}
                      <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center">
                          {getStatusBadge(part.status)}
                        </div>
                        {part.status === 'reservada' && part.reservadoA && (
                          <p className="text-[10px] text-amber-400/80 truncate max-w-[120px] mx-auto mt-0.5">
                            {part.reservadoA}
                          </p>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectPart(part)}
                            title="Ver detalles y código QR"
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPrintSingle(part)}
                            title="Imprimir etiqueta QR"
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredParts.map((part) => (
            <div
              key={part.id}
              onClick={() => onSelectPart(part)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all cursor-pointer flex flex-col group shadow-xs"
            >
              {/* Image Frame */}
              <div className="relative h-44 bg-neutral-950 overflow-hidden">
                {part.fotos && part.fotos.length > 0 ? (
                  <img
                    src={part.fotos[0]}
                    alt={part.pieza}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 bg-neutral-950">
                    <Car className="w-8 h-8 mb-1" />
                    <span className="text-xs">Sin foto</span>
                  </div>
                )}

                {/* Top Overlay Chips */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="font-mono text-xs font-bold text-neutral-950 bg-amber-400 px-2 py-0.5 rounded shadow-sm">
                    {part.id}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 bg-neutral-950/80 backdrop-blur-sm px-2 py-0.5 rounded border border-neutral-800">
                  {getStatusBadge(part.status)}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-semibold text-white text-base leading-snug line-clamp-1">
                    {part.pieza}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
                    <span>{part.marca} {part.modelo}</span>
                    <span>·</span>
                    <span className="font-mono">{part.anio}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                    {part.estadoPieza}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-neutral-500 block text-[10px]">Ubicación</span>
                    <span className="font-semibold text-neutral-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {part.ubicacion.estante}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-neutral-500 block text-[10px]">Precio</span>
                    {part.precio !== null ? (
                      <span className="font-mono font-bold text-white text-sm tabular-nums">
                        $ {part.precio.toLocaleString('es-AR')}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400 font-semibold">Consultar</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div 
                className="bg-neutral-950/70 px-4 py-2.5 border-t border-neutral-800/80 flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[11px] text-neutral-500 font-mono">
                  {part.ubicacion.nave}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPrintSingle(part)}
                    className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                    title="Imprimir etiqueta"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSelectPart(part)}
                    className="px-2.5 py-1 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
                  >
                    Ver Ficha
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
