// Combo option (e.g. individual flavour inside a Flight Box)
export interface ComboOption {
  id: string;
  name: string;
  price: number;
  image?: string;
  isActive: boolean;
}

// Combo product configuration (e.g. Flight Box / Gift Combo)
export interface ComboProduct {
  id: string;
  name: string;
  description: string;
  image?: string;
  baseSelectionCount: number;
  basePrice: number;
  allowExtras: boolean;
  baseProductId: string; // existing product id used for checkout
  options: ComboOption[];
}

const STORAGE_KEY = "cozyoven_combo_products";

function loadFromStorage(): ComboProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ComboProduct[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveToStorage(combos: ComboProduct[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(combos));
  } catch {
    // ignore write errors
  }
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  return `combo_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export const comboService = {
  getAll(): ComboProduct[] {
    return loadFromStorage();
  },

  getById(id: string): ComboProduct | undefined {
    return loadFromStorage().find((c) => c.id === id);
  },

  create(data: Omit<ComboProduct, "id">): ComboProduct {
    const combos = loadFromStorage();
    const newCombo: ComboProduct = {
      ...data,
      id: generateId(),
    };
    combos.push(newCombo);
    saveToStorage(combos);
    return newCombo;
  },

  update(id: string, data: Partial<Omit<ComboProduct, "id">>): ComboProduct | undefined {
    const combos = loadFromStorage();
    const index = combos.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    const updated: ComboProduct = { ...combos[index], ...data };
    combos[index] = updated;
    saveToStorage(combos);
    return updated;
  },

  delete(id: string): void {
    const combos = loadFromStorage().filter((c) => c.id !== id);
    saveToStorage(combos);
  },
};

export default comboService;


