import React from 'react';
import { ActivityRecord } from '../types/inventory';
import { History, CheckCircle2, Clock, PackageCheck, AlertCircle, Calendar } from 'lucide-react';

interface ActivityLogViewProps {
  activities: ActivityRecord[];
  onSelectPartById: (partId: string) => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  activities,
  onSelectPartById
}) => {
  const getActionIcon = (action: ActivityRecord['action']) => {
    switch (action) {
      case 'vendida':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'reservada':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'creada':
        return <PackageCheck className="w-4 h-4 text-blue-400" />;
      default:
        return <History className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white text-sm">
            Registro Histórico de Operaciones & Trazabilidad
          </h3>
          <p className="text-xs text-neutral-400">
            Control de auditoría en tiempo real de cada movimiento, reserva y venta realizada en el depósito.
          </p>
        </div>
        <span className="text-xs text-neutral-400">
          <strong className="text-white font-mono">{activities.length}</strong> eventos registrados
        </span>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <History className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
            <p className="text-sm font-medium text-white">Sin movimientos registrados recientemente</p>
            <p className="text-xs text-neutral-500 mt-1">
              Las reservas, ventas y altas de piezas se registrarán automáticamente aquí.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80">
            {activities.map((act) => {
              const date = new Date(act.timestamp);
              const formattedDate = date.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={act.id}
                  className="p-4 hover:bg-neutral-800/40 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
                      {getActionIcon(act.action)}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-white">
                        {act.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                        <button
                          onClick={() => onSelectPartById(act.partId)}
                          className="font-mono text-amber-400 hover:underline font-semibold"
                        >
                          {act.partId}
                        </button>
                        <span>·</span>
                        <span>{act.partName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-neutral-400 font-mono">
                      {formattedDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
