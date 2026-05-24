import type { Deal } from '../../data/mockDeals';

export interface FilterState {
  company: string[];
  branch: string[];
  shop: string[];
  businessArea: string[];
  mode: string[];
  status: string[];
  labels: string[];
  assignedTo: string[];
  pickupType: string[];
  categoryPaths: string[];
  hasMissingDocs: 'all' | 'yes' | 'no';
  isExtension: 'all' | 'yes' | 'no';
  createdDateFrom: string;
  createdDateTo: string;
  dueDateFrom: string;
  dueDateTo: string;
  minSuggestedPayout: string;
  maxSuggestedPayout: string;
}

export const INITIAL_FILTERS: FilterState = {
  company: [],
  branch: [],
  shop: [],
  businessArea: [],
  mode: [],
  status: [],
  labels: [],
  assignedTo: [],
  pickupType: [],
  categoryPaths: [],
  hasMissingDocs: 'all',
  isExtension: 'all',
  createdDateFrom: '',
  createdDateTo: '',
  dueDateFrom: '',
  dueDateTo: '',
  minSuggestedPayout: '',
  maxSuggestedPayout: '',
};

// Type for array fields of Deal (for use in MultiCheckboxFilter)
export type DealArrayKey = {
  [K in keyof Deal]: Deal[K] extends string[] ? K : never;
}[keyof Deal];
