export interface Item {
  itemId: string;
  title: string;
  variant: string;
  category: string;
  status: string;
  marketValue: number;
  shop: string;
  dealId: string;
}

export const MOCK_ITEMS: Item[] = [
  {
    itemId: 'ITEM-001',
    title: 'iPhone 14 Pro',
    variant: '256GB / Space Black',
    category: 'Electronics',
    status: 'IN_STOCK',
    marketValue: 999,
    shop: 'Vienna Central',
    dealId: 'DEAL-000001'
  }
];
