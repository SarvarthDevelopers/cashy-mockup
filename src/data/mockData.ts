// All deal cards data for the Home Board
// ------------------------------------------------------------
/**
 * `DealData` is the central data contract used throughout the Cashy Hub
 * application. It represents the full payload of a deal, containing all
 * fields required by the Kanban board, the filter sidebar, and the Deal
 * Wizard modal. Because many UI components depend on this shape, any
 * modification to the interface has wide‑impact, which is why the Graphify
 * analysis identified it as a *god node* (high betweenness centrality).
 *
 * The interface is deliberately exhaustive – it includes fields used only
 * by specific features (e.g., `wizardData` for the modal). When a component
 * needs only a subset of the data, a lighter view‑model (`DealBoardItem`)
 * should be used instead. This keeps component coupling low while preserving
 * a single source of truth.
 */
export interface WizardDisplayData {
  customerName: string;
  email: string;
  phone: string;
  branch: string;
  company: string;
  businessArea: string;
  categoryPath: string;
  dealDuration?: string;
  payoutType: string;
  amount?: string;
  item: string;
}

export interface DealData {
  id: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  amount?: string;
  dueDate?: string;
  appointmentDate?: string;
  items: string[];
  branch: string;
  dealType: string;
  businessArea?: string;
  flags?: string[];
  specialNote?: string;
  wizardData: WizardDisplayData;
}

/**
 * Minimal representation of a deal for board‑level display. Contains only
 * the fields required by `KanBanBoard` and its child components. Using this
 * type reduces the amount of data each component must be aware of.
 */
export interface DealBoardItem {
  id: string;
  firstName: string;
  lastName: string;
  amount?: string;
  branch: string;
  businessArea?: string;
  flags?: string[];
}

/**
 * Alias for the full deal payload used by the Deal Wizard.
 */
export type DealWizardPayload = DealData;

