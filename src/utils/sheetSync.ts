import * as XLSX from 'xlsx';
import { AutoPart, PartStatus, LocationInfo } from '../types/inventory';

/**
 * Extracts Google Spreadsheet ID from any valid Google Sheets URL
 */
export function extractSpreadsheetId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  // Check if it's already an ID (alphanumeric with hyphens/underscores, ~44 chars)
  if (/^[a-zA-Z0-9-_]{20,60}$/.test(trimmed)) {
    return trimmed;
  }
  // Extract from URL: https://docs.google.com/spreadsheets/d/{ID}/...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

/**
 * Normalizes raw sheet row objects into our strongly typed AutoPart structure
 */
export function normalizeRowToPart(row: Record<string, unknown>, index: number): AutoPart {
  // Helper to find case-insensitive key
  const getValue = (...candidateKeys: string[]): string => {
    for (const ck of candidateKeys) {
      const lowerCk = ck.toLowerCase();
      for (const [k, v] of Object.entries(row)) {
        if (k.toLowerCase().trim() === lowerCk && v !== undefined && v !== null) {
          return String(v).trim();
        }
      }
    }
    return '';
  };

  const rawId = getValue('codigo', 'código', 'id', 'qr', 'codigo_qr', 'codigo unico');
  const id = rawId ? rawId.toUpperCase() : `DES-${(index + 300).toString().padStart(4, '0')}`;

  const pieza = getValue('pieza', 'nombre', 'repuesto', 'descripción', 'descripcion', 'articulo', 'artículo') || 'Pieza sin especificar';
  const marca = getValue('marca', 'fabricante', 'brand') || 'General';
  const modelo = getValue('modelo', 'model') || 'Universal';
  
  const rawYear = getValue('año', 'anio', 'ano', 'year');
  const anio = parseInt(rawYear, 10) || new Date().getFullYear();

  const categoria = getValue('categoria', 'categoría', 'rubro') || 'General';
  const versionMotor = getValue('version', 'versión', 'motorizacion', 'motorización');

  const numeroMotor = getValue('motor', 'numero_motor', 'n_motor', 'n° motor');
  const numeroChasis = getValue('chasis', 'vin', 'numero_chasis', 'n_chasis', 'n° chasis');
  const obleaRudac = getValue('rudac', 'oblea', 'oblea_rudac', 'oblea rudac');

  const estadoPieza = getValue('estado', 'condicion', 'condición', 'detalle', 'estado_pieza') || 'Usada original';

  // Ubicación
  const rawEstante = getValue('estante', 'ubicacion', 'ubicación', 'rack', 'posicion', 'deposito');
  const estante = rawEstante || 'Estante B-4';
  const nave = getValue('nave', 'sector', 'galpon') || 'Nave Central';
  const pasillo = getValue('pasillo', 'aisle') || 'Pasillo 1';
  const nivel = getValue('nivel', 'bandeja', 'piso');

  const ubicacion: LocationInfo = {
    estante,
    nave,
    pasillo,
    nivel: nivel || undefined
  };

  // Precio
  const rawPrecio = getValue('precio', 'valor', 'precio_ars', 'precio_venta');
  let precio: number | null = null;
  if (rawPrecio && !/consultar/i.test(rawPrecio)) {
    const num = parseFloat(rawPrecio.replace(/[^0-9.-]+/g, ''));
    if (!isNaN(num)) precio = num;
  }

  // Status
  const rawStatus = getValue('status', 'disponibilidad', 'estado_venta').toLowerCase();
  let status: PartStatus = 'disponible';
  if (rawStatus.includes('vend') || rawStatus === 'sold') {
    status = 'vendida';
  } else if (rawStatus.includes('reser')) {
    status = 'reservada';
  } else if (rawStatus.includes('revis') || rawStatus.includes('taller')) {
    status = 'en_revision';
  }

  // Fotos
  const rawFotos = getValue('foto', 'fotos', 'imagen', 'imagenes', 'url_foto');
  const fotos: string[] = [];
  if (rawFotos) {
    if (rawFotos.includes(',')) {
      fotos.push(...rawFotos.split(',').map(s => s.trim()).filter(Boolean));
    } else {
      fotos.push(rawFotos);
    }
  }

  const fechaIngreso = getValue('fecha', 'ingreso', 'fecha_ingreso') || new Date().toISOString().split('T')[0];
  const fechaVenta = getValue('fecha_venta', 'venta');
  const observaciones = getValue('observaciones', 'notas', 'comentarios');
  const reservadoA = getValue('reservado_a', 'cliente_reserva');
  const vendidoA = getValue('vendido_a', 'comprador', 'cliente');

  return {
    id,
    pieza,
    categoria,
    marca,
    modelo,
    anio,
    versionMotor: versionMotor || undefined,
    numeroMotor: numeroMotor || undefined,
    numeroChasis: numeroChasis || undefined,
    obleaRudac: obleaRudac || undefined,
    estadoPieza,
    ubicacion,
    precio,
    moneda: 'ARS',
    fotos: fotos.length > 0 ? fotos : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'],
    fechaIngreso,
    fechaVenta: fechaVenta || undefined,
    status,
    reservadoA: reservadoA || undefined,
    vendidoA: vendidoA || undefined,
    observaciones: observaciones || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Fetch and parse data from a public or published Google Sheet
 */
export async function fetchGoogleSheetParts(sheetUrlOrId: string): Promise<AutoPart[]> {
  const sheetId = extractSpreadsheetId(sheetUrlOrId);
  if (!sheetId) {
    throw new Error('El enlace ingresado no contiene un ID válido de Google Sheets.');
  }

  // URLs to try for public or published Google Sheets
  const csvUrls = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&id=${sheetId}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`
  ];

  let csvText: string | null = null;
  let lastErr: unknown = null;

  for (const url of csvUrls) {
    try {
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'text/csv' } });
      if (res.ok) {
        csvText = await res.text();
        if (csvText && csvText.trim().length > 10 && !csvText.includes('<!DOCTYPE html>')) {
          break;
        }
      }
    } catch (e) {
      lastErr = e;
    }
  }

  if (!csvText || csvText.includes('<!DOCTYPE html>')) {
    throw new Error(
      'No se pudo descargar la planilla de Google Sheets. Asegurate de que el documento esté compartido como "Cualquier persona con el enlace puede ver" o publicado en la web (Archivo > Compartir > Publicar en la web).'
    );
  }

  const workbook = XLSX.read(csvText, { type: 'string' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet);

  if (!rawRows || rawRows.length === 0) {
    throw new Error('La planilla de Google Sheets no contiene filas de datos con encabezados.');
  }

  return rawRows.map((r, i) => normalizeRowToPart(r, i));
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV file loaded from computer or mobile file picker
 */
export async function parseExcelOrCsvFile(file: File): Promise<AutoPart[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet);

  if (!rawRows || rawRows.length === 0) {
    throw new Error('El archivo no contiene filas con datos legibles.');
  }

  return rawRows.map((r, i) => normalizeRowToPart(r, i));
}

/**
 * Exports current inventory to an Excel (.xlsx) file
 */
export function exportInventoryToExcel(parts: AutoPart[], filename = 'Inventario_QRParts_Desarmadero.xlsx') {
  const exportData = parts.map(p => ({
    'Código QR': p.id,
    'Pieza': p.pieza,
    'Categoría': p.categoria,
    'Marca': p.marca,
    'Modelo': p.modelo,
    'Año': p.anio,
    'Motorización': p.versionMotor || '',
    'Estado Pieza': p.estadoPieza,
    'Estante': p.ubicacion.estante,
    'Nave / Sector': p.ubicacion.nave,
    'Pasillo': p.ubicacion.pasillo,
    'Nivel / Bandeja': p.ubicacion.nivel || '',
    'Precio': p.precio !== null ? p.precio : 'A Consultar',
    'Disponibilidad': p.status.toUpperCase(),
    'Fecha Ingreso': p.fechaIngreso,
    'Fecha Venta': p.fechaVenta || '',
    'Cliente Reserva': p.reservadoA || '',
    'Comprador': p.vendidoA || '',
    'Precio Venta Final': p.precioVentaFinal || '',
    'N° Motor': p.numeroMotor || '',
    'Chasis / VIN': p.numeroChasis || '',
    'Oblea RUDAC': p.obleaRudac || '',
    'Fotos (URLs)': p.fotos ? p.fotos.join(' , ') : '',
    'Observaciones': p.observaciones || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  // Set clean column widths
  worksheet['!cols'] = [
    { wch: 14 }, // Codigo QR
    { wch: 28 }, // Pieza
    { wch: 16 }, // Categoria
    { wch: 15 }, // Marca
    { wch: 16 }, // Modelo
    { wch: 8 },  // Año
    { wch: 16 }, // Motorizacion
    { wch: 30 }, // Estado Pieza
    { wch: 14 }, // Estante
    { wch: 16 }, // Nave
    { wch: 12 }, // Pasillo
    { wch: 12 }, // Nivel
    { wch: 14 }, // Precio
    { wch: 14 }, // Disponibilidad
    { wch: 13 }, // Fecha Ingreso
    { wch: 13 }, // Fecha Venta
    { wch: 20 }, // Cliente Reserva
    { wch: 20 }, // Comprador
    { wch: 16 }, // Precio Venta Final
    { wch: 16 }, // N° Motor
    { wch: 20 }, // Chasis
    { wch: 18 }, // RUDAC
    { wch: 35 }, // Fotos
    { wch: 30 }  // Observaciones
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario Piezas');
  XLSX.writeFile(workbook, filename);
}

/**
 * Sends real-time update to Google Apps Script Webhook when an operator records/updates a piece
 */
export async function sendPartToGoogleSheetWebhook(
  webhookUrl: string, 
  part: AutoPart, 
  action: 'create' | 'update' | 'sell' | 'reserve'
): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return false;

  try {
    const payload = {
      action,
      timestamp: new Date().toISOString(),
      part: {
        id: part.id,
        pieza: part.pieza,
        categoria: part.categoria,
        marca: part.marca,
        modelo: part.modelo,
        anio: part.anio,
        versionMotor: part.versionMotor || '',
        estadoPieza: part.estadoPieza,
        estante: part.ubicacion.estante,
        nave: part.ubicacion.nave,
        pasillo: part.ubicacion.pasillo,
        nivel: part.ubicacion.nivel || '',
        precio: part.precio,
        status: part.status,
        fechaIngreso: part.fechaIngreso,
        fechaVenta: part.fechaVenta || '',
        reservadoA: part.reservadoA || '',
        vendidoA: part.vendidoA || '',
        precioVentaFinal: part.precioVentaFinal || '',
        numeroMotor: part.numeroMotor || '',
        numeroChasis: part.numeroChasis || '',
        obleaRudac: part.obleaRudac || '',
        fotoPrincipal: part.fotos?.[0] || '',
        observaciones: part.observaciones || ''
      }
    };

    // Google Apps Script requires text/plain or no-cors to avoid CORS preflight rejection
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (err) {
    console.warn('Webhook sync error:', err);
    return false;
  }
}

/**
 * Official Google Apps Script template for 2-way real-time synchronization
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * QRParts Manager - Script de Sincronización en Google Sheets
 * 
 * Instrucciones de instalación:
 * 1. En tu Google Sheet, ve a: Extensiones > Apps Script.
 * 2. Borra el código existente y pega este código completo.
 * 3. Haz clic en "Implementar" (botón azul arriba a la derecha) > "Nueva implementación".
 * 4. Selecciona tipo: "Aplicación web".
 * 5. Configura:
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone)
 * 6. Haz clic en "Implementar" y copia la URL de la aplicación web.
 * 7. Pega esa URL en QRParts Manager en "Sincronización Google Sheets".
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var part = contents.part;
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Si la hoja está vacía, crear encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Código QR", "Pieza", "Marca", "Modelo", "Año", 
        "Estante", "Nave", "Estado Pieza", "Precio", "Disponibilidad", 
        "Fecha Ingreso", "N° Motor", "Chasis/VIN", "Oblea RUDAC", "Foto Principal"
      ]);
    }
    
    // Buscar si ya existe por Código QR para actualizar o agregar
    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).toUpperCase() === String(part.id).toUpperCase()) {
        rowIndex = i + 1;
        break;
      }
    }
    
    var rowValues = [
      part.id, part.pieza, part.marca, part.modelo, part.anio,
      part.estante, part.nave, part.estadoPieza, part.precio || "Consultar", part.status,
      part.fechaIngreso, part.numeroMotor, part.numeroChasis, part.obleaRudac, part.fotoPrincipal
    ];
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, id: part.id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
