export type PartStatus = 'disponible' | 'reservada' | 'vendida' | 'en_revision';

export interface LocationInfo {
  nave: string;      // ej: Nave A, Nave B, Patio
  pasillo: string;   // ej: Pasillo 1, Pasillo 2
  estante: string;   // ej: Estante B-4
  nivel?: string;    // ej: Nivel 1, Nivel 2
}

export interface AutoPart {
  id: string;               // Código único ej: DES-0248
  pieza: string;            // Nombre de la pieza ej: Óptica delantera derecha
  categoria: string;        // ej: Iluminación, Motor, Carrocería, Transmisión, Suspensión, Interior
  marca: string;            // ej: Volkswagen
  modelo: string;           // ej: Gol Trend
  anio: number;             // ej: 2014
  versionMotor?: string;    // ej: 1.6 8v MSI
  numeroMotor?: string;     // Trazabilidad legal desarmadero
  numeroChasis?: string;    // VIN / Chasis
  obleaRudac?: string;      // Sticker/Oblea legal si aplica
  estadoPieza: string;      // ej: Usada, sin fisuras
  ubicacion: LocationInfo;  // Ubicación física exacta
  precio: number | null;    // null si es "A consultar"
  moneda: 'ARS' | 'USD';
  fotos: string[];          // URLs o base64
  fechaIngreso: string;     // YYYY-MM-DD
  fechaVenta?: string;      // YYYY-MM-DD
  status: PartStatus;
  reservadoA?: string;      // Nombre o teléfono del cliente si está reservada
  vendidoA?: string;        // Datos del comprador
  precioVentaFinal?: number;
  observaciones?: string;   // Notas sobre estado o desmontaje
  createdAt: string;
  updatedAt: string;
}

export interface ActivityRecord {
  id: string;
  partId: string;
  partName: string;
  action: 'creada' | 'reservada' | 'vendida' | 'disponible' | 'editada' | 'reubicada';
  description: string;
  timestamp: string;
  user?: string;
}

export interface BusinessConfig {
  nombreDesarmadero: string;
  cuit: string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  leyendaLegal: string;
}
