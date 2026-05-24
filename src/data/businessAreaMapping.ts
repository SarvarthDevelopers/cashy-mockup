export interface BusinessArea {
  id: string;
  name: string;
  categories: string[];
}

export const DEFAULT_BUSINESS_AREAS: BusinessArea[] = [
  {
    id: 'automotive',
    name: 'Automotive',
    categories: ['car']
  },
  {
    id: 'electronics',
    name: 'Electronics',
    categories: [
      'electronics.smartphone',
      'electronics.laptop',
      'electronics.tablet',
      'electronics.console'
    ]
  },
  {
    id: 'luxury',
    name: 'Luxury',
    categories: ['watches', 'bags', 'jewelry']
  }
];

export const ALL_EXISTING_CATEGORIES = [
  'car',
  'electronics.smartphone',
  'electronics.laptop',
  'electronics.tablet',
  'electronics.console',
  'watches',
  'bags',
  'jewelry'
];

export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'car': 'Automotive > Passenger Car',
  'electronics.smartphone': 'Electronics > Smartphone',
  'electronics.laptop': 'Electronics > Laptop',
  'electronics.tablet': 'Electronics > Tablet',
  'electronics.console': 'Electronics > Gaming Console',
  'watches': 'Luxury > Watches',
  'bags': 'Luxury > Handbags',
  'jewelry': 'Luxury > Jewelry'
};

export interface CategoryNode {
  name: string;
  fullPath: string;
  displayName: string;
  children: Record<string, CategoryNode>;
  isLeaf: boolean;
}

export function buildCategoryTree(categories: string[]): CategoryNode {
  const root: CategoryNode = { name: 'Root', fullPath: '', displayName: 'Root', children: {}, isLeaf: false };
  categories.forEach(cat => {
    if (!cat) return;
    const parts = cat.split('.');
    let current = root;
    let pathAcc = '';
    parts.forEach((part, idx) => {
      pathAcc = pathAcc ? `${pathAcc}.${part}` : part;
      const isLast = idx === parts.length - 1;
      if (!current.children[part]) {
        let dispName = part.charAt(0).toUpperCase() + part.slice(1);
        if (isLast && CATEGORY_DISPLAY_NAMES[pathAcc]) {
          const dispParts = CATEGORY_DISPLAY_NAMES[pathAcc].split('>');
          dispName = dispParts[dispParts.length - 1].trim();
        }
        current.children[part] = {
          name: part,
          fullPath: pathAcc,
          displayName: dispName,
          children: {},
          isLeaf: false
        };
      }
      current = current.children[part];
    });
    current.isLeaf = true;
  });
  return root;
}

export function getDescendants(node: CategoryNode): string[] {
  const paths: string[] = [];
  const recurse = (n: CategoryNode) => {
    if (n.fullPath) paths.push(n.fullPath);
    Object.values(n.children).forEach(recurse);
  };
  recurse(node);
  return paths;
}

export function getBusinessAreas(): BusinessArea[] {
  const saved = localStorage.getItem('cashy_business_areas');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Strip color if it exists in local storage
      return parsed.map((a: Record<string, unknown>) => {
        const rest = { ...a };
        delete rest.color;
        return rest as unknown as BusinessArea;
      });
    } catch (e) {
      console.error('Failed to parse dynamic business areas', e);
    }
  }
  return JSON.parse(JSON.stringify(DEFAULT_BUSINESS_AREAS));
}

export function saveBusinessAreas(areas: BusinessArea[]) {
  // Strip color from saved areas
  const cleanedAreas = areas.map(({ name, id, categories }) => ({ id, name, categories }));
  localStorage.setItem('cashy_business_areas', JSON.stringify(cleanedAreas));

  // Save to flat mappings for backward-compatibility
  const flatMappings: Record<string, string> = {};
  cleanedAreas.forEach(area => {
    area.categories.forEach(cat => {
      flatMappings[cat] = area.name;
    });
  });
  localStorage.setItem('cashy_business_area_mappings', JSON.stringify(flatMappings));

  // Notify components of updates dynamically
  window.dispatchEvent(new CustomEvent('cashy_business_areas_updated', { detail: cleanedAreas }));
}

// Backward compatibility helpers
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
  const areas = getBusinessAreas();
  const flatMappings: Record<string, string> = {};
  areas.forEach(area => {
    area.categories.forEach(cat => {
      flatMappings[cat] = area.name;
    });
  });
  return flatMappings;
}

export function saveBusinessAreaMappings(mappings: Record<string, string>) {
  // Convert flat mappings to list of business areas
  const currentAreas = getBusinessAreas();
  const updatedAreas = currentAreas.map(area => {
    const updatedCategories = Object.keys(mappings).filter(cat => mappings[cat] === area.name);
    return {
      ...area,
      categories: updatedCategories
    };
  });
  saveBusinessAreas(updatedAreas);
}

export function getBusinessAreaForItem(category: string): string {
  const norm = category.toLowerCase();
  const areas = getBusinessAreas();
  const matchingArea = areas.find(area => 
    area.categories.map(c => c.toLowerCase()).includes(norm)
  );
  return matchingArea ? matchingArea.name : 'General';
}

export function getCategoryFromItemTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('bmw') || t.includes('vw') || t.includes('golf') || t.includes('audi') || t.includes('mercedes') || t.includes('tesla') || t.includes('peugeot') || t.includes('ford') || t.includes('opel') || t.includes('skoda') || t.includes('car')) {
    return 'car';
  }
  if (t.includes('iphone') || t.includes('samsung') || t.includes('galaxy') || t.includes('smartphone')) {
    return 'electronics.smartphone';
  }
  if (t.includes('macbook') || t.includes('laptop') || t.includes('pc')) {
    return 'electronics.laptop';
  }
  if (t.includes('ipad') || t.includes('tablet')) {
    return 'electronics.tablet';
  }
  if (t.includes('playstation') || t.includes('ps5') || t.includes('console') || t.includes('canon') || t.includes('camera') || t.includes('lens')) {
    return 'electronics.console';
  }
  if (t.includes('rolex') || t.includes('omega') || t.includes('speedmaster') || t.includes('carrera') || t.includes('tag heuer') || t.includes('daytona') || t.includes('seamaster') || t.includes('watches') || t.includes('watch') || t.includes('nautilus') || t.includes('patek')) {
    return 'watches';
  }
  if (t.includes('handbag') || t.includes('gucci') || t.includes('bag') || t.includes('wallet') || t.includes('prada') || t.includes('chanel') || t.includes('hermès') || t.includes('birkin')) {
    return 'bags';
  }
  if (t.includes('cartier') || t.includes('bracelet') || t.includes('ring') || t.includes('jewelry') || t.includes('gold')) {
    return 'jewelry';
  }
  return 'other';
}

export function getBusinessAreaForDeal(items: Array<string | { category?: string }> | undefined): string {
  if (!items || items.length === 0) return 'General';
  
  const categories = items.map(item => {
    if (typeof item === 'string') {
      return getCategoryFromItemTitle(item);
    }
    return item.category || 'other';
  });
  
  const uniqueAreas = Array.from(new Set(
    categories.map(cat => getBusinessAreaForItem(cat))
  ));
  
  if (uniqueAreas.length === 1) {
    return uniqueAreas[0];
  }
  return 'Mixed';
}
