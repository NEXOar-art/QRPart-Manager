import { AutoPart, BusinessConfig, ActivityRecord } from '../types/inventory';
import { INITIAL_PARTS, DEFAULT_BUSINESS_CONFIG } from '../data/initialData';

const PARTS_KEY = 'qrparts_inventory_v1';
const CONFIG_KEY = 'qrparts_business_config_v1';
const ACTIVITY_KEY = 'qrparts_activity_v1';

export function loadParts(): AutoPart[] {
  try {
    const raw = localStorage.getItem(PARTS_KEY);
    if (!raw) {
      saveParts(INITIAL_PARTS);
      return INITIAL_PARTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveParts(INITIAL_PARTS);
      return INITIAL_PARTS;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading parts from localStorage:', err);
    return INITIAL_PARTS;
  }
}

export function saveParts(parts: AutoPart[]): void {
  try {
    localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  } catch (err) {
    console.error('Error saving parts to localStorage:', err);
  }
}

export function loadConfig(): BusinessConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_BUSINESS_CONFIG;
    return { ...DEFAULT_BUSINESS_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BUSINESS_CONFIG;
  }
}

export function saveConfig(cfg: BusinessConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

export function loadActivities(): ActivityRecord[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logActivity(record: Omit<ActivityRecord, 'id' | 'timestamp'>): void {
  try {
    const existing = loadActivities();
    const newRecord: ActivityRecord = {
      ...record,
      id: 'ACT-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    const updated = [newRecord, ...existing.slice(0, 49)];
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

export function resetToDemo(): AutoPart[] {
  saveParts(INITIAL_PARTS);
  saveConfig(DEFAULT_BUSINESS_CONFIG);
  localStorage.removeItem(ACTIVITY_KEY);
  return INITIAL_PARTS;
}
