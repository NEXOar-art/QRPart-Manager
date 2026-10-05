import React, { useState } from 'react';
import { AutoPart, PartStatus, LocationInfo } from '../types/inventory';
import { SHELVES_DIRECTORY } from '../data/initialData';
import { 
  X, Save, Car, MapPin, Tag, ShieldCheck, 
  DollarSign, Image as ImageIcon, Plus, Sparkles, 
  Camera, Upload, Check 
} from 'lucide-react';

interface PartFormModalProps {
  partToEdit?: AutoPart;
  existingParts: AutoPart[];
  onClose: () => void;
  onSave: (part: AutoPart) => void;
}

const CATEGORIES = [
  'Iluminación',
  'Carrocería',
  'Motor',
  'Transmisión',
  'Suspensión y Dirección',
  'Electricidad',
  'Frenos',
  'Climatización',
  'Interior & Confort'
];

const PRESET_PHOTOS = [
  { label: 'Óptica / Faro', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80' },
  { label: 'Puerta / Chapa', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80' },
  { label: 'Compresor / Motor', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80' },
  { label: 'Alternador / Eléctrico', url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80' },
  { label: 'Paragolpes', url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80' },
  { label: 'Caja de Cambios', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80' },
  { label: 'Espejo Retrovisor', url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Dirección / Bomba', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80' }
];

export const PartFormModal: React.FC<PartFormModalProps> = ({
  partToEdit,
  existingParts,
  onClose,
  onSave
}) => {
  // Generate next code if new
  const calculateNextId = (): string => {
    let maxNum = 247;
    existingParts.forEach(p => {
      const match = p.id.match(/^DES-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `DES-${nextNum.toString().padStart(4, '0')}`;
  };

  const [id, setId] = useState(partToEdit ? partToEdit.id : calculateNextId());
  const [pieza, setPieza] = useState(partToEdit ? partToEdit.pieza : '');
  const [categoria, setCategoria] = useState(partToEdit ? partToEdit.categoria : 'Iluminación');
  const [marca, setMarca] = useState(partToEdit ? partToEdit.marca : 'Volkswagen');
  const [modelo, setModelo] = useState(partToEdit ? partToEdit.modelo : 'Gol Trend');
  const [anio, setAnio] = useState<number>(partToEdit ? partToEdit.anio : 2015);
  const [versionMotor, setVersionMotor] = useState(partToEdit?.versionMotor || '');
  
  // Legal
  const [numeroMotor, setNumeroMotor] = useState(partToEdit?.numeroMotor || '');
  const [numeroChasis, setNumeroChasis] = useState(partToEdit?.numeroChasis || '');
  const [obleaRudac, setObleaRudac] = useState(partToEdit?.obleaRudac || '');

  // Condition
  const [estadoPieza, setEstadoPieza] = useState(partToEdit ? partToEdit.estadoPieza : 'Usada, sin fisuras (anclajes sanos)');
  
  // Location
  const [estante, setEstante] = useState(partToEdit ? partToEdit.ubicacion.estante : 'Estante B-4');
  const [isCustomShelf, setIsCustomShelf] = useState(false);
  const [nave, setNave] = useState(partToEdit ? partToEdit.ubicacion.nave : 'Nave Central');
  const [pasillo, setPasillo] = useState(partToEdit ? partToEdit.ubicacion.pasillo : 'Pasillo 2');
  const [nivel, setNivel] = useState(partToEdit?.ubicacion.nivel || 'Bandeja 1');

  // Price
  const [isConsultPrice, setIsConsultPrice] = useState(partToEdit ? partToEdit.precio === null : false);
  const [precio, setPrecio] = useState<string>(partToEdit && partToEdit.precio !== null ? partToEdit.precio.toString() : '85000');

  // Status & notes
  const [status, setStatus] = useState<PartStatus>(partToEdit ? partToEdit.status : 'disponible');
  const [observaciones, setObservaciones] = useState(partToEdit?.observaciones || '');
  const [fechaIngreso, setFechaIngreso] = useState(
    partToEdit ? partToEdit.fechaIngreso : new Date().toISOString().split('T')[0]
  );

  // Photos
  const [photos, setPhotos] = useState<string[]>(
    partToEdit ? partToEdit.fotos : [PRESET_PHOTOS[0].url]
  );
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // Auto fill warehouse details when shelf changes
  const handleShelfChange = (selectedShelfId: string) => {
    if (selectedShelfId === '__custom__') {
      setIsCustomShelf(true);
      setEstante('');
      return;
    }
    setIsCustomShelf(false);
    setEstante(selectedShelfId);
    const found = SHELVES_DIRECTORY.find(s => s.id === selectedShelfId);
    if (found) {
      setNave(found.nave);
      setPasillo(found.pasillo);
    }
  };

  const handleAddPresetPhoto = (url: string) => {
    if (!photos.includes(url)) {
      setPhotos([...photos, url]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Image file upload or mobile camera capture
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        const result = uploadEvt.target?.result as string;
        if (result) {
          // Put the newest captured photo first
          setPhotos([result, ...photos]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !pieza.trim() || !marca.trim() || !modelo.trim()) {
      return;
    }

    const updatedLocation: LocationInfo = {
      nave,
      pasillo,
      estante: estante.trim() || 'Estante B-4',
      nivel
    };

    const newPart: AutoPart = {
      id: id.trim().toUpperCase(),
      pieza: pieza.trim(),
      categoria,
      marca: marca.trim(),
      modelo: modelo.trim(),
      anio: Number(anio),
      versionMotor: versionMotor.trim() || undefined,
      numeroMotor: numeroMotor.trim() || undefined,
      numeroChasis: numeroChasis.trim() || undefined,
      obleaRudac: obleaRudac.trim() || undefined,
      estadoPieza: estadoPieza.trim(),
      ubicacion: updatedLocation,
      precio: isConsultPrice ? null : parseFloat(precio) || 0,
      moneda: 'ARS',
      fotos: photos.length > 0 ? photos : [PRESET_PHOTOS[0].url],
      fechaIngreso,
      status,
      observaciones: observaciones.trim() || undefined,
      createdAt: partToEdit ? partToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newPart);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-800 bg-neutral-950 shrink-0">
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">
              {partToEdit ? 'Editar Pieza de Inventario' : 'Registrar Pieza en Depósito (Operario)'}
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
              Asigná ubicación física, tomá fotos con el móvil y sincronizá con Google Sheets / Excel.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          
          {/* Quick Mobile Snapshot Action Banner */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Foto en Depósito desde el Móvil</p>
                <p className="text-[11px] text-neutral-400">Capturá la pieza directamente con la cámara del celular.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs">
                <Camera className="w-3.5 h-3.5" />
                <span>Tomar Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Section 1: Unique Code & Core Data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Código Único QR *
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase())}
                required
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Nombre de la Pieza *
              </label>
              <input
                type="text"
                value={pieza}
                onChange={(e) => setPieza(e.target.value)}
                placeholder="Ej: Óptica delantera derecha"
                required
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Section 2: Vehicle Source Data */}
          <div className="p-3.5 sm:p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
              <Car className="w-4 h-4 text-amber-400" />
              <span>Vehículo de Origen (Donante)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Marca *</label>
                <input
                  type="text"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Ej: Volkswagen"
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Modelo *</label>
                <input
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ej: Gol Trend"
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Año *</label>
                <input
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(parseInt(e.target.value) || 2020)}
                  min={1970}
                  max={2030}
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Categoría</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Versión / Motorización (Opcional)</label>
              <input
                type="text"
                value={versionMotor}
                onChange={(e) => setVersionMotor(e.target.value)}
                placeholder="Ej: 1.6 8v MSI / 2.8 D-4D / 1.4 Turbo"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Section 3: Physical Location in Junkyard / Warehouse */}
          <div className="p-3.5 sm:p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Ubicación Física en Depósito (Estante)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomShelf(!isCustomShelf)}
                className="text-[11px] text-amber-400 hover:underline"
              >
                {isCustomShelf ? 'Elegir de lista' : '+ Estante nuevo / personalizado'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Estantería *</label>
                {isCustomShelf ? (
                  <input
                    type="text"
                    value={estante}
                    onChange={(e) => setEstante(e.target.value)}
                    placeholder="Ej: Estante E-3"
                    required
                    className="w-full bg-neutral-900 border border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <select
                    value={estante}
                    onChange={(e) => handleShelfChange(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  >
                    {SHELVES_DIRECTORY.map(s => (
                      <option key={s.id} value={s.id}>{s.id}</option>
                    ))}
                    <option value="Estante B-4">Estante B-4 (Ejemplo Gol)</option>
                    <option value="__custom__">+ Otro estante...</option>
                  </select>
                )}
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Nave / Sector</label>
                <input
                  type="text"
                  value={nave}
                  onChange={(e) => setNave(e.target.value)}
                  placeholder="Ej: Nave Central"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Pasillo</label>
                <input
                  type="text"
                  value={pasillo}
                  onChange={(e) => setPasillo(e.target.value)}
                  placeholder="Ej: Pasillo 2"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Nivel / Bandeja</label>
                <input
                  type="text"
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                  placeholder="Ej: Bandeja 3"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Condition & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Estado de la Pieza *
              </label>
              <input
                type="text"
                value={estadoPieza}
                onChange={(e) => setEstadoPieza(e.target.value)}
                placeholder="Ej: Usada, sin fisuras / Probada en banco"
                required
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-300">
                  Precio de Venta (ARS)
                </label>
                <label className="text-[11px] text-amber-400 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isConsultPrice}
                    onChange={(e) => setIsConsultPrice(e.target.checked)}
                    className="rounded border-neutral-700 bg-neutral-900 text-amber-400"
                  />
                  <span>"A Consultar"</span>
                </label>
              </div>
              <input
                type="number"
                disabled={isConsultPrice}
                value={isConsultPrice ? '' : precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder={isConsultPrice ? 'Precio a consultar' : 'Ej: 85000'}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-neutral-500 disabled:opacity-40 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Section 5: Legal RUDAC & Motor / Chasis */}
          <div className="p-3.5 bg-neutral-950/40 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Trazabilidad Legal (Ley 25.761)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">N° Motor</label>
                <input
                  type="text"
                  value={numeroMotor}
                  onChange={(e) => setNumeroMotor(e.target.value)}
                  placeholder="Ej: CFZ-918234"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">N° Chasis / VIN</label>
                <input
                  type="text"
                  value={numeroChasis}
                  onChange={(e) => setNumeroChasis(e.target.value)}
                  placeholder="Ej: 8AWZZZ5UZFA019283"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Oblea RUDAC</label>
                <input
                  type="text"
                  value={obleaRudac}
                  onChange={(e) => setObleaRudac(e.target.value)}
                  placeholder="Ej: RUD-8492019-B"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-amber-400 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                Fotos de la Pieza ({photos.length})
              </label>
              <label className="text-[11px] text-amber-400 hover:underline cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Elegir de galería</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            
            {/* Current Photos Row */}
            <div className="flex flex-wrap gap-2 items-center">
              {photos.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-neutral-700 group shrink-0">
                  <img src={url} alt={`Preview ${idx}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute inset-0 bg-red-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-neutral-950/80 text-[8px] text-center text-amber-400 font-mono">
                      Principal
                    </span>
                  )}
                </div>
              ))}

              {/* Mobile camera trigger square */}
              <label className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-dashed border-neutral-700 hover:border-amber-400 flex flex-col items-center justify-center text-neutral-400 hover:text-white cursor-pointer transition-colors shrink-0">
                <Camera className="w-4 h-4 text-amber-400" />
                <span className="text-[9px] mt-0.5 font-medium">+ Cámara</span>
                <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Quick Presets for Demo / Testing */}
            <div className="pt-1">
              <p className="text-[11px] text-neutral-400 mb-1">
                O asociar foto de muestra de autopartes:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PHOTOS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPresetPhoto(p.url)}
                    className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                  >
                    + {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 7: Notes */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Observaciones de Desmontaje / Compatibilidad
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              placeholder="Ej: Anclajes sanos, conector eléctrico intacto, sin lámparas."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Sticky Submit Toolbar for Mobile & Desktop */}
          <div className="sticky bottom-0 pt-3 pb-1 bg-neutral-900 border-t border-neutral-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{partToEdit ? 'Guardar Cambios' : 'Registrar en Depósito & QR'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
