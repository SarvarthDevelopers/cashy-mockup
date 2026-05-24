// Conversion helpers for Deal data models

import type { DealData, DealBoardItem } from '../data/mockData';

/**
 * Convert a full `DealData` object into a `DealBoardItem` for board display.
 */
export const toBoardItem = (deal: DealData): DealBoardItem => ({
  id: deal.id,
  firstName: deal.firstName,
  lastName: deal.lastName,
  amount: deal.amount,
  branch: deal.branch,
  businessArea: deal.businessArea,
  flags: deal.flags,
});

/**
 * Merge a `DealBoardItem` back into a full `DealData` using the original
 * payload. This is useful when the wizard needs the complete record.
 */
export const toFullDeal = (
  _boardItem: DealBoardItem,
  original: DealData,
): DealData => ({
  ...original,
  // boardItem may contain a subset, but we keep original fields unchanged.
});
