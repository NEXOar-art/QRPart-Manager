import React, { useState } from 'react';
import { BusinessConfig, AutoPart } from '../types/inventory';
import { X, Save, Building2, RotateCcw, Download, Upload, Shield } from 'lucide-react';

interface BusinessSettingsModalProps {
  config: BusinessConfig;
  parts: AutoPart[];
  onClose: () => void;
  onSaveConfig: (cfg: BusinessConfig) => void;
  onResetDemo: () => void;
  onImportBackup: (importedParts: AutoPart[]) => void;
}

export const BusinessSettingsModal: React.FC<BusinessSettingsModalProps> = ({
  config,
  parts,
  onClose,
  onSaveConfig,
  onResetDemo,
  onImportBackup
}) => {
  const [form, setForm] = useState<BusinessConfig>({ ...config });
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    onClose();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(parts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `qrparts_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
          onImportBackup(parsed);
          setImportStatus(`Se importaron con éxito ${parsed.length} piezas.`);
        } else {
          setImportStatus('El archivo JSON no tiene el formato válido de QRParts.');
        }
      } catch {
        setImportStatus('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-4">
        
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white text-base">
              Datos del Desarmadero & Etiquetas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Nombre Comercial del Desarmadero *
            </label>
            <input
              type="text"
              value={form.nombreDesarmadero}
              onChange={(e) => setForm({ ...form, nombreDesarmadero: e.target.value })}
              required
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                CUIT / Identificación Fiscal
              </label>
              <input
                type="text"
                value={form.cuit}
                onChange={(e) => setForm({ ...form, cuit: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Dirección del Depósito
            </label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Leyenda Legal para Etiquetas y RUDAC
            </label>
            <textarea
              value={form.leyendaLegal}
              onChange={(e) => setForm({ ...form, leyendaLegal: e.target.value })}
              rows={2}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Backup & Demo section */}
          <div className="pt-3 border-t border-neutral-800 space-y-3">
            <label className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
              Copia de Seguridad & Restauración
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Backup JSON</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Backup</span>
                <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Restablecer datos al catálogo de ejemplo (incluye DES-0248 Gol Trend)?')) {
                    onResetDemo();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Demo</span>
              </button>
            </div>

            {importStatus && (
              <p className="text-xs text-amber-400 bg-amber-950/40 p-2 rounded border border-amber-800/60">
                {importStatus}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
