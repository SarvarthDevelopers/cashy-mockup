export type PastelColor = "Green" | "Lime" | "Rose" | "Pink" | "Blue" | "Turquoise" | "Orange" | "Purple";

export interface PastelColorOption {
  value: PastelColor;
  label: string;
  bg: string;
  text: string;
}

export const PASTEL_COLORS: PastelColorOption[] = [
  { value: "Green", label: "Green", bg: "#dcfce7", text: "#15803d" },
  { value: "Lime", label: "Lime", bg: "#fef9c3", text: "#a16207" },
  { value: "Rose", label: "Rose", bg: "#ffe4e6", text: "#b91c1c" },
  { value: "Pink", label: "Pink", bg: "#fce8ff", text: "#86198f" },
  { value: "Blue", label: "Blue", bg: "#dbeafe", text: "#1d4ed8" },
  { value: "Turquoise", label: "Turquoise", bg: "#cffafe", text: "#0369a1" },
  { value: "Orange", label: "Orange", bg: "#ffedd5", text: "#c2410c" },
  { value: "Purple", label: "Purple", bg: "#f3e8ff", text: "#6b21a8" },
];

export const ALL_BRANCHES_SHOPS = [
  // Branches / Cities
  'Vienna',
  'Berlin',
  'Munich',
  'Graz',
  'Linz',
  'Salzburg',
  'Hamburg',
  'Frankfurt',
  
  // Specific shops
  'Wien-1',
  'Wien-2',
  'Wien-3',
  'Berlin-Mitte',
  'Berlin-West',
  'Munich-1',
  'Munich-2',
  'Hamburg-1',
  'Frankfurt-1',
  'Graz-1',
  'Linz-1',
  'Salzburg-1',
  
  // General / fallback branch names in codebase
  'Wien',
  'Vienna Main',
  'Downtown Branch',
  'Uptown Branch',
  'West Side Branch',
  'East Side Branch',
  'Global'
];

export function getBranchColors(): Record<string, PastelColor> {
  const saved = localStorage.getItem('cashy_branch_colors');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse branch colors', e);
    }
  }
  return {};
}

export function saveBranchColors(mappings: Record<string, PastelColor>) {
  localStorage.setItem('cashy_branch_colors', JSON.stringify(mappings));
  window.dispatchEvent(new CustomEvent('cashy_branch_colors_updated', { detail: mappings }));
}
