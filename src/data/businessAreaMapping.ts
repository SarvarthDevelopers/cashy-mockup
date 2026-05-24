export const DEFAULT_BUSINESS_AREA_MAPPINGS: Record<string, string> = {
  'car': 'Automotive',
  'electronics.smartphone': 'Electronics',
  'electronics.laptop': 'Electronics',
  'electronics.tablet': 'Electronics',
  'electronics.console': 'Electronics',
  'watches': 'Luxury',
  'bags': 'Luxury',
  'jewelry': 'Luxury',
};

export function getBusinessAreaMappings(): Record<string, string> {
  const saved = localStorage.getItem('cashy_business_area_mappings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse business area mappings', e);
    }
  }
  return { ...DEFAULT_BUSINESS_AREA_MAPPINGS };
}

export function saveBusinessAreaMappings(mappings: Record<string, string>) {
  localStorage.setItem('cashy_business_area_mappings', JSON.stringify(mappings));
}

export function getBusinessAreaForItem(category: string): string {
  const mappings = getBusinessAreaMappings();
  return mappings[category] || 'Mixed';
}
