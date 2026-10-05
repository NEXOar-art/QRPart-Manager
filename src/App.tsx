import React, { useState, useEffect } from 'react';
import { AutoPart, BusinessConfig, ActivityRecord, PartStatus } from './types/inventory';
import { 
  loadParts, saveParts, loadConfig, saveConfig, 
  loadActivities, logActivity, resetToDemo 
} from './utils/storage';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { InventoryTable } from './components/InventoryTable';
import { PartModal } from './components/PartModal';
import { PartFormModal } from './components/PartFormModal';
import { QrScannerModal } from './components/QrScannerModal';
import { PrintLabelsModal } from './components/PrintLabelsModal';
import { ShelvesView } from './components/ShelvesView';
import { ActivityLogView } from './components/ActivityLogView';
import { BusinessSettingsModal } from './components/BusinessSettingsModal';
import { SheetSyncModal } from './components/SheetSyncModal';
import { exportInventoryToExcel, sendPartToGoogleSheetWebhook } from './utils/sheetSync';

export default function App() {
  const [parts, setParts] = useState<AutoPart[]>([]);
  const [config, setConfig] = useState<BusinessConfig>(loadConfig());
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<'inventory' | 'shelves' | 'labels' | 'history'>('inventory');

  // Modals
  const [selectedPart, setSelectedPart] = useState<AutoPart | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [partToEdit, setPartToEdit] = useState<AutoPart | undefined>(undefined);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [initialPrintPart, setInitialPrintPart] = useState<AutoPart | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSheetSyncOpen, setIsSheetSyncOpen] = useState(false);
  const [selectedShelfForView, setSelectedShelfForView] = useState<string | null>(null);

  // Load data on startup
  useEffect(() => {
    const loaded = loadParts();
    setParts(loaded);
    setActivities(loadActivities());
  }, []);

  // Save changes
  const updatePartsState = (newParts: AutoPart[]) => {
    setParts(newParts);
    saveParts(newParts);
  };

  // Status transition handler (e.g. from PartModal or quick action)
  const handleUpdateStatus = (
    partId: string, 
    newStatus: PartStatus, 
    details?: { reservadoA?: string; vendidoA?: string; precioVentaFinal?: number }
  ) => {
    const updated = parts.map(p => {
      if (p.id === partId) {
        const item: AutoPart = {
          ...p,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          ...(newStatus === 'reservada' && {
            reservadoA: details?.reservadoA || p.reservadoA
          }),
          ...(newStatus === 'vendida' && {
            vendidoA: details?.vendidoA || p.vendidoA || 'Cliente Mostrador',
            precioVentaFinal: details?.precioVentaFinal || p.precio || undefined,
            fechaVenta: new Date().toISOString().split('T')[0]
          }),
          ...(newStatus === 'disponible' && {
            reservadoA: undefined,
            vendidoA: undefined,
            fechaVenta: undefined,
            precioVentaFinal: undefined
          })
        };
        return item;
      }
      return p;
    });

    updatePartsState(updated);

    const changedItem = parts.find(p => p.id === partId);
    if (changedItem) {
      logActivity({
        partId,
        partName: `${changedItem.pieza} (${changedItem.marca} ${changedItem.modelo})`,
        action: newStatus === 'vendida' ? 'vendida' : newStatus === 'reservada' ? 'reservada' : 'disponible',
        description: newStatus === 'vendida'
          ? `Venta registrada a ${details?.vendidoA || 'Cliente'}. Pieza dada de baja para evitar doble venta.`
          : newStatus === 'reservada'
          ? `Pieza reservada para ${details?.reservadoA || 'Cliente'}. Ubicación: ${changedItem.ubicacion.estante}.`
          : `Pieza restaurada a estado Disponible en ${changedItem.ubicacion.estante}.`
      });
      setActivities(loadActivities());

      // If Google Sheets Webhook is active, sync status change in background
      if (config.googleSheet?.webhookUrl && config.googleSheet.autoSyncOnSave) {
        const itemToSync = updated.find(p => p.id === partId);
        if (itemToSync) {
          sendPartToGoogleSheetWebhook(config.googleSheet.webhookUrl, itemToSync, newStatus === 'vendida' ? 'sell' : 'update');
        }
      }
    }

    // Keep selected part in sync if modal is open
    if (selectedPart && selectedPart.id === partId) {
      const refreshed = updated.find(p => p.id === partId);
      if (refreshed) setSelectedPart(refreshed);
    }
  };

  // Save new or edited part
  const handleSavePart = (part: AutoPart) => {
    const exists = parts.some(p => p.id === part.id);
    let updated: AutoPart[];

    if (exists) {
      updated = parts.map(p => p.id === part.id ? part : p);
      logActivity({
        partId: part.id,
        partName: `${part.pieza} (${part.marca} ${part.modelo})`,
        action: 'editada',
        description: `Datos actualizados. Ubicación: ${part.ubicacion.estante} (${part.ubicacion.nave}).`
      });
    } else {
      updated = [part, ...parts];
      logActivity({
        partId: part.id,
        partName: `${part.pieza} (${part.marca} ${part.modelo})`,
        action: 'creada',
        description: `Alta de nueva pieza con código QR asignado. Ubicación: ${part.ubicacion.estante}.`
      });
    }

    updatePartsState(updated);
    setActivities(loadActivities());
    setIsFormOpen(false);
    setPartToEdit(undefined);

    // Auto-sync to Google Sheets Webhook if configured
    if (config.googleSheet?.webhookUrl && config.googleSheet.autoSyncOnSave) {
      sendPartToGoogleSheetWebhook(config.googleSheet.webhookUrl, part, exists ? 'update' : 'create');
    }

    // If modal was open, refresh it
    if (selectedPart && selectedPart.id === part.id) {
      setSelectedPart(part);
    }
  };

  // Import parts from Google Sheets or Excel
  const handleImportFromSheetsOrExcel = (importedParts: AutoPart[], mode: 'replace' | 'merge') => {
    let finalParts: AutoPart[];
    if (mode === 'replace') {
      finalParts = importedParts;
    } else {
      // Merge: update matching IDs, append new ones
      const existingMap = new Map(parts.map(p => [p.id.toUpperCase(), p]));
      importedParts.forEach(p => {
        existingMap.set(p.id.toUpperCase(), p);
      });
      finalParts = Array.from(existingMap.values());
    }

    updatePartsState(finalParts);
    logActivity({
      partId: 'SHEETS',
      partName: 'Importación Masiva',
      action: 'creada',
      description: `Se sincronizaron ${importedParts.length} piezas desde Google Sheets / Excel (${mode === 'replace' ? 'reemplazo total' : 'fusión'}).`
    });
    setActivities(loadActivities());
  };

  // Open single print dialog
  const handlePrintSingle = (part: AutoPart) => {
    setInitialPrintPart(part);
    setIsPrintOpen(true);
  };

  // Print shelf poster/labels
  const handlePrintShelf = (shelfId: string) => {
    setSelectedShelfForView(shelfId);
    setIsPrintOpen(true);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Código QR',
      'Pieza',
      'Categoría',
      'Marca',
      'Modelo',
      'Año',
      'Estado Pieza',
      'Estante',
      'Nave',
      'Pasillo',
      'Precio',
      'Disponibilidad',
      'Fecha Ingreso',
      'Fecha Venta',
      'RUDAC / Motor'
    ];

    const rows = parts.map(p => [
      `"${p.id}"`,
      `"${p.pieza.replace(/"/g, '""')}"`,
      `"${p.categoria}"`,
      `"${p.marca}"`,
      `"${p.modelo}"`,
      p.anio,
      `"${p.estadoPieza.replace(/"/g, '""')}"`,
      `"${p.ubicacion.estante}"`,
      `"${p.ubicacion.nave}"`,
      `"${p.ubicacion.pasillo}"`,
      p.precio !== null ? p.precio : 'A Consultar',
      `"${p.status}"`,
      `"${p.fechaIngreso}"`,
      `"${p.fechaVenta || ''}"`,
      `"${p.obleaRudac || p.numeroMotor || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario_desarmadero_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset to demo
  const handleResetDemo = () => {
    const demoData = resetToDemo();
    setParts(demoData);
    setConfig(loadConfig());
    setActivities([]);
  };

  // Import backup
  const handleImportBackup = (imported: AutoPart[]) => {
    updatePartsState(imported);
    logActivity({
      partId: 'SISTEMA',
      partName: 'Backup Importado',
      action: 'creada',
      description: `Se importaron ${imported.length} piezas desde archivo de respaldo.`
    });
    setActivities(loadActivities());
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      
      {/* Top Header adheres strictly to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenNewPart={() => {
          setPartToEdit(undefined);
          setIsFormOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSync={() => setIsSheetSyncOpen(true)}
        syncConfig={config.googleSheet}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Metric summary & user practical case highlight */}
        <StatsBanner
          parts={parts}
          onSelectSample={(id) => {
            const found = parts.find(p => p.id === id);
            if (found) setSelectedPart(found);
          }}
          onOpenSync={() => setIsSheetSyncOpen(true)}
          syncConfig={config.googleSheet}
        />

        {/* Tab 1: Digital Inventory Spreadsheet / Cards */}
        {currentTab === 'inventory' && (
          <InventoryTable
            parts={parts}
            onSelectPart={(part) => setSelectedPart(part)}
            onQuickStatusChange={(id, status) => handleUpdateStatus(id, status)}
            onPrintSingle={handlePrintSingle}
            onEditPart={(part) => {
              setPartToEdit(part);
              setIsFormOpen(true);
            }}
            onExportCsv={handleExportCsv}
            onExportExcel={() => exportInventoryToExcel(parts)}
            onOpenSync={() => setIsSheetSyncOpen(true)}
          />
        )}

        {/* Tab 2: Junkyard Shelves & Racks */}
        {currentTab === 'shelves' && (
          <ShelvesView
            parts={parts}
            onSelectPart={(part) => setSelectedPart(part)}
            onPrintShelf={handlePrintShelf}
            selectedShelfId={selectedShelfForView}
          />
        )}

        {/* Tab 3: Dedicated Print Labels Hub */}
        {currentTab === 'labels' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Centro de Impresión de Etiquetas QR
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 max-w-xl">
                  Imprimí etiquetas térmicas de 80mm/58mm o planchas A4 autoadhesivas para piezas y estanterías físicas del desarmadero.
                </p>
              </div>
              <button
                onClick={() => {
                  setInitialPrintPart(undefined);
                  setIsPrintOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                Abrir Asistente de Impresión
              </button>
            </div>

            {/* Quick gallery of printable items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {parts.slice(0, 6).map((part) => (
                <div
                  key={part.id}
                  className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-neutral-700 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold text-amber-400 block">
                      {part.id}
                    </span>
                    <h5 className="font-semibold text-white text-xs truncate">
                      {part.pieza}
                    </h5>
                    <p className="text-[11px] text-neutral-400">
                      {part.marca} {part.modelo} · {part.ubicacion.estante}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePrintSingle(part)}
                    className="p-2 text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors shrink-0"
                    title="Imprimir esta etiqueta"
                  >
                    Imprimir
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Traceability Audit Log */}
        {currentTab === 'history' && (
          <ActivityLogView
            activities={activities}
            onSelectPartById={(id) => {
              const found = parts.find(p => p.id === id);
              if (found) setSelectedPart(found);
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-4 px-4 sm:px-6 lg:px-8 mt-12 text-center text-xs text-neutral-500">
        <p>
          QRParts Manager · Sistema de Digitalización y Trazabilidad para Desarmaderos y Comercios de Autopartes
        </p>
        <p className="text-[11px] text-neutral-600 mt-1">
          {config.nombreDesarmadero} · {config.direccion} · {config.leyendaLegal}
        </p>
      </footer>

      {/* MODALS */}
      {/* 1. Core Scanned / Inspect Part Modal */}
      {selectedPart && (
        <PartModal
          part={selectedPart}
          config={config}
          onClose={() => setSelectedPart(null)}
          onUpdateStatus={handleUpdateStatus}
          onEdit={(p) => {
            setSelectedPart(null);
            setPartToEdit(p);
            setIsFormOpen(true);
          }}
          onPrint={(p) => {
            handlePrintSingle(p);
          }}
        />
      )}

      {/* 2. QR Scanner Modal */}
      {isScannerOpen && (
        <QrScannerModal
          parts={parts}
          onClose={() => setIsScannerOpen(false)}
          onPartDetected={(detected) => {
            setSelectedPart(detected);
          }}
          onShelfDetected={(shelfId) => {
            setSelectedShelfForView(shelfId);
            setCurrentTab('shelves');
          }}
        />
      )}

      {/* 3. New / Edit Part Form Modal */}
      {isFormOpen && (
        <PartFormModal
          partToEdit={partToEdit}
          existingParts={parts}
          onClose={() => {
            setIsFormOpen(false);
            setPartToEdit(undefined);
          }}
          onSave={handleSavePart}
        />
      )}

      {/* 4. Labels Print Modal */}
      {isPrintOpen && (
        <PrintLabelsModal
          parts={parts}
          config={config}
          initialSelectedPart={initialPrintPart}
          onClose={() => {
            setIsPrintOpen(false);
            setInitialPrintPart(undefined);
          }}
        />
      )}

      {/* 5. Business Settings & Backup Modal */}
      {isSettingsOpen && (
        <BusinessSettingsModal
          config={config}
          parts={parts}
          onClose={() => setIsSettingsOpen(false)}
          onSaveConfig={(cfg) => {
            setConfig(cfg);
            saveConfig(cfg);
          }}
          onResetDemo={handleResetDemo}
          onImportBackup={handleImportBackup}
        />
      )}

      {/* 6. Google Sheets & Excel Sync Modal */}
      {isSheetSyncOpen && (
        <SheetSyncModal
          parts={parts}
          config={config}
          onClose={() => setIsSheetSyncOpen(false)}
          onImportParts={handleImportFromSheetsOrExcel}
          onUpdateConfig={(newCfg) => {
            setConfig(newCfg);
            saveConfig(newCfg);
          }}
        />
      )}

    </div>
  );
}