/**
 * Helper to convert a full `DealData` object into the lightweight
 * `DealBoardItem` representation.
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

export type ColumnId = 
  | 'car-inbox'
  | 'call-attempt'
  | 'send-documents'
  | 'data-received'
  | 'price-research'
  | 'waiting-documents'
  | 'final-control'
  | 'appointment'
  | 'payout-storage'
  | 'archive';

export const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'car-inbox', title: 'Inbox' },
  { id: 'call-attempt', title: 'Call Attempt' },
  { id: 'send-documents', title: 'Send Documents' },
  { id: 'data-received', title: 'Data Received' },
  { id: 'price-research', title: 'Request Approval' },
  { id: 'waiting-documents', title: 'Waiting for Documents' },
  { id: 'final-control', title: 'Final Control' },
  { id: 'appointment', title: 'Appointment' },
  { id: 'payout-storage', title: 'Ready for Payout / Storage' },
  { id: 'archive', title: 'Archive' }
];

export const INITIAL_DEALS: Record<ColumnId, DealData[]> = {
  'car-inbox': [
    {
      id: '000001',
      countryCode: 'AT',
      firstName: 'Franz',
      lastName: 'Kürsten',
      amount: '€9,800',
      dueDate: 'Jan 20',
      items: ['BMW 3 Series'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Car',
      wizardData: {
        customerName: 'Franz Kürsten',
        email: 'franz.k@example.com',
        phone: '+43 *** *** 123',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        dealDuration: '20 days remaining',
        payoutType: 'Pawn',
        amount: '€9,800',
        item: 'BMW 3 Series'
      }
    },
    {
      id: '000002',
      countryCode: 'AT',
      firstName: 'Claudia',
      lastName: 'David',
      amount: '€7,200',
      dueDate: 'Jan 22',
      items: ['iPhone 14 Pro'],
      branch: 'Linz',
      dealType: 'Pawn',
      businessArea: 'General Electronics',
      wizardData: {
        customerName: 'Claudia David',
        email: 'claudia.d@example.com',
        phone: '+43 *** *** 456',
        branch: 'Linz',
        company: 'Austria (AT)',
        businessArea: 'General Electronics',
        categoryPath: 'Electronics > Smartphone > Apple',
        dealDuration: '22 days remaining',
        payoutType: 'Pawn',
        amount: '€7,200',
        item: 'iPhone 14 Pro'
      }
    },
    {
      id: '000003',
      countryCode: 'AT',
      firstName: 'Julia',
      lastName: 'Kern',
      amount: '€7,900',
      dueDate: 'Jan 21',
      items: ['VW Polo'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Car',
      wizardData: {
        customerName: 'Julia Kern',
        email: 'julia.k@example.com',
        phone: '+43 *** *** 789',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        dealDuration: '21 days remaining',
        payoutType: 'Pawn',
        amount: '€7,900',
        item: 'VW Polo'
      }
    },
    {
      id: '000004',
      countryCode: 'AT',
      firstName: 'Markus',
      lastName: 'Leitner',
      amount: '€11,600',
      dueDate: 'Jan 24',
      items: ['Skoda Octavia'],
      branch: 'Linz',
      dealType: 'Pawn',
      businessArea: 'Car',
      wizardData: {
        customerName: 'Markus Leitner',
        email: 'markus.l@example.com',
        phone: '+43 *** *** 234',
        branch: 'Linz',
        company: 'Austria (AT)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        dealDuration: '24 days remaining',
        payoutType: 'Pawn',
        amount: '€11,600',
        item: 'Skoda Octavia'
      }
    },
    {
      id: '000005',
      countryCode: 'DE',
      firstName: 'Hannah',
      lastName: 'Scholz',
      amount: '€9,250',
      dueDate: 'Jan 22',
      items: ['BMW X1'],
      branch: 'Berlin',
      dealType: 'Pawn',
      businessArea: 'Car',
      wizardData: {
        customerName: 'Hannah Scholz',
        email: 'hannah.s@example.com',
        phone: '+49 *** *** 567',
        branch: 'Berlin',
        company: 'Germany (DE)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        dealDuration: '22 days remaining',
        payoutType: 'Pawn',
        amount: '€9,250',
        item: 'BMW X1'
      }
    },
    {
      id: '000006',
      countryCode: 'AT',
      firstName: 'Peter',
      lastName: 'Wallner',
      amount: '€6,300',
      dueDate: 'Jan 20',
      items: ['Opel Corsa'],
      branch: 'Graz',
      dealType: 'Pawn',
      businessArea: 'Car',
      wizardData: {
        customerName: 'Peter Wallner',
        email: 'peter.w@example.com',
        phone: '+43 *** *** 890',
        branch: 'Graz',
        company: 'Austria (AT)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        dealDuration: '20 days remaining',
        payoutType: 'Pawn',
        amount: '€6,300',
        item: 'Opel Corsa'
      }
    }
  ],
  'call-attempt': [
    {
      id: '000007',
      countryCode: 'AT',
      firstName: 'Komsi',
      lastName: 'Ogli',
      amount: '€6,000',
      dueDate: 'Jan 19',
      items: ['Samsung S21'],
      branch: 'Graz',
      dealType: 'Pawn',
      businessArea: 'General Electronics',
      wizardData: {
        customerName: 'Komsi Ogli',
        email: 'komsi.o@example.com',
        phone: '+43 *** *** 789',
        branch: 'Graz',
        company: 'Austria (AT)',
        businessArea: 'General Electronics',
        categoryPath: 'Electronics > Smartphone > Samsung',
        dealDuration: '19 days remaining',
        payoutType: 'Pawn',
        amount: '€6,000',
        item: 'Samsung S21'
      }
    },
    {
      id: '000008',
      countryCode: 'AT',
      firstName: 'Musa',
      lastName: 'Hausbetreuung',
      amount: '€8,500',
      dueDate: 'Jan 19',
      items: ['Audi A3'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Car',
      wizardData: {
        customerName: 'Musa Hausbetreuung',
        email: 'musa.h@example.com',
        phone: '+43 *** *** 321',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        dealDuration: '19 days remaining',
        payoutType: 'Pawn',
        amount: '€8,500',
        item: 'Audi A3'
      }
    },
    {
      id: '000009',
      countryCode: 'AT',
      firstName: 'Nina',
      lastName: 'Aigner',
      amount: '€5,800',
      dueDate: 'Jan 19',
      items: ['Samsung S22'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'General Electronics',
      wizardData: {
        customerName: 'Nina Aigner',
        email: 'nina.a@example.com',
        phone: '+43 *** *** 345',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'General Electronics',
        categoryPath: 'Electronics > Smartphone > Samsung',
        dealDuration: '19 days remaining',
        payoutType: 'Pawn',
        amount: '€5,800',
        item: 'Samsung S22'
      }
    },
    {
      id: '000010',
      countryCode: 'DE',
      firstName: 'Tobias',
      lastName: 'Krüger',
      amount: '€8,100',
      dueDate: 'Jan 19',
      items: ['Audi A1'],
      branch: 'Munich',
      dealType: 'Pawn',
      businessArea: 'Car',
      wizardData: {
        customerName: 'Tobias Krüger',
        email: 'tobias.k@example.com',
        phone: '+49 *** *** 678',
        branch: 'Munich',
        company: 'Germany (DE)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        dealDuration: '19 days remaining',
        payoutType: 'Pawn',
        amount: '€8,100',
        item: 'Audi A1'
      }
    },
    {
      id: '000011',
      countryCode: 'AT',
      firstName: 'Stefan',
      lastName: 'Holzer',
      amount: '€6,700',
      dueDate: 'Jan 20',
      items: ['iPhone 13 Pro'],
      branch: 'Linz',
      dealType: 'Pawn',
      businessArea: 'General Electronics',
      wizardData: {
        customerName: 'Stefan Holzer',
        email: 'stefan.h@example.com',
        phone: '+43 *** *** 901',
        branch: 'Linz',
        company: 'Austria (AT)',
        businessArea: 'General Electronics',
        categoryPath: 'Electronics > Smartphone > Apple',
        dealDuration: '20 days remaining',
        payoutType: 'Pawn',
        amount: '€6,700',
        item: 'iPhone 13 Pro'
      }
    }
  ],
  'send-documents': [
    {
      id: '000012',
      countryCode: 'AT',
      firstName: 'Verena',
      lastName: 'Hofer',
      amount: '€12,400',
      dueDate: 'Jan 23',
      items: ['Rolex Submariner'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Watches',
      wizardData: {
        customerName: 'Verena Hofer',
        email: 'verena.h@example.com',
        phone: '+43 *** *** 456',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Watches',
        categoryPath: 'Luxury > Watches > Rolex',
        dealDuration: '23 days remaining',
        payoutType: 'Pawn',
        amount: '€12,400',
        item: 'Rolex Submariner'
      }
    },
    {
      id: '000013',
      countryCode: 'DE',
      firstName: 'Jonas',
      lastName: 'Weber',
      amount: '€4,500',
      items: ['MacBook Pro 14"'],
      branch: 'Berlin',
      dealType: 'Purchase',
      businessArea: 'General Electronics',
      wizardData: {
        customerName: 'Jonas Weber',
        email: 'jonas.w@example.com',
        phone: '+49 *** *** 234',
        branch: 'Berlin',
        company: 'Germany (DE)',
        businessArea: 'General Electronics',
        categoryPath: 'Electronics > Laptop > Apple',
        payoutType: 'Purchase',
        amount: '€4,500',
        item: 'MacBook Pro 14"'
      }
    },
    {
      id: '000014',
      countryCode: 'AT',
      firstName: 'Andreas',
      lastName: 'Gruber',
      amount: '€8,900',
      dueDate: 'Jan 25',
      items: ['Mercedes A-Class'],
      branch: 'Graz',
      dealType: 'Pawn',
      businessArea: 'Car',
      wizardData: {
        customerName: 'Andreas Gruber',
        email: 'andreas.g@example.com',
        phone: '+43 *** *** 567',
        branch: 'Graz',
        company: 'Austria (AT)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        dealDuration: '25 days remaining',
        payoutType: 'Pawn',
        amount: '€8,900',
        item: 'Mercedes A-Class'
      }
    }
  ],
  'data-received': [
    {
      id: '000015',
      countryCode: 'AT',
      firstName: 'Laura',
      lastName: 'Bauer',
      amount: '€15,200',
      dueDate: 'Jan 21',
      items: ['Gucci Handbag', 'Louis Vuitton Wallet'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Handbags',
      wizardData: {
        customerName: 'Laura Bauer',
        email: 'laura.b@example.com',
        phone: '+43 *** *** 890',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Handbags',
        categoryPath: 'Luxury > Handbags',
        dealDuration: '21 days remaining',
        payoutType: 'Pawn',
        amount: '€15,200',
        item: 'Gucci Handbag'
      }
    },
    {
      id: '000016',
      countryCode: 'DE',
      firstName: 'Felix',
      lastName: 'Hoffmann',
      amount: '€9,600',
      dueDate: 'Jan 22',
      items: ['Omega Seamaster'],
      branch: 'Munich',
      dealType: 'Pawn',
      businessArea: 'Watches',
      wizardData: {
        customerName: 'Felix Hoffmann',
        email: 'felix.h@example.com',
        phone: '+49 *** *** 123',
        branch: 'Munich',
        company: 'Germany (DE)',
        businessArea: 'Watches',
        categoryPath: 'Luxury > Watches > Omega',
        dealDuration: '22 days remaining',
        payoutType: 'Pawn',
        amount: '€9,600',
        item: 'Omega Seamaster'
      }
    },
    {
      id: '000017',
      countryCode: 'AT',
      firstName: 'Sandra',
      lastName: 'Moser',
      amount: '€7,800',
      dueDate: 'Jan 23',
      items: ['iPad Pro 12.9"', 'Apple Pencil'],
      branch: 'Linz',
      dealType: 'Pawn',
      businessArea: 'General Electronics',
      wizardData: {
        customerName: 'Sandra Moser',
        email: 'sandra.m@example.com',
        phone: '+43 *** *** 345',
        branch: 'Linz',
        company: 'Austria (AT)',
        businessArea: 'General Electronics',
        categoryPath: 'Electronics > Tablet > Apple',
        dealDuration: '23 days remaining',
        payoutType: 'Pawn',
        amount: '€7,800',
        item: 'iPad Pro 12.9"'
      }
    },
    {
      id: '000018',
      countryCode: 'AT',
      firstName: 'Michael',
      lastName: 'Steiner',
      amount: '€10,300',
      dueDate: 'Jan 24',
      items: ['Ford Focus'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Car',
      wizardData: {
        customerName: 'Michael Steiner',
        email: 'michael.s@example.com',
        phone: '+43 *** *** 678',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        dealDuration: '24 days remaining',
        payoutType: 'Pawn',
        amount: '€10,300',
        item: 'Ford Focus'
      }
    }
  ],
  'price-research': [
    {
      id: '000019',
      countryCode: 'DE',
      firstName: 'MTE',
      lastName: 'GmbH',
      amount: '€18,900',
      dueDate: 'Jan 26',
      items: ['Audi Q3'],
      branch: 'Berlin',
      dealType: 'Purchase',
      businessArea: 'Car',
      flags: ['HIGH VALUE'],
      wizardData: {
        customerName: 'MTE GmbH',
        email: 'contact@mte.de',
        phone: '+49 *** *** 999',
        branch: 'Berlin',
        company: 'Germany (DE)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        dealDuration: '26 days remaining',
        payoutType: 'Purchase',
        amount: '€18,900',
        item: 'Audi Q3'
      }
    },
    {
      id: '000020',
      countryCode: 'AT',
      firstName: 'Sabine',
      lastName: 'Wagner',
      amount: '€22,500',
      dueDate: 'Jan 27',
      items: ['Cartier Love Bracelet', 'Cartier Ring'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Luxury',
      flags: ['HIGH VALUE'],
      wizardData: {
        customerName: 'Sabine Wagner',
        email: 'sabine.w@example.com',
        phone: '+43 *** *** 111',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Luxury',
        categoryPath: 'Luxury > Jewelry',
        dealDuration: '27 days remaining',
        payoutType: 'Pawn',
        amount: '€22,500',
        item: 'Cartier Love Bracelet'
      }
    },
    {
      id: '000021',
      countryCode: 'DE',
      firstName: 'Daniel',
      lastName: 'Koch',
      amount: '€11,700',
      dueDate: 'Jan 25',
      items: ['TAG Heuer Carrera'],
      branch: 'Munich',
      dealType: 'Pawn',
      businessArea: 'Watches',
      wizardData: {
        customerName: 'Daniel Koch',
        email: 'daniel.k@example.com',
        phone: '+49 *** *** 222',
        branch: 'Munich',
        company: 'Germany (DE)',
        businessArea: 'Watches',
        categoryPath: 'Luxury > Watches > TAG Heuer',
        dealDuration: '25 days remaining',
        payoutType: 'Pawn',
        amount: '€11,700',
        item: 'TAG Heuer Carrera'
      }
    },
    {
      id: '000022',
      countryCode: 'AT',
      firstName: 'Elisabeth',
      lastName: 'Frank',
      amount: '€8,200',
      dueDate: 'Jan 26',
      items: ['Sony PlayStation 5', 'Controllers', 'Games'],
      branch: 'Graz',
      dealType: 'Pawn',
      businessArea: 'General Electronics',
      wizardData: {
        customerName: 'Elisabeth Frank',
        email: 'elisabeth.f@example.com',
        phone: '+43 *** *** 333',
        branch: 'Graz',
        company: 'Austria (AT)',
        businessArea: 'General Electronics',
        categoryPath: 'Electronics > Gaming Console',
        dealDuration: '26 days remaining',
        payoutType: 'Pawn',
        amount: '€8,200',
        item: 'Sony PlayStation 5'
      }
    }
  ],
  'waiting-documents': [
    {
      id: '000023',
      countryCode: 'AT',
      firstName: 'Karin',
      lastName: 'Huber',
      amount: '€13,400',
      dueDate: 'Jan 28',
      items: ['Prada Handbag'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Handbags',
      specialNote: 'Waiting for ownership proof',
      wizardData: {
        customerName: 'Karin Huber',
        email: 'karin.h@example.com',
        phone: '+43 *** *** 444',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Handbags',
        categoryPath: 'Luxury > Handbags > Prada',
        dealDuration: '28 days remaining',
        payoutType: 'Pawn',
        amount: '€13,400',
        item: 'Prada Handbag'
      }
    },
    {
      id: '000024',
      countryCode: 'DE',
      firstName: 'Moritz',
      lastName: 'Zimmermann',
      amount: '€16,800',
      dueDate: 'Jan 29',
      items: ['BMW 5 Series'],
      branch: 'Berlin',
      dealType: 'Pawn',
      businessArea: 'Car',
      specialNote: 'Waiting for registration documents',
      wizardData: {
        customerName: 'Moritz Zimmermann',
        email: 'moritz.z@example.com',
        phone: '+49 *** *** 555',
        branch: 'Berlin',
        company: 'Germany (DE)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        dealDuration: '29 days remaining',
        payoutType: 'Pawn',
        amount: '€16,800',
        item: 'BMW 5 Series'
      }
    },
    {
      id: '000025',
      countryCode: 'AT',
      firstName: 'Katharina',
      lastName: 'Reiter',
      amount: '€5,900',
      items: ['Canon EOS R5', 'Lens Set'],
      branch: 'Linz',
      dealType: 'Purchase',
      businessArea: 'General Electronics',
      specialNote: 'Receipt requested',
      wizardData: {
        customerName: 'Katharina Reiter',
        email: 'katharina.r@example.com',
        phone: '+43 *** *** 666',
        branch: 'Linz',
        company: 'Austria (AT)',
        businessArea: 'General Electronics',
        categoryPath: 'Electronics > Camera > Canon',
        payoutType: 'Purchase',
        amount: '€5,900',
        item: 'Canon EOS R5'
      }
    }
  ],
  'final-control': [
    {
      id: '000026',
      countryCode: 'AT',
      firstName: 'Lukas',
      lastName: 'Berger',
      amount: '€19,200',
      dueDate: 'Jan 30',
      items: ['Rolex Daytona'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Watches',
      flags: ['HIGH VALUE'],
      wizardData: {
        customerName: 'Lukas Berger',
        email: 'lukas.b@example.com',
        phone: '+43 *** *** 777',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Watches',
        categoryPath: 'Luxury > Watches > Rolex',
        dealDuration: '30 days remaining',
        payoutType: 'Pawn',
        amount: '€19,200',
        item: 'Rolex Daytona'
      }
    },
    {
      id: '000027',
      countryCode: 'DE',
      firstName: 'Elisa',
      lastName: 'Schmitt',
      amount: '€7,600',
      items: ['Chanel Classic Flap'],
      branch: 'Munich',
      dealType: 'Purchase',
      businessArea: 'Handbags',
      wizardData: {
        customerName: 'Elisa Schmitt',
        email: 'elisa.s@example.com',
        phone: '+49 *** *** 888',
        branch: 'Munich',
        company: 'Germany (DE)',
        businessArea: 'Handbags',
        categoryPath: 'Luxury > Handbags > Chanel',
        payoutType: 'Purchase',
        amount: '€7,600',
        item: 'Chanel Classic Flap'
      }
    }
  ],
  'appointment': [
    {
      id: '000028',
      countryCode: 'AT',
      firstName: 'Wissem',
      lastName: 'Al-Rashid',
      appointmentDate: 'Jan 22',
      items: ['Mercedes C-Class'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Car',
      specialNote: 'Vehicle inspection scheduled',
      wizardData: {
        customerName: 'Wissem Al-Rashid',
        email: 'wissem.ar@example.com',
        phone: '+43 *** *** 999',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        payoutType: 'Pawn',
        item: 'Mercedes C-Class'
      }
    },
    {
      id: '000029',
      countryCode: 'DE',
      firstName: 'Wolfgang',
      lastName: 'Becker',
      appointmentDate: 'Jan 23',
      items: ['Breitling Navitimer'],
      branch: 'Berlin',
      dealType: 'Pawn',
      businessArea: 'Watches',
      wizardData: {
        customerName: 'Wolfgang Becker',
        email: 'wolfgang.b@example.com',
        phone: '+49 *** *** 000',
        branch: 'Berlin',
        company: 'Germany (DE)',
        businessArea: 'Watches',
        categoryPath: 'Luxury > Watches > Breitling',
        payoutType: 'Pawn',
        item: 'Breitling Navitimer'
      }
    },
    {
      id: '000030',
      countryCode: 'AT',
      firstName: 'Jana',
      lastName: 'Novak',
      appointmentDate: 'Jan 24',
      items: ['Hermès Birkin'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Handbags',
      flags: ['HIGH VALUE'],
      wizardData: {
        customerName: 'Jana Novak',
        email: 'jana.n@example.com',
        phone: '+43 *** *** 100',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Handbags',
        categoryPath: 'Luxury > Handbags > Hermès',
        payoutType: 'Pawn',
        item: 'Hermès Birkin'
      }
    },
    {
      id: '000031',
      countryCode: 'DE',
      firstName: 'Martin',
      lastName: 'Schulz',
      appointmentDate: 'Jan 25',
      items: ['Audi A4'],
      branch: 'Munich',
      dealType: 'Pawn',
      businessArea: 'Car',
      wizardData: {
        customerName: 'Martin Schulz',
        email: 'martin.s@example.com',
        phone: '+49 *** *** 200',
        branch: 'Munich',
        company: 'Germany (DE)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        payoutType: 'Pawn',
        item: 'Audi A4'
      }
    },
    {
      id: '000032',
      countryCode: 'AT',
      firstName: 'Oliver',
      lastName: 'Lang',
      appointmentDate: 'Jan 26',
      items: ['IWC Pilot Watch'],
      branch: 'Graz',
      dealType: 'Pawn',
      businessArea: 'Watches',
      wizardData: {
        customerName: 'Oliver Lang',
        email: 'oliver.l@example.com',
        phone: '+43 *** *** 300',
        branch: 'Graz',
        company: 'Austria (AT)',
        businessArea: 'Watches',
        categoryPath: 'Luxury > Watches > IWC',
        payoutType: 'Pawn',
        item: 'IWC Pilot Watch'
      }
    }
  ],
  'payout-storage': [
    {
      id: '000033',
      countryCode: 'AT',
      firstName: 'Logistics',
      lastName: 'Center Vienna',
      amount: '€24,500',
      items: ['Mercedes E-Class'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Car',
      specialNote: 'Ready for customer pickup',
      flags: ['READY'],
      wizardData: {
        customerName: 'Logistics Center Vienna',
        email: 'logistics@cashy.at',
        phone: '+43 *** *** 400',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Passenger Car',
        payoutType: 'Pawn',
        amount: '€24,500',
        item: 'Mercedes E-Class'
      }
    },
    {
      id: '000034',
      countryCode: 'DE',
      firstName: 'Warehouse',
      lastName: 'Berlin',
      amount: '€14,200',
      items: ['Patek Philippe Calatrava'],
      branch: 'Berlin',
      dealType: 'Pawn',
      businessArea: 'Watches',
      specialNote: 'In secure storage',
      flags: ['HIGH VALUE', 'READY'],
      wizardData: {
        customerName: 'Warehouse Berlin',
        email: 'warehouse@cashy.de',
        phone: '+49 *** *** 500',
        branch: 'Berlin',
        company: 'Germany (DE)',
        businessArea: 'Watches',
        categoryPath: 'Luxury > Watches > Patek Philippe',
        payoutType: 'Pawn',
        amount: '€14,200',
        item: 'Patek Philippe Calatrava'
      }
    },
    {
      id: '000035',
      countryCode: 'AT',
      firstName: 'Storage',
      lastName: 'Linz',
      amount: '€8,900',
      items: ['Louis Vuitton Neverfull', 'Louis Vuitton Speedy'],
      branch: 'Linz',
      dealType: 'Pawn',
      businessArea: 'Handbags',
      specialNote: 'Awaiting payout confirmation',
      flags: ['READY'],
      wizardData: {
        customerName: 'Storage Linz',
        email: 'storage@cashy.at',
        phone: '+43 *** *** 600',
        branch: 'Linz',
        company: 'Austria (AT)',
        businessArea: 'Handbags',
        categoryPath: 'Luxury > Handbags > Louis Vuitton',
        payoutType: 'Pawn',
        amount: '€8,900',
        item: 'Louis Vuitton Neverfull'
      }
    }
  ],
  'archive': [
    {
      id: '000036',
      countryCode: 'AT',
      firstName: 'Archived',
      lastName: 'Deal #1024',
      amount: '€3,200',
      items: ['Vespa Piaggio 125'],
      branch: 'Vienna',
      dealType: 'Pawn',
      businessArea: 'Car',
      specialNote: 'Completed - Jan 15, 2026',
      wizardData: {
        customerName: 'Archived Deal #1024',
        email: 'archive@cashy.at',
        phone: '+43 *** *** 700',
        branch: 'Vienna',
        company: 'Austria (AT)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Motorcycle',
        payoutType: 'Pawn',
        amount: '€3,200',
        item: 'Vespa Piaggio 125'
      }
    },
    {
      id: '000037',
      countryCode: 'DE',
      firstName: 'Archived',
      lastName: 'Deal #1025',
      amount: '€4,800',
      items: ['Vespa Primavera 150'],
      branch: 'Berlin',
      dealType: 'Purchase',
      businessArea: 'Car',
      specialNote: 'Completed - Jan 16, 2026',
      wizardData: {
        customerName: 'Archived Deal #1025',
        email: 'archive@cashy.de',
        phone: '+49 *** *** 800',
        branch: 'Berlin',
        company: 'Germany (DE)',
        businessArea: 'Car',
        categoryPath: 'Automotive > Motorcycle',
        payoutType: 'Purchase',
        amount: '€4,800',
        item: 'Vespa Primavera 150'
      }
    },
    {
      id: '000038',
      countryCode: 'AT',
      firstName: 'Archived',
      lastName: 'Deal #1026',
      amount: '€6,500',
      items: ['Louis Vuitton Alma'],
      branch: 'Graz',
      dealType: 'Pawn',
      businessArea: 'Handbags',
      specialNote: 'Completed - Jan 17, 2026',
      wizardData: {
        customerName: 'Archived Deal #1026',
        email: 'archive@cashy.at',
        phone: '+43 *** *** 900',
        branch: 'Graz',
        company: 'Austria (AT)',
        businessArea: 'Handbags',
        categoryPath: 'Luxury > Handbags > Louis Vuitton',
        payoutType: 'Pawn',
        amount: '€6,500',
        item: 'Louis Vuitton Alma'
      }
    }
  ]
};