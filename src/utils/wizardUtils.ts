import type { WizardConfig, WizardField } from '../data/wizardData';

/**
 * Extracts the base name of a wizard by stripping trailing two-or-more digit numbers if present.
 * Examples:
 * - "Car Wizard" -> "Car Wizard"
 * - "Car Wizard 01" -> "Car Wizard"
 * - "Luxury Watch Wizard 03" -> "Luxury Watch Wizard"
 */
export function getWizardBaseName(name: string): string {
  const trimmed = name.trim();
  const match = trimmed.match(/^(.*?)(?:\s+(\d{2,}))$/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return trimmed;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generates an auto-incrementing duplicate name with zero-padded 2-digit suffix.
 * Rules:
 * - If original is "Car Wizard", and no "Car Wizard XX" exists, returns "Car Wizard 01".
 * - If "Car Wizard 01" exists, returns "Car Wizard 02".
 * - If highest existing number is 2 (e.g. "Car Wizard 02"), returns "Car Wizard 03".
 */
export function generateDuplicateName(originalName: string, existingWizards: WizardConfig[]): string {
  const baseName = getWizardBaseName(originalName);
  const baseLower = baseName.toLowerCase();

  let maxSuffix = 0;

  for (const wizard of existingWizards) {
    const wName = wizard.name.trim();
    const wLower = wName.toLowerCase();

    if (wLower === baseLower) {
      if (maxSuffix < 0) maxSuffix = 0; // base exists
    } else {
      // Check if wName starts with baseName followed by a space and digits
      const match = wName.match(new RegExp(`^${escapeRegExp(baseName)}\\s+(\\d+)$`, 'i'));
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSuffix) {
          maxSuffix = num;
        }
      }
    }
  }

  const nextSuffix = maxSuffix + 1;
  const formattedSuffix = String(nextSuffix).padStart(2, '0');
  return `${baseName} ${formattedSuffix}`;
}

/**
 * Generates the next sequential ID in the scheme `WIZ-XXX`.
 */
export function generateNextWizardId(existingWizards: WizardConfig[]): string {
  let maxIdNum = 0;

  for (const wizard of existingWizards) {
    const match = wizard.id.match(/^WIZ-(\d+)$/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxIdNum) {
        maxIdNum = num;
      }
    }
  }

  const nextNum = maxIdNum + 1;
  return `WIZ-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Duplicates a source WizardConfig:
 * 1. Generates a new auto-incremented name ("Base Name 01", "Base Name 02"...)
 * 2. Generates a unique ID ("WIZ-005")
 * 3. Clears product category (`category: ''`)
 * 4. Sets active status to false (`active: false`)
 * 5. Performs a deep clone of stepNames, stepActions, and fields (generating fresh unique IDs for fields)
 * 6. Inserts the duplicate immediately below the source wizard in `currentWizards` array.
 */
export function duplicateWizard(
  sourceWizard: WizardConfig,
  currentWizards: WizardConfig[]
): { updatedWizards: WizardConfig[]; newWizard: WizardConfig } {
  const newName = generateDuplicateName(sourceWizard.name, currentWizards);
  const newId = generateNextWizardId(currentWizards);

  // Deep clone fields with unique field IDs to avoid key collisions
  const clonedFields: WizardField[] = sourceWizard.fields.map((f, idx) => ({
    ...f,
    id: `f_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
    options: f.options ? [...f.options] : undefined
  }));

  const newWizard: WizardConfig = {
    ...sourceWizard,
    id: newId,
    name: newName,
    category: '', // Explicitly cleared per requirement
    condition: 'All', // Default unassigned condition
    active: false, // Explicitly inactive per requirement
    shop: sourceWizard.shop || 'Global',
    businessArea: sourceWizard.businessArea || 'General',
    updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    updatedBy: 'Wizard Builder',
    fields: clonedFields,
    stepNames: { ...(sourceWizard.stepNames || {}) },
    stepActions: { ...(sourceWizard.stepActions || {}) }
  };

  // Find index of source wizard in current list
  const sourceIndex = currentWizards.findIndex(w => w.id === sourceWizard.id);
  const insertIndex = sourceIndex !== -1 ? sourceIndex + 1 : currentWizards.length;

  const updatedWizards = [...currentWizards];
  updatedWizards.splice(insertIndex, 0, newWizard);

  return { updatedWizards, newWizard };
}
