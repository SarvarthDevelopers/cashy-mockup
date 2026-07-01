export interface WizardField {
  id: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'file';
  label: string;
  placeholder?: string;
  options?: string[];
  stepId: string;
  required?: boolean;
}

export type AssociatedAction = string; // Allows any dynamic workflow gate ID or 'NONE'

export interface WizardConfig {
  id: string;
  name: string;
  businessArea: string;
  category: string;
  shop?: string;
  active: boolean;
  fields: WizardField[];
  stepNames: Record<string, string>; // Maps step ID to custom display name
  stepActions?: Record<string, AssociatedAction>; // Maps step ID to associated action
  updatedAt: string;
  updatedBy: string;
}


export const GLOBAL_STEPS = [
  { id: 'step2', defaultTitle: 'Research' },
  { id: 'step3', defaultTitle: 'Price' },
  { id: 'step4', defaultTitle: 'Verification' },
  { id: 'step6', defaultTitle: 'Payout' },
  { id: 'step7', defaultTitle: 'Storage' },
];

export const MOCK_WIZARDS: WizardConfig[] = [
  {
    id: 'WIZ-001',
    name: 'Car Wizard',
    businessArea: 'Automotive',
    category: 'Car',
    active: true,
    updatedAt: 'Jan 14, 2026',
    updatedBy: 'Julia',
    stepNames: {
      step2: 'Vehicle Research',
      step3: 'Appraisal & Pricing',
      step4: 'Technical Verification',
      step6: 'Payout Management',
      step7: 'Warehouse Storage'
    },
    stepActions: {
      step2: 'SET_REVIEWING',
      step3: 'NONE',
      step4: 'VERIFY_DEAL',
      step6: 'EXECUTE_PAYOUT',
      step7: 'NONE'
    },
    fields: [
      { id: 'f1', stepId: 'step2', type: 'text', label: 'Manufacturer & Model', placeholder: 'e.g. BMW 320d' },
      { id: 'f2', stepId: 'step2', type: 'number', label: 'Manufacturing Year', placeholder: '2023' },
      { id: 'f3', stepId: 'step2', type: 'text', label: 'VIN (Vehicle ID Number)', placeholder: 'WBA...' },
      { id: 'f4', stepId: 'step2', type: 'select', label: 'Fuel Type', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'] },
      { id: 'f5', stepId: 'step3', type: 'select', label: 'Interior Condition', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { id: 'f6', stepId: 'step3', type: 'select', label: 'Exterior Condition', options: ['Pristine', 'Minor Scratches', 'Moderate Wear', 'Damaged'] },
      { id: 'f7', stepId: 'step3', type: 'number', label: 'Estimated Market Value', placeholder: '0.00' },
      { id: 'f8', stepId: 'step4', type: 'file', label: 'Registration Document (V5C)' },
      { id: 'f9', stepId: 'step4', type: 'checkbox', label: 'Service History Verified' },
      { id: 'f10', stepId: 'step4', type: 'text', label: 'Accident Record Summary', placeholder: 'Describe any previous accidents...' },
      { id: 'f11', stepId: 'step6', type: 'select', label: 'Payment Method', options: ['Bank Transfer', 'Cheque', 'Financing Settle'] },
      { id: 'f12', stepId: 'step6', type: 'text', label: 'Account Holder Name', placeholder: 'Name on account' },
      { id: 'f13', stepId: 'step7', type: 'text', label: 'Parking Slot Assignment', placeholder: 'e.g. B-12' }
    ]
  },
  {
    id: 'WIZ-002',
    name: 'Luxury Watch Wizard',
    businessArea: 'Luxury Goods',
    category: 'Watches',
    active: true,
    updatedAt: 'Jan 12, 2026',
    updatedBy: 'Mark',
    stepNames: {
      step2: 'Watch Specification',
      step3: 'Valuation',
      step4: 'Authenticity Check',
      step6: 'Disbursement',
      step7: 'Safe Storage'
    },
    stepActions: {
      step2: 'NONE',
      step3: 'NONE',
      step4: 'VERIFY_DEAL',
      step6: 'EXECUTE_PAYOUT',
      step7: 'NONE'
    },
    fields: [
      { id: 'f14', stepId: 'step2', type: 'text', label: 'Brand & Collection', placeholder: 'e.g. Rolex Submariner' },
      { id: 'f15', stepId: 'step2', type: 'text', label: 'Reference Number', placeholder: '126610LN' },
      { id: 'f16', stepId: 'step2', type: 'text', label: 'Serial Number', placeholder: 'Enter serial...' },
      { id: 'f17', stepId: 'step2', type: 'select', label: 'Movement Type', options: ['Automatic', 'Quartz', 'Manual', 'Kinetic'] },
      { id: 'f18', stepId: 'step3', type: 'select', label: 'Working Condition', options: ['Running Strong', 'Needs Service', 'Non-Functional'] },
      { id: 'f19', stepId: 'step3', type: 'select', label: 'Bracelet Condition', options: ['No Stretch', 'Minor Stretch', 'Moderate Stretch'] },
      { id: 'f20', stepId: 'step4', type: 'checkbox', label: 'Original Box Included' },
      { id: 'f21', stepId: 'step4', type: 'checkbox', label: 'Warranty Card/Papers Present' },
      { id: 'f22', stepId: 'step4', type: 'file', label: 'High-Res Dial Image' },
      { id: 'f23', stepId: 'step6', type: 'text', label: 'IBAN / Swift Code', placeholder: 'For wire transfer' },
      { id: 'f24', stepId: 'step7', type: 'text', label: 'Secure Vault ID', placeholder: 'Vault Box Number' }
    ]
  },
  {
    id: 'WIZ-003',
    name: 'Electronics & Mobile Wizard',
    businessArea: 'Electronics',
    category: 'General Electronics',
    active: true,
    updatedAt: 'Jan 15, 2026',
    updatedBy: 'Julia',
    stepNames: {
      step2: 'Device Intake',
      step3: 'Functional Testing',
      step4: 'Security Verification',
      step6: 'Payment Setup',
      step7: 'Inventory Placement'
    },
    stepActions: {
      step2: 'NONE',
      step3: 'NONE',
      step4: 'VERIFY_DEAL',
      step6: 'EXECUTE_PAYOUT',
      step7: 'NONE'
    },
    fields: [
      { id: 'f25', stepId: 'step2', type: 'select', label: 'Device Category', options: ['Smartphone', 'Laptop', 'Tablet', 'Console'] },
      { id: 'f26', stepId: 'step2', type: 'text', label: 'Manufacturer', placeholder: 'e.g. Apple' },
      { id: 'f27', stepId: 'step2', type: 'text', label: 'IMEI / Serial Number', placeholder: '15-digit number' },
      { id: 'f28', stepId: 'step3', type: 'select', label: 'Screen Condition', options: ['Pristine', 'Micro-scratches', 'Cracked', 'Dead Pixels'] },
      { id: 'f29', stepId: 'step3', type: 'number', label: 'Battery Health %', placeholder: '1-100' },
      { id: 'f30', stepId: 'step3', type: 'select', label: 'Storage', options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
      { id: 'f31', stepId: 'step4', type: 'checkbox', label: 'Find My / Activation Lock OFF' },
      { id: 'f32', stepId: 'step4', type: 'checkbox', label: 'Data Wipe Confirmed' },
      { id: 'f33', stepId: 'step4', type: 'file', label: 'Diagnostic Report' },
      { id: 'f34', stepId: 'step6', type: 'select', label: 'Payout Priority', options: ['Standard (3 Days)', 'Instant Cash'] },
      { id: 'f35', stepId: 'step7', type: 'text', label: 'Bin / Shelf Location', placeholder: 'e.g. ELEC-04' }
    ]
  },
  {
    id: 'WIZ-004',
    name: 'Luxury Goods Wizard',
    businessArea: 'Luxury',
    category: 'Luxury',
    active: true,
    updatedAt: 'Jan 10, 2026',
    updatedBy: 'Sarah',
    stepNames: {
      step2: 'Item Identification',
      step3: 'Material Grading',
      step4: 'Authentication',
      step6: 'Settlement',
      step7: 'Showroom Placement'
    },
    stepActions: {
      step2: 'NONE',
      step3: 'NONE',
      step4: 'VERIFY_DEAL',
      step6: 'EXECUTE_PAYOUT',
      step7: 'NONE'
    },
    fields: [
      { id: 'f36', stepId: 'step2', type: 'text', label: 'Designer/Brand', placeholder: 'e.g. Hermes' },
      { id: 'f37', stepId: 'step2', type: 'text', label: 'Item Name', placeholder: 'Birkin 30' },
      { id: 'f38', stepId: 'step2', type: 'text', label: 'Production Year/Code', placeholder: 'e.g. U Stamp' },
      { id: 'f39', stepId: 'step3', type: 'select', label: 'Material/Leather', options: ['Togo', 'Epsom', 'Clemence', 'Exotic'] },
      { id: 'f40', stepId: 'step3', type: 'number', label: 'Item Weight (g)', placeholder: '0.00' },
      { id: 'f41', stepId: 'step4', type: 'checkbox', label: 'Authenticity Card Present' },
      { id: 'f42', stepId: 'step4', type: 'select', label: 'Hardware Condition', options: ['Gold-tone (New)', 'Palladium (Worn)', 'Scratched'] },
      { id: 'f43', stepId: 'step4', type: 'text', label: 'Stitching/Hardware Notes', placeholder: 'Detail any specific markings...' },
      { id: 'f44', stepId: 'step6', type: 'text', label: 'Consignment Terms', placeholder: 'e.g. 20% Commission' },
      { id: 'f45', stepId: 'step7', type: 'text', label: 'Display Case Number', placeholder: 'Luxury-01' }
    ]
  }
];
