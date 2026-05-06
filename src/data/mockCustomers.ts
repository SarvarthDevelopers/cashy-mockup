export interface Customer {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: string;
  totalDeals: number;
  totalVolume: number;
  createdAt: string;
}

export const MOCK_CUSTOMERS: Customer[] = [
  {
    customerId: 'CUST-001',
    firstName: 'Franz',
    lastName: 'Kürsten',
    email: 'franz.k@example.com',
    phone: '+43 123 456789',
    city: 'Vienna',
    country: 'Austria',
    status: 'ACTIVE',
    totalDeals: 5,
    totalVolume: 25000,
    createdAt: '2026-01-14T10:00:00Z'
  }
];
