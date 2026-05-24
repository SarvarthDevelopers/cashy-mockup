export interface FilterState {
  customerId: string;
  countries: string[];
  cities: string[];
  statuses: string[];
  minDeals: string;
  maxDeals: string;
  minVolume: string;
  maxVolume: string;
  createdDateFrom: string;
  createdDateTo: string;
}

export const INITIAL_FILTERS: FilterState = {
  customerId: '',
  countries: [],
  cities: [],
  statuses: [],
  minDeals: '',
  maxDeals: '',
  minVolume: '',
  maxVolume: '',
  createdDateFrom: '',
  createdDateTo: '',
};
