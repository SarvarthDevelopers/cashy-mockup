export interface DealCustomer {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface DealItem {
  itemId: string;
  title: string;
  category: string;
  variant: string;
  marketValue: number;
  requestedPayout: number;
}

export interface Deal {
  dealId: string;
  mode: 'deal' | 'custom_deal';
  status:
    | 'BOOKED'
    | 'REVIEWING'
    | 'VERIFIED'
    | 'CANCELED'
    | 'DECLINED'
    | 'ITEM_RECEIVED_ID_MISSING'
    | 'PAYED_AND_STORED'
    | 'LOAN_DUE_NOTIFIED'
    | 'LOAN_DUE'
    | 'EXTENSION_CONFIRMED'
    | 'PAYBACK_CONFIRMED'
    | 'PAYED_SHIPMENT_PENDING'
    | 'CLOSED'
    | 'ON_SELL'
    | 'SOLD_INTERN'
    | 'SOLD_EXTERN'
    | 'PICKED_UP'
    | 'PICKUP_UNSUCCESSFUL';
  company: 'CASHY_AUT' | 'CASHY_DE';
  branch: string;
  shop: string;
  businessArea: 'Automotive' | 'Electronics' | 'Luxury' | 'Mixed';
  primaryCustomer: DealCustomer;
  items: DealItem[];
  totalMarketValue: number;
  totalRequestedPayout: number;
  suggestedPayout: number;
  durationDays: number;
  dueDate: string;
  createdAt: string;
  labels: string[];
  priority: 'Low' | 'Medium' | 'High';
  isExtension: boolean;
  pickupType: 'SHOP' | 'STANDARD_SHIPMENT' | 'STOREBOX' | 'EXTENSION';
  hasMissingDocs: boolean;
  assignedTo: string;
  column: string;
  lastColumnLabelAssignedAt: string;
  notes: string;
}

// ---- Helpers ----

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}



function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// ---- Constants ----

const STATUSES: Deal['status'][] = [
  'BOOKED',
  'REVIEWING',
  'VERIFIED',
  'CANCELED',
  'DECLINED',
  'ITEM_RECEIVED_ID_MISSING',
  'PAYED_AND_STORED',
  'LOAN_DUE_NOTIFIED',
  'LOAN_DUE',
  'EXTENSION_CONFIRMED',
  'PAYBACK_CONFIRMED',
  'PAYED_SHIPMENT_PENDING',
  'CLOSED',
  'ON_SELL',
  'SOLD_INTERN',
  'SOLD_EXTERN',
  'PICKED_UP',
  'PICKUP_UNSUCCESSFUL'
];
const COLUMNS = ['Inbox', 'Research', 'Verification', 'Ready to Payout', 'Ready to Sell', 'Archived'];

const NOTES_POOL = [
  'VIN pending verification',
  'Photos attached',
  'Appraiser requested physical inspection',
  'Customer contacted for follow-up',
  'Waiting for additional documents',
  'Ready for final review',
  'Price adjustment needed',
  'Customer approved payout',
  'Extension requested by customer',
  'Urgent — high-value item',
];

const BRANCHES_AUT = ['Vienna', 'Graz', 'Linz', 'Salzburg'];
const BRANCHES_DE = ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'];

const SHOPS_AUT: Record<string, string[]> = {
  'Vienna': ['Wien-1', 'Wien-2', 'Wien-3'],
  'Graz': ['Graz-1'],
  'Linz': ['Linz-1'],
  'Salzburg': ['Salzburg-1'],
};

const SHOPS_DE: Record<string, string[]> = {
  'Berlin': ['Berlin-Mitte', 'Berlin-West'],
  'Munich': ['Munich-1', 'Munich-2'],
  'Hamburg': ['Hamburg-1'],
  'Frankfurt': ['Frankfurt-1'],
};

