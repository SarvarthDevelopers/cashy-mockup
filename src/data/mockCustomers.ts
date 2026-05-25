import { MOCK_DEALS } from './mockDeals';
import type { Deal } from './mockDeals';

export interface Customer {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';
  totalDeals: number;
  totalVolume: number;
  createdAt: string;
}

// Dynamically generate MOCK_CUSTOMERS from MOCK_DEALS to ensure consistency
const generateMockCustomers = (): Customer[] => {
  const customerMap = new Map<string, Deal[]>();

  MOCK_DEALS.forEach((deal) => {
    const email = deal.primaryCustomer.email.toLowerCase().trim();
    if (!customerMap.has(email)) {
      customerMap.set(email, []);
    }
    customerMap.get(email)!.push(deal);
  });

  const PREDEFINED_IDS = ['2030397', '2031878', '2018376', '2031408', '2015829', '2022015', '2016204'];
  const customers: Customer[] = [];
  let counter = 1;

  customerMap.forEach((deals) => {
    const firstDeal = deals[0];
    const customerId = PREDEFINED_IDS[counter - 1] || String(2032000 + counter);
    
    // Sort deals by createdAt to find the earliest
    const sortedDeals = [...deals].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const earliestDate = sortedDeals[0].createdAt;
    
    const totalVolume = deals.reduce((sum, d) => sum + (d.suggestedPayout || 0), 0);
    
    // Deterministic status: index-based
    let status: Customer['status'] = 'ACTIVE';
    if (counter % 12 === 0) {
      status = 'BLACKLISTED';
    } else if (counter % 5 === 0) {
      status = 'INACTIVE';
    }

    const country = firstDeal.company === 'CASHY_DE' ? 'Germany' : 'Austria';

    customers.push({
      customerId,
      firstName: firstDeal.primaryCustomer.firstName,
      lastName: firstDeal.primaryCustomer.lastName,
      email: firstDeal.primaryCustomer.email,
      phone: firstDeal.primaryCustomer.phone,
      city: firstDeal.branch,
      country,
      status,
      totalDeals: deals.length,
      totalVolume,
      createdAt: earliestDate
    });

    counter++;
  });

  return customers;
};

export const MOCK_CUSTOMERS = generateMockCustomers();
