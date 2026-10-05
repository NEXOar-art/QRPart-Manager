import React, { useState, useEffect } from 'react';
import { AutoPart, PartStatus, BusinessConfig } from '../types/inventory';
import { generateQrDataUrl, formatPartQrPayload } from '../utils/qrGenerator';
import confetti from 'canvas-confetti';
import { 
  X, MapPin, QrCode, Printer, Share2, CheckCircle2, 
  Clock, AlertTriangle, ShieldCheck, Car, Calendar, 
  DollarSign, Edit3, ArrowRight, Phone, Check, Copy
} from 'lucide-react';

interface PartModalProps {
  part: AutoPart;
  config: BusinessConfig;
  onClose: () => void;
  onUpdateStatus: (partId: string, status: PartStatus, details?: { reservadoA?: string; vendidoA?: string; precioVentaFinal?: number }) => void;
  onEdit: (part: AutoPart) => void;
  onPrint: (part: AutoPart) => void;
}

export const PartModal: React.FC<PartModalProps> = ({
  part,
  config,
  onClose,
  onUpdateStatus,
  onEdit,
  onPrint
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [actionStep, setActionStep] = useState<'idle' | 'reserve' | 'sell'>('idle');
  
  // Form states for reserve and sell
  const [clientName, setClientName] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [salePrice, setSalePrice] = useState<string>(part.precio ? part.precio.toString() : '');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    generateQrDataUrl(formatPartQrPayload(part.id), 260).then((url) => {
      if (isMounted) setQrUrl(url);
    });
    return () => { isMounted = false; };
  }, [part.id]);

  const handleConfirmReservation = () => {
    if (!clientName.trim()) return;
    onUpdateStatus(part.id, 'reservada', { reservadoA: clientName.trim() });
    setActionStep('idle');
  };

  const handleConfirmSale = () => {
    const finalPrice = parseFloat(salePrice) || part.precio || 0;
    onUpdateStatus(part.id, 'vendida', {
      vendidoA: buyerName.trim() || 'Cliente Mostrador',
      precioVentaFinal: finalPrice
    });
    setActionStep('idle');
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleMakeAvailable = () => {
    onUpdateStatus(part.id, 'disponible');
    setActionStep('idle');
  };

  const handleShareWhatsApp = () => {
    const text = `*${config.nombreDesarmadero}*\n` +
      `📦 *Pieza:* ${part.pieza}\n` +
      `🚗 *Vehículo:* ${part.marca} ${part.modelo} (${part.anio})\n` +
      `🏷️ *Código QR:* ${part.id}\n` +
      `📍 *Ubicación:* ${part.ubicacion.estante} (${part.ubicacion.nave})\n` +
      `✨ *Estado:* ${part.estadoPieza}\n` +
      `💰 *Precio:* ${part.precio ? `$${part.precio.toLocaleString('es-AR')}` : 'A consultar'}\n` +
      `📋 *Estado Actual:* ${part.status.toUpperCase()}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(part.id);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-500/20">
              {part.id}
            </span>
            <div className="text-xs text-neutral-400 hidden sm:block">
              <span>Ingreso: <strong className="text-neutral-300 font-mono">{part.fechaIngreso}</strong></span>
              {part.fechaVenta && (
                <>
                  <span className="mx-1.5">·</span>
                  <span>Vendido: <strong className="text-neutral-300 font-mono">{part.fechaVenta}</strong></span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              title="Copiar código"
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onEdit(part)}
              title="Editar pieza"
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Critical Availability Banner */}
        {part.status === 'vendida' ? (
          <div className="bg-red-950/70 border-b border-red-800/80 px-5 py-3 flex items-center justify-between gap-3 text-red-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="font-bold text-red-300">¡PIEZA YA VENDIDA!</p>
                <p className="text-xs text-red-300/80">
                  Vendida el {part.fechaVenta || 'recientemente'} a: <strong>{part.vendidoA || 'Cliente Registrado'}</strong>.
                  No ofrecer para venta duplicate.
                </p>
              </div>
            </div>
            <button
              onClick={handleMakeAvailable}
              className="px-2.5 py-1 text-xs font-semibold text-red-200 bg-red-900/60 hover:bg-red-900 rounded border border-red-700/60 shrink-0 transition-colors"
            >
              Restaurar a Disponible
            </button>
          </div>
        ) : part.status === 'reservada' ? (
          <div className="bg-amber-950/70 border-b border-amber-800/80 px-5 py-3 flex items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-amber-300">PIEZA RESERVADA</p>
                <p className="text-xs text-amber-300/80">
                  Apartada para: <strong>{part.reservadoA || 'Cliente'}</strong>. Ubicada en {part.ubicacion.estante}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActionStep('sell')}
                className="px-2.5 py-1 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
              >
                Cobrar y Entregar
              </button>
              <button
                onClick={handleMakeAvailable}
                className="px-2 py-1 text-xs text-amber-300 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              >
                Liberar
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/50 border-b border-emerald-800/60 px-5 py-2.5 flex items-center justify-between gap-3 text-emerald-200">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Pieza <strong className="text-emerald-300">DISPONIBLE</strong> en depósito · Lista para retiro en <strong className="text-white">{part.ubicacion.estante}</strong>.
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setActionStep('reserve')}
                className="px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/60 rounded transition-colors"
              >
                Reservar
              </button>
              <button
                onClick={() => setActionStep('sell')}
                className="px-2.5 py-1 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
              >
                Marcar Vendida
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Action Inlines (Reserve or Sell forms) */}
        {actionStep === 'reserve' && (
          <div className="bg-neutral-950 p-4 border-b border-neutral-800 animate-in fade-in">
            <h4 className="text-xs font-semibold text-amber-400 mb-2">Reservar Pieza</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre del cliente / Teléfono / Taller (ej: Taller Charly 11-4433-2211)"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirmReservation}
                  disabled={!clientName.trim()}
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors"
                >
                  Confirmar Reserva
                </button>
                <button
                  onClick={() => setActionStep('idle')}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {actionStep === 'sell' && (
          <div className="bg-neutral-950 p-4 border-b border-neutral-800 animate-in fade-in">
            <h4 className="text-xs font-semibold text-emerald-400 mb-2">Registrar Venta de Pieza</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Comprador / Empresa / Factura"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                  autoFocus
                />
              </div>
              <div>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Precio Final ($)"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-2.5">
              <button
                onClick={() => setActionStep('idle')}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSale}
                className="px-4 py-1.5 text-xs font-semibold text-neutral-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                Confirmar y Dar de Baja
              </button>
            </div>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[75vh] overflow-y-auto">
          
          {/* Left Column: Photos & QR */}
          <div className="space-y-4">
            {/* Primary Photo */}
            <div className="relative h-52 bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              {part.fotos && part.fotos.length > 0 ? (
                <img
                  src={part.fotos[selectedPhotoIndex] || part.fotos[0]}
                  alt={part.pieza}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-neutral-500">
                  <Car className="w-10 h-10 mx-auto mb-2 opacity-60" />
                  <span className="text-xs">Sin fotos cargadas</span>
                </div>
              )}
            </div>

            {/* Thumbnail carousel if multiple */}
            {part.fotos && part.fotos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {part.fotos.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      selectedPhotoIndex === idx ? 'border-amber-400' : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Foto ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* QR Card Container */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex flex-col items-center text-center">
              <div className="bg-white p-2.5 rounded-lg shadow-sm mb-2">
                {qrUrl ? (
                  <img src={qrUrl} alt={`QR ${part.id}`} className="w-36 h-36 object-contain" />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-neutral-400 text-xs">
                    Generando QR...
                  </div>
                )}
              </div>
              <span className="font-mono text-xs font-bold text-amber-400">
                {part.id}
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Escaneable con cualquier celular o lector del depósito
              </p>
            </div>
          </div>

          {/* Right Two Columns: Technical Spec & Junkyard Data */}
          <div className="md:col-span-2 space-y-5">
            {/* Title & Vehicle */}
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <span className="text-amber-400 font-medium">{part.categoria}</span>
                <span>·</span>
                <span>Desarmadero Autorizado</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {part.pieza}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-neutral-300">
                <Car className="w-4 h-4 text-neutral-400" />
                <span className="font-medium text-white">{part.marca} {part.modelo}</span>
                <span>·</span>
                <span className="font-mono text-neutral-300">Año {part.anio}</span>
                {part.versionMotor && (
                  <>
                    <span>·</span>
                    <span className="text-xs text-neutral-400">{part.versionMotor}</span>
                  </>
                )}
              </div>
            </div>

            {/* Price & Location Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Location Card */}
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ubicación Física en Depósito</span>
                </div>
                <p className="text-lg font-bold text-white font-mono">
                  {part.ubicacion.estante}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {part.ubicacion.nave} · {part.ubicacion.pasillo}
                  {part.ubicacion.nivel ? ` · ${part.ubicacion.nivel}` : ''}
                </p>
              </div>

              {/* Price Card */}
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Precio de Lista</span>
                </div>
                {part.precio !== null ? (
                  <p className="text-lg font-bold text-white font-mono tabular-nums">
                    $ {part.precio.toLocaleString('es-AR')}
                  </p>
                ) : (
                  <p className="text-base font-bold text-amber-400">
                    A Consultar
                  </p>
                )}
                {part.precioVentaFinal && (
                  <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                    Vendido final: ${part.precioVentaFinal.toLocaleString('es-AR')}
                  </p>
                )}
              </div>
            </div>

            {/* Condition & Observations */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">
                  Estado y Condición de la Pieza
                </label>
                <div className="bg-neutral-950/50 border border-neutral-800 rounded-lg p-3 text-xs sm:text-sm text-neutral-200">
                  {part.estadoPieza}
                </div>
              </div>

              {part.observaciones && (
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">
                    Notas de Desmontaje / Compatibilidad
                  </label>
                  <p className="text-xs text-neutral-400 bg-neutral-950/30 p-2.5 rounded-lg border border-neutral-800/80">
                    {part.observaciones}
                  </p>
                </div>
              )}
            </div>

            {/* Traceability & Legal (RUDAC / Motor / Chasis) */}
            <div className="pt-2 border-t border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Trazabilidad Legal (Ley 25.761 / RUDAC)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-neutral-950 p-2 rounded border border-neutral-800/80">
                  <span className="text-neutral-500 block text-[10px]">N° Motor</span>
                  <span className="font-mono text-neutral-200 font-medium">
                    {part.numeroMotor || 'S/D'}
                  </span>
                </div>
                <div className="bg-neutral-950 p-2 rounded border border-neutral-800/80">
                  <span className="text-neutral-500 block text-[10px]">Chasis / VIN</span>
                  <span className="font-mono text-neutral-200 font-medium truncate block">
                    {part.numeroChasis || 'S/D'}
                  </span>
                </div>
                <div className="bg-neutral-950 p-2 rounded border border-neutral-800/80">
                  <span className="text-neutral-500 block text-[10px]">Oblea RUDAC</span>
                  <span className="font-mono text-amber-400 font-medium">
                    {part.obleaRudac || 'Homologada'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Quick Action Toolbar */}
        <div className="bg-neutral-950 px-5 py-3.5 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(part)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-200 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Etiqueta</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/40 rounded-lg transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Enviar por WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