// Car items
const CAR_ITEMS = [
  { title: 'Peugeot 208', variant: 'Peugeot 208 2020', category: 'car' },
  { title: 'BMW 320i', variant: 'BMW 320i 2019', category: 'car' },
  { title: 'VW Golf', variant: 'VW Golf 8 2021', category: 'car' },
  { title: 'Audi A4', variant: 'Audi A4 Avant 2020', category: 'car' },
  { title: 'Mercedes C200', variant: 'Mercedes C200 2018', category: 'car' },
  { title: 'Tesla Model 3', variant: 'Tesla Model 3 LR 2022', category: 'car' },
];

// Electronics items
const ELECTRONICS_ITEMS = [
  { title: 'iPhone 16 Pro', variant: 'iPhone 16 Pro 256GB', category: 'electronics.smartphone' },
  { title: 'iPhone 16', variant: 'iPhone 16 128GB', category: 'electronics.smartphone' },
  { title: 'Samsung Galaxy S25', variant: 'Samsung Galaxy S25 Ultra', category: 'electronics.smartphone' },
  { title: 'MacBook Pro 14"', variant: 'MacBook Pro 14 M3', category: 'electronics.laptop' },
  { title: 'iPad Pro 12.9"', variant: 'iPad Pro 12.9 M2', category: 'electronics.tablet' },
  { title: 'Sony PlayStation 5', variant: 'PS5 Disc Edition', category: 'electronics.console' },
];

// Luxury items
const LUXURY_ITEMS = [
  { title: 'Rolex Submariner', variant: 'Rolex Submariner 40mm', category: 'watches' },
  { title: 'Omega Speedmaster', variant: 'Omega Speedmaster Professional', category: 'watches' },
  { title: 'Louis Vuitton Neverfull', variant: 'LV Neverfull MM Monogram', category: 'bags' },
  { title: 'Cartier Love Bracelet', variant: 'Cartier Love 18K Yellow Gold', category: 'jewelry' },
  { title: 'Hermès Birkin 25', variant: 'Hermès Birkin 25 Togo', category: 'bags' },
  { title: 'Patek Philippe Nautilus', variant: 'Patek Nautilus 5711', category: 'watches' },
];

// Duplicate customer names for search disambiguation edge cases
const DUPLICATE_NAMES: DealCustomer[] = [
  { firstName: 'Thomas', lastName: 'Müller', phone: '+43 660 111111', email: 'thomas.mueller1@example.at' },
  { firstName: 'Thomas', lastName: 'Müller', phone: '+43 660 222222', email: 'thomas.mueller2@example.at' },
  { firstName: 'Thomas', lastName: 'Müller', phone: '+49 30 333333', email: 'thomas.mueller3@example.de' },
  { firstName: 'Anna', lastName: 'Schmidt', phone: '+43 660 444444', email: 'anna.schmidt1@example.at' },
  { firstName: 'Anna', lastName: 'Schmidt', phone: '+49 89 555555', email: 'anna.schmidt2@example.de' },
  { firstName: 'Anna', lastName: 'Schmidt', phone: '+49 40 666666', email: 'anna.schmidt3@example.de' },
];

const FIRST_NAMES = ['Franz', 'Anna', 'Lukas', 'Maria', 'Stefan', 'Julia', 'Michael', 'Laura', 'David', 'Sophie', 'Peter', 'Eva', 'Markus', 'Sandra', 'Johannes', 'Katharina', 'Daniel', 'Lisa', 'Christian', 'Nina'];
const LAST_NAMES_AUT = ['Kürsten', 'Gruber', 'Huber', 'Wagner', 'Bauer', 'Pichler', 'Steiner', 'Moser', 'Mayer', 'Hofer'];
const LAST_NAMES_DE = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch'];

