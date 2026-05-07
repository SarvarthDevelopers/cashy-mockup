import React, { useState, useEffect } from 'react';
import { Package, MessageSquare, History, ChevronUp, ChevronDown, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { 
    Button, 
    Tabs, 
    Tab, 
    Input, 
    TextArea, 
    Dropdown, 
    RadioGroup, 
    Radio, 
    Checkbox 
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
    const dealId = currentDeal?.id.replace('deal-', '') || 'PENDING';
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
                id: `deal-${Math.floor(Math.random() * 10000)}`,
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

    const renderStepFields = () => {
        const item = items[activeItemIndex];
        const wizard = getWizardForCategory(item?.category || 'Car');
        const fields = (wizard?.fields || []).filter((f: { stepId: string }) => f.stepId === activeStep);

        if (fields.length === 0) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Package className="text-gray-200" size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Phase Not Required</h4>
                    <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                        The <span className="font-bold text-gray-500">{item?.category || 'Standard'}</span> category does not require specific data entry during the <span className="font-bold text-gray-500">{steps.find(s => s.id === activeStep)?.title}</span> phase.
                    </p>
                    <button 
                        onClick={() => {
                            if (activeItemIndex < items.length - 1) {
                                setActiveItemIndex(prev => prev + 1);
                            } else {
                                handleNextStep();
                                setActiveItemIndex(0);
                            }
                        }}
                        className="mt-8 px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        Continue to Next {activeItemIndex < items.length - 1 ? 'Item' : 'Phase'}
                    </button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {fields.map((field: any) => (
                    <div key={field.id} className={field.type === 'checkbox' || field.type === 'textarea' ? 'col-span-2' : ''}>
                        {field.type === 'checkbox' ? (
                            <Checkbox 
                                label={field.label} 
                            />
                        ) : field.type === 'select' ? (
                            <Dropdown 
                                label={field.label} 
                                options={(field.options || []).map((opt: string) => ({ label: opt, value: opt }))} 
                            />
                        ) : field.type === 'textarea' ? (
                            <TextArea 
                                label={field.label} 
                                placeholder={field.placeholder} 
                            />
                        ) : (
                            <Input 
                                label={field.label} 
                                placeholder={field.placeholder} 
                                type={field.type} 
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const handleNextStep = () => {
        const currentIndex = steps.findIndex(s => s.id === activeStep);
        if (currentIndex < steps.length - 1) {
            setActiveStep(steps[currentIndex + 1].id);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (!creationFinalized || activeStep === 'step1') return;
        
        const target = e.currentTarget;
        const isAtBottom = Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) < 1;
        
        if (isAtBottom) {
            // Debounce or add a small delay for premium feel
            setTimeout(() => {
                if (activeItemIndex < items.length - 1) {
                    setActiveItemIndex(prev => prev + 1);
                    target.scrollTop = 0;
                } else if (activeStep !== 'step7') {
                    handleNextStep();
                    setActiveItemIndex(0);
                }
            }, 300);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white animate-in fade-in duration-200">
            <div className="w-full h-full flex flex-col bg-white overflow-hidden" onClick={(e) => e.stopPropagation()}>
                
                {/* --- HEADER --- */}
                <div className="border-b border-gray-100 shrink-0 bg-white" style={{ padding: 'var(--space-600) var(--space-800)' }}>
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
                                    <ShopLabel color="Green" country={dealData?.countryCode || 'AT'} branch={dealData?.branch || 'Wien'} />
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
                            <div className="flex flex-col items-end">
                                <div className="text-[24px] font-bold tabular-nums" style={{ color: 'var(--brand-500)' }}>
                                    € {formattedTotal}
                                </div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--gray-400)' }}>
                                    Est. Payout
                                </span>
                            </div>
                        ) : (
                            <div className={`text-[32px] font-bold tabular-nums transition-colors text-[#17142B]`} style={{ color: 'var(--brand-500)' }}>
                                € {formattedTotal}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- STEPPER & ACTIONS --- */}
                <div className="border-b border-gray-100 shrink-0 bg-white flex items-center justify-between" style={{ padding: 'var(--space-400) var(--space-800)' }}>
                    <div className="flex-1 relative overflow-hidden group">
                        <Tabs 
                            variant="stepper" 
                            value={activeStep} 
                            onValueChange={(val) => {
                                const step = steps.find(s => s.id === val);
                                if (step && (val === 'step1' || isCreated)) {
                                    setActiveStep(val);
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
                        <div className="flex gap-2">
                            {!isCreated && (
                                <div className="flex items-center gap-3 mr-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Deal Type</span>
                                    <Tabs 
                                        variant="segment" 
                                        value={dealMode} 
                                        onValueChange={(val) => setDealMode(val as 'Pawn' | 'Purchase')}
                                        className="h-10"
                                    >
                                        <Tab value="Pawn">Pawn</Tab>
                                        <Tab value="Purchase">Purchase</Tab>
                                    </Tabs>
                                </div>
                            )}

                            {creationFinalized ? (
                                <>
                                    <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" style={{ color: 'var(--brand-500)' }}>
                                        <div className="w-5 h-5 border-2 rounded-[4px] relative" style={{ borderColor: 'var(--brand-500)' }}>
                                            <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5" style={{ backgroundColor: 'var(--brand-500)' }} />
                                        </div>
                                    </button>
                                    {isCreated ? (
                                        <>
                                            <Button variant="secondary" size="small" className="font-bold">Payback</Button>
                                            <Button variant="secondary" size="small" className="font-bold">Extend</Button>
                                            <Button variant="primary" size="small" className="font-bold" onClick={onClose}>Close</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="secondary" size="small" className="font-bold" onClick={onClose}>Cancel</Button>
                                            <Button 
                                                variant="primary" 
                                                size="small" 
                                                className="font-bold" 
                                                onClick={() => setActiveStep('step2')}
                                            >
                                                Create {dealMode} Deal
                                            </Button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {!isCreating && <Button variant="secondary" size="small" className="h-10 px-6 font-bold border-gray-200" style={{ color: 'var(--brand-500)' }} onClick={onClose}>Cancel</Button>}
                                    <Button 
                                        variant="primary" 
                                        size="small" 
                                        isLoading={isCreating}
                                        disabled={isCreating}
                                        className={`h-10 px-8 border-none font-bold`}
                                        style={{ backgroundColor: 'var(--lilac-600)' }}
                                        onClick={handleCreateDeal}
                                    >
                                        {isCreating ? 'Creating...' : `Create ${dealMode} Deal`}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] relative">
                        {creationFinalized && activeStep !== 'step1' && items.length > 1 && (
                            <div className="px-8 bg-white border-b border-gray-100 flex gap-8">
                                {items.map((item, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveItemIndex(idx)}
                                        className={`py-4 px-2 border-b-2 transition-all text-left ${activeItemIndex === idx ? 'border-[#4649E5] text-[#17142B]' : 'border-transparent text-gray-400'}`}
                                    >
                                        <p className="text-sm font-bold m-0">Item {idx + 1}</p>
                                        <p className="text-[11px] font-medium m-0">{item.title || 'Unknown Item'}</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-8" onScroll={handleScroll}>
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
                            ) : activeStep === 'step1' ? (
                                <div className="max-w-[800px] mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* --- Customer Section --- */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                        <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between">
                                            <h3 className="text-xs font-bold text-[#17142B] uppercase tracking-wider m-0">Customer Profile</h3>
                                            <div className="flex items-center gap-2 text-[#4649E5] text-[12px] font-bold cursor-pointer hover:opacity-70 transition-opacity">
                                                <Plus size={14} /> Add Secondary
                                            </div>
                                        </div>
                                        <div className="p-8 space-y-8">
                                            <RadioGroup 
                                                direction="horizontal" 
                                                value={customerData.mode} 
                                                onChange={(val) => setCustomerData({...customerData, mode: val as any})}
                                                className="gap-8"
                                            >
                                                <Radio value="Registered" label="Registered" />
                                                <Radio value="Guest" label="Guest" />
                                                <Radio value="Create New" label="Create New" />
                                            </RadioGroup>

                                            <div className="grid grid-cols-2 gap-6">
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
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-xs font-bold text-[#17142B] uppercase tracking-wider m-0">Items & Valuation ({items.length})</h3>
                                            <Button 
                                                variant="secondary" 
                                                size="small" 
                                                onClick={addItem}
                                                className="h-8 gap-2 font-bold bg-white border-gray-200"
                                            >
                                                <Plus size={14} /> Add Item
                                            </Button>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {items.map((item, index) => (
                                                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md relative">
                                                    <div className="px-6 py-4 bg-gray-50/30 border-b border-gray-50 flex items-center justify-between cursor-pointer rounded-t-2xl" onClick={() => toggleItem(item.id)}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-400">#{index + 1}</div>
                                                            <div>
                                                                <p className="text-[13px] font-bold text-[#17142B] m-0">{item.title || 'New Item'}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 m-0 uppercase tracking-tight">{item.category || 'No Category'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} 
                                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                            {item.expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                                        </div>
                                                    </div>
                                                    {item.expanded && (
                                                        <div className="p-8 grid grid-cols-2 gap-6 animate-in fade-in duration-300">
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
                                                            />
                                                            {/* VIN Field for Car */}
                                                            {item.category === 'Car' && (
                                                                <Input 
                                                                    label="VIN Number" 
                                                                    placeholder="Enter 17-digit VIN..." 
                                                                    value={item.vin}
                                                                    maxLength={17}
                                                                    onChange={(e) => handleItemChange(item.id, 'vin', e.target.value.toUpperCase())}
                                                                />
                                                            )}

                                                            {/* Standard Item Title for non-car items */}
                                                            {item.category !== 'Car' && item.category !== '' && (
                                                                <Input 
                                                                    label="Item Title" 
                                                                    placeholder={item.category === 'Smartphones' ? "e.g. iPhone 14 Pro" : "e.g. Rolex Datejust"} 
                                                                    value={item.title}
                                                                    onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
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
                                                                    />
                                                                    <Dropdown 
                                                                        label="Vehicle Model" 
                                                                        options={(item.make ? CAR_DATA[item.make] || [] : []).map(m => ({ label: m, value: m }))}
                                                                        value={item.model}
                                                                        onChange={(val) => handleItemChange(item.id, 'model', val)}
                                                                        disabled={!item.make}
                                                                    />
                                                                    <Input 
                                                                        label="Vehicle Year" 
                                                                        placeholder="2022" 
                                                                        type="number"
                                                                        value={item.year}
                                                                        onChange={(e) => handleItemChange(item.id, 'year', e.target.value)}
                                                                    />
                                                                    <div className="relative">
                                                                        <Input 
                                                                            label="Odometer" 
                                                                            placeholder="45000" 
                                                                            type="number"
                                                                            value={item.odometer}
                                                                            onChange={(e) => handleItemChange(item.id, 'odometer', e.target.value)}
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
                                                            />
                                                            <Input 
                                                                label="Requested Payout (€)" 
                                                                placeholder="0,00" 
                                                                type="number" 
                                                                value={item.requestedPayout}
                                                                onChange={(e) => handleItemChange(item.id, 'requestedPayout', e.target.value)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* --- Deal Metadata & Transport --- */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
                                            <h3 className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400 mb-8">Deal Metadata</h3>
                                            <div className="grid grid-cols-2 gap-8">
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

                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
                                            <h3 className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400 mb-8">Transport & Payout</h3>
                                            <div className="grid grid-cols-2 gap-8">
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
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
                                        <h3 className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400 mb-8">Additional Notes</h3>
                                        <TextArea 
                                            placeholder="e.g. Special handling for car keys, documents needed..." 
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-[800px] mx-auto w-full h-full pb-20">
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 min-h-fit flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h3 className="text-2xl font-bold text-[#17142B] mb-12 flex items-center justify-between">
                                            <span>
                                                {steps.find(s => s.id === activeStep)?.title}
                                            </span>
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                                Wizard: {items[activeItemIndex]?.category || 'Standard'} Flow
                                            </span>
                                        </h3>
                                        
                                        <div className="flex-1">
                                            {renderStepFields()}
                                        </div>

                                        {/* Next Item/Step Preview Footer */}
                                        {activeStep !== 'step1' && (activeStep !== 'step7' || activeItemIndex < items.length - 1) && (
                                            <div className="mt-20 pt-12 border-t border-gray-100 flex flex-col items-center">
                                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-300 mb-4">
                                                    {activeItemIndex < items.length - 1 ? 'Scroll for next item' : 'Keep scrolling for next step'}
                                                </p>
                                                <div className="flex items-center gap-4 opacity-40">
                                                    <div className="w-10 h-[1px] bg-gray-200" />
                                                    <span className="text-sm font-bold text-gray-400">
                                                        {activeItemIndex < items.length - 1 
                                                            ? `Item ${activeItemIndex + 2}: ${items[activeItemIndex + 1]?.title || 'Unknown'}` 
                                                            : `Next Step: ${steps[Math.max(0, steps.findIndex(s => s.id === activeStep)) + 1]?.title || 'Finish'}`}
                                                    </span>
                                                    <div className="w-10 h-[1px] bg-gray-200" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className={`bg-white border-l border-gray-100 flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${creationFinalized || activeStep === 'step1' ? 'w-[380px] opacity-100' : 'w-0 opacity-0'}`}>
                        {activeStep === 'step1' ? (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/50">
                                    <div className="flex items-center gap-2 m-0">
                                        <Package size={18} className="text-[#4649E5]" />
                                        <h3 className="text-sm font-bold text-[#17142B] uppercase tracking-wider m-0">Deal Summary</h3>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-[13px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Itemized Breakdown</span>
                                        </div>
                                        {items.map((item, idx) => (
                                            <div key={item.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-[13px] font-bold text-[#17142B] m-0">{item.title || `Item ${idx + 1}`}</p>
                                                        <p className="text-[11px] font-medium text-gray-400 m-0 uppercase tracking-tight">{item.category || 'Select Category'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[13px] font-bold text-[#17142B] m-0">€ {parseFloat(item.requestedPayout || '0').toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 m-0 uppercase">Requested</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500">Subtotal</span>
                                            <span className="text-sm font-bold text-[#17142B]">€ {formattedTotal}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500">Service Fees (est.)</span>
                                            <span className="text-sm font-bold text-gray-400">€ 0,00</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-100">
                                            <span className="text-base font-bold text-[#17142B]">Total Payout</span>
                                            <span className="text-xl font-extrabold text-[#4649E5]">€ {formattedTotal}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed m-0 text-center">
                                        Calculations are based on the current item values and conditions. Final payout may vary after verification.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex border-b border-gray-100 px-4">
                                    <button className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 ${sidebarTab === 'comments' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`} onClick={() => setSidebarTab('comments')}>
                                        <MessageSquare size={18} /> Comments
                                    </button>
                                    <button className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 ${sidebarTab === 'timeline' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`} onClick={() => setSidebarTab('timeline')}>
                                        <History size={18} /> Timeline
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                    <CommentItem initials="TW" name="Thomas Weber" time="09:15" text="Initial assessment complete. Waiting for documents." />
                                    <CommentItem initials="MS" name="Maria Schmidt" time="Yesterday" text="Customer requested cash payout." />
                                </div>
                                <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                                    <textarea placeholder="Add a comment..." className="w-full h-20 p-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none resize-none mb-3" />
                                    <Button variant="secondary" className="w-full justify-center font-bold">Post Comment</Button>
                                </div>
                            </>
                        )}
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
            <span className="text-[14px] font-bold text-[#17142B]">{value}</span>
        )}
    </div>
);

const CommentItem = ({ initials, name, time, text }: any) => (
    <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">{initials}</div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-[#17142B]">{name}</span>
                <span className="text-[11px] text-gray-400 font-medium">{time}</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed m-0">{text}</p>
        </div>
    </div>
);
