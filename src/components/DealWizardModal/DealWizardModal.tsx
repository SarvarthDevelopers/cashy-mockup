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
}

export const DealWizardModal: React.FC<DealWizardModalProps> = ({ 
    isOpen, 
    onClose, 
    dealData,
    initialStep = 'step2',
    isNew = false,
    onCreateDeal,
    onUpdateDeal
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
    const [metadata, setMetadata] = useState({
        company: 'CASHY_AUT',
        branch: 'Vienna Main',
        duration: '180',
        dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payoutMethod: 'Bank Transfer'
    });

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
            setMetadata({
                company: dealData.wizardData?.company || 'CASHY_AUT',
                branch: dealData.wizardData?.branch || 'Vienna Main',
                duration: dealData.wizardData?.dealDuration?.split(' ')[0] || '180',
                dueDate: dealData.dueDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                payoutMethod: dealData.wizardData?.payoutType || 'Bank Transfer'
            });
            if (dealData.items && dealData.items.length > 0) {
                setItems(dealData.items.map((it, idx) => ({
                    id: String(idx),
                    category: dealData.businessArea || 'Car',
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
            setActiveStep(isNew ? 'step1' : initialStep);
            setIsCreated(!isNew);
            setCreationFinalized(!isNew);
            if (isNew) setLastSyncedId(null);
        }
    }, [isOpen, isNew, initialStep]);


    // Derived data
    const currentDeal = isCreated ? dealData : null;
    const dealId = currentDeal?.id || 'PENDING';
    const totalRequestedPayout = items.reduce((sum, item) => sum + (parseFloat(item.requestedPayout) || 0), 0);
    const formattedTotal = totalRequestedPayout.toLocaleString('de-DE', { minimumFractionDigits: 2 });

    const handleCreateDeal = () => {
        setIsCreating(true);
        setCreationStep(1);
        
        // Simulation steps
        setTimeout(() => setCreationStep(2), 800);
        setTimeout(() => setCreationStep(3), 1600);
        setTimeout(() => {
            const newDeal: DealData = {
                id: Math.floor(100000 + Math.random() * 900000).toString(),
                countryCode: 'AT',
                branch: 'Vienna',
                firstName: customerData.firstName,
                lastName: customerData.lastName,
                amount: `€${formattedTotal}`,
                items: items.map(i => i.title || 'Unknown Item'),
                dealType: dealMode,
                businessArea: items[0]?.category || 'Automotive',
                wizardData: {
                    customerName: `${customerData.firstName} ${customerData.lastName}`,
                    email: customerData.email,
                    phone: customerData.phone,
                    branch: metadata.branch,
                    company: metadata.company,
                    businessArea: items[0]?.category || 'Automotive',
                    categoryPath: `Automotive > ${items[0]?.category || 'General'}`,
                    dealDuration: `${metadata.duration} days`,
                    payoutType: dealMode,
                    amount: `€${formattedTotal}`,
                    item: items[0]?.title || 'Unknown Item'
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
            const updatedDeal: DealData = {
                ...dealData,
                firstName: customerData.firstName,
                lastName: customerData.lastName,
                amount: `€${formattedTotal}`,
                items: items.map(i => i.title || 'Unknown Item'),
                dueDate: metadata.dueDate,
                branch: metadata.branch,
                wizardData: {
                    ...dealData.wizardData,
                    customerName: `${customerData.firstName} ${customerData.lastName}`,
                    email: customerData.email,
                    phone: customerData.phone,
                    branch: metadata.branch,
                    company: metadata.company,
                    dealDuration: `${metadata.duration} days`,
                    amount: `€${formattedTotal}`,
                    item: items[0]?.title || 'Unknown Item'
                }
            };
            onUpdateDeal(updatedDeal);
        }
    }, [customerData, metadata, items, isCreated, creationFinalized]);


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
            
            let updatedItem = { ...item, [field]: value };
            
            // Auto-generate title for Car
            if (updatedItem.category === 'Car' && (field === 'make' || field === 'model' || field === 'year')) {
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

    const [allWizards, setAllWizards] = useState<any[]>(MOCK_WIZARDS);

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
        return allWizards.find(w => w.category === category) || allWizards[0];
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
        const wizard = getWizardForCategory(item?.category || 'Car');
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
            <div className="bg-[var(--background-primary)] rounded-2xl border border-[var(--border-subtlest)] shadow-sm p-6 md:p-10">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400">
                        {steps.find(s => s.id === stepId)?.title} Details — {item?.title || 'Unknown Item'}
                    </h3>
                    {items.length > 1 && (
                        <span className="text-[10px] font-bold text-[#4649E5] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-tight">
                            Item {itemIdx + 1} of {items.length}
                        </span>
                    )}
                </div>
                
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
        );
    };

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
                    <div className={`${isMobile ? 'flex flex-1' : 'flex'} items-center gap-3 mr-2`}>
                        {!isMobile && <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Deal Type</span>}
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
                                <Button variant="secondary" size="small" className={`${isMobile ? 'flex-1' : ''} font-bold`}>Extend</Button>
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
                                    Create {dealMode} Deal
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
                            {isCreating ? 'Creating...' : `Create ${dealMode} Deal`}
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
                                    <p className="text-[11px] font-medium text-[var(--text-placeholder)] m-0 uppercase tracking-tight">{item.category || 'Select Category'}</p>
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
                                <div className="flex items-center gap-3">
                                    <ShopLabel country={dealData?.countryCode || 'AT'} branch={dealData?.branch || 'Wien'} />
                                    <div>
                                        <h2 className="text-xl font-bold m-0 leading-tight" style={{ color: 'var(--brand-500)' }}>{`${customerData.firstName} ${customerData.lastName}`}</h2>
                                        <p className="text-sm font-medium m-0" style={{ color: 'var(--gray-400)' }}>Primary Customer</p>
                                    </div>
                                </div>
                                <div className="h-10 w-[1px] bg-gray-100" style={{ margin: '0 var(--space-200)' }} />
                                <div className="flex" style={{ gap: 'var(--space-800)' }}>
                                    <DetailItem label="Deal ID" value={dealId} />
                                    <DetailItem label="Pawn Duration" value={`${metadata.duration} Days`} />
                                    <DetailItem label="Total Items" value={String(items.length)} />
                                    <DetailItem label="Secondary" value="NA" />
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
                    <div className="flex-1 flex flex-col min-w-0 bg-[#FBFCFC] relative">
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
                                <div className="h-full flex flex-col items-center justify-center">
                                    <div className="w-[500px] space-y-8 animate-in fade-in zoom-in duration-500">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="relative">
                                                <div className="w-16 h-16 border-4 border-blue-50 rounded-full border-t-[#4649E5] animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Package className="text-[#4649E5]" size={24} />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-xl font-bold text-[#17142B] mb-2">Creating Deal...</h3>
                                                <p className="text-gray-400 text-sm">Please wait while we initialize the records</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <SimulationStep active={creationStep >= 1} done={creationStep > 1} text="Saving deal data to database..." />
                                            <SimulationStep active={creationStep >= 2} done={creationStep > 2} text="Generating booking number..." />
                                            <SimulationStep active={creationStep >= 3} done={creationStep > 3} text="Initializing workflow steps..." />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-[800px] mx-auto space-y-12 py-8 md:py-20 px-4 md:px-8 pb-32 md:pb-20">
                                    {/* --- Section 1: Basic Info --- */}
                                    <div 
                                        id="section-step1" 
                                        ref={(el) => { if (el) sectionRefs.current.set('step1', el); }}
                                        className="space-y-8 scroll-mt-20"
                                    >
                                        <div className="px-2">
                                            <h2 className="text-2xl font-bold text-[#131518]">Basic Information</h2>
                                            <p className="text-sm text-gray-400">Initialize the core deal and customer details.</p>
                                        </div>

                                        {/* --- Customer Section --- */}
                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                            <div className="px-6 md:px-8 py-4 md:py-5 border-b border-gray-50 flex items-center justify-between">
                                                <h3 className="text-xs font-bold text-[#131518] uppercase tracking-wider m-0">Customer Profile</h3>
                                                <div className="flex items-center gap-2 text-[#4649E5] text-[12px] font-bold cursor-pointer hover:opacity-70 transition-opacity">
                                                    <Plus size={14} /> Add Secondary
                                                </div>
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
                                            </div>
                                        </div>

                                        {/* --- Items Section --- */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-2">
                                                <h3 className="text-xs font-bold text-[#131518] uppercase tracking-wider m-0">Items & Valuation ({items.length})</h3>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {items.map((item, index) => (
                                                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md relative">
                                                        <div className="px-6 py-4 bg-[#FBFCFC] border-b border-gray-50 flex items-center justify-between cursor-pointer rounded-t-2xl" onClick={() => toggleItem(item.id)}>
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-400">#{index + 1}</div>
                                                                <div>
                                                                    <p className="text-[13px] font-bold text-[#131518] m-0">{item.title || 'New Item'}</p>
                                                                    <p className="text-[10px] font-bold text-gray-400 m-0 uppercase tracking-tight">{item.category || 'No Category'}</p>
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
                                                                <Dropdown 
                                                                    label="Category" 
                                                                    options={[
                                                                        { label: 'Car', value: 'Car' },
                                                                        { label: 'Watches', value: 'Watches' },
                                                                        { label: 'Electronics', value: 'General Electronics' },
                                                                        { label: 'Luxury', value: 'Luxury' }
                                                                    ]}
                                                                    value={item.category}
                                                                    onChange={(val) => handleItemChange(item.id, 'category', val)}
                                                                    disabled={isCreated}
                                                                />
                                                                {/* VIN Field for Car */}
                                                                {item.category === 'Car' && (
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
                                                                {item.category !== 'Car' && item.category !== '' && (
                                                                    <Input 
                                                                        label="Item Title" 
                                                                        placeholder={item.category === 'Smartphones' ? "e.g. iPhone 14 Pro" : "e.g. Rolex Datejust"} 
                                                                        value={item.title}
                                                                        onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                                                                        disabled={isCreated}
                                                                    />
                                                                )}

                                                                {/* Indicata Search Simulation for Car */}
                                                                {item.category === 'Car' && item.indicataStatus === 'searching' && (
                                                                    <div className="col-span-2 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 animate-pulse">
                                                                        <Loader2 size={18} className="text-[#4649E5] animate-spin" />
                                                                        <span className="text-[13px] font-bold text-[#4649E5]">Searching Indicata records...</span>
                                                                    </div>
                                                                )}

                                                                {item.category === 'Car' && item.indicataStatus === 'not_found' && (
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

                                    {/* --- Deal Metadata & Transport --- */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
                                            <h3 className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400 mb-8">Deal Metadata</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
                                                    onChange={(e) => setMetadata({...metadata, duration: e.target.value})}
                                                />
                                                <Input 
                                                    label="Due Date (for staff)" 
                                                    type="date"
                                                    value={metadata.dueDate}
                                                    onChange={(e) => setMetadata({ ...metadata, dueDate: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
                                            <h3 className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400 mb-8">Transport & Payout</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
                                            <div className="flex-1 min-h-[40px]" />
                                            <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium italic">
                                                <AlertCircle size={14} /> Payout methods vary by country.
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- Additional Notes --- */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
                                        <h3 className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400 mb-8">Additional Notes</h3>
                                        <TextArea 
                                            placeholder="e.g. Special handling for car keys, documents needed..." 
                                            rows={4}
                                        />
                                    </div>

                                    {/* Mobile Deal Summary */}
                                    {activeStep === 'step1' && (
                                        <div className="lg:hidden mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                            {renderDealSummary()}
                                        </div>
                                    )}

                                    {/* --- Dynamic Phases Sections --- */}
                                    {creationFinalized && steps.slice(1).map((step) => (
                                        <div 
                                            key={step.id} 
                                            id={`section-${step.id}`}
                                            ref={(el) => { if (el) sectionRefs.current.set(step.id, el); }}
                                            className="space-y-10 scroll-mt-20"
                                        >
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
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-[var(--text-subtlest)]">Deal ID</span>
                                    <span className="text-xs font-mono font-bold text-[var(--text-subtle)] bg-[var(--background-primary)] px-2 py-0.5 rounded border border-[var(--border-subtlest)]">{dealId}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-[var(--text-subtlest)]">Duration</span>
                                    <span className="text-xs font-bold text-[var(--text-subtle)]">{metadata.duration} Days</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-[var(--text-subtlest)]">Total Items</span>
                                    <span className="text-xs font-bold text-[var(--text-subtle)]">{items.length}</span>
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


const SimulationStep = ({ active, done, text }: any) => (
    <div className={`flex items-center gap-4 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-30'}`}>
        <div 
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center`}
            style={{ 
                backgroundColor: done ? 'var(--green-500)' : 'transparent',
                borderColor: done ? 'var(--green-500)' : active ? 'var(--blue-500)' : 'var(--gray-300)'
            }}
        >
            {done && <div className="w-2 h-1 border-b-2 border-r-2 border-white rotate-45 mb-0.5" />}
        </div>
        <span 
            className={`text-sm font-medium`}
            style={{ 
                color: done ? 'var(--gray-400)' : active ? 'var(--brand-500)' : 'var(--gray-400)',
                textDecoration: done ? 'line-through' : 'none'
            }}
        >{text}</span>
    </div>
);


const DetailItem = ({ label, value, isBadge }: any) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400">{label}</span>
        {isBadge ? (
            <div className="inline-flex px-2 py-1 rounded-md bg-blue-50 border border-blue-100 text-[#4649E5] text-[11px] font-bold w-fit leading-none">{value}</div>
        ) : (
            <span className="text-[14px] font-bold text-[#131518]">{value}</span>
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
