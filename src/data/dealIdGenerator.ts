/**
 * Sequential Deal ID Generator
 * Generates standard 6-digit zero-padded deal IDs (e.g. "000039") matching 
 * the format of all deals in Cashy.
 */

let currentMaxSeq = 38;

export function generateNewDealId(parentDealId?: string): string {
  if (parentDealId) {
    const numericOnly = parentDealId.replace(/\D/g, '');
    if (numericOnly) {
      const parsed = parseInt(numericOnly, 10);
      if (parsed > currentMaxSeq) {
        currentMaxSeq = parsed;
      }
    }
  }

  currentMaxSeq += 1;
  return String(currentMaxSeq).padStart(6, '0');
}