function generateCustomer(company: 'CASHY_AUT' | 'CASHY_DE', index: number): DealCustomer {
  const firstName = randomChoice(FIRST_NAMES);
  const lastNames = company === 'CASHY_AUT' ? LAST_NAMES_AUT : LAST_NAMES_DE;
  const lastName = randomChoice(lastNames);
  const prefix = company === 'CASHY_AUT' ? '+43' : '+49';
  const phone = `${prefix} ${randomInt(100, 999)} ${randomInt(100000, 999999)}`;
  const domain = company === 'CASHY_AUT' ? 'example.at' : 'example.de';
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${domain}`;
  return { firstName, lastName, phone, email };
}

interface RawItem {
  title: string;
  variant: string;
  category: string;
  marketValue: number;
  requestedPayout: number;
}

function getItemsForCategory(businessArea: Deal['businessArea']): DealItem[] {
  const selectedItems: RawItem[] = [];

  switch (businessArea) {
    case 'Automotive': {
      const carItem = randomChoice(CAR_ITEMS);
      const marketValue = randomInt(8000, 120000);
      selectedItems.push({ ...carItem, marketValue, requestedPayout: 0 });
      break;
    }
    case 'Electronics': {
      const count = randomInt(1, 2);
      for (let i = 0; i < count; i++) {
        const item = randomChoice(ELECTRONICS_ITEMS);
        const marketValue = randomInt(50, 3000);
        selectedItems.push({ ...item, marketValue, requestedPayout: 0 });
      }
      break;
    }
    case 'Luxury': {
      const item = randomChoice(LUXURY_ITEMS);
      const marketValue = randomInt(2000, 80000);
      selectedItems.push({ ...item, marketValue, requestedPayout: 0 });
      break;
    }
    case 'Mixed': {
      // 2-3 items from mixed categories
      const count = randomInt(2, 3);
      const pools = [ELECTRONICS_ITEMS, LUXURY_ITEMS];
      for (let i = 0; i < count; i++) {
        const pool = randomChoice(pools);
        const item = randomChoice(pool);
        const marketValue = pool === LUXURY_ITEMS ? randomInt(2000, 15000) : randomInt(200, 2000);
      selectedItems.push({ ...item, marketValue, requestedPayout: 0 });
      }
      break;
    }
  }

  const items: DealItem[] = selectedItems.map((item) => {
    const ltvRange = businessArea === 'Automotive' ? [0.5, 0.7] :
      businessArea === 'Electronics' ? [0.4, 0.6] :
        businessArea === 'Luxury' ? [0.3, 0.5] : [0.35, 0.55];
    const ltv = randomFloat(ltvRange[0], ltvRange[1]);
    const requestedPayout = Math.round(item.marketValue * ltv);
    return {
      itemId: `I-${randomInt(1000, 9999)}`,
      title: item.title,
      category: item.category,
      variant: item.variant,
      marketValue: item.marketValue,
      requestedPayout,
    };
  });

  return items;
}

// ---- Three sample rows (verbatim from reference) ----

const SAMPLE_ROWS: Deal[] = [
  {
    dealId: '000001',
    mode: 'deal',
    status: 'PAYED_AND_STORED',
    company: 'CASHY_AUT',
    branch: 'Vienna',
    shop: 'Wien-1',
    businessArea: 'Automotive',
    primaryCustomer: { firstName: 'Franz', lastName: 'Kürsten', phone: '+43 660 123456', email: 'franz@example.at' },
    items: [{ itemId: 'I-1001', title: 'Peugeot 208', category: 'car', variant: 'Peugeot 208 2020', marketValue: 45200, requestedPayout: 30000 }],
    totalMarketValue: 45200,
    totalRequestedPayout: 30000,
    suggestedPayout: 30000,
    durationDays: 180,
    dueDate: '—',
    createdAt: '2026-04-01T09:15:00Z',
    labels: [],
    priority: 'High',
    isExtension: false,
    pickupType: 'SHOP',
    hasMissingDocs: false,
    assignedTo: 'Unassigned',
    column: 'Research',
    lastColumnLabelAssignedAt: '2026-04-02T10:00:00Z',
    notes: 'VIN pending verification',
  },
  {
    dealId: '000023',
    mode: 'deal',
    status: 'BOOKED',
    company: 'CASHY_DE',
    branch: 'Berlin',
    shop: 'Berlin-Mitte',
    businessArea: 'Electronics',
    primaryCustomer: { firstName: 'Anna', lastName: 'Müller', phone: '+49 30 555555', email: 'anna@example.de' },
    items: [{ itemId: 'I-2001', title: 'iPhone 16 Pro', category: 'electronics.smartphone', variant: 'iPhone 16 Pro 256GB', marketValue: 1200, requestedPayout: 800 }],
    totalMarketValue: 1200,
    totalRequestedPayout: 800,
    suggestedPayout: 720,
    durationDays: 30,
    dueDate: '—',
    createdAt: '2026-04-03T11:00:00Z',
    labels: [],
    priority: 'Medium',
    isExtension: false,
    pickupType: 'SHOP',
    hasMissingDocs: false,
    assignedTo: 'Unassigned',
    column: 'Inbox',
    lastColumnLabelAssignedAt: '2026-04-03T11:00:00Z',
    notes: 'Photos attached',
  },
  {
    dealId: '000077',
    mode: 'custom_deal',
    status: 'REVIEWING',
    company: 'CASHY_DE',
    branch: 'Munich',
    shop: 'Munich-2',
    businessArea: 'Mixed',
    primaryCustomer: { firstName: 'Lukas', lastName: 'Weber', phone: '+49 89 111222', email: 'lukas@example.de' },
    items: [
      { itemId: 'I-4001', title: 'Rolex Submariner', category: 'watches', variant: 'Rolex Submariner 40mm', marketValue: 12000, requestedPayout: 7000 },
      { itemId: 'I-4002', title: 'iPhone 16', category: 'electronics.smartphone', variant: 'iPhone 16 128GB', marketValue: 900, requestedPayout: 500 },
    ],
    totalMarketValue: 12900,
    totalRequestedPayout: 7500,
    suggestedPayout: 6500,
    durationDays: 90,
    dueDate: '—',
    createdAt: '2026-03-20T10:00:00Z',
    labels: [],
    priority: 'High',
    isExtension: false,
    pickupType: 'SHOP',
    hasMissingDocs: false,
    assignedTo: 'Unassigned',
    column: 'Verification',
    lastColumnLabelAssignedAt: '2026-03-21T09:00:00Z',
    notes: 'Appraiser requested physical inspection',
  },
];

// ---- Main Generator ----

export function generateMockDeals(count = 100): Deal[] {
  const deals: Deal[] = [...SAMPLE_ROWS];
  const usedIds = new Set(['000001', '000023', '000077']);

  // Indices for distribution tracking
  let customDealAccepted = 0;
  let archivedCount = 1; // 000077 area counts

  let highValueCarCount = 1; // 000001 already high-value
  let mixedMultiItemCount = 1; // 000077 already multi-item mixed
  let duplicateNameIdx = 0;

  for (let i = deals.length; i < count; i++) {
    let dealNum = randomInt(2, 99999);
    let dealId = `${String(dealNum).padStart(6, '0')}`;
    while (usedIds.has(dealId)) {
      dealNum = randomInt(2, 99999);
      dealId = `${String(dealNum).padStart(6, '0')}`;
    }
    usedIds.add(dealId);

    // Company: 60% AUT, 40% DE
    const company: Deal['company'] = i < count * 0.6 ? 'CASHY_AUT' : 'CASHY_DE';

    // Branch and shop
    const branches = company === 'CASHY_AUT' ? BRANCHES_AUT : BRANCHES_DE;
    const shopsMap = company === 'CASHY_AUT' ? SHOPS_AUT : SHOPS_DE;
    const branch = randomChoice(branches);
    const shop = randomChoice(shopsMap[branch]);

    // Mode: 90% deal (Pawn), 10% custom_deal (Purchase)
    const mode: Deal['mode'] = Math.random() < 0.90 ? 'deal' : 'custom_deal';

    // Status distribution
    let status: Deal['status'];

    // Ensure at least 8 VERIFIED custom_deals
    if (mode === 'custom_deal' && customDealAccepted < 8 && i > count * 0.5) {
      status = 'VERIFIED';
      customDealAccepted++;
    }
    // Ensure at least 10 CLOSED
    else if (archivedCount < 10 && i > count * 0.7) {
      status = 'CLOSED';
      archivedCount++;
    } else {
      status = randomChoice(STATUSES);
      if (status === 'CLOSED') archivedCount++;
      if (status === 'VERIFIED' && mode === 'custom_deal') customDealAccepted++;
    }

    // Business Area distribution: ~20% Mixed, rest spread
    let businessArea: Deal['businessArea'];
    if (mixedMultiItemCount < 5 && i % 5 === 0) {
      businessArea = 'Mixed';
      mixedMultiItemCount++;
    } else if (highValueCarCount < 3 && i % 15 === 0) {
      businessArea = 'Automotive';
    } else if (Math.random() < 0.2) {
      businessArea = 'Mixed';
    } else {
      businessArea = randomChoice(['Automotive', 'Electronics', 'Luxury'] as Deal['businessArea'][]);
    }

    const items = getItemsForCategory(businessArea);

    // High-value car override
    if (businessArea === 'Automotive' && highValueCarCount < 3) {
      items[0].marketValue = randomInt(30000, 120000);
      items[0].requestedPayout = Math.round(items[0].marketValue * randomFloat(0.5, 0.7));
      highValueCarCount++;
    }

    // Compute totals
    const totalMarketValue = items.reduce((s, item) => s + item.marketValue, 0);
    const totalRequestedPayout = items.reduce((s, item) => s + item.requestedPayout, 0);

    // Suggested payout calculation
    const ltvRanges: Record<string, [number, number]> = {
      'Automotive': [0.5, 0.7],
      'Electronics': [0.4, 0.6],
      'Luxury': [0.3, 0.5],
      'Mixed': [0.35, 0.55],
    };
    const [ltvMin, ltvMax] = ltvRanges[businessArea];
    const avgLtv = randomFloat(ltvMin, ltvMax);
    const randomFactor = randomFloat(0.95, 1.0);
    const fees = randomInt(10, 200);
    const suggestedPayout = Math.round(totalMarketValue * avgLtv * randomFactor - fees);

    // Duration and dates
    const durationDays = randomChoice([30, 60, 90, 120, 180]);
    const createdDaysAgo = randomInt(1, 90);
    const createdDate = daysAgo(createdDaysAgo);

    // Customer
    let customer: DealCustomer;
    if (duplicateNameIdx < 6) {
      customer = DUPLICATE_NAMES[duplicateNameIdx];
      duplicateNameIdx++;
    } else {
      customer = generateCustomer(company, i);
    }

    // Pickup type
    const pickupType: Deal['pickupType'] = randomChoice(['SHOP', 'SHOP', 'SHOP', 'STANDARD_SHIPMENT', 'STOREBOX']);

    // Priority
    const priority: Deal['priority'] = totalMarketValue > 20000 ? 'High' :
      totalMarketValue > 5000 ? 'Medium' : 'Low';

    // Column
    const column = status === 'CLOSED' ? 'Archived' : randomChoice(COLUMNS.filter(c => c !== 'Archived'));

    // Last column assigned timestamp
    const columnDaysAgo = randomInt(0, Math.min(createdDaysAgo, 90));
    const lastColumnDate = daysAgo(columnDaysAgo);

    deals.push({
      dealId,
      mode,
      status,
      company,
      branch,
      shop,
      businessArea,
      primaryCustomer: customer,
      items,
      totalMarketValue,
      totalRequestedPayout,
      suggestedPayout,
      durationDays,
      dueDate: '—',
      createdAt: createdDate.toISOString(),
      labels: [],
      priority,
      isExtension: false,
      pickupType,
      hasMissingDocs: false,
      assignedTo: 'Unassigned',
      column,
      lastColumnLabelAssignedAt: lastColumnDate.toISOString(),
      notes: randomChoice(NOTES_POOL),
    });
  }

  // Sort by dealId for consistent ordering
  return deals.sort((a, b) => a.dealId.localeCompare(b.dealId));
}

export const MOCK_DEALS = generateMockDeals(100);

// Business Area color mapping
export const BUSINESS_AREA_COLORS: Record<string, string> = {
  'Automotive': '#3b82f6',
  'Electronics': '#8b5cf6',
  'Luxury': '#f59e0b',
  'Mixed': '#6b7280',
};

// Status badge styling
export const STATUS_STYLES: Record<Deal['status'], { bg: string; text: string }> = {
  'BOOKED': { bg: '#e0f2fe', text: '#0369a1' },
  'REVIEWING': { bg: '#ede9fe', text: '#7c3aed' },
  'VERIFIED': { bg: '#dcfce7', text: '#15803d' },
  'CANCELED': { bg: '#f3f4f6', text: '#4b5563' },
  'DECLINED': { bg: '#fee2e2', text: '#dc2626' },
  'ITEM_RECEIVED_ID_MISSING': { bg: '#ffedd5', text: '#ea580c' },
  'PAYED_AND_STORED': { bg: '#ecfdf5', text: '#047857' },
  'LOAN_DUE_NOTIFIED': { bg: '#fef3c7', text: '#b45309' },
  'LOAN_DUE': { bg: '#fff7ed', text: '#c2410c' },
  'EXTENSION_CONFIRMED': { bg: '#fae8ff', text: '#a21caf' },
  'PAYBACK_CONFIRMED': { bg: '#e0f2fe', text: '#0284c7' },
  'PAYED_SHIPMENT_PENDING': { bg: '#f0fdfa', text: '#0f766e' },
  'CLOSED': { bg: '#f3f4f6', text: '#374151' },
  'ON_SELL': { bg: '#e0f2fe', text: '#0284c7' },
  'SOLD_INTERN': { bg: '#fdf2f8', text: '#be185d' },
  'SOLD_EXTERN': { bg: '#fff1f2', text: '#be123c' },
  'PICKED_UP': { bg: '#ecfdf5', text: '#047857' },
  'PICKUP_UNSUCCESSFUL': { bg: '#fff1f2', text: '#e11d48' },
};

export const SHOP_METADATA: Record<string, string[]> = {
  'Vienna': ['Wien-1', 'Wien-2', 'Wien-3'],
  'Graz': ['Graz-1'],
  'Linz': ['Linz-1'],
  'Salzburg': ['Salzburg-1'],
  'Berlin': ['Berlin-Mitte', 'Berlin-West'],
  'Munich': ['Munich-1', 'Munich-2'],
  'Hamburg': ['Hamburg-1'],
  'Frankfurt': ['Frankfurt-1']
};

export const DEALS_MICROCOPY = {
  search: {
    placeholder: "Search by ID, customer name, item variant, VIN...",
    emptyHint: "No results found. Refine your query or reset active filters.",
    unsortedWarning: "Search results are unsorted — refine query or use filters."
  },
  sorting: {
    unsupportedTooltip: "Multi-column sorting on this field is not indexed. Using default sort instead."
  },
  bulk: {
    progress: "Processing bulk action...",
    success: "Successfully processed bulk action.",
    partialError: "Some operations failed. Inline retries are available."
  },
  export: {
    started: "Export job started.",
    estimatedTime: "Estimated completion time: 45 seconds.",
    fallback: "Live CSV stream unavailable. Exporting current page instead."
  },
  preview: {
    openWizard: "Open Deal Wizard",
    confirmDelete: "Are you sure you want to archive this deal? This action is reversible."
  }
};

