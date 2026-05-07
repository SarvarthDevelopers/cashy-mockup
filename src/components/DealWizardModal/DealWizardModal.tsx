import React, { useState, useEffect } from 'react';
import { Package, MessageSquare, History, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Button } from '../Button/Button';
import { ShopLabel } from '../Card/ShopLabel';
import type { DealData } from '../../data/mockData';
import { MOCK_WIZARDS, GLOBAL_STEPS } from '../../data/wizardData';

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
    const [dealMode] = useState<'Pawn' | 'Purchase'>('Pawn');
    const [items, setItems] = useState<any[]>([
        { id: '1', category: 'Car', title: '', requestedPayout: '', condition: '', vin: '', expanded: true }
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
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        customer: true,
        metadata: true,
        transport: true,
        notes: true,
        items: true
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

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), category: '', title: '', requestedPayout: '', condition: '', expanded: true }]);
    };

    const removeItem = (id: string) => {
        if (items.length <= 1) return;
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: string, field: string, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
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
                    <div key={field.id} className={field.type === 'checkbox' ? 'col-span-2' : ''}>
                        {field.type === 'checkbox' ? (
                            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50 cursor-pointer hover:border-blue-200 transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#4649E5] focus:ring-[#4649E5]" />
                                <span className="text-[13px] font-bold text-gray-700">{field.label}</span>
                            </label>
                        ) : field.type === 'select' ? (
                            <SelectField label={field.label} options={field.options || []} />
                        ) : (
                            <InputField label={field.label} placeholder={field.placeholder} type={field.type} />
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
                                <div>
                                    <h2 className="text-xl font-bold m-0 leading-tight" style={{ color: 'var(--brand-500)' }}>New Deal Creation</h2>
                                    <p className="text-sm font-medium m-0" style={{ color: 'var(--gray-400)' }}>Initialize basic deal information and customer records</p>
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
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pr-12 scroll-smooth" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                            {steps.map((s, idx) => (
                                <React.Fragment key={s.id}>
                                    <StepItem 
                                        number={String(idx + 1).padStart(2, '0')} 
                                        title={s.title} 
                                        active={activeStep === s.id} 
                                        disabled={s.id !== 'step1' && !isCreated} 
                                        onClick={() => (s.id === 'step1' || isCreated) && setActiveStep(s.id)} 
                                    />
                                    {idx < steps.length - 1 && <ChevronRight size={14} className="text-gray-300 shrink-0" />}
                                </React.Fragment>
                            ))}
                        </div>
                        {/* Gradient Mask for Horizontal Scroll */}
                        <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-r from-transparent to-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                            {creationFinalized ? (
                                <>
                                    <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" style={{ color: 'var(--brand-500)' }}>
                                        <div className="w-5 h-5 border-2 rounded-[4px] relative" style={{ borderColor: 'var(--brand-500)' }}>
                                            <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5" style={{ backgroundColor: 'var(--brand-500)' }} />
                                        </div>
                                    </button>
                                    <Button variant="secondary" size="small" className="h-10 px-5 font-bold border-gray-200" style={{ color: 'var(--brand-500)' }}>Payback</Button>
                                    <Button variant="secondary" size="small" className="h-10 px-5 font-bold border-gray-200" style={{ color: 'var(--brand-500)' }}>Extend</Button>
                                    {activeStep === 'step1' && !isCreated ? (
                                        <Button 
                                            variant="primary" 
                                            size="small" 
                                            className="h-10 px-8 border-none font-bold" 
                                            style={{ backgroundColor: 'var(--brand-500)' }} 
                                            onClick={() => setActiveStep('step2')}
                                        >
                                            Save and Continue
                                        </Button>
                                    ) : (
                                        <Button variant="primary" size="small" className="h-10 px-6 font-bold border-none" style={{ backgroundColor: 'var(--brand-500)' }} onClick={onClose}>Close</Button>
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
                                <div className="max-w-[1200px] mx-auto grid grid-cols-2 gap-8 items-start pb-20">
                                    <div className="space-y-6">
                                        <Section title="Customer" expanded={expandedSections.customer} onToggle={() => toggleSection('customer')}>
                                            <div className="space-y-6 pt-2">
                                                <div className="flex gap-4">
                                                    {['Registered', 'Guest', 'Create New'].map(mode => (
                                                        <label key={mode} className="flex items-center gap-2 cursor-pointer group" onClick={() => setCustomerData({...customerData, mode})}>
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${customerData.mode === mode ? 'border-[#4649E5] bg-blue-50' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                                                {customerData.mode === mode && <div className="w-2 h-2 rounded-full bg-[#4649E5]" />}
                                                            </div>
                                                            <span className={`text-[13px] font-bold ${customerData.mode === mode ? 'text-[#17142B]' : 'text-gray-400'}`}>{mode}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputField 
                                                        label="Email Address *" 
                                                        placeholder="customer@example.com" 
                                                        type="email" 
                                                        value={customerData.email}
                                                        onChange={(e: any) => setCustomerData({...customerData, email: e.target.value})}
                                                    />
                                                    <InputField 
                                                        label="Phone Number" 
                                                        placeholder="+43 660 123 456" 
                                                        type="tel" 
                                                        value={customerData.phone}
                                                        onChange={(e: any) => setCustomerData({...customerData, phone: e.target.value})}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 text-[#4649E5] text-[13px] font-bold cursor-pointer hover:underline w-fit">
                                                    <Plus size={14} /> Add Secondary Customer
                                                </div>
                                            </div>
                                        </Section>

                                        <Section title="Deal Metadata" expanded={expandedSections.metadata} onToggle={() => toggleSection('metadata')}>
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <SelectField 
                                                    label="Company *" 
                                                    options={['CASHY_AUT', 'CASHY_GER']} 
                                                    value={metadata.company}
                                                    onChange={(e: any) => setMetadata({...metadata, company: e.target.value})}
                                                />
                                                <SelectField 
                                                    label="Branch / Shop *" 
                                                    options={['Vienna Main', 'Graz South']} 
                                                    value={metadata.branch}
                                                    onChange={(e: any) => setMetadata({...metadata, branch: e.target.value})}
                                                />
                                                <InputField 
                                                    label="Duration (Days)" 
                                                    placeholder="90" 
                                                    type="number" 
                                                    value={metadata.duration}
                                                    onChange={(e: any) => setMetadata({...metadata, duration: e.target.value})}
                                                />
                                                <InputField 
                                                    label="Due Date *" 
                                                    type="date" 
                                                    value={metadata.dueDate}
                                                    onChange={(e: any) => setMetadata({...metadata, dueDate: e.target.value})}
                                                />
                                            </div>
                                        </Section>

                                        <Section title="Transport & Storage" expanded={expandedSections.transport} onToggle={() => toggleSection('transport')}>
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <SelectField label="Method" options={['Pickup: SHOP', 'Courier']} />
                                                <SelectField label="Payout Method" options={['Cash', 'Bank Transfer', 'PayPal']} />
                                            </div>
                                        </Section>

                                        <Section title="Additional Notes" expanded={expandedSections.notes} onToggle={() => toggleSection('notes')}>
                                            <div className="pt-2">
                                                <textarea placeholder="e.g. Special handling for car keys..." className="w-full h-24 p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600 bg-white resize-none" />
                                            </div>
                                        </Section>
                                    </div>

                                    {/* Column 2: Items & Summary */}
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                            <div className="flex items-center justify-between p-4 border-b border-gray-50">
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider m-0">Items ({items.length})</h3>
                                            </div>
                                            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                                                {items.map((item, index) => (
                                                    <div key={item.id} className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors">
                                                        <div className="flex items-center justify-between p-4 bg-white cursor-pointer" onClick={() => toggleItem(item.id)}>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400">#{index + 1}</div>
                                                                <div>
                                                                    <p className="text-[13px] font-bold text-gray-900 m-0">{item.title || 'New Item'}</p>
                                                                    <p className="text-[11px] text-gray-400 m-0 font-medium uppercase tracking-tighter">{item.category || 'Select Type'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {item.expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                                                                <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {item.expanded && (
                                                            <div className="p-4 pt-0 border-t border-gray-50">
                                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                                    <SelectField 
                                                                        label="Category *" 
                                                                        options={['Car', 'Watches', 'General Electronics', 'Luxury']} 
                                                                        value={item.category}
                                                                        onChange={(e: any) => handleItemChange(item.id, 'category', e.target.value)}
                                                                    />
                                                                    <InputField 
                                                                        label="VIN / Serial Number" 
                                                                        placeholder="Enter ID..." 
                                                                        value={item.vin}
                                                                        onChange={(e: any) => handleItemChange(item.id, 'vin', e.target.value)}
                                                                    />
                                                                    <InputField 
                                                                        label="Item Title *" 
                                                                        placeholder="e.g. Rolex Datejust" 
                                                                        value={item.title}
                                                                        onChange={(e: any) => handleItemChange(item.id, 'title', e.target.value)}
                                                                    />
                                                                    <SelectField 
                                                                        label="Condition *" 
                                                                        options={['New', 'Used', 'Worn']} 
                                                                        value={item.condition}
                                                                        onChange={(e: any) => handleItemChange(item.id, 'condition', e.target.value)}
                                                                    />
                                                                    <div className="col-span-2">
                                                                        <InputField 
                                                                            label="Requested Payout (€) *" 
                                                                            placeholder="1500" 
                                                                            type="number" 
                                                                            value={item.requestedPayout}
                                                                            onChange={(e: any) => handleItemChange(item.id, 'requestedPayout', e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                <div 
                                                    className="flex items-center gap-2 text-[#4649E5] text-[13px] font-bold cursor-pointer hover:underline w-fit pt-2"
                                                    onClick={addItem}
                                                >
                                                    <Plus size={14} /> Add Item
                                                </div>
                                            </div>
                                        </div>

                                        
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-[1400px] mx-auto w-full h-full">
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 min-h-full flex flex-col">
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
                    <div className={`bg-white border-l border-gray-100 flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${creationFinalized ? 'w-[380px] opacity-100' : 'w-0 opacity-0'}`}>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

const StepItem = ({ number, title, active, disabled, onClick }: any) => (
    <div 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shrink-0 whitespace-nowrap ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
        style={{ 
            backgroundColor: active ? 'var(--brand-500)' : 'transparent',
            color: active ? 'var(--white)' : 'var(--gray-400)',
            boxShadow: active ? 'var(--shadow-md)' : 'none'
        }}
    >
        <span className="text-[11px] font-bold opacity-60">{number}</span>
        <span className="text-[13px] font-bold">{title}</span>
    </div>
);

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

const ChevronRight = ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6"/>
    </svg>
);

const Section = ({ title, children, expanded, onToggle }: any) => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <h3 className="text-[12px] font-bold text-[#17142B] uppercase tracking-wider m-0">{title}</h3>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expanded && <div className="p-4 pt-0 border-t border-gray-50">{children}</div>}
    </div>
);

const InputField = ({ label, ...props }: any) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{label}</label>
        <input {...props} className="h-10 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4649E5] bg-white transition-all focus:ring-4 focus:ring-blue-600/5 shadow-sm" />
    </div>
);

const SelectField = ({ label, options, value, onChange }: any) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{label}</label>
        <select 
            value={value}
            onChange={onChange}
            className="h-10 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4649E5] bg-white transition-all focus:ring-4 focus:ring-blue-600/5 shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat"
        >
            {options.map((opt: string) => <option key={opt}>{opt}</option>)}
        </select>
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
