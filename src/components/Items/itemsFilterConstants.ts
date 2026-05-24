export interface FilterState {
  itemId: string;
  categoryPaths: string[];
  businessAreas: string[];
  dealId: string;
  dealStatuses: string[];
  hasImages: 'all' | 'yes' | 'no';
  hasDocuments: 'all' | 'yes' | 'no';
}

export const INITIAL_FILTERS: FilterState = {
  itemId: '',
  categoryPaths: [],
  businessAreas: [],
  dealId: '',
  dealStatuses: [],
  hasImages: 'all',
  hasDocuments: 'all',
};
