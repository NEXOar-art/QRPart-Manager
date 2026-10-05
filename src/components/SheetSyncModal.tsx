import React, { useState } from 'react';
import { AutoPart, BusinessConfig, GoogleSheetSyncConfig } from '../types/inventory';
import { 
  fetchGoogleSheetParts, parseExcelOrCsvFile, exportInventoryToExcel, 
  GOOGLE_APPS_SCRIPT_TEMPLATE 
} from '../utils/sheetSync';
import { 
  X, FileSpreadsheet, Download, Upload, CheckCircle2, 
  AlertCircle, RefreshCw, Copy, Check, ExternalLink, 
  FileText, Sparkles, Cloud, ArrowRight, ShieldCheck 
} from 'lucide-react';

interface SheetSyncModalProps {
  parts: AutoPart[];
  config: BusinessConfig;
  onClose: () => void;
  onImportParts: (importedParts: AutoPart[], mode: 'replace' | 'merge') => void;
  onUpdateConfig: (newConfig: BusinessConfig) => void;
}

export const SheetSyncModal: React.FC<SheetSyncModalProps> = ({
  parts,
  config,
  onClose,
  onImportParts,
  onUpdateConfig
}) => {
  const currentSync = config.googleSheet || {
    sheetUrl: '',
    webhookUrl: '',
    autoSyncOnSave: true,
    syncStatus: 'disconnected'
  };

  const [sheetUrl, setSheetUrl] = useState(currentSync.sheetUrl || '');
  const [webhookUrl, setWebhookUrl] = useState(currentSync.webhookUrl || '');
  const [autoSyncOnSave, setAutoSyncOnSave] = useState(currentSync.autoSyncOnSave ?? true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showScriptGuide, setShowScriptGuide] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  
  // Excel File upload preview
  const [uploadedParts, setUploadedParts] = useState<AutoPart[] | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  // Handle Google Sheet Connect & Fetch
  const handleConnectSheet = async () => {
    if (!sheetUrl.trim()) {
      setFeedback({ type: 'error', message: 'Por favor, ingresá el enlace de tu Google Sheet.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const fetchedParts = await fetchGoogleSheetParts(sheetUrl.trim());
      
      const newSyncConfig: GoogleSheetSyncConfig = {
        sheetUrl: sheetUrl.trim(),
        webhookUrl: webhookUrl.trim() || undefined,
        autoSyncOnSave,
        syncStatus: 'connected',
        lastSyncTime: new Date().toISOString()
      };

      onUpdateConfig({
        ...config,
        googleSheet: newSyncConfig
      });

      onImportParts(fetchedParts, importMode);
      
      setFeedback({
        type: 'success',
        message: `¡Conexión exitosa! Se sincronizaron y cargaron ${fetchedParts.length} piezas desde Google Sheets.`
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al conectar con Google Sheets.';
      setFeedback({ type: 'error', message: msg });
      
      onUpdateConfig({
        ...config,
        googleSheet: {
          ...currentSync,
          sheetUrl: sheetUrl.trim(),
          webhookUrl: webhookUrl.trim() || undefined,
          syncStatus: 'error',
          lastError: msg
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Excel File Drop/Upload
  const handleExcelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const parsed = await parseExcelOrCsvFile(file);
      setUploadedParts(parsed);
      setFeedback({
        type: 'success',
        message: `Se leyeron ${parsed.length} piezas de "${file.name}". Revisá la vista previa y confirmá la importación.`
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo leer el archivo Excel.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm Excel File Import
  const handleConfirmExcelImport = () => {
    if (!uploadedParts || uploadedParts.length === 0) return;
    onImportParts(uploadedParts, importMode);
    setFeedback({
      type: 'success',
      message: `¡Listo! Se incorporaron ${uploadedParts.length} piezas al inventario con éxito.`
    });
    setUploadedParts(null);
  };

  // Export current inventory to Excel (.xlsx)
  const handleExportExcel = () => {
    exportInventoryToExcel(parts);
    setFeedback({
      type: 'success',
      message: 'Descarga iniciada: archivo Excel (.xlsx) generado con todas las piezas y estantes.'
    });
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base leading-tight">
                Integración con Google Sheets & Excel
              </h3>
              <p className="text-xs text-neutral-400">
                Sincronizá el depósito móvil con tu base de datos en ordenador o computadora central.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div className={`px-5 py-3 border-b text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 text-emerald-200 border-emerald-800/80'
              : 'bg-red-950/70 text-red-200 border-red-800/80'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Section 1: Google Sheets URL Connection */}
          <div className="p-4 sm:p-5 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-amber-400" />
                <h4 className="font-semibold text-white text-sm">
                  1. Conectar con Planilla de Google Sheets
                </h4>
              </div>
              {currentSync.syncStatus === 'connected' && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conectado
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Pegá el enlace de tu Google Sheet. Para que la app pueda leer los datos, asegurate de que el documento esté compartido como <strong>"Cualquier persona con el enlace puede ver"</strong> o publicado desde <em>Archivo &gt; Compartir &gt; Publicar en la web</em>.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block">
                Enlace o ID de Google Sheets
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit..."
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleConnectSheet}
                  disabled={isLoading || !sheetUrl.trim()}
                  className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>{isLoading ? 'Conectando...' : 'Sincronizar y Cargar'}</span>
                </button>
              </div>
            </div>

            {/* Realtime 2-way Webhook option */}
            <div className="pt-3 border-t border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sincronización Bidireccional en Tiempo Real (Google Apps Script)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowScriptGuide(!showScriptGuide)}
                  className="text-xs text-amber-400 hover:underline font-medium"
                >
                  {showScriptGuide ? 'Ocultar Código' : 'Ver Código del Script'}
                </button>
              </div>

              <p className="text-[11px] text-neutral-400">
                Opcional: cuando un operario en el patio registra una pieza con foto y estante desde su teléfono, se actualiza automáticamente en la hoja de cálculo de Google Sheets en tu PC.
              </p>

              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="URL de la Aplicación Web (Google Apps Script Webhook)"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoSync"
                  checked={autoSyncOnSave}
                  onChange={(e) => setAutoSyncOnSave(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-amber-400"
                />
                <label htmlFor="autoSync" className="text-xs text-neutral-300 cursor-pointer">
                  Enviar automáticamente cambios y fotos a Google Sheets al registrar o vender
                </label>
              </div>

              {/* Collapsible Apps Script Box */}
              {showScriptGuide && (
                <div className="mt-3 p-3.5 bg-neutral-900 rounded-lg border border-neutral-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Código para Google Apps Script:</span>
                    <button
                      onClick={handleCopyScript}
                      className="px-2.5 py-1 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-600 flex items-center gap-1"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? 'Copiado' : 'Copiar Código'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 bg-neutral-950 rounded text-[11px] text-neutral-300 font-mono overflow-x-auto max-h-40">
                    {GOOGLE_APPS_SCRIPT_TEMPLATE}
                  </pre>
                  <p className="text-[11px] text-neutral-400">
                    En tu Google Sheet ve a <strong>Extensiones &gt; Apps Script</strong>, pega este código, haz clic en <strong>Implementar &gt; Nueva implementación &gt; Aplicación Web</strong> (con acceso para 'Cualquiera') y copia el enlace aquí arriba.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Excel (.xlsx / .csv) File Upload & Export */}
          <div className="p-4 sm:p-5 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <h4 className="font-semibold text-white text-sm">
                2. Importar o Exportar Archivo Excel (.xlsx / .csv)
              </h4>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              ¿Tenés tu lista de piezas actual en una planilla de Excel en tu computadora? Podés cargarla directamente aquí. Detecta automáticamente columnas de código, repuesto, marca, modelo, estante, precio y estado.
            </p>

            {/* Import & Export Action Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Import File Button */}
              <label className="p-4 rounded-xl border-2 border-dashed border-neutral-700 hover:border-amber-400 bg-neutral-900/50 hover:bg-neutral-900 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
                <Upload className="w-6 h-6 text-neutral-400 group-hover:text-amber-400 mb-1.5 transition-colors" />
                <span className="text-xs font-semibold text-white">Subir archivo Excel o CSV</span>
                <span className="text-[11px] text-neutral-400 mt-0.5">Arrastrá aquí tu archivo .xlsx o hacé clic</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelFileUpload}
                  className="hidden"
                />
              </label>

              {/* Export File Button */}
              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-xs font-semibold text-white block">Descargar Base en Excel</span>
                  <span className="text-[11px] text-neutral-400 mt-0.5 block">
                    Exporta las {parts.length} piezas actuales con ubicación en estanterías, códigos QR y precios para chequear en el ordenador.
                  </span>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="w-full py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Descargar .XLSX</span>
                </button>
              </div>
            </div>

            {/* Uploaded Preview Dialog */}
            {uploadedParts && (
              <div className="p-4 bg-neutral-900 rounded-xl border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      Vista Previa de Importación: {uploadedParts.length} piezas listas
                    </h5>
                    <p className="text-[11px] text-neutral-400">
                      Elegí cómo deseas cargar estos datos en el sistema:
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadedParts(null)}
                    className="text-xs text-neutral-500 hover:text-white"
                  >
                    Descartar
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-amber-400 bg-neutral-950 border-neutral-700"
                    />
                    <span>Fusionar / Agregar al inventario existente</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-amber-400 bg-neutral-950 border-neutral-700"
                    />
                    <span>Reemplazar todo el inventario</span>
                  </label>
                </div>

                {/* Sample Rows Preview */}
                <div className="max-h-32 overflow-y-auto rounded border border-neutral-800 text-[11px]">
                  <table className="w-full text-left text-neutral-300">
                    <thead className="bg-neutral-950 text-neutral-400 font-mono text-[10px]">
                      <tr>
                        <th className="p-1.5">Código</th>
                        <th className="p-1.5">Pieza</th>
                        <th className="p-1.5">Vehículo</th>
                        <th className="p-1.5">Estante</th>
                        <th className="p-1.5 text-right">Precio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {uploadedParts.slice(0, 5).map((p, idx) => (
                        <tr key={idx}>
                          <td className="p-1.5 font-mono text-amber-400">{p.id}</td>
                          <td className="p-1.5 font-medium text-white">{p.pieza}</td>
                          <td className="p-1.5">{p.marca} {p.modelo} ({p.anio})</td>
                          <td className="p-1.5 text-neutral-400">{p.ubicacion.estante}</td>
                          <td className="p-1.5 text-right font-mono">
                            {p.precio !== null ? `$${p.precio.toLocaleString('es-AR')}` : 'Consultar'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setUploadedParts(null)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmExcelImport}
                    className="px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirmar y Guardar {uploadedParts.length} Piezas</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="bg-neutral-950 px-5 py-3.5 border-t border-neutral-800 flex items-center justify-between">
          <p className="text-[11px] text-neutral-500">
            {currentSync.lastSyncTime ? (
              <span>Última sincronización: <strong className="text-neutral-300 font-mono">{new Date(currentSync.lastSyncTime).toLocaleTimeString('es-AR')}</strong></span>
            ) : (
              <span>Modo almacenamiento local activo</span>
            )}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Listo / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
