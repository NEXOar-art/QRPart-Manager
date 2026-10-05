import React, { useState, useEffect } from 'react';
import { AutoPart, BusinessConfig } from '../types/inventory';
import { generateQrDataUrl, formatPartQrPayload, formatShelfQrPayload } from '../utils/qrGenerator';
import { SHELVES_DIRECTORY } from '../data/initialData';
import { 
  X, Printer, CheckSquare, Square, Layers, 
  Warehouse, Tag, SlidersHorizontal, Check 
} from 'lucide-react';

interface PrintLabelsModalProps {
  parts: AutoPart[];
  config: BusinessConfig;
  initialSelectedPart?: AutoPart;
  onClose: () => void;
}

export const PrintLabelsModal: React.FC<PrintLabelsModalProps> = ({
  parts,
  config,
  initialSelectedPart,
  onClose
}) => {
  const [labelType, setLabelType] = useState<'parts' | 'shelves'>('parts');
  const [paperFormat, setPaperFormat] = useState<'thermal80' | 'thermal58' | 'sheetA4'>('thermal80');
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>(
    initialSelectedPart ? [initialSelectedPart.id] : parts.slice(0, 4).map(p => p.id)
  );
  const [selectedShelves, setSelectedShelves] = useState<string[]>(
    SHELVES_DIRECTORY.map(s => s.id)
  );

  // Cached QR Data URLs
  const [qrCache, setQrCache] = useState<Record<string, string>>({});
  const [loadingQrs, setLoadingQrs] = useState(false);

  // Pre-generate QRs for selected items
  useEffect(() => {
    let isCancelled = false;
    setLoadingQrs(true);

    const generateAll = async () => {
      const cache: Record<string, string> = {};

      if (labelType === 'parts') {
        for (const p of parts) {
          if (selectedPartIds.includes(p.id)) {
            cache[p.id] = await generateQrDataUrl(formatPartQrPayload(p.id), 220);
          }
        }
      } else {
        for (const s of SHELVES_DIRECTORY) {
          if (selectedShelves.includes(s.id)) {
            cache[s.id] = await generateQrDataUrl(formatShelfQrPayload(s.id), 220);
          }
        }
      }

      if (!isCancelled) {
        setQrCache(cache);
        setLoadingQrs(false);
      }
    };

    generateAll();
    return () => { isCancelled = true; };
  }, [labelType, selectedPartIds, selectedShelves, parts]);

  const togglePartSelection = (id: string) => {
    setSelectedPartIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllParts = () => {
    if (selectedPartIds.length === parts.length) {
      setSelectedPartIds([]);
    } else {
      setSelectedPartIds(parts.map(p => p.id));
    }
  };

  const toggleShelfSelection = (id: string) => {
    setSelectedShelves(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedPartsList = parts.filter(p => selectedPartIds.includes(p.id));
  const selectedShelvesList = SHELVES_DIRECTORY.filter(s => selectedShelves.includes(s.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white text-base">
              Generador & Impresor de Etiquetas QR
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loadingQrs || (labelType === 'parts' ? selectedPartIds.length === 0 : selectedShelves.length === 0)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir ({labelType === 'parts' ? selectedPartIds.length : selectedShelves.length})</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-neutral-950/90 border-b border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-3 no-print">
          
          {/* Label Type */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Tipo de Etiqueta
            </label>
            <div className="flex rounded-lg bg-neutral-900 p-0.5 border border-neutral-800">
              <button
                onClick={() => setLabelType('parts')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  labelType === 'parts' ? 'bg-amber-400 text-neutral-950 font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                Para Piezas
              </button>
              <button
                onClick={() => setLabelType('shelves')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  labelType === 'shelves' ? 'bg-amber-400 text-neutral-950 font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Warehouse className="w-3.5 h-3.5" />
                Para Estanterías
              </button>
            </div>
          </div>

          {/* Paper Format */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Formato de Salida
            </label>
            <div className="flex rounded-lg bg-neutral-900 p-0.5 border border-neutral-800 text-xs">
              <button
                onClick={() => setPaperFormat('thermal80')}
                className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                  paperFormat === 'thermal80' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Térmico 80mm
              </button>
              <button
                onClick={() => setPaperFormat('thermal58')}
                className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                  paperFormat === 'thermal58' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Térmico 58mm
              </button>
              <button
                onClick={() => setPaperFormat('sheetA4')}
                className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                  paperFormat === 'sheetA4' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Hoja A4
              </button>
            </div>
          </div>

          {/* Selection Stats */}
          <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0">
            {labelType === 'parts' && (
              <button
                onClick={toggleSelectAllParts}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                {selectedPartIds.length === parts.length ? 'Deseleccionar todas' : 'Seleccionar todas las piezas'}
              </button>
            )}
            <span className="text-xs text-neutral-400">
              {labelType === 'parts' ? `${selectedPartIds.length} seleccionadas` : `${selectedShelves.length} estantes`}
            </span>
          </div>

        </div>

        {/* Split View: Left List Picker (no-print) / Right Print Preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Item Selector Column (Left) */}
          <div className="lg:col-span-4 border-r border-neutral-800 p-4 overflow-y-auto max-h-[60vh] bg-neutral-950/60 no-print space-y-2">
            <p className="text-xs font-semibold text-neutral-400 mb-2">
              {labelType === 'parts' ? 'Elegí las piezas a imprimir:' : 'Elegí los estantes a señalizar:'}
            </p>

            {labelType === 'parts' ? (
              parts.map(part => {
                const isSelected = selectedPartIds.includes(part.id);
                return (
                  <div
                    key={part.id}
                    onClick={() => togglePartSelection(part.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-neutral-900 border-amber-500/50 text-white'
                        : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-400">{part.id}</span>
                        <span className="truncate font-medium">{part.pieza}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {part.marca} {part.modelo} · {part.ubicacion.estante}
                      </p>
                    </div>
                    <div className="shrink-0 text-amber-400">
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-neutral-600" />}
                    </div>
                  </div>
                );
              })
            ) : (
              SHELVES_DIRECTORY.map(shelf => {
                const isSelected = selectedShelves.includes(shelf.id);
                const count = parts.filter(p => p.ubicacion.estante === shelf.id).length;
                return (
                  <div
                    key={shelf.id}
                    onClick={() => toggleShelfSelection(shelf.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-neutral-900 border-amber-500/50 text-white'
                        : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <p className="font-mono font-bold text-white">{shelf.id}</p>
                      <p className="text-[11px] text-neutral-400">{shelf.descripcion}</p>
                      <span className="text-[10px] text-amber-400/90">{count} piezas en este estante</span>
                    </div>
                    <div className="shrink-0 text-amber-400">
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-neutral-600" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Label Preview Column (Right / Printable in Browser) */}
          <div className="lg:col-span-8 p-6 overflow-y-auto max-h-[60vh] bg-neutral-950 flex flex-col items-center">
            
            <div className="mb-4 text-center no-print">
              <span className="text-xs text-neutral-400">
                Vista previa de impresión térmica / autoadhesiva
              </span>
            </div>

            {loadingQrs && (
              <div className="text-xs text-neutral-400 my-8">
                Generando códigos QR de alta resolución...
              </div>
            )}

            {/* Printable Container */}
            <div className={`printable-area w-full flex flex-wrap gap-4 justify-center ${
              paperFormat === 'sheetA4' ? 'max-w-[700px]' : paperFormat === 'thermal58' ? 'max-w-[280px]' : 'max-w-[380px]'
            }`}>
              
              {/* PIECES LABELS */}
              {labelType === 'parts' && selectedPartsList.map(part => (
                <div
                  key={part.id}
                  className={`bg-white text-black p-3.5 rounded-md border-2 border-dashed border-neutral-300 print:border-black print-break-inside-avoid shadow-xs flex flex-col justify-between ${
                    paperFormat === 'thermal58' ? 'w-full text-[10px]' : paperFormat === 'thermal80' ? 'w-full text-xs' : 'w-[220px] text-[11px]'
                  }`}
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {/* Business Lockup & Unique Code */}
                  <div className="border-b border-black pb-1.5 mb-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold tracking-tight uppercase block leading-tight text-neutral-800 text-[10px]">
                        {config.nombreDesarmadero}
                      </span>
                      <span className="text-[9px] text-neutral-600">
                        CUIT {config.cuit} · RUDAC
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm bg-black text-white px-2 py-0.5 rounded">
                      {part.id}
                    </span>
                  </div>

                  {/* QR & Core Data Row */}
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 bg-white p-1 border border-neutral-300">
                      {qrCache[part.id] ? (
                        <img
                          src={qrCache[part.id]}
                          alt={part.id}
                          className={paperFormat === 'thermal58' ? 'w-20 h-20' : 'w-24 h-24'}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-neutral-100 flex items-center justify-center text-[9px]">
                          QR
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-extrabold uppercase text-neutral-900 leading-tight">
                        {part.pieza}
                      </p>
                      <p className="font-bold text-neutral-800">
                        {part.marca} {part.modelo} ({part.anio})
                      </p>
                      <div className="bg-neutral-100 border border-neutral-300 px-1.5 py-0.5 rounded text-[10px]">
                        <span className="font-semibold">ESTANTE: </span>
                        <strong className="font-mono text-black">{part.ubicacion.estante}</strong>
                      </div>
                      <p className="text-[9px] text-neutral-700 truncate">
                        {part.estadoPieza}
                      </p>
                    </div>
                  </div>

                  {/* Legal and price bottom bar */}
                  <div className="border-t border-black/80 pt-1.5 mt-2 flex items-center justify-between text-[9px]">
                    <span className="text-neutral-600 font-mono">
                      Ingreso: {part.fechaIngreso}
                    </span>
                    <span className="font-bold font-mono">
                      {part.precio !== null ? `$${part.precio.toLocaleString('es-AR')}` : 'CONSULTAR'}
                    </span>
                  </div>
                </div>
              ))}

              {/* SHELF LABELS */}
              {labelType === 'shelves' && selectedShelvesList.map(shelf => {
                const count = parts.filter(p => p.ubicacion.estante === shelf.id).length;
                return (
                  <div
                    key={shelf.id}
                    className={`bg-white text-black p-4 rounded-md border-2 border-black print-break-inside-avoid shadow-xs flex flex-col justify-between ${
                      paperFormat === 'thermal58' ? 'w-full text-xs' : 'w-full text-sm'
                    }`}
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                  >
                    <div className="border-b-2 border-black pb-1 mb-2 flex items-center justify-between">
                      <span className="font-bold uppercase text-[11px] text-neutral-800">
                        IDENTIFICADOR DE ESTANTERÍA
                      </span>
                      <span className="text-[10px] font-mono text-neutral-600">
                        {shelf.nave}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 my-2">
                      <div className="bg-white p-1 border-2 border-black shrink-0">
                        {qrCache[shelf.id] ? (
                          <img src={qrCache[shelf.id]} alt={shelf.id} className="w-24 h-24" />
                        ) : (
                          <div className="w-24 h-24 bg-neutral-100 flex items-center justify-center text-xs">
                            QR Estante
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <span className="text-xs uppercase text-neutral-600 font-bold block">
                          Ubicación
                        </span>
                        <h2 className="text-2xl font-black font-mono tracking-tight text-black leading-none">
                          {shelf.id}
                        </h2>
                        <p className="text-xs font-semibold text-neutral-800 mt-1">
                          {shelf.descripcion}
                        </p>
                        <p className="text-[11px] text-neutral-600 mt-1">
                          {shelf.pasillo} · {count} piezas inventariadas
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-neutral-300 pt-1 text-[9px] text-center text-neutral-600">
                      Escanee este código con QRParts Manager para auditar el contenido de este estante
                    </div>
                  </div>
                );
              })}

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="bg-neutral-950 px-5 py-3 border-t border-neutral-800 flex items-center justify-between no-print">
          <p className="text-xs text-neutral-400">
            💡 Las etiquetas están optimizadas para impresoras térmicas (Zebra, Xprinter, etc.) y hojas autoadhesivas.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-neutral-400 hover:text-white"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
