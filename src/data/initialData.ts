import { AutoPart, BusinessConfig } from '../types/inventory';

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  nombreDesarmadero: 'Desarmadero Autopartes San Martín',
  cuit: '30-71458923-8',
  direccion: 'Ruta 8 Km 18.5, San Martín, Bs. As.',
  telefono: '+54 11 4752-9988',
  whatsapp: '+54 9 11 5521-8840',
  leyendaLegal: 'Autopartes legales recuperadas conforme a Ley Nacional de Desarmaderos 25.761 / RUDAC.'
};

export const INITIAL_PARTS: AutoPart[] = [
  {
    id: 'DES-0248',
    pieza: 'Óptica Delantera Derecha',
    categoria: 'Iluminación',
    marca: 'Volkswagen',
    modelo: 'Gol Trend',
    anio: 2014,
    versionMotor: '1.6 8v MSI',
    numeroMotor: 'CFZ-918234',
    numeroChasis: '8AWZZZ5UZFA019283',
    obleaRudac: 'RUD-8492019-B',
    estadoPieza: 'Usada, sin fisuras (anclajes sanos)',
    ubicacion: {
      nave: 'Nave Central',
      pasillo: 'Pasillo 2',
      estante: 'Estante B-4',
      nivel: 'Bandeja 3'
    },
    precio: null, // "Consultar" como en el ejemplo del usuario
    moneda: 'ARS',
    fotos: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80'
    ],
    fechaIngreso: '2026-03-01',
    status: 'disponible',
    observaciones: 'Óptica original Arteb / Valeo con fondo negro, acrílico pulido sin amarillamiento ni patas rotas.',
    createdAt: '2026-03-01T10:15:00.000Z',
    updatedAt: '2026-03-01T10:15:00.000Z'
  },
  {
    id: 'DES-0249',
    pieza: 'Puerta Delantera Izquierda (Conductor)',
    categoria: 'Carrocería',
    marca: 'Peugeot',
    modelo: '208',
    anio: 2019,
    versionMotor: '1.6 VTi 115cv Allure',
    numeroMotor: 'EC5-384729',
    numeroChasis: '8ADCAEC59KG019284',
    obleaRudac: 'RUD-7731920-A',
    estadoPieza: 'Usada original, pintura de fábrica gris grafito, sin golpes',
    ubicacion: {
      nave: 'Nave Central',
      pasillo: 'Pasillo 1',
      estante: 'Estante A-2',
      nivel: 'Bandeja 1'
    },
    precio: 145000,
    moneda: 'ARS',
    fotos: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'
    ],
    fechaIngreso: '2026-02-24',
    status: 'disponible',
    observaciones: 'Incluye máquina levavidrio eléctrica y manija exterior. Sin panel tapizado interior.',
    createdAt: '2026-02-24T14:30:00.000Z',
    updatedAt: '2026-02-24T14:30:00.000Z'
  },
  {
    id: 'DES-0250',
    pieza: 'Compresor de Aire Acondicionado',
    categoria: 'Motor',
    marca: 'Toyota',
    modelo: 'Hilux',
    anio: 2018,
    versionMotor: '2.8 D-4D 1GD-FTV',
    numeroMotor: '1GD-8472910',
    numeroChasis: '8AJBA3CD9J1092834',
    obleaRudac: 'RUD-9182374-M',
    estadoPieza: 'Usado probado en banco, polea y embrague impecable',
    ubicacion: {
      nave: 'Nave Repuestos Menores',
      pasillo: 'Pasillo 3',
      estante: 'Estante C-1',
      nivel: 'Bandeja 2'
    },
    precio: 290000,
    moneda: 'ARS',
    fotos: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'
    ],
    fechaIngreso: '2026-02-15',
    status: 'disponible',
    observaciones: 'Marca Denso 10S17C original Toyota. Conserva aceite y sellos colocados.',
    createdAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z'
  },
  {
    id: 'DES-0251',
    pieza: 'Alternador 90A con Polea Desacoplable',
    categoria: 'Electricidad',
    marca: 'Ford',
    modelo: 'Ka',
    anio: 2016,
    versionMotor: '1.5 Sigma 16v',
    numeroMotor: 'SIG-492019',
    numeroChasis: '9BFZH55V7G8123498',
    obleaRudac: 'RUD-4829103-E',
    estadoPieza: 'Usado con carbones y rodamientos testeados (14.2V)',
    ubicacion: {
      nave: 'Nave Central',
      pasillo: 'Pasillo 2',
      estante: 'Estante B-4',
      nivel: 'Bandeja 1'
    },
    precio: 95000,
    moneda: 'ARS',
    fotos: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80'
    ],
    fechaIngreso: '2026-03-02',
    status: 'disponible',
    observaciones: 'Original Bosch. Compatible también con Ford Fiesta Kinetic y EcoSport 1.6 Sigma.',
    createdAt: '2026-03-02T11:20:00.000Z',
    updatedAt: '2026-03-02T11:20:00.000Z'
  },
  {
    id: 'DES-0252',
    pieza: 'Paragolpes Delantero con Rejilla y Guías',
    categoria: 'Carrocería',
    marca: 'Fiat',
    modelo: 'Cronos',
    anio: 2021,
    versionMotor: '1.3 GSE Firefly',
    numeroMotor: 'FLY-782910',
    numeroChasis: '9BD359A1BM0293847',
    obleaRudac: 'RUD-6548192-C',
    estadoPieza: 'Usado original, color Blanco Banchisa, detalle leve en esquina inferior',
    ubicacion: {
      nave: 'Patio Chapa y Paragolpes',
      pasillo: 'Sector Perimetral',
      estante: 'Estante D-3',
      nivel: 'Piso'
    },
    precio: 130000,
    moneda: 'ARS',
    fotos: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80'
    ],
    fechaIngreso: '2026-02-18',
    status: 'reservada',
    reservadoA: 'Taller Mecánico Charly (Tel: 11-4433-2211)',
    observaciones: 'Reservado hasta el viernes a las 18hs. Se acordó $125.000 en efectivo.',
    createdAt: '2026-02-18T16:00:00.000Z',
    updatedAt: '2026-03-04T09:40:00.000Z'
  },
  {
    id: 'DES-0253',
    pieza: 'Caja de Velocidades Manual de 5ta',
    categoria: 'Transmisión',
    marca: 'Chevrolet',
    modelo: 'Cruze',
    anio: 2017,
    versionMotor: '1.4 Turbo Ecotec',
    numeroMotor: 'LE2-918239',
    numeroChasis: '8AGBF69K0H0192847',
    obleaRudac: 'RUD-3920194-T',
    estadoPieza: 'Usada garantizada, 68.000 km, engranajes y sincronizados probados',
    ubicacion: {
      nave: 'Nave Central',
      pasillo: 'Pasillo 4',
      estante: 'Estante M-1',
      nivel: 'Base'
    },
    precio: 480000,
    moneda: 'ARS',
    fotos: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80'
    ],
    fechaIngreso: '2026-01-20',
    fechaVenta: '2026-03-03',
    status: 'vendida',
    vendidoA: 'Repuestos Avenida S.A.',
    precioVentaFinal: 460000,
    observaciones: 'Entregada con factura de desarmadero autorizado y baja RUDAC para asentamiento legal.',
    createdAt: '2026-01-20T08:30:00.000Z',
    updatedAt: '2026-03-03T17:15:00.000Z'
  },
  {
    id: 'DES-0254',
    pieza: 'Espejo Retrovisor Eléctrico Izquierdo',
    categoria: 'Carrocería',
    marca: 'Volkswagen',
    modelo: 'Gol Trend',
    anio: 2014,
    versionMotor: '1.6 8v MSI',
    numeroMotor: 'CFZ-918234',
    numeroChasis: '8AWZZZ5UZFA019283',
    obleaRudac: 'RUD-8492019-B',
    estadoPieza: 'Usado con cacha color carrocería roja, motor eléctrico funcionando',
    ubicacion: {
      nave: 'Nave Central',
      pasillo: 'Pasillo 2',
      estante: 'Estante B-4',
      nivel: 'Bandeja 2'
    },
    precio: 48000,
    moneda: 'ARS',
    fotos: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80'
    ],
    fechaIngreso: '2026-03-01',
    status: 'disponible',
    observaciones: 'Mismo vehículo donante que la óptica DES-0248.',
    createdAt: '2026-03-01T10:40:00.000Z',
    updatedAt: '2026-03-01T10:40:00.000Z'
  },
  {
    id: 'DES-0255',
    pieza: 'Cremallera de Dirección Asistida Hidráulica',
    categoria: 'Suspensión y Dirección',
    marca: 'Renault',
    modelo: 'Sandero',
    anio: 2015,
    versionMotor: '1.6 16v K4M',
    numeroMotor: 'K4M-582910',
    numeroChasis: '8A15R5BA5FL102938',
    obleaRudac: 'RUD-5819203-D',
    estadoPieza: 'Usada sin pérdidas de líquido ni juego axial en extremos',
    ubicacion: {
      nave: 'Nave Central',
      pasillo: 'Pasillo 3',
      estante: 'Estante S-2',
      nivel: 'Bandeja 1'
    },
    precio: 165000,
    moneda: 'ARS',
    fotos: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80'
    ],
    fechaIngreso: '2026-02-10',
    status: 'disponible',
    observaciones: 'Probada en banco hidrostático. Fuelles sanos.',
    createdAt: '2026-02-10T12:00:00.000Z',
    updatedAt: '2026-02-10T12:00:00.000Z'
  }
];

export const SHELVES_DIRECTORY = [
  { id: 'Estante B-4', nave: 'Nave Central', pasillo: 'Pasillo 2', descripcion: 'Iluminación y Componentes Frontales', capacidadMax: 20 },
  { id: 'Estante A-2', nave: 'Nave Central', pasillo: 'Pasillo 1', descripcion: 'Puertas y Cristales Delanteros', capacidadMax: 12 },
  { id: 'Estante C-1', nave: 'Nave Repuestos Menores', pasillo: 'Pasillo 3', descripcion: 'Compresores de A/C y Climatización', capacidadMax: 15 },
  { id: 'Estante D-3', nave: 'Patio Chapa y Paragolpes', pasillo: 'Sector Perimetral', descripcion: 'Paragolpes y Guardabarros', capacidadMax: 25 },
  { id: 'Estante M-1', nave: 'Nave Central', pasillo: 'Pasillo 4', descripcion: 'Cajas de Cambio y Embragues', capacidadMax: 8 },
  { id: 'Estante S-2', nave: 'Nave Central', pasillo: 'Pasillo 3', descripcion: 'Sistemas de Dirección y Bombas', capacidadMax: 16 }
];
