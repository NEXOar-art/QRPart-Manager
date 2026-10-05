import React from 'react';
import { QrCode, Plus, Scan, Warehouse, Layers, History, Settings } from 'lucide-react';

interface HeaderProps {
  currentTab: 'inventory' | 'shelves' | 'labels' | 'history';
  onTabChange: (tab: 'inventory' | 'shelves' | 'labels' | 'history') => void;
  onOpenScanner: () => void;
  onOpenNewPart: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenScanner,
  onOpenNewPart,
  onOpenSettings
}) => {
  return (
    <header className="sticky top-0 z-30 bg-neutral-900 border-b border-neutral-800 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                QRParts <span className="text-amber-400 font-semibold">Manager</span>
              </span>
            </div>
          </div>

          {/* Zone 2: Clean text navigation tabs */}
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

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              title="Configuración del Desarmadero"
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-900 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors shadow-sm whitespace-nowrap"
            >
              <Scan className="w-4 h-4" />
              <span>Escanear QR</span>
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

        {/* Mobile secondary tab strip */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-neutral-800/80 text-xs">
          <button
            onClick={() => onTabChange('inventory')}
            className={`py-1.5 px-2.5 rounded ${currentTab === 'inventory' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
          >
            Inventario
          </button>
          <button
            onClick={() => onTabChange('shelves')}
            className={`py-1.5 px-2.5 rounded ${currentTab === 'shelves' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
          >
            Estanterías
          </button>
          <button
            onClick={() => onTabChange('labels')}
            className={`py-1.5 px-2.5 rounded ${currentTab === 'labels' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
          >
            Etiquetas
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`py-1.5 px-2.5 rounded ${currentTab === 'history' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
          >
            Trazabilidad
          </button>
        </div>
      </div>
    </header>
  );
};
