import React, { useState, useEffect, useRef } from 'react';
import { AutoPart } from '../types/inventory';
import { parseQrPayload } from '../utils/qrGenerator';
import { 
  X, Camera, CameraOff, Sparkles, Search, 
  MapPin, AlertCircle, RefreshCw, Upload, Check 
} from 'lucide-react';

interface QrScannerModalProps {
  parts: AutoPart[];
  onClose: () => void;
  onPartDetected: (part: AutoPart) => void;
  onShelfDetected?: (shelfId: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  parts,
  onClose,
  onPartDetected,
  onShelfDetected
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [inputFeedback, setInputFeedback] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no está soportada en este navegador.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        startScanningLoop();
      }
    } catch (err: unknown) {
      console.warn('Camera start issue:', err);
      const errMsg = err instanceof Error ? err.message : 'No se pudo acceder a la cámara.';
      setCameraError(
        errMsg.includes('Permission') || errMsg.includes('NotAllowed')
          ? 'Permiso de cámara denegado. Podés probar con el selector rápido o ingresar el código manualmente.'
          : 'Cámara no disponible o no encontrada en este dispositivo.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setCameraActive(false);
  };

  // Barcode / QR detection loop using native BarcodeDetector if available
  const startScanningLoop = () => {
    const BarcodeDetectorClass = (window as unknown as { BarcodeDetector?: any }).BarcodeDetector;
    if (!BarcodeDetectorClass) {
      return; // Fallback will allow manual search & simulation
    }

    try {
      const barcodeDetector = new BarcodeDetectorClass({
        formats: ['qr_code', 'code_128', 'ean_13']
      });

      const scanFrame = async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              processDetectedCode(rawValue);
              return; // Stop loop once detected
            }
          } catch {
            // Frame detection error, continue
          }
        }
        animFrameRef.current = requestAnimationFrame(scanFrame);
      };

      animFrameRef.current = requestAnimationFrame(scanFrame);
    } catch {
      // Browser didn't support configured formats
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const processDetectedCode = (codeStr: string) => {
    const { type, id } = parseQrPayload(codeStr);

    if (type === 'shelf') {
      if (onShelfDetected) {
        onShelfDetected(id);
        onClose();
        return;
      }
    }

    // Lookup part
    const cleanId = id.toUpperCase();
    const found = parts.find(p => p.id.toUpperCase() === cleanId);
    if (found) {
      stopCamera();
      onPartDetected(found);
      onClose();
    } else {
      // Check if code matches any shelf
      const shelfMatch = parts.find(p => p.ubicacion.estante.toLowerCase() === id.toLowerCase());
      if (shelfMatch && onShelfDetected) {
        onShelfDetected(shelfMatch.ubicacion.estante);
        onClose();
        return;
      }

      setInputFeedback(`Código "${id}" no registrado en el inventario.`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processDetectedCode(manualCode.trim());
  };

  const handleQuickSelect = (part: AutoPart) => {
    stopCamera();
    onPartDetected(part);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white text-base">
              Escáner Móvil QR & Código
            </h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />

          {cameraActive ? (
            /* Scanning Laser Guide */
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-amber-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></div>
                <div className="absolute -top-6 inset-x-0 text-center text-[11px] font-medium text-amber-400">
                  Enfocá la etiqueta QR de la pieza
                </div>
              </div>
            </div>
          ) : (
            /* Camera Inactive / Error View */
            <div className="p-6 text-center text-neutral-400 space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                <CameraOff className="w-6 h-6" />
              </div>
              <p className="text-xs max-w-xs mx-auto">
                {cameraError || 'La cámara está inactiva o no se detectó dispositivo de video.'}
              </p>
              <button
                onClick={startCamera}
                className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reintentar Cámara
              </button>
            </div>
          )}
        </div>

        {/* Manual Code Input */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800">
          <form onSubmit={handleManualSubmit} className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Ingreso Manual o Pistola Lectora
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value);
                    setInputFeedback(null);
                  }}
                  placeholder="Ej: DES-0248"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
              >
                Buscar
              </button>
            </div>
            {inputFeedback && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {inputFeedback}
              </p>
            )}
          </form>
        </div>

        {/* Quick Simulation / Test Cases */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Simular escaneo de piezas de prueba
            </span>
            <span className="text-[11px] text-neutral-500">
              1 toque para abrir ficha
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {parts.slice(0, 5).map((part) => (
              <button
                key={part.id}
                onClick={() => handleQuickSelect(part)}
                className="w-full p-2.5 rounded-lg bg-neutral-950/70 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-left transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {part.id}
                    </span>
                    <span className="text-xs font-medium text-white truncate">
                      {part.pieza}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {part.marca} {part.modelo} ({part.anio}) · <span className="text-neutral-300">{part.ubicacion.estante}</span>
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 text-xs text-neutral-400 group-hover:text-amber-400 font-medium">
                  <span>Escanear</span>
                  <span className="font-mono">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-950 px-4 py-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Cerrar Escáner
          </button>
        </div>

      </div>
    </div>
  );
};
