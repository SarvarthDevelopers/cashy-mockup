export interface WorkflowGate {
  id: string;
  name: string;
  triggers: string[];
  title: string;
  description: string;
  buttonText: string;
  system?: boolean;
}

export interface DealStatusInfo {
  status: string;
  description: string;
  type: 'Manual' | 'Automatic' | 'Inline';
  who: string;
  mutation: string;
}

export const ALL_DEAL_STATUSES: DealStatusInfo[] = [
  {
    status: 'REVIEWING',
    description: 'Generates issuance certificate PDF and sets deal under employee review.',
    type: 'Manual',
    who: 'Employee',
    mutation: 'setDealReviewing(dealId)',
  },
  {
    status: 'VERIFIED',
    description: 'Locks appraisal pricing, generates legal contracts, and marks deal as verified.',
    type: 'Manual',
    who: 'Employee / Franchise',
    mutation: 'verifyDeal(verifyDealArgs)',
  },
  {
    status: 'PAYED_AND_STORED',
    description: 'Confirms item has been paid out and is safely cataloged in shop storage.',
    type: 'Manual',
    who: 'Employee',
    mutation: 'setPayedAndStored(dealId)',
  },
  {
    status: 'DECLINED',
    description: 'Declines the deal manually, ending the wizard pipeline and archiving details.',
    type: 'Manual',
    who: 'Employee',
    mutation: 'declineDeal(dealId)',
  },
  {
    status: 'ITEM_RECEIVED_ID_MISSING',
    description: 'Marks item as received but halts progress because the customer ID documentation is missing.',
    type: 'Manual',
    who: 'Employee',
    mutation: 'setDealReceivedIdMissing(dealId)',
  },
  {
    status: 'CANCELED',
    description: 'Cancels the deal process entirely (initiated by customer or staff).',
    type: 'Manual',
    who: 'Employee / Customer',
    mutation: 'cancelDeal(dealId)',
  },
  {
    status: 'EXTENSION_CONFIRMED',
    description: 'Confirms an active loan extension based on a pre-calculated token.',
    type: 'Manual',
    who: 'Employee / Franchise',
    mutation: 'confirmExtension(args)',
  },
  {
    status: 'PAYBACK_CONFIRMED',
    description: 'Confirms customer payback of the loan, returning the item from storage.',
    type: 'Manual',
    who: 'Employee / Franchise',
    mutation: 'confirmPayback(args)',
  },
  {
    status: 'CLOSED',
    description: 'Closes the deal fully and completes cataloging.',
    type: 'Manual',
    who: 'Employee',
    mutation: 'closeDeal(dealId, removeItems)',
  },
  {
    status: 'ON_SELL',
    description: 'Moves the item to the public showcase / retail marketplace (Superadmin only).',
    type: 'Manual',
    who: 'Superadmin',
    mutation: 'setOnSell(dealId)',
  },
  {
    status: 'SOLD_EXTERN',
    description: 'Marks item as sold through an external sales channel.',
    type: 'Manual',
    who: 'Employee',
    mutation: 'setSoldExtern(dealId)',
  },
  {
    status: 'SOLD_INTERN',
    description: 'Transitioned automatically (inline) inside shop retail or auction/valoration flows.',
    type: 'Inline',
    who: 'System',
    mutation: 'Side-effect of sales/auctions',
  },
  {
    status: 'PAYED_SHIPMENT_PENDING',
    description: 'Inline side-effect triggered inside payback confirmation if item transport is shipment.',
    type: 'Inline',
    who: 'System',
    mutation: 'Side-effect inside confirmPayback',
  }
];

export const DEFAULT_WORKFLOW_GATES: WorkflowGate[] = [
  {
    id: 'SET_REVIEWING',
    name: 'Start Review',
    triggers: ['REVIEWING'],
    title: 'Start Item Review',
    description: 'Ready to start the review process and transition the status to REVIEWING.',
    buttonText: 'Start Review',
    system: true,
  },
  {
    id: 'VERIFY_DEAL',
    name: 'Verify Deal',
    triggers: ['VERIFIED'],
    title: 'Verify Calculations',
    description: 'Validates all input data, locks appraisal/pricing, and marks the deal as VERIFIED.',
    buttonText: 'Verify & Lock',
    system: true,
  },
  {
    id: 'EXECUTE_PAYOUT',
    name: 'Confirm Payout',
    triggers: ['PAYED_AND_STORED'],
    title: 'Execute Payout',
    description: 'Processes the cashbook entry and marks the deal as PAYED_AND_STORED (Live).',
    buttonText: 'Confirm Payout',
    system: true,
  },
  {
    id: 'DECLINE_DEAL',
    name: 'Reject & Close',
    triggers: ['DECLINED'],
    title: 'Decline Deal',
    description: 'Marks the deal as DECLINED. This terminates the wizard process.',
    buttonText: 'Decline Deal',
    system: true,
  }
];

export const getWorkflowGates = (): WorkflowGate[] => {
  const saved = localStorage.getItem('cashy_workflow_gates');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse workflow gates', e);
    }
  }
  return DEFAULT_WORKFLOW_GATES;
};

export const saveWorkflowGates = (gates: WorkflowGate[]) => {
  localStorage.setItem('cashy_workflow_gates', JSON.stringify(gates));
  window.dispatchEvent(new Event('cashy_workflow_gates_updated'));
};

export const resetWorkflowGates = () => {
  localStorage.removeItem('cashy_workflow_gates');
  window.dispatchEvent(new Event('cashy_workflow_gates_updated'));
};

// Natural order progression for gating logic
export const STATUS_ORDER: Record<string, number> = {
  BOOKED: 1,
  REVIEWING: 2,
  VERIFIED: 3,
  ITEM_RECEIVED_ID_MISSING: 3.5,
  PAYED_AND_STORED: 4,
  ON_SELL: 5,
  SOLD_INTERN: 6,
  SOLD_EXTERN: 6,
  CLOSED: 7,
};
