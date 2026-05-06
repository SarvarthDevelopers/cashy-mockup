export interface Deal {
  dealId: string;
  mode: 'custom_deal' | 'deal';
  status: string;
  company: string;
  branch: string;
  shop: string;
  businessUnit: string;
  businessArea: string;
  primaryCustomer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: Array<{
    title: string;
    variant: string;
    category: string;
  }>;
  totalMarketValue: number;
  totalRequestedPayout: number;
  suggestedPayout: number;
  durationDays: number;
  dueDate: string;
  createdAt: string;
  labels: string[];
  priority: string;
  isExtension: boolean;
  pickupType: string;
  hasMissingDocs: boolean;
  assignedTo: string;
  column: string;
  lastColumnLabelAssignedAt: string;
  notes?: string;
}

export const BUSINESS_AREA_COLORS: Record<string, string> = {
  'Car': '#4649e5',
  'Watches': '#16a34a',
  'Handbags': '#7c3aed',
  'Luxury': '#d97706',
  'General Electronics': '#2563eb'
};

export const STATUS_STYLES: Record<string, { bg: string, text: string }> = {
  'DRAFT': { bg: '#f3f4f6', text: '#374151' },
  'ACTIVE': { bg: '#dcfce7', text: '#166534' },
  'PENDING': { bg: '#fef9c3', text: '#854d0e' },
  'COMPLETED': { bg: '#dbeafe', text: '#1e40af' },
  'ARCHIVED': { bg: '#fee2e2', text: '#991b1b' }
};

export const MOCK_DEALS: Deal[] = [
  {
    dealId: 'DEAL-001',
    mode: 'deal',
    status: 'ACTIVE',
    company: 'CASHY_AT',
    branch: 'Vienna',
    shop: 'Shop 1',
    businessUnit: 'B2C',
    businessArea: 'Car',
    primaryCustomer: {
      firstName: 'Franz',
      lastName: 'Kürsten',
      email: 'franz.k@example.com',
      phone: '+43 123 456789'
    },
    items: [
      { title: 'BMW 3 Series', variant: '320d', category: 'Automotive' }
    ],
    totalMarketValue: 15000,
    totalRequestedPayout: 9800,
    suggestedPayout: 10000,
    durationDays: 30,
    dueDate: '2026-05-20',
    createdAt: '2026-04-20T10:00:00Z',
    labels: ['priority'],
    priority: 'high',
    isExtension: false,
    pickupType: 'STORE',
    hasMissingDocs: false,
    assignedTo: 'Julia',
    column: 'Inbox',
    lastColumnLabelAssignedAt: '2026-04-20T11:00:00Z',
    notes: ''
  }
];
