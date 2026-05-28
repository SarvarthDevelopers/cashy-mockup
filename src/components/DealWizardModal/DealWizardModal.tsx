/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, react-hooks/refs, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Package, MessageSquare, History, ChevronUp, ChevronDown, Plus, Trash2, AlertCircle, Loader2, X, Menu, Info } from 'lucide-react';
import { 
    Button, 
    Tabs, 
    Tab, 
    Input, 
    TextArea, 
    Dropdown, 
    RadioGroup, 
    Radio, 
    Checkbox,
    FileUpload,
    ImageUpload
} from '../';
import { ShopLabel } from '../Card/ShopLabel';
import type { DealData } from '../../data/mockData';
import { MOCK_WIZARDS, GLOBAL_STEPS } from '../../data/wizardData';
import { getBusinessAreaForDeal, getCategoryFromItemTitle, CATEGORY_DISPLAY_NAMES } from '../../data/businessAreaMapping';
import { CategoryTreeDropdown } from '../CategoryTree/CategoryTreeDropdown';
import { DatePicker } from '../DatePicker/DatePicker';

const parseDateString = (str: string): Date | null => {
  if (!str) return null;
  // Handle YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    if (!isNaN(d.getTime())) return d;
  }
  // Try standard parsing
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) return new Date(parsed);

  // Handle "Jan 20" style format
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const parts = str.trim().split(/\s+/);
  if (parts.length === 2) {
    const monthStr = parts[0].toLowerCase().slice(0, 3);
    const day = parseInt(parts[1], 10);
    if (monthStr in months && !isNaN(day)) {
      const today = new Date();
      const d = new Date(today.getFullYear(), months[monthStr], day);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
};

const formatDateString = (date: Date | null): string => {
  if (!date) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const CAR_DATA: Record<string, string[]> = {
    'Volkswagen': ['Golf', 'Tiguan', 'Passat', 'Polo', 'ID.4'],
    'BMW': ['3 Series', '5 Series', 'X5', 'X3', '1 Series'],
    'Audi': ['A3', 'A4', 'A6', 'Q5', 'Q3'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'A-Class', 'S-Class'],
    'Toyota': ['Corolla', 'Yaris', 'RAV4', 'C-HR', 'Camry'],
    'Ford': ['Focus', 'Fiesta', 'Puma', 'Kuga', 'Mustang'],
};

export interface DealWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    dealData?: DealData;
    initialStep?: string;
    isNew?: boolean;
    onCreateDeal?: (deal: DealData) => void;
    onUpdateDeal?: (deal: DealData) => void;
    onExtend?: (deal: DealData) => void;
}

export const DealWizardModal: React.FC<DealWizardModalProps> = ({ 
    isOpen, 
    onClose, 
    dealData,
    initialStep = 'step2',
    isNew = false,
    onCreateDeal,
    onUpdateDeal,
    onExtend
}) => {
    const [activeStep, setActiveStep] = useState(isNew ? 'step1' : initialStep);
    const [isCreated, setIsCreated] = useState(!isNew);
    const [creationFinalized, setCreationFinalized] = useState(!isNew);
    const [isCreating, setIsCreating] = useState(false);
    const [creationStep, setCreationStep] = useState(0);
    const [sidebarTab, setSidebarTab] = useState('comments');
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    
    // Continuous Scroll Refs
    const contentRef = React.useRef<HTMLDivElement>(null);
    const sectionRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);

    const scrollToSection = (stepId: string, itemIdx?: number) => {
        setIsAutoScrolling(true);
        setActiveStep(stepId);
        if (itemIdx !== undefined) setActiveItemIndex(itemIdx);

        // Defer scroll to allow DOM/layout updates (like mounting the item tabs bar) to settle first
        setTimeout(() => {
            const key = itemIdx !== undefined ? `${stepId}-${itemIdx}` : stepId;
            const el = sectionRefs.current.get(key);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Keep isAutoScrolling true until smooth scroll completes
            setTimeout(() => {
                setIsAutoScrolling(false);
            }, 800);
        }, 100);
    };
    
    // --- CREATE DEAL FORM STATE ---
    const [dealMode, setDealMode] = useState<'Pawn' | 'Purchase'>('Pawn');
    const [items, setItems] = useState<any[]>([
        { 
            id: '1', 
            category: '', 
            title: '', 
            requestedPayout: '', 
            condition: '', 
            vin: '', 
            indicataStatus: 'idle', 
            make: '', 
            model: '', 
            year: '', 
            odometer: '', 
            suggestedValue: '',
            expanded: true 
        }
    ]);
    const [customerData, setCustomerData] = useState({
        mode: 'Guest',
        email: 'franz.k@example.com',
        phone: '+43 660 123 456',
        firstName: 'Franz',
        lastName: 'Kürsten'
    });
    const [secondaryCustomerData, setSecondaryCustomerData] = useState<{
        mode?: 'Registered' | 'Guest' | 'Create New';
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    } | null>(null);
    const [showSecondaryCustomer, setShowSecondaryCustomer] = useState(false);
    const [showPawnDueDate, setShowPawnDueDate] = useState(false);
    
    const [metadata, setMetadata] = useState(() => ({
        company: 'CASHY_AUT',
        branch: 'Vienna Main',
        duration: '180',
        dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payoutMethod: 'Bank Transfer',
        createdAt: new Date().toISOString()
    }));

    const [lastSyncedId, setLastSyncedId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && dealData && (dealData.id !== lastSyncedId)) {
            setCustomerData({
                mode: 'Registered',
                email: dealData.wizardData?.email || 'franz.k@example.com',
                phone: dealData.wizardData?.phone || '+43 660 123 456',
                firstName: dealData.firstName,
                lastName: dealData.lastName
            });
            if (dealData.wizardData?.secondaryCustomer) {
                setSecondaryCustomerData({
                    firstName: dealData.wizardData.secondaryCustomer.firstName,
                    lastName: dealData.wizardData.secondaryCustomer.lastName,
                    email: dealData.wizardData.secondaryCustomer.email,
                    phone: dealData.wizardData.secondaryCustomer.phone,
                });
                setShowSecondaryCustomer(true);
            } else {
                setSecondaryCustomerData(null);
                setShowSecondaryCustomer(false);
            }
            setShowPawnDueDate(false);
            const parsedD = dealData.dueDate ? parseDateString(dealData.dueDate) : null;
            const finalD = parsedD ? formatDateString(parsedD) : (() => {
                const durationDays = parseInt(dealData.wizardData?.dealDuration?.split(' ')[0] || '180', 10) || 180;
                const d = new Date();
                d.setDate(d.getDate() + durationDays);
                return formatDateString(d);
            })();
            setMetadata({
                company: dealData.wizardData?.company || 'CASHY_AUT',
                branch: dealData.wizardData?.branch || 'Vienna Main',
                duration: dealData.wizardData?.dealDuration?.split(' ')[0] || '180',
                dueDate: finalD,
                payoutMethod: dealData.wizardData?.payoutType || 'Bank Transfer',
                createdAt: dealData.wizardData?.createdAt || new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            });
            if (dealData.items && dealData.items.length > 0) {
                setItems(dealData.items.map((it, idx) => ({
                    id: String(idx),
                    category: getCategoryFromItemTitle(it),
                    title: it,
                    requestedPayout: dealData.wizardData?.amount?.replace('€', '').replace(',', '') || '0',
                    condition: 'Used',
                    expanded: idx === 0
                })));
            }
            setLastSyncedId(dealData.id);
        }
    }, [isOpen, dealData, lastSyncedId]);

    useEffect(() => {
        if (isOpen) {
            if (!isNew) {
                // If it's not a new deal, we reset the synced ID so it re-syncs when opened
                // Actually, if we use isNew we might need more logic
            }
            const targetStep = isNew ? 'step1' : initialStep;
            setActiveStep(targetStep);
            setIsCreated(!isNew);
            setCreationFinalized(!isNew);
            if (isNew) {
                setLastSyncedId(null);
                setCustomerData({
                    mode: 'Guest',
                    email: 'franz.k@example.com',
                    phone: '+43 660 123 456',
                    firstName: 'Franz',
                    lastName: 'Kürsten'
                });
                setSecondaryCustomerData(null);
                setShowSecondaryCustomer(false);
                setShowPawnDueDate(false);
                setMetadata({
                    company: 'CASHY_AUT',
                    branch: 'Vienna Main',
                    duration: '180',
                    dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    payoutMethod: 'Bank Transfer',
                    createdAt: new Date().toISOString()
                });
            } else {
                // Defer scroll to ensure elements are mounted and layout has finished
                setTimeout(() => {
                    scrollToSection(targetStep);
                }, 300);
            }
        }
    }, [isOpen, isNew, initialStep]);


    // Derived data
    const currentDeal = isCreated ? dealData : null;
    const dealId = currentDeal?.id || 'PENDING';
    const totalRequestedPayout = items.reduce((sum, item) => sum + (parseFloat(item.requestedPayout) || 0), 0);
    const formattedTotal = totalRequestedPayout.toLocaleString('de-DE', { minimumFractionDigits: 2 });
    const currentBusinessArea = getBusinessAreaForDeal(items);

    const handleCreateDeal = () => {
        setIsCreating(true);
        setCreationStep(1);
        
        // Simulation steps
        setTimeout(() => setCreationStep(2), 800);
        setTimeout(() => setCreationStep(3), 1600);
        setTimeout(() => {
            const resolvedArea = getBusinessAreaForDeal(items);
            const firstCategory = items[0]?.category || 'car';
            const displayCategory = CATEGORY_DISPLAY_NAMES[firstCategory] || firstCategory;

            // Convert YYYY-MM-DD → "Mon DD" format that the priority system parses
            let formattedDueDate: string;
            let targetDate: Date;
            if (metadata.dueDate) {
                targetDate = parseDateString(metadata.dueDate) || new Date();
            } else {
                const durationDays = parseInt(metadata.duration, 10) || 30;
                targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + durationDays);
            }

            if (!isNaN(targetDate.getTime())) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                formattedDueDate = `${monthNames[targetDate.getMonth()]} ${targetDate.getDate()}`;
            } else {
                const durationDays = parseInt(metadata.duration, 10) || 30;
                const fallback = new Date();
                fallback.setDate(fallback.getDate() + durationDays);
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                formattedDueDate = `${monthNames[fallback.getMonth()]} ${fallback.getDate()}`;
            }

            const createdAtVal = new Date().toISOString();
            const durationDays = parseInt(metadata.duration, 10) || 180;
            const pawnDueObj = new Date(createdAtVal);
            pawnDueObj.setDate(pawnDueObj.getDate() + durationDays);
            const pawnDueDate = pawnDueObj.toISOString();

            const newDeal: DealData = {
                id: Math.floor(100000 + Math.random() * 900000).toString(),
                countryCode: 'AT',
                branch: 'Vienna',
                firstName: customerData.firstName,
                lastName: customerData.lastName,
                amount: `€${formattedTotal}`,
                items: items.map(i => i.title || 'Unknown Item'),
                dealType: dealMode,
                businessArea: resolvedArea,
                dueDate: formattedDueDate,
                wizardData: {
                    customerName: `${customerData.firstName} ${customerData.lastName}`,
                    email: customerData.email,
                    phone: customerData.phone,
                    branch: metadata.branch,
                    company: metadata.company,
                    businessArea: resolvedArea,
                    categoryPath: `${resolvedArea} > ${displayCategory}`,
                    dealDuration: `${metadata.duration} days`,
                    payoutType: dealMode,
                    amount: `€${formattedTotal}`,
                    item: items[0]?.title || 'Unknown Item',
                    createdAt: createdAtVal,
                    pawnDueDate: pawnDueDate,
                    secondaryCustomer: (showSecondaryCustomer && secondaryCustomerData) ? secondaryCustomerData : undefined
                }
            };
            
            onCreateDeal?.(newDeal);
            setIsCreated(true);
            setCreationFinalized(true);
            setIsCreating(false);
            setActiveStep('step2');
        }, 2400);
     };
 
     // --- AUTO-SAVE LOGIC ---
     useEffect(() => {
         if (isCreated && creationFinalized && onUpdateDeal && dealData) {
             const resolvedArea = getBusinessAreaForDeal(items);
             const firstCategory = items[0]?.category || 'car';
             const displayCategory = CATEGORY_DISPLAY_NAMES[firstCategory] || firstCategory;

             const createdAtVal = dealData.wizardData?.createdAt || metadata.createdAt || new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
             const durationDays = parseInt(metadata.duration, 10) || 180;
             const pawnDueObj = new Date(createdAtVal);
             pawnDueObj.setDate(pawnDueObj.getDate() + durationDays);
             const pawnDueDate = pawnDueObj.toISOString();

             const updatedDeal: DealData = {
                 ...dealData,
                 firstName: customerData.firstName,
                 lastName: customerData.lastName,
                 amount: `€${formattedTotal}`,
                 items: items.map(i => i.title || 'Unknown Item'),
                 dueDate: metadata.dueDate,
                 branch: metadata.branch,
                 businessArea: resolvedArea,
                 wizardData: {
                     ...dealData.wizardData,
                     customerName: `${customerData.firstName} ${customerData.lastName}`,
                     email: customerData.email,
                     phone: customerData.phone,
                     branch: metadata.branch,
                     company: metadata.company,
                     businessArea: resolvedArea,
                     categoryPath: `${resolvedArea} > ${displayCategory}`,
                     dealDuration: `${metadata.duration} days`,
                     amount: `€${formattedTotal}`,
                     item: items[0]?.title || 'Unknown Item',
                     createdAt: createdAtVal,
                     pawnDueDate: pawnDueDate,
                     secondaryCustomer: (showSecondaryCustomer && secondaryCustomerData) ? secondaryCustomerData : undefined
                 }
             };
             onUpdateDeal(updatedDeal);
         }
     }, [customerData, secondaryCustomerData, showSecondaryCustomer, metadata, items, isCreated, creationFinalized]);

     const getFormattedPawnDueDate = () => {
         const createdAtVal = dealData?.wizardData?.createdAt || metadata.createdAt || '';
         if (!createdAtVal) return '';
         const durationDays = parseInt(metadata.duration, 10) || 180;
         const d = new Date(createdAtVal);
         d.setDate(d.getDate() + durationDays);
         
         const day = d.getDate();
         const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
         const month = monthNames[d.getMonth()];
         const year = d.getFullYear();
         return `${day} ${month}, ${year}`;
     };

    const addItem = () => {
        setItems([...items, { 
            id: Date.now().toString(), 
            category: '', 
            title: '', 
            requestedPayout: '', 
            condition: '', 
            indicataStatus: 'idle', 
            make: '', 
            model: '', 
            year: '', 
            odometer: '', 
            suggestedValue: '',
            expanded: true 
        }]);
    };

    const removeItem = (id: string) => {
        if (items.length <= 1) return;
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: string, field: string, value: any) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id !== id) return item;
            
            const updatedItem = { ...item, [field]: value };
            
            // Auto-generate title for Car
            if (updatedItem.category === 'car' && (field === 'make' || field === 'model' || field === 'year')) {
                const parts = [updatedItem.make, updatedItem.model, updatedItem.year].filter(Boolean);
                updatedItem.title = parts.join(' ');
            }
            
            // Handle VIN Search Simulation
            if (field === 'vin') {
                const currentStatus = item.indicataStatus || 'idle';
                if (value.length < 17) {
                    updatedItem.indicataStatus = 'idle';
                } else if (value.length === 17 && currentStatus === 'idle') {
                    updatedItem.indicataStatus = 'searching';
                    
                    // Simulate search delay
                    setTimeout(() => {
                        setItems(currentItems => 
                            currentItems.map(ci => 
                                ci.id === id ? { ...ci, indicataStatus: 'not_found' } : ci
                            )
                        );
                    }, 1800);
                }
            }
            
            return updatedItem;
        }));
    };

    const toggleItem = (id: string) => {
        setItems(items.map(item => item.id === id ? { ...item, expanded: !item.expanded } : item));
    };

    const [allWizards, setAllWizards] = useState<any[]>(() => {
        const saved = localStorage.getItem('cashy_wizards_v2');
        return saved ? JSON.parse(saved) : MOCK_WIZARDS;
    });

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('cashy_wizards_v2');
            if (saved) setAllWizards(JSON.parse(saved));
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getWizardForCategory = (category: string) => {
        const norm = category.toLowerCase();
        const match = allWizards.find(w => {
            const wCat = w.category.toLowerCase();
            return norm === wCat || norm.startsWith(wCat + '.') || wCat.startsWith(norm + '.');
        });
        if (match) return match;

        if (norm === 'car') return allWizards.find(w => w.category === 'Car') || allWizards[0];
        if (norm.startsWith('electronics')) return allWizards.find(w => w.category === 'General Electronics') || allWizards[0];
        if (norm === 'watches') return allWizards.find(w => w.category === 'Watches') || allWizards[0];
        if (norm === 'bags' || norm === 'jewelry') return allWizards.find(w => w.category === 'Luxury') || allWizards[0];
        return allWizards.find(w => w.category.toLowerCase() === norm) 
            || allWizards.find(w => w.category === category) 
            || allWizards[0];
    };

    const steps = [
        { id: 'step1', title: 'Basic Info' },
        ...GLOBAL_STEPS.map(s => ({
            id: s.id,
            title: s.defaultTitle
        }))
    ];

    const renderStepItemFields = (stepId: string, itemIdx: number) => {
        const item = items[itemIdx];
        const wizard = getWizardForCategory(item?.category || 'car');
        const fields = (wizard?.fields || []).filter((f: { stepId: string }) => f.stepId === stepId);

        if (fields.length === 0) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-12 bg-[var(--background-primary)] rounded-2xl border border-dashed border-[var(--border-subtlest)] min-h-[400px]">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Package className="text-gray-200" size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Phase Not Required</h4>
                    <p className="text-[13px] text-gray-400 max-w-xs leading-relaxed">
                        The <span className="font-bold text-gray-500">{item?.category || 'Standard'}</span> category does not require specific data entry during the <span className="font-bold text-gray-500">{steps.find(s => s.id === stepId)?.title}</span> phase.
                    </p>
                </div>
            );
        }

        return (
            <div className="bg-[var(--background-primary)] rounded-2xl border border-[var(--border-subtlest)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                <div className="px-6 md:px-8 py-4 md:py-5 border-b border-[var(--border-subtlest)] bg-[var(--background-secondary)]/40 flex items-center justify-between">
                    <h3 className="text-[11px] font-bold text-[var(--text-subtle)] uppercase tracking-wider m-0">
                        {steps.find(s => s.id === stepId)?.title} Details — {item?.title || 'Unknown Item'}
                    </h3>
                    {items.length > 1 && (
                        <span className="text-[10px] font-bold text-[#4649E5] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-tight">
                            Item {itemIdx + 1} of {items.length}
                        </span>
                    )}
                </div>
                
                <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                        {fields.map((field: any) => (
                            <div 
                                key={field.id} 
                                className={
                                    field.type === 'checkbox' || 
                                    field.type === 'textarea' || 
                                    field.type === 'file' || 
                                    field.type === 'image' || 
                                    field.type === 'url' 
                                        ? 'col-span-1 md:col-span-2' 
                                        : 'col-span-1'
                                 }
                            >
                                {field.type === 'checkbox' ? (
                                    <Checkbox 
                                        label={field.label} 
                                    />
                                ) : field.type === 'select' || field.type === 'dropdown' ? (
                                    <Dropdown 
                                        label={field.label} 
                                        options={(field.options || []).map((opt: string) => ({ label: opt, value: opt }))} 
                                    />
                                ) : field.type === 'textarea' ? (
                                    <TextArea 
                                        label={field.label} 
                                        placeholder={field.placeholder || `Enter ${field.label}...`}
                                        rows={4}
                                    />
                                ) : (field.type === 'file' || field.type === 'fileUpload') ? (
                                    (field.label.toLowerCase().includes('image') || 
                                     field.label.toLowerCase().includes('photo') || 
                                     field.label.toLowerCase().includes('picture')) ? (
                                        <ImageUpload 
                                            label={field.label}
                                        />
                                    ) : (
                                        <FileUpload 
                                            label={field.label}
                                            description={field.placeholder}
                                        />
                                    )
                                ) : field.type === 'image' || field.type === 'imageUpload' ? (
                                    <ImageUpload 
                                        label={field.label}
                                    />
                                ) : (
                                    <Input 
                                        label={field.label} 
                                        placeholder={field.placeholder || `Enter ${field.label}...`}
                                        type={field.type === 'url' ? 'text' : field.type} 
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };



    const handleScroll = () => {
        if (!creationFinalized || isAutoScrolling || !contentRef.current) return;
        
        const container = contentRef.current;
        const containerTop = container.getBoundingClientRect().top;
        const scrollThreshold = 200; // Pixels from top to trigger change

        let currentStepId = activeStep;
        let currentItemIdx = activeItemIndex;

        // Iterate through all possible sections and find the one closest to the threshold
        sectionRefs.current.forEach((el, key) => {
            const rect = el.getBoundingClientRect();
            if (rect.top - containerTop < scrollThreshold && rect.bottom - containerTop > scrollThreshold) {
                if (key.includes('-')) {
                    const [stepId, idx] = key.split('-');
                    currentStepId = stepId;
                    currentItemIdx = parseInt(idx);
                } else {
                    currentStepId = key;
                }
            }
        });

        if (currentStepId !== activeStep) setActiveStep(currentStepId);
        if (currentItemIdx !== activeItemIndex) setActiveItemIndex(currentItemIdx);
    };

    const renderActionButtons = (mode: 'desktop' | 'mobile') => {
        const isMobile = mode === 'mobile';
        const containerClasses = isMobile ? "flex gap-2 w-full" : "hidden md:flex gap-2";
        
        return (
            <div className={containerClasses}>
                {!isCreated && (
                    isMobile ? (
                        <div className="relative shrink-0 select-none">
                            <select
                                value={dealMode}
                                onChange={(e) => setDealMode(e.target.value as 'Pawn' | 'Purchase')}
                                className="h-10 px-3 pr-8 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-subtlest)] text-xs font-bold text-[var(--text-primary)] outline-none appearance-none cursor-pointer"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                                    backgroundPosition: 'right 0.5rem center',
                                    backgroundSize: '1.25rem',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            >
                                <option value="Pawn">Pawn</option>
                                <option value="Purchase">Purchase</option>
                            </select>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 mr-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Deal Type</span>
                            <Tabs 
                                variant="segment" 
                                value={dealMode} 
                                onValueChange={(val) => setDealMode(val as 'Pawn' | 'Purchase')}
                                className="h-10 w-full"
                            >
                                <Tab value="Pawn">Pawn</Tab>
                                <Tab value="Purchase">Purchase</Tab>
                            </Tabs>
                        </div>
                    )
                )}

                {creationFinalized ? (
                    <>
                        <button className={`${isMobile ? 'hidden' : 'flex'} w-10 h-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors`} style={{ color: 'var(--brand-500)' }}>
                            <div className="w-5 h-5 border-2 rounded-[4px] relative" style={{ borderColor: 'var(--brand-500)' }}>
                                <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5" style={{ backgroundColor: 'var(--brand-500)' }} />
                            </div>
                        </button>
                        {isCreated ? (
                            <>
                                <Button variant="secondary" size="small" className={`${isMobile ? 'flex-1' : ''} font-bold`}>Payback</Button>
                                {dealMode === 'Pawn' && (
                                    <Button 
                                        variant="secondary" 
                                        size="small" 
                                        className={`${isMobile ? 'flex-1' : ''} font-bold`}
                                        onClick={() => {
                                            if (dealData && onExtend) onExtend(dealData);
                                        }}
                                    >
                                        Extend
                                    </Button>
                                )}
                                <Button variant="primary" size="small" className={`${isMobile ? 'flex-1' : ''} font-bold`} onClick={onClose}>Close</Button>
                            </>
                        ) : (
                            <>
                                <Button variant="secondary" size="small" className={`${isMobile ? 'flex-1' : ''} font-bold`} onClick={onClose}>Cancel</Button>
                                <Button 
                                    variant="primary" 
                                    size="small" 
                                    className={`${isMobile ? 'flex-[2]' : ''} font-bold`} 
                                    onClick={() => setActiveStep('step2')}
                                >
                                    {isMobile ? `Create ${dealMode}` : `Create ${dealMode} Deal`}
                                </Button>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {!isCreating && <Button variant="secondary" size="small" className={`${isMobile ? 'flex-1' : ''} h-10 px-6 font-bold border-gray-200`} style={{ color: 'var(--brand-500)' }} onClick={onClose}>Cancel</Button>}
                        <Button 
                            variant="primary" 
                            size="small" 
                            isLoading={isCreating}
                            disabled={isCreating}
                            className={`${isMobile ? 'flex-[2]' : ''} h-10 px-8 border-none font-bold`}
                            style={{ backgroundColor: 'var(--lilac-600)' }}
                            onClick={handleCreateDeal}
                        >
                            {isCreating ? 'Creating...' : isMobile ? `Create ${dealMode}` : `Create ${dealMode} Deal`}
                        </Button>
                    </>
                )}
            </div>
        );
    };

    const renderDealSummary = () => (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-[var(--border-subtlest)] px-6 py-5 bg-[var(--background-secondary)]">
                <div className="flex items-center gap-2 m-0">
                    <Package size={18} className="text-[var(--lilac-600)]" />
                    <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">Deal Summary</h3>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 slick-scrollbar">
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-[13px] font-bold text-[var(--text-placeholder)] uppercase tracking-widest">
                        <span>Itemized Breakdown</span>
                    </div>
                    {items.map((item, idx) => (
                        <div key={item.id} className="p-4 rounded-xl border border-[var(--border-subtlest)] bg-[var(--background-secondary)]/30 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[13px] font-bold text-[var(--text-primary)] m-0">{item.title || `Item ${idx + 1}`}</p>
                                    <p className="text-[11px] font-medium text-[var(--text-placeholder)] m-0 uppercase tracking-tight">{CATEGORY_DISPLAY_NAMES[item.category] || item.category || 'Select Category'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[13px] font-bold text-[var(--text-primary)] m-0">€ {parseFloat(item.requestedPayout || '0').toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
                                    <p className="text-[10px] font-bold text-[var(--text-placeholder)] m-0 uppercase">Requested</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-[var(--border-subtlest)] space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-[var(--text-subtlest)]">Subtotal</span>
                        <span className="text-sm font-bold text-[var(--text-primary)]">€ {formattedTotal}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-[var(--text-subtlest)]">Service Fees (est.)</span>
                        <span className="text-sm font-bold text-[var(--text-placeholder)]">€ 0,00</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-dashed border-[var(--border-subtlest)]">
                        <span className="text-base font-bold text-[var(--text-primary)]">Total Payout</span>
                        <span className="text-xl font-extrabold text-[var(--lilac-600)]">€ {formattedTotal}</span>
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-[var(--background-secondary-hover)] bg-[var(--background-secondary)]/30">
                <p className="text-[11px] text-[var(--text-placeholder)] font-medium leading-relaxed m-0 text-center">
                    Calculations are based on the current item values and conditions. Final payout may vary after verification.
                </p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#131518]/60 backdrop-blur-sm animate-in fade-in duration-200 p-0 md:p-8" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClose(); }}>
            <div 
                className="w-full md:max-w-[1400px] h-full md:h-[95vh] flex flex-col bg-white overflow-hidden rounded-none md:rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border-none md:border md:border-white/20 animate-in slide-in-from-bottom duration-300" 
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                
                {/* --- MOBILE HEADER --- */}
                <div className="md:hidden border-b border-[var(--border-subtlest)] shrink-0 bg-[var(--background-primary)] px-4 py-3 flex items-center justify-between z-40">
                    <button 
                        onClick={() => setIsLeftSidebarOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--background-hover)] text-[var(--text-subtlest)]"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-placeholder)]">
                            {creationFinalized ? `DEAL #${dealId}` : 'New Deal'}
                        </span>
                        <span className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[180px]">
                            {creationFinalized ? `${customerData.firstName} ${customerData.lastName}` : 'New Deal Creation'}
                        </span>
                    </div>
                    <button 
                        onClick={() => setIsRightSidebarOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--background-hover)] text-[var(--text-subtlest)]"
                    >
                        <Info size={20} />
                    </button>
                </div>

                {/* --- MOBILE STEP BAR (black, sticky context strip) --- */}
                {creationFinalized && (
                    <div className="md:hidden shrink-0 bg-[#131518] flex items-center justify-between px-4" style={{ height: '36px' }}>
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/40 shrink-0">Step</span>
                            <span className="text-[11px] font-extrabold text-white tabular-nums shrink-0">
                                {steps.findIndex(s => s.id === activeStep) + 1}
                                <span className="text-white/30 mx-1">/</span>
                                {steps.length}
                            </span>
                            <span className="text-white/20 mx-2 shrink-0">—</span>
                            <span className="text-[11px] font-extrabold uppercase tracking-wide text-white truncate">
                                {steps.find(s => s.id === activeStep)?.title}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsLeftSidebarOpen(true)}
                            className="text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors shrink-0 ml-3"
                        >
                            All Steps ›
                        </button>
                    </div>
                )}

                {/* --- MOBILE ITEM BAR (white, horizontally scrollable) --- */}
                {creationFinalized && activeStep !== 'step1' && (
                    <div className="md:hidden shrink-0 bg-[var(--background-primary)] border-b border-[var(--border-subtlest)] flex items-center gap-2 px-3 overflow-x-auto scrollbar-hide" style={{ height: '44px' }}>
                        {items.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => scrollToSection(activeStep, idx)}
                                className={`shrink-0 h-7 px-3 rounded-full text-[10px] font-bold uppercase tracking-tight transition-all whitespace-nowrap border ${
                                    activeItemIndex === idx
                                        ? 'bg-[#131518] text-white border-[#131518]'
                                        : 'bg-transparent text-[var(--text-subtlest)] border-[var(--border-subtlest)] hover:bg-[var(--background-hover)]'
                                }`}
                            >
                                {idx + 1} · {item.title || 'New Item'}
                            </button>
                        ))}
                    </div>
                )}

                {/* --- DESKTOP HEADER --- */}
                <div className="hidden md:block border-b border-gray-100 shrink-0 bg-white" style={{ padding: 'var(--space-400) var(--space-800)' }}>
                    <div className="flex items-center justify-between">
                        {!creationFinalized ? (
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg text-white shadow-lg shadow-blue-100" style={{ backgroundColor: 'var(--lilac-600)' }}>
                                    <Package size={24} />
                                </div>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <h2 className="text-xl font-bold m-0 leading-tight" style={{ color: 'var(--brand-500)' }}>New Deal Creation</h2>
                                        <p className="text-sm font-medium m-0" style={{ color: 'var(--gray-400)' }}>Initialize basic deal information and customer records</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center" style={{ gap: 'var(--space-600)' }}>
                                <div className="flex flex-col items-start gap-1">
                                    <ShopLabel country={dealData?.countryCode || 'AT'} branch={dealData?.branch || 'Wien'} />
                                    <div className="flex flex-col gap-0.5">
                                        <h2 className="text-sm font-bold m-0 leading-normal" style={{ color: 'var(--brand-500)' }}>
                                            {`${customerData.firstName} ${customerData.lastName}`}
                                        </h2>
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--gray-400)' }}>
                                            Primary Customer
                                        </span>
                                    </div>
                                    {showSecondaryCustomer && secondaryCustomerData && (
                                        <div className="flex flex-col gap-0.5 mt-0.5 pt-0.5 border-t border-gray-100 w-full">
                                            <h2 className="text-sm font-semibold m-0 leading-normal" style={{ color: 'var(--lilac-600)' }}>
                                                {`${secondaryCustomerData.firstName} ${secondaryCustomerData.lastName}`}
                                            </h2>
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--gray-400)' }}>
                                                Secondary Customer
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="w-[1px] bg-gray-100 align-self-stretch self-stretch" style={{ margin: '0 var(--space-200)' }} />
                                <div className="flex" style={{ gap: 'var(--space-800)' }}>
                                    <DetailItem label="Deal ID" value={dealId} />
                                    <DetailItem 
                                        label="Pawn Duration" 
                                        value={dealMode === 'Pawn' && showPawnDueDate ? getFormattedPawnDueDate() : `${metadata.duration} Days`} 
                                        isInteractive={dealMode === 'Pawn'}
                                        onClick={() => dealMode === 'Pawn' && setShowPawnDueDate(!showPawnDueDate)}
                                    />
                                    <DetailItem label="Total Items" value={String(items.length)} />
                                    <DetailItem label="Business Area" value={currentBusinessArea} />
                                </div>
                            </div>
                        )}

                        {!creationFinalized ? (
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end">
                                    <div className="text-[18px] font-bold tabular-nums" style={{ color: 'var(--brand-500)' }}>
                                        € {formattedTotal}
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--gray-400)' }}>
                                        Est. Payout
                                    </span>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-[#131518] transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-0.5 rounded bg-blue-50 text-[#4649E5] text-[10px] font-bold uppercase tracking-tight border border-blue-100">
                                            {dealMode}
                                        </div>
                                        <div className="text-[22px] font-bold tabular-nums ml-2" style={{ color: 'var(--brand-500)' }}>
                                            € {formattedTotal}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Total Payout</span>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-[#131518] transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- STEPPER & ACTIONS --- */}
                <div className="hidden md:flex border-b border-gray-100 shrink-0 bg-white items-center justify-between" style={{ padding: 'var(--space-300) var(--space-800)' }}>
                    <div className="flex-1 relative overflow-hidden group">
                        <Tabs 
                            variant="stepper" 
                            value={activeStep} 
                            onValueChange={(val) => {
                                if (val === 'step1' || isCreated) {
                                    scrollToSection(val);
                                }
                            }}
                            className="overflow-x-auto scrollbar-hide pr-12 scroll-smooth"
                        >
                            {steps.map((s) => (
                                <Tab 
                                    key={s.id} 
                                    value={s.id} 
                                    disabled={s.id !== 'step1' && !isCreated}
                                >
                                    {s.title}
                                </Tab>
                            ))}
                        </Tabs>
                        {/* Gradient Mask for Horizontal Scroll */}
                        <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-r from-transparent to-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex items-center gap-3">
                        {renderActionButtons('desktop')}
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex flex-col min-w-0 bg-[#F4F5F7] relative">
                        {creationFinalized && activeStep !== 'step1' && (
                            <div className="px-8 bg-white border-b border-gray-100 hidden md:flex gap-8 shrink-0 overflow-x-auto scrollbar-hide z-10">
                                {items.map((item, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => scrollToSection(activeStep, idx)}
                                        className={`py-4 px-2 border-b-2 transition-all text-left shrink-0 ${activeItemIndex === idx ? 'border-[#4649E5] text-[#131518]' : 'border-transparent text-gray-400'}`}
                                    >
                                        <p className="text-sm font-bold m-0">Item {idx + 1}</p>
                                        <p className="text-[11px] font-medium m-0 truncate max-w-[150px]">{item.title || 'New Item'}</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div 
                            ref={contentRef}
                            className="flex-1 overflow-y-auto slick-scrollbar scroll-smooth" 
                            onScroll={handleScroll}
                        >
                            {isCreating ? (
                                <div className="h-full flex flex-col items-center justify-center px-4 py-10">
                                    <div className="w-full max-w-sm space-y-10 animate-in fade-in zoom-in duration-500">
                                        {/* Spinner */}
                                        <div className="flex flex-col items-center gap-5">
                                            <div className="relative">
                                                <div className="w-14 h-14 border-4 border-[var(--background-brand-subtlest)] rounded-full border-t-[var(--border-brand)] animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Package className="text-[var(--text-brand)]" size={22} />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">Creating Deal...</h3>
                                                <p className="text-sm text-[var(--text-subtlest)]">Please wait while we initialise the records</p>
                                            </div>
                                        </div>

                                        {/* Steps */}
                                        <div className="space-y-3">
                                            <SimulationStep active={creationStep >= 1} done={creationStep > 1} text="Saving deal data to database..." />
                                            <SimulationStep active={creationStep >= 2} done={creationStep > 2} text="Generating booking number..." />
                                            <SimulationStep active={creationStep >= 3} done={creationStep > 3} text="Initializing workflow steps..." />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full max-w-full mx-auto space-y-12 pt-4 md:pt-8 pb-32 md:pb-20 px-4 md:px-8">
                                    {/* --- Section 1: Basic Info --- */}
                                    <div 
                                        id="section-step1" 
                                        ref={(el) => { if (el) sectionRefs.current.set('step1', el); }}
                                        className="space-y-8 scroll-mt-20"
                                    >
                                        <div className="px-2">
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--background-secondary)] border border-[var(--border-subtlest)] text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-placeholder)] mb-3">
                                                Step 1 of {steps.length}
                                            </div>
                                            <h2 className="text-2xl font-bold text-[#131518]">Basic Information</h2>
                                            <p className="text-sm text-gray-400">Initialize the core deal and customer details.</p>
                                        </div>

                                        {/* --- Customer Section --- */}
                                        <div className="bg-white rounded-2xl border border-[var(--border-subtlest)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                                            <div className="px-6 md:px-8 py-4 md:py-5 border-b border-[var(--border-subtlest)] bg-[var(--background-secondary)]/40 flex items-center justify-between">
                                                <h3 className="text-[11px] font-bold text-[var(--text-subtle)] uppercase tracking-wider m-0">Customer Profile</h3>
                                                {!showSecondaryCustomer && (
                                                    <div 
                                                        onClick={() => {
                                                            setShowSecondaryCustomer(true);
                                                            setSecondaryCustomerData({
                                                                mode: 'Guest',
                                                                firstName: '',
                                                                lastName: '',
                                                                email: '',
                                                                phone: ''
                                                            });
                                                        }}
                                                        className="flex items-center gap-2 text-[#4649E5] text-[12px] font-bold cursor-pointer hover:opacity-70 transition-opacity"
                                                    >
                                                        <Plus size={14} /> Add Secondary
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                                                <RadioGroup 
                                                    direction="horizontal" 
                                                    value={customerData.mode} 
                                                    onChange={(val) => setCustomerData({...customerData, mode: val as any})}
                                                    className="gap-4 md:gap-8 flex-wrap"
                                                >
                                                    <Radio value="Registered" label="Registered" />
                                                    <Radio value="Guest" label="Guest" />
                                                    <Radio value="Create New" label="Create New" />
                                                </RadioGroup>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Input 
                                                        label="First Name" 
                                                        placeholder="Franz" 
                                                        value={customerData.firstName}
                                                        onChange={(e) => setCustomerData({...customerData, firstName: e.target.value})}
                                                        required
                                                    />
                                                    <Input 
                                                        label="Last Name" 
                                                        placeholder="Kürsten" 
                                                        value={customerData.lastName}
                                                        onChange={(e) => setCustomerData({...customerData, lastName: e.target.value})}
                                                        required
                                                    />
                                                    <Input 
                                                        label="Email Address" 
                                                        placeholder="customer@example.com" 
                                                        type="email" 
                                                        value={customerData.email}
                                                        onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                                                        required
                                                    />
                                                    <Input 
                                                        label="Phone Number" 
                                                        placeholder="+43 660 123 456" 
                                                        type="tel" 
                                                        value={customerData.phone}
                                                        onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                                                    />
                                                </div>

                                                {showSecondaryCustomer && (
                                                    <div className="mt-8 pt-8 border-t border-[var(--border-subtlest)] space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-[11px] font-bold text-[var(--text-subtle)] uppercase tracking-wider m-0">Secondary Customer Profile</h4>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    setShowSecondaryCustomer(false);
                                                                    setSecondaryCustomerData(null);
                                                                }}
                                                                className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                                                            >
                                                                Remove Secondary
                                                            </button>
                                                        </div>
                                                        <RadioGroup 
                                                            direction="horizontal" 
                                                            value={secondaryCustomerData?.mode || 'Guest'} 
                                                            onChange={(val) => setSecondaryCustomerData(prev => ({
                                                                ...(prev || { firstName: '', lastName: '', email: '', phone: '' }),
                                                                mode: val as any
                                                            }))}
                                                            className="gap-4 md:gap-8 flex-wrap"
                                                        >
                                                            <Radio value="Registered" label="Registered" />
                                                            <Radio value="Guest" label="Guest" />
                                                            <Radio value="Create New" label="Create New" />
                                                        </RadioGroup>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <Input 
                                                                label="First Name" 
                                                                placeholder="e.g. Maria" 
                                                                value={secondaryCustomerData?.firstName || ''}
                                                                onChange={(e) => setSecondaryCustomerData(prev => ({
                                                                    ...(prev || { email: '', phone: '', lastName: '' }),
                                                                    firstName: e.target.value
                                                                }))}
                                                                required
                                                            />
                                                            <Input 
                                                                label="Last Name" 
                                                                placeholder="e.g. Schmidt" 
                                                                value={secondaryCustomerData?.lastName || ''}
                                                                onChange={(e) => setSecondaryCustomerData(prev => ({
                                                                    ...(prev || { email: '', phone: '', firstName: '' }),
                                                                    lastName: e.target.value
                                                                }))}
                                                                required
                                                            />
                                                            <Input 
                                                                label="Email Address" 
                                                                placeholder="secondary@example.com" 
                                                                type="email" 
                                                                value={secondaryCustomerData?.email || ''}
                                                                onChange={(e) => setSecondaryCustomerData(prev => ({
                                                                    ...(prev || { phone: '', firstName: '', lastName: '' }),
                                                                    email: e.target.value
                                                                }))}
                                                                required
                                                            />
                                                            <Input 
                                                                label="Phone Number" 
                                                                placeholder="+43 660 789 012" 
                                                                type="tel" 
                                                                value={secondaryCustomerData?.phone || ''}
                                                                onChange={(e) => setSecondaryCustomerData(prev => ({
                                                                    ...(prev || { email: '', firstName: '', lastName: '' }),
                                                                    phone: e.target.value
                                                                }))}
                                                            />
                                                        </div>
                                                    </div>
                                                    )}
                                            </div>
                                        </div>

                                        {/* --- Items Section --- */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-2">
                                                <h3 className="text-[11px] font-bold text-[var(--text-subtle)] uppercase tracking-wider m-0">Items & Valuation ({items.length})</h3>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {items.map((item, index) => (
                                                    <div key={item.id} className="bg-white rounded-2xl border border-[var(--border-subtlest)] shadow-sm transition-all duration-300 hover:shadow-md relative">
                                                        <div className="px-6 py-4 bg-[var(--background-secondary)]/40 border-b border-[var(--border-subtlest)] flex items-center justify-between cursor-pointer rounded-t-2xl" onClick={() => toggleItem(item.id)}>
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-8 h-8 rounded-full bg-white border border-[var(--border-subtlest)] flex items-center justify-center text-[11px] font-bold text-gray-400">#{index + 1}</div>
                                                                <div>
                                                                    <p className="text-[13px] font-bold text-[#131518] m-0">{item.title || 'New Item'}</p>
                                                                    <p className="text-[10px] font-bold text-gray-400 m-0 uppercase tracking-tight">{CATEGORY_DISPLAY_NAMES[item.category] || item.category || 'No Category'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                {!isCreated && (
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} 
                                                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                                {item.expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                                            </div>
                                                        </div>
                                                        {item.expanded && (
                                                            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                                                                 <CategoryTreeDropdown 
                                                                    label="Category" 
                                                                    value={item.category}
                                                                    onChange={(val) => handleItemChange(item.id, 'category', val)}
                                                                    disabled={isCreated}
                                                                />
                                                                {/* VIN Field for Car */}
                                                                {item.category === 'car' && (
                                                                    <Input 
                                                                        label="VIN Number" 
                                                                        placeholder="Enter 17-digit VIN..." 
                                                                        value={item.vin}
                                                                        maxLength={17}
                                                                        onChange={(e) => handleItemChange(item.id, 'vin', e.target.value.toUpperCase())}
                                                                        disabled={isCreated}
                                                                    />
                                                                )}

                                                                {/* Standard Item Title for non-car items */}
                                                                {item.category !== 'car' && item.category !== '' && (
                                                                    <Input 
                                                                        label="Item Title" 
                                                                        placeholder={item.category.toLowerCase().includes('smartphone') ? "e.g. iPhone 14 Pro" : "e.g. Rolex Datejust"} 
                                                                        value={item.title}
                                                                        onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                                                                        disabled={isCreated}
                                                                    />
                                                                )}

                                                                {/* Indicata Search Simulation for Car */}
                                                                {item.category === 'car' && item.indicataStatus === 'searching' && (
                                                                    <div className="col-span-2 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 animate-pulse">
                                                                        <Loader2 size={18} className="text-[#4649E5] animate-spin" />
                                                                        <span className="text-[13px] font-bold text-[#4649E5]">Searching Indicata records...</span>
                                                                    </div>
                                                                )}

                                                                {item.category === 'car' && item.indicataStatus === 'not_found' && (
                                                                    <>
                                                                        <div className="col-span-2 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                                                            <AlertCircle size={18} className="text-[#E11D48]" />
                                                                            <span className="text-[13px] font-bold text-[#E11D48]">No records found on Indicata. Please enter details manually.</span>
                                                                        </div>
                                                                        
                                                                        {/* Dynamic Car Fields */}
                                                                        <Dropdown 
                                                                            label="Vehicle Make" 
                                                                            options={Object.keys(CAR_DATA).map(m => ({ label: m, value: m }))}
                                                                            value={item.make}
                                                                            onChange={(val) => handleItemChange(item.id, 'make', val)}
                                                                            disabled={isCreated}
                                                                        />
                                                                        <Dropdown 
                                                                            label="Vehicle Model" 
                                                                            options={(item.make ? CAR_DATA[item.make] || [] : []).map(m => ({ label: m, value: m }))}
                                                                            value={item.model}
                                                                            onChange={(val) => handleItemChange(item.id, 'model', val)}
                                                                            disabled={!item.make || isCreated}
                                                                        />
                                                                        <Input 
                                                                            label="Vehicle Year" 
                                                                            placeholder="2022" 
                                                                            type="number"
                                                                            value={item.year}
                                                                            onChange={(e) => handleItemChange(item.id, 'year', e.target.value)}
                                                                            disabled={isCreated}
                                                                        />
                                                                        <div className="relative">
                                                                            <Input 
                                                                                label="Odometer" 
                                                                                placeholder="45000" 
                                                                                type="number"
                                                                                value={item.odometer}
                                                                                onChange={(e) => handleItemChange(item.id, 'odometer', e.target.value)}
                                                                                disabled={isCreated}
                                                                            />
                                                                            <span className="absolute right-4 bottom-2.5 text-[11px] font-bold text-gray-400">KM</span>
                                                                        </div>
                                                                        <div className="col-span-2">
                                                                            <Input 
                                                                                label="Suggested Market Value" 
                                                                                placeholder="15000" 
                                                                                type="number"
                                                                                value={item.suggestedValue}
                                                                                onChange={(e) => handleItemChange(item.id, 'suggestedValue', e.target.value)}
                                                                                disabled={isCreated}
                                                                            />
                                                                        </div>

                                                                        <Input 
                                                                            label="Item Name (Generated)" 
                                                                            placeholder="Make + Model + Year" 
                                                                            value={item.title}
                                                                            readOnly
                                                                            className="col-span-2 bg-gray-50/50"
                                                                        />
                                                                    </>
                                                                )}
                                                                <Dropdown 
                                                                    label="Condition" 
                                                                    options={[
                                                                        { label: 'New', value: 'New' },
                                                                        { label: 'Used', value: 'Used' },
                                                                        { label: 'Worn', value: 'Worn' }
                                                                    ]}
                                                                    value={item.condition}
                                                                    onChange={(val) => handleItemChange(item.id, 'condition', val)}
                                                                    disabled={isCreated}
                                                                />
                                                                <Input 
                                                                    label="Requested Payout (€)" 
                                                                    placeholder="0,00" 
                                                                    type="number" 
                                                                    value={item.requestedPayout}
                                                                    onChange={(e) => handleItemChange(item.id, 'requestedPayout', e.target.value)}
                                                                    disabled={isCreated}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {!isCreated && (
                                                    <button 
                                                        onClick={addItem}
                                                        className="w-full py-6 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#4649E5] hover:text-[#4649E5] hover:bg-blue-50/50 transition-all group"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                                            <Plus size={20} />
                                                        </div>
                                                        <span className="text-sm font-bold uppercase tracking-widest">Add Another Item</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- Deal Metadata --- */}
                                    <div className="bg-white rounded-2xl border border-[var(--border-subtlest)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                                        <div className="px-6 md:px-8 py-4 md:py-5 border-b border-[var(--border-subtlest)] bg-[var(--background-secondary)]/40 flex items-center justify-between">
                                            <h3 className="text-[11px] font-bold text-[var(--text-subtle)] uppercase tracking-wider m-0">Deal Metadata</h3>
                                        </div>
                                        <div className="p-6 md:p-8">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                                <Dropdown 
                                                    label="Company" 
                                                    options={[{ label: 'CASHY_AUT', value: 'CASHY_AUT' }, { label: 'CASHY_GER', value: 'CASHY_GER' }]}
                                                    value={metadata.company}
                                                    onChange={(val) => setMetadata({...metadata, company: val})}
                                                />
                                                <Dropdown 
                                                    label="Branch" 
                                                    options={[{ label: 'Vienna Main', value: 'Vienna Main' }, { label: 'Graz South', value: 'Graz South' }]}
                                                    value={metadata.branch}
                                                    onChange={(val) => setMetadata({...metadata, branch: val})}
                                                />
                                                <Input 
                                                    label="Duration (Days)" 
                                                    type="number" 
                                                    value={metadata.duration}
                                                    onChange={(e) => {
                                                        const newDur = e.target.value;
                                                        const numDays = parseInt(newDur, 10) || 180;
                                                        const d = new Date();
                                                        d.setDate(d.getDate() + numDays);
                                                        setMetadata({
                                                            ...metadata,
                                                            duration: newDur,
                                                            dueDate: formatDateString(d)
                                                        });
                                                    }}
                                                />
                                                <DatePicker 
                                                    label="Due Date (for staff)" 
                                                    value={metadata.dueDate ? parseDateString(metadata.dueDate) : null}
                                                    onChange={(date) => setMetadata({ ...metadata, dueDate: date ? formatDateString(date) : '' })}
                                                    placeholder="Select due date"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- Transport & Payout --- */}
                                    <div className="bg-white rounded-2xl border border-[var(--border-subtlest)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                                        <div className="px-6 md:px-8 py-4 md:py-5 border-b border-[var(--border-subtlest)] bg-[var(--background-secondary)]/40 flex items-center justify-between">
                                            <h3 className="text-[11px] font-bold text-[var(--text-subtle)] uppercase tracking-wider m-0">Transport & Payout</h3>
                                        </div>
                                        <div className="p-6 md:p-8">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                                <Dropdown 
                                                    label="Transport Method" 
                                                    options={[{ label: 'Pickup: SHOP', value: 'Pickup: SHOP' }, { label: 'Courier', value: 'Courier' }]}
                                                />
                                                <Dropdown 
                                                    label="Payout Method" 
                                                    options={[{ label: 'Cash', value: 'Cash' }, { label: 'Bank Transfer', value: 'Bank Transfer' }, { label: 'PayPal', value: 'PayPal' }]}
                                                    value={metadata.payoutMethod}
                                                    onChange={(val) => setMetadata({...metadata, payoutMethod: val})}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium italic mt-6">
                                                <AlertCircle size={14} /> Payout methods vary by country.
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- Additional Notes --- */}
                                    <div className="bg-white rounded-2xl border border-[var(--border-subtlest)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                                        <div className="px-6 md:px-8 py-4 md:py-5 border-b border-[var(--border-subtlest)] bg-[var(--background-secondary)]/40">
                                            <h3 className="text-[11px] font-bold text-[var(--text-subtle)] uppercase tracking-wider m-0">Additional Notes</h3>
                                        </div>
                                        <div className="p-6 md:p-8">
                                            <TextArea 
                                                placeholder="e.g. Special handling for car keys, documents needed..." 
                                                rows={4}
                                            />
                                        </div>
                                    </div>

                                    {/* Mobile Deal Summary */}
                                    {activeStep === 'step1' && (
                                        <div className="lg:hidden mt-8 bg-white rounded-2xl border border-[var(--border-subtlest)] shadow-sm overflow-hidden">
                                            {renderDealSummary()}
                                        </div>
                                    )}

                                    {/* --- Dynamic Phases Sections --- */}
                                    {creationFinalized && steps.slice(1).map((step, idx) => (
                                        <div 
                                            key={step.id} 
                                            id={`section-${step.id}`}
                                            ref={(el) => { if (el) sectionRefs.current.set(step.id, el); }}
                                            className="space-y-10 scroll-mt-20 pt-4"
                                        >
                                            {/* Integrated Line & Pill Separator */}
                                            <div className="flex items-center gap-3 px-2 select-none">
                                                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--background-secondary)] border border-[var(--border-subtlest)] text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-placeholder)] shrink-0 shadow-sm">
                                                    Step {idx + 2} of {steps.length}
                                                </span>
                                                <div className="flex-1 h-[1px] bg-[var(--border-subtlest)]" />
                                            </div>

                                            <div className="px-2">
                                                <h2 className="text-2xl font-bold text-[#131518]">{step.title}</h2>
                                                <p className="text-sm text-gray-400">Complete the {step.title.toLowerCase()} process for all deal items.</p>
                                            </div>

                                            <div className="space-y-8">
                                                {items.map((_, idx) => (
                                                    <div 
                                                        key={`${step.id}-${idx}`}
                                                        id={`section-${step.id}-${idx}`}
                                                        ref={(el) => { if (el) sectionRefs.current.set(`${step.id}-${idx}`, el); }}
                                                        className="scroll-mt-40"
                                                    >
                                                        {renderStepItemFields(step.id, idx)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sticky Mobile Action Bar */}
                        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-[var(--background-primary)] border-t border-[var(--border-subtlest)] shadow-[0_-4px_24px_rgba(0,0,0,0.05)] z-50">
                            {renderActionButtons('mobile')}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className={`hidden lg:flex bg-white border-l border-gray-100 flex-col shrink-0 transition-all duration-300 overflow-hidden ${creationFinalized || activeStep === 'step1' ? 'w-[380px] opacity-100' : 'w-0 opacity-0'}`}>
                        {/* Summary removed as it's now in the header */}

                        {activeStep === 'step1' ? (
                            renderDealSummary()
                        ) : (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex border-b border-gray-100 px-4 shrink-0 bg-white">
                                    <button className={`flex-1 py-4 text-[11px] uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 border-b-2 transition-colors ${sidebarTab === 'comments' ? 'border-[#4649E5] text-[#131518]' : 'border-transparent text-gray-300 hover:text-gray-400'}`} onClick={() => setSidebarTab('comments')}>
                                        <MessageSquare size={16} /> Comments
                                    </button>
                                    <button className={`flex-1 py-4 text-[11px] uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 border-b-2 transition-colors ${sidebarTab === 'timeline' ? 'border-[#4649E5] text-[#131518]' : 'border-transparent text-gray-300 hover:text-gray-400'}`} onClick={() => setSidebarTab('timeline')}>
                                        <History size={16} /> Timeline
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-8 slick-scrollbar">
                                    {sidebarTab === 'comments' ? (
                                        <>
                                            <CommentItem initials="TW" name="Thomas Weber" time="09:15" text="Initial assessment complete. Waiting for documents." />
                                            <CommentItem initials="MS" name="Maria Schmidt" time="Yesterday" text="Customer requested cash payout." />
                                            <CommentItem initials="AK" name="Admin Kernel" time="2 days ago" text="New item added to the deal." />
                                        </>
                                    ) : (
                                        <div className="space-y-0">
                                            <TimelineItem 
                                                icon={<Package size={14} />} 
                                                title="Deal Created" 
                                                user="Thomas Weber" 
                                                time="10 May, 14:20" 
                                                color="blue"
                                            />
                                            <TimelineItem 
                                                icon={<History size={14} />} 
                                                title="Item Added: Rolex Datejust" 
                                                user="Maria Schmidt" 
                                                time="10 May, 14:45" 
                                                color="indigo"
                                            />
                                            <TimelineItem 
                                                icon={<AlertCircle size={14} />} 
                                                title="Condition Verified: Used" 
                                                user="Thomas Weber" 
                                                time="Today, 09:15" 
                                                color="green"
                                            />
                                            <TimelineItem 
                                                icon={<Plus size={14} />} 
                                                title="Payout Updated: € 1.200,00" 
                                                user="Admin Kernel" 
                                                time="Today, 10:30" 
                                                color="purple"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                                    <textarea placeholder="Add a comment..." className="w-full h-24 p-4 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#4649E5] focus:ring-1 focus:ring-[#4649E5] transition-all resize-none mb-4 shadow-sm" />
                                    <Button variant="secondary" className="w-full justify-center font-bold h-11 bg-white border-gray-200 hover:border-[#4649E5] hover:text-[#4649E5]">Post Comment</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- MOBILE LEFT SIDE SHEET (STEPPER) --- */}
                <div className={`fixed inset-0 z-[250] md:hidden transition-opacity duration-300 ${isLeftSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsLeftSidebarOpen(false)} />
                    {/* Content */}
                    <div className={`absolute top-0 bottom-0 left-0 w-[280px] bg-[var(--background-primary)] shadow-2xl transition-transform duration-300 flex flex-col ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="p-4 border-b border-[var(--border-subtlest)] flex items-center justify-between bg-[var(--background-primary)] shrink-0">
                            <h3 className="font-bold text-[var(--text-subtle)] text-base m-0">Navigation Steps</h3>
                            <button onClick={() => setIsLeftSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--background-secondary-hover)] rounded-full text-[var(--text-placeholder)]">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--background-primary)]">
                            {steps.map((s, idx) => {
                                const isActive = activeStep === s.id;
                                const isStepDisabled = s.id !== 'step1' && !isCreated;
                                return (
                                    <button
                                        key={s.id}
                                        disabled={isStepDisabled}
                                        onClick={() => {
                                            scrollToSection(s.id);
                                            setIsLeftSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${isActive ? 'bg-[var(--lilac-600)]/10 text-[var(--lilac-600)] font-bold' : 'hover:bg-[var(--background-hover)] text-[var(--text-subtle)] disabled:opacity-40 disabled:hover:bg-transparent'}`}
                                    >
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors shrink-0 ${isActive ? 'border-[var(--lilac-600)] bg-[var(--lilac-600)] text-[var(--text-white)]' : 'border-[var(--border-primary)] bg-[var(--background-secondary)] text-[var(--text-subtlest)]'}`}>
                                            {idx + 1}
                                        </div>
                                        <span className="text-sm font-semibold">{s.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- MOBILE RIGHT SIDE SHEET (DEAL INFO & METADATA) --- */}
                <div className={`fixed inset-0 z-[250] md:hidden transition-opacity duration-300 ${isRightSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsRightSidebarOpen(false)} />
                    {/* Content */}
                    <div className={`absolute top-0 bottom-0 right-0 w-[320px] bg-[var(--background-primary)] shadow-2xl transition-transform duration-300 flex flex-col ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="p-4 border-b border-[var(--border-subtlest)] flex items-center justify-between bg-[var(--background-primary)] shrink-0">
                            <h3 className="font-bold text-[var(--text-subtle)] text-base m-0">Deal Information</h3>
                            <button onClick={() => setIsRightSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--background-secondary-hover)] rounded-full text-[var(--text-placeholder)]">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 slick-scrollbar bg-[var(--background-primary)]">
                            {/* Payout Summary */}
                            <div className="bg-[var(--lilac-600)]/5 border border-[var(--lilac-600)]/10 rounded-xl p-3 flex items-center justify-between">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-placeholder)]">
                                    {creationFinalized ? 'Total Payout' : 'Est. Payout'}
                                </span>
                                <div className="text-xl font-extrabold text-[var(--lilac-600)]">
                                    € {formattedTotal}
                                </div>
                            </div>

                            {/* Location & Customer Info */}
                            <div className="bg-[var(--background-secondary)] rounded-2xl p-4 space-y-4 border border-[var(--border-subtlest)]">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-[var(--text-subtlest)]">Location</span>
                                    <ShopLabel country={dealData?.countryCode || 'AT'} branch={dealData?.branch || 'Wien'} />
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-medium text-[var(--text-subtlest)] mt-0.5">Customer</span>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-[var(--text-primary)] block">
                                            {customerData.firstName ? `${customerData.firstName} ${customerData.lastName}` : 'Guest'}
                                        </span>
                                        <span className="text-[10px] font-medium text-[var(--text-placeholder)] block uppercase">Primary Customer</span>
                                    </div>
                                </div>
                                {showSecondaryCustomer && secondaryCustomerData && (
                                    <div className="flex justify-between items-start border-t border-[var(--border-subtlest)] pt-3">
                                        <span className="text-xs font-medium text-[var(--text-subtlest)] mt-0.5">Secondary</span>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-[var(--text-primary)] block">
                                                {`${secondaryCustomerData.firstName} ${secondaryCustomerData.lastName}`}
                                            </span>
                                            <span className="text-[10px] font-medium text-[var(--text-placeholder)] block uppercase">Secondary Customer</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-[var(--text-subtlest)]">Deal ID</span>
                                    <span className="text-xs font-mono font-bold text-[var(--text-subtle)] bg-[var(--background-primary)] px-2 py-0.5 rounded border border-[var(--border-subtlest)]">{dealId}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-[var(--text-subtlest)]">Duration</span>
                                    {dealMode === 'Pawn' ? (
                                        <span 
                                            onClick={() => setShowPawnDueDate(!showPawnDueDate)}
                                            className="text-xs font-bold text-[var(--text-subtle)] underline decoration-dotted underline-offset-[3px] cursor-pointer hover:opacity-80 transition-opacity"
                                        >
                                            {showPawnDueDate ? getFormattedPawnDueDate() : `${metadata.duration} Days`}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-[var(--text-subtle)]">{metadata.duration} Days</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-[var(--text-subtlest)]">Total Items</span>
                                    <span className="text-xs font-bold text-[var(--text-subtle)]">{items.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-[var(--text-subtlest)]">Business Area</span>
                                    <span className="text-xs font-bold text-[var(--text-subtle)]">{currentBusinessArea}</span>
                                </div>
                            </div>

                            {/* Comments & Timeline Tabs */}
                            {activeStep !== 'step1' && (
                                <div className="border-t border-[var(--border-subtlest)] pt-6 space-y-4">
                                    {/* Tabs */}
                                    <div className="flex border-b border-[var(--border-subtlest)] bg-[var(--background-primary)] shrink-0">
                                        <button 
                                            className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 border-b-2 transition-colors border-none bg-transparent cursor-pointer ${
                                                sidebarTab === 'comments' 
                                                    ? 'border-[#4649E5] text-[var(--text-primary)]' 
                                                    : 'border-transparent text-[var(--text-placeholder)] hover:text-[var(--text-subtle)]'
                                            }`} 
                                            onClick={() => setSidebarTab('comments')}
                                        >
                                            <MessageSquare size={14} /> Comments
                                        </button>
                                        <button 
                                            className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 border-b-2 transition-colors border-none bg-transparent cursor-pointer ${
                                                sidebarTab === 'timeline' 
                                                    ? 'border-[#4649E5] text-[var(--text-primary)]' 
                                                    : 'border-transparent text-[var(--text-placeholder)] hover:text-[var(--text-subtle)]'
                                            }`} 
                                            onClick={() => setSidebarTab('timeline')}
                                        >
                                            <History size={14} /> Timeline
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="py-2">
                                        {sidebarTab === 'comments' ? (
                                            <div className="space-y-6">
                                                <div className="space-y-6">
                                                    <CommentItem initials="TW" name="Thomas Weber" time="09:15" text="Initial assessment complete. Waiting for documents." />
                                                    <CommentItem initials="MS" name="Maria Schmidt" time="Yesterday" text="Customer requested cash payout." />
                                                    <CommentItem initials="AK" name="Admin Kernel" time="2 days ago" text="New item added to the deal." />
                                                </div>
                                                <div className="pt-4 border-t border-[var(--border-subtlest)]">
                                                    <textarea 
                                                        placeholder="Add a comment..." 
                                                        className="w-full h-20 p-3 border border-[var(--border-subtlest)] rounded-xl text-xs bg-[var(--background-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[#4649E5] focus:ring-1 focus:ring-[#4649E5] transition-all resize-none mb-3 shadow-sm" 
                                                    />
                                                    <Button 
                                                        variant="secondary" 
                                                        className="w-full justify-center font-bold h-9 text-xs bg-[var(--background-primary)] border-[var(--border-subtlest)] hover:border-[#4649E5] hover:text-[#4649E5]"
                                                    >
                                                        Post Comment
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-0">
                                                <TimelineItem 
                                                    icon={<Package size={12} />} 
                                                    title="Deal Created" 
                                                    user="Thomas Weber" 
                                                    time="10 May, 14:20" 
                                                    color="blue"
                                                />
                                                <TimelineItem 
                                                    icon={<History size={12} />} 
                                                    title="Item Added: Rolex Datejust" 
                                                    user="Maria Schmidt" 
                                                    time="10 May, 14:45" 
                                                    color="indigo"
                                                />
                                                <TimelineItem 
                                                    icon={<AlertCircle size={12} />} 
                                                    title="Condition Verified: Used" 
                                                    user="Thomas Weber" 
                                                    time="Today, 09:15" 
                                                    color="green"
                                                />
                                                <TimelineItem 
                                                    icon={<Plus size={12} />} 
                                                    title="Payout Updated: € 1.200,00" 
                                                    user="Admin Kernel" 
                                                    time="Today, 10:30" 
                                                    color="purple"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const SimulationStep = ({ active, done, text }: { active: boolean; done: boolean; text: string }) => (
    <div
        className="flex items-center gap-3 transition-all duration-300"
        style={{ opacity: active ? 1 : 0.3 }}
    >
        {/* Status indicator */}
        <div
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
            style={{
                backgroundColor: done
                    ? 'var(--background-success-solid, #16a34a)'
                    : active
                    ? 'transparent'
                    : 'transparent',
                border: done
                    ? '2px solid var(--background-success-solid, #16a34a)'
                    : active
                    ? '2px solid var(--border-brand, #4649e5)'
                    : '2px solid var(--border-subtle, #d1d5db)',
            }}
        >
            {done ? (
                /* Simple SVG checkmark — reliable across all browsers */
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : active ? (
                /* Active pulse dot */
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--border-brand, #4649e5)' }} />
            ) : null}
        </div>

        {/* Label */}
        <span
            className="text-sm font-medium transition-all duration-300"
            style={{
                color: done
                    ? 'var(--text-subtlest, #9ca3af)'
                    : active
                    ? 'var(--text-primary, #131518)'
                    : 'var(--text-subtlest, #9ca3af)',
                textDecoration: done ? 'line-through' : 'none',
            }}
        >
            {text}
        </span>
    </div>
);


const DetailItem = ({ label, value, isBadge, isInteractive, onClick }: any) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400">{label}</span>
        {isBadge ? (
            <div className="inline-flex px-2 py-1 rounded-md bg-blue-50 border border-blue-100 text-[#4649E5] text-[11px] font-bold w-fit leading-none">{value}</div>
        ) : (
            <span 
                onClick={onClick}
                className={`text-[14px] font-bold text-[#131518] ${isInteractive ? 'underline decoration-dotted underline-offset-[3px] cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            >
                {value}
            </span>
        )}
    </div>
);

const CommentItem = ({ initials, name, time, text }: any) => (
    <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">{initials}</div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-[#131518]">{name}</span>
                <span className="text-[11px] text-gray-400 font-medium">{time}</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed m-0">{text}</p>
        </div>
    </div>
);

const TimelineItem = ({ icon, title, user, time, color }: any) => {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-500',
        indigo: 'bg-indigo-500',
        green: 'bg-emerald-500',
        purple: 'bg-purple-500',
        amber: 'bg-amber-500'
    };
    
    return (
        <div className="relative pl-8 pb-4 last:pb-0">
            <div className="absolute left-0 top-0 h-full w-[1px] bg-gray-100 last:hidden" style={{ left: '15px' }} />
            <div className={`absolute left-0 top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white shadow-sm z-10 ${colorMap[color] || 'bg-gray-400'}`} style={{ 
                left: '-1px'
            }}>
                {icon}
            </div>
            <div className="pt-1">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-[#131518] leading-tight">{title}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight shrink-0 ml-4">{time}</span>
                </div>
                <p className="text-[11px] font-medium text-gray-400">by <span className="text-[#4649E5]">{user}</span></p>
            </div>
        </div>
    );
};
