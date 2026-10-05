import React from 'react';
import { 
  QrCode, Plus, Scan, Warehouse, Layers, 
  History, Settings, FileSpreadsheet, CloudCheck, 
  CheckCircle2 
} from 'lucide-react';
import { GoogleSheetSyncConfig } from '../types/inventory';

interface HeaderProps {
  currentTab: 'inventory' | 'shelves' | 'labels' | 'history';
  onTabChange: (tab: 'inventory' | 'shelves' | 'labels' | 'history') => void;
  onOpenScanner: () => void;
  onOpenNewPart: () => void;
  onOpenSettings: () => void;
  onOpenSync: () => void;
  syncConfig?: GoogleSheetSyncConfig;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenScanner,
  onOpenNewPart,
  onOpenSettings,
  onOpenSync,
  syncConfig
}) => {
  const isSheetConnected = syncConfig?.syncStatus === 'connected';

  return (
    <>
      <header className="sticky top-0 z-30 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 text-neutral-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  QRParts <span className="text-amber-400 font-semibold">Manager</span>
                </span>
              </div>
            </div>

            {/* Zone 2: Navigation tabs on desktop / tablet */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onTabChange('inventory')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentTab === 'inventory'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                Inventario Digital
              </button>
              <button
                onClick={() => onTabChange('shelves')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  currentTab === 'shelves'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Warehouse className="w-4 h-4" />
                Estanterías & Depósito
              </button>
              <button
                onClick={() => onTabChange('labels')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  currentTab === 'labels'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Layers className="w-4 h-4" />
                Impresión de Etiquetas
              </button>
              <button
                onClick={() => onTabChange('history')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  currentTab === 'history'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <History className="w-4 h-4" />
                Trazabilidad
              </button>
            </nav>

            {/* Zone 3: Primary Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Google Sheets & Excel Cloud Status Button */}
              <button
                onClick={onOpenSync}
                title="Sincronización con Google Sheets & Excel"
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isSheetConnected
                    ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <FileSpreadsheet className={`w-3.5 h-3.5 ${isSheetConnected ? 'text-emerald-400' : 'text-neutral-400'}`} />
                <span className="hidden sm:inline">
                  {isSheetConnected ? 'Sheets Conectado' : 'Google Sheets / Excel'}
                </span>
                {isSheetConnected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>

              <button
                onClick={onOpenSettings}
                title="Configuración del Desarmadero"
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenScanner}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-900 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors shadow-sm whitespace-nowrap"
              >
                <Scan className="w-4 h-4" />
                <span className="hidden xs:inline">Escanear QR</span>
                <span className="xs:hidden">QR</span>
              </button>

              <button
                onClick={onOpenNewPart}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Pieza</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Operator Mobile Sticky Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 py-1.5 px-3 flex items-center justify-around text-neutral-400 shadow-xl">
        <button
          onClick={() => onTabChange('inventory')}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] rounded-lg transition-colors ${
            currentTab === 'inventory' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <QrCode className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Inventario</span>
        </button>

        <button
          onClick={() => onTabChange('shelves')}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] rounded-lg transition-colors ${
            currentTab === 'shelves' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Warehouse className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Estantes</span>
        </button>

        {/* Center Big Scan / Register button for warehouse operator */}
        <button
          onClick={onOpenScanner}
          className="flex flex-col items-center justify-center w-12 h-12 -mt-4 rounded-full bg-amber-400 text-neutral-950 shadow-lg font-bold border-2 border-neutral-950 active:scale-95 transition-transform"
          title="Escanear QR con Cámara"
        >
          <Scan className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenNewPart}
          className="flex flex-col items-center justify-center min-w-[54px] min-h-[44px] rounded-lg transition-colors text-neutral-300 hover:text-amber-400"
        >
          <Plus className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Registrar</span>
        </button>

        <button
          onClick={onOpenSync}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] rounded-lg transition-colors ${
            isSheetConnected ? 'text-emerald-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">{isSheetConnected ? 'Sheets' : 'Excel/Sheets'}</span>
        </button>
      </div>
    </>
  );
};

