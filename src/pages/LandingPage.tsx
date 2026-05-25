import React, { useState, useEffect, useMemo } from 'react';
import { KanBanBoard } from '../components/Board/KanBanBoard';
import { KanBanDndProvider } from '../components/Board/KanBanDndProvider';
import { KanBanColumn } from '../components/Board/KanBanColumn';
import { ColumnHeader } from '../components/ColumnHeader/ColumnHeader';
import { DraggableDealCard } from '../components/Card/DraggableDealCard';
import type { DealData } from '../data/mockData';
import { TaskCardLarge, type TaskPriority } from '../components/TaskCard/TaskCardLarge';
import { TaskCreateCardLarge } from '../components/TaskCard/TaskCreateCardLarge';
import { useToast } from '../components/Toast/useToast';
import type { ColumnConfig } from '../components/Board/types';
import { ColumnConfigPanel } from '../components/Board/ColumnConfigPanel';
import { ConfirmationModal } from '../components/Modal/ConfirmationModal';
import { FilterDropdown } from '../components/KanbanFilterBar/FilterDropdown';
// @ts-expect-error canvas-confetti does not have TypeScript declaration files installed in this project
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';

interface TaskData {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    priority: TaskPriority;
    assignee: string;
}

interface BoardColumnWrapperProps {
    focused?: boolean;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

const BoardColumnWrapper: React.FC<BoardColumnWrapperProps> = ({ children, style }) => {
    return <div style={style}>{children}</div>;
};

const generateTaskId = () => `task-${Math.random().toString(36).substring(2, 7)}`;

// Collapsible Section Wrapper for mobile filter drawer
function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="content-stretch flex flex-col gap-0 items-start relative shrink-0 w-full last:border-b-0 border-b border-[var(--border-subtle)]" data-name="Section">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="bg-[var(--background-primary)] relative shrink-0 w-full cursor-pointer hover:bg-[var(--background-secondary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] text-left border-none"
                data-name="Section Header"
                aria-expanded={open}
            >
                <div className="flex flex-row items-center size-full">
                    <div className="content-stretch flex gap-[8px] items-center py-[16px] pl-[16px] pr-[16px] relative w-full">
                        <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Title">
                            <div className="relative shrink-0 size-[24px] flex items-center justify-center text-[var(--text-primary)]">
                                {open ? (
                                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                ) : (
                                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>
                            <div className="flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[var(--text-primary)] text-[15px] whitespace-nowrap">
                                <p className="leading-[1.4]">{title}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </button>
            {open && children && (
                <div className="relative shrink-0 w-full pb-[16px] pl-[16px] pr-[16px]">
                    <div className="content-stretch flex flex-col gap-[6px] items-stretch relative w-full">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}

// Multi-checkbox helper for mobile filter drawer
function MultiCheckboxFilter({
    options,
    selected,
    onChange,
    renderLabel,
}: {
    options: string[];
    selected: string[];
    onChange: (val: string[]) => void;
    renderLabel?: (val: string) => string;
}) {
    return (
        <div className="flex flex-col gap-[6px] w-full" role="group">
            {options.map(opt => {
                const checked = selected.includes(opt);
                const displayLabel = renderLabel ? renderLabel(opt) : opt;
                const handleKeyDown = (e: React.KeyboardEvent) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        if (checked) onChange(selected.filter(s => s !== opt));
                        else onChange([...selected, opt]);
                    }
                };

                return (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => {
                            if (checked) {
                                onChange(selected.filter(s => s !== opt));
                            } else {
                                onChange([...selected, opt]);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        className={`w-full h-[40px] relative rounded-[6px] shrink-0 border transition-all cursor-pointer flex flex-row items-center justify-between px-[12px] py-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] ${
                            checked
                                ? 'bg-[var(--background-brand-subtle)] border-[var(--border-brand)] hover:bg-[var(--background-brand-subtle-hover)]'
                                : 'bg-[var(--background-secondary)] border-[var(--border-subtle)] hover:bg-[var(--background-secondary-hover)] hover:border-[var(--border-brand-hover)]'
                        }`}
                    >
                        <div className="flex items-center gap-[10px]">
                            <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center shrink-0 transition-all ${
                                checked 
                                    ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white' 
                                    : 'border-[var(--border-subtle)] bg-[var(--background-primary)]'
                            }`}>
                                {checked && (
                                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <span className={`text-[13px] font-medium transition-colors ${
                                checked ? 'text-[var(--text-brand)] font-semibold' : 'text-[var(--text-primary)]'
                            }`}>{displayLabel}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

interface LandingPageProps {
    onSelectDeal: (deal: DealData) => void;
    selectedDealId?: string | null;
    dealsByColumn: Record<string, DealData[]>;
    columns: ColumnConfig[];
    onUpdateColumn: (updatedColumn: ColumnConfig) => void;
    onDeleteColumn: (columnId: string) => void;
    onAddColumn: (index: number) => string;
    onClearColumnsFocus?: () => void;
    onDealDragOver: (dealId: string, fromColumn: string, toColumn: string, toIndex: number) => void;
    onDealDragEnd: (columnId: string, oldIndex: number, newIndex: number) => void;
    onArchiveDeal?: (dealId: string) => void;
    onDragEndComplete?: (dealId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
    onSelectDeal, 
    selectedDealId, 
    dealsByColumn, 
    columns, 
    onUpdateColumn, 
    onDeleteColumn, 
    onAddColumn, 
    onClearColumnsFocus,
    onDealDragOver, 
    onDealDragEnd, 
    onArchiveDeal, 
    onDragEndComplete 
}) => {
    const [tasksByColumn, setTasksByColumn] = useState<Record<string, TaskData[]>>({});
    const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [activeConfigColumnId, setActiveConfigColumnId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [columnToDelete, setColumnToDelete] = useState<ColumnConfig | null>(null);
    const [deleteModalType, setDeleteModalType] = useState<'confirm' | 'warning'>('confirm');
    const { showToast } = useToast();

    // Landing page filter bar state
    const [searchQuery, setSearchQuery] = useState('');
    const [companyFilter, setCompanyFilter] = useState<string[]>([]);
    const [branchFilter, setBranchFilter] = useState<string[]>([]);
    const [businessAreaFilter, setBusinessAreaFilter] = useState<string[]>([]);
    const [dealTypeFilter, setDealTypeFilter] = useState<string[]>([]);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (companyFilter.length > 0) count++;
        if (branchFilter.length > 0) count++;
        if (businessAreaFilter.length > 0) count++;
        if (dealTypeFilter.length > 0) count++;
        return count;
    }, [companyFilter, branchFilter, businessAreaFilter, dealTypeFilter]);

    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Helper: derive priority level from a due date string
    const getPriorityFromDueDate = (dueDateStr?: string): { isHigh: boolean; priorityType: string } => {
        if (!dueDateStr || dueDateStr === 'No Date') return { isHigh: false, priorityType: 'Low' };
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Parse strings like "May 25" or "Jan 20"
        const months: Record<string, number> = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        };
        const parts = dueDateStr.trim().split(' ');
        let dueDate: Date | null = null;
        if (parts.length === 2) {
            const monthStr = parts[0].toLowerCase().slice(0, 3);
            const day = parseInt(parts[1], 10);
            if (monthStr in months && !isNaN(day)) {
                dueDate = new Date(today.getFullYear(), months[monthStr], day);
                // Handle year rollover (e.g. Jan dates while in Dec)
                if (dueDate.getTime() < today.getTime() - 30 * 24 * 60 * 60 * 1000) {
                    dueDate.setFullYear(today.getFullYear() + 1);
                }
            }
        }
        if (!dueDate) {
            const parsed = Date.parse(dueDateStr);
            if (!isNaN(parsed)) dueDate = new Date(parsed);
        }
        if (!dueDate) return { isHigh: false, priorityType: 'Low' };

        const dueTime = dueDate.getTime();
        if (dueTime <= today.getTime()) return { isHigh: true, priorityType: 'Highest' };
        if (dueTime <= tomorrow.getTime()) return { isHigh: false, priorityType: 'Medium' };
        return { isHigh: false, priorityType: 'Low' };
    };

    // Derive unique filter options from deals
    const filterOptions = useMemo(() => {
        const allDeals = Object.values(dealsByColumn).flat();
        const companies = ['all', ...Array.from(new Set(allDeals.map(d => d.countryCode).filter((c): c is string => !!c)))];
        const branches = ['all', ...Array.from(new Set(allDeals.map(d => d.branch).filter((b): b is string => !!b)))];
        const businessAreas = ['all', ...Array.from(new Set(allDeals.map(d => d.businessArea).filter((b): b is string => !!b)))];
        const dealTypes = ['all', ...Array.from(new Set(allDeals.map(d => d.dealType).filter((t): t is string => !!t)))];
        return { companies, branches, businessAreas, dealTypes };
    }, [dealsByColumn]);

    // Filtered deals per column
    const filteredDealsByColumn = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        const result: Record<string, DealData[]> = {};
        for (const colId in dealsByColumn) {
            result[colId] = dealsByColumn[colId].filter(deal => {
                if (q) {
                    const name = `${deal.firstName} ${deal.lastName}`.toLowerCase();
                    const id = deal.id.toLowerCase();
                    const items = (deal.items || []).join(' ').toLowerCase();
                    if (!name.includes(q) && !id.includes(q) && !items.includes(q)) return false;
                }
                if (companyFilter.length > 0 && !companyFilter.includes(deal.countryCode || '')) return false;
                if (branchFilter.length > 0 && !branchFilter.includes(deal.branch || '')) return false;
                if (businessAreaFilter.length > 0 && !businessAreaFilter.includes(deal.businessArea || '')) return false;
                if (dealTypeFilter.length > 0 && !dealTypeFilter.includes(deal.dealType || '')) return false;
                return true;
            });
        }
        return result;
    }, [dealsByColumn, searchQuery, companyFilter, branchFilter, businessAreaFilter, dealTypeFilter]);

    const handleAddColumn = (index: number) => {
        const newId = onAddColumn(index);
        if (newId) {
            showToast('New column added successfully.', 'success');
            // Confetti burst for micro-interaction delight!
            try {
                confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { y: 0.8 },
                    colors: ['#4649e5', '#60a5fa', '#34d399', '#f472b6']
                });
            } catch (err) {
                console.error('Failed to trigger confetti', err);
            }
        }
    };

    const handleArchive = (dealId: string) => {
        onArchiveDeal?.(dealId);
        showToast(`Deal #${dealId} archived successfully.`, 'success');
    };

    const handleAddTask = (columnId: string, data: { title: string; description: string; dueDate: Date }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(data.dueDate.getFullYear(), data.dueDate.getMonth(), data.dueDate.getDate());
        const diff = target.getTime() - today.getTime();
        
        let priority: TaskPriority = 'low';
        if (diff <= 0) priority = 'high';
        else if (diff <= 86400000) priority = 'medium';

        const newTask: TaskData = {
            id: generateTaskId(),
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
            priority,
            assignee: 'Admin'
        };

        setTasksByColumn(prev => ({
            ...prev,
            [columnId]: [newTask, ...(prev[columnId] || [])]
        }));
        setAddingToColumn(null);
    };

    const handleSaveTask = (columnId: string, taskId: string, data: { title: string; description: string; dueDate: Date }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(data.dueDate.getFullYear(), data.dueDate.getMonth(), data.dueDate.getDate());
        const diff = target.getTime() - today.getTime();
        
        let priority: TaskPriority = 'low';
        if (diff <= 0) priority = 'high';
        else if (diff <= 86400000) priority = 'medium';

        setTasksByColumn(prev => ({
            ...prev,
            [columnId]: (prev[columnId] || []).map(t => t.id === taskId ? {
                ...t,
                title: data.title,
                description: data.description,
                dueDate: data.dueDate,
                priority
            } : t)
        }));
        setEditingTaskId(null);
        showToast('Task updated successfully.', 'success');
    };

    const handleDeleteTask = (columnId: string, taskId: string) => {
        setTasksByColumn(prev => ({
            ...prev,
            [columnId]: (prev[columnId] || []).filter(t => t.id !== taskId)
        }));
        showToast('Task deleted successfully.', 'success');
    };

    return (
        <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden relative" onClick={onClearColumnsFocus}>

            {/* ── Filter Bar (Desktop) ──────────────────────────────────────── */}
            <div
                className="hidden md:flex items-center gap-2.5 shrink-0 px-6 py-3 bg-[var(--background-primary)] border-b border-[var(--border-subtle)]"
                onClick={e => e.stopPropagation()}
            >
                {/* Search — mirrors Input.module.css .inputWrapper + .input */}
                <div
                    className="flex items-center min-h-[40px] border border-[var(--border-subtle)] rounded-[var(--radius-200,8px)] bg-[var(--background-primary)] w-[300px] shrink-0 overflow-hidden box-border transition-[border-color,box-shadow] duration-200 focus-within:border-[var(--border-focused)] focus-within:[box-shadow:0_0_0_2px_var(--background-primary),0_0_0_4px_var(--purple-200)] hover:not(:focus-within):border-[var(--border-primary-hover)]"
                    style={undefined}
                >
                    {/* Left icon — mirrors .leftIcon */}
                    <div className="flex items-center justify-center pl-[12px] pr-[4px] text-[var(--text-subtle)] shrink-0">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 1 1-13.333 0 6.667 6.667 0 0 1 13.333 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    {/* Input — mirrors .input */}
                    <input
                        id="kanban-search"
                        type="text"
                        placeholder="Search deals, customers, items…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="flex-1 border-none bg-transparent py-[var(--space-200,8px)] px-[var(--space-400,16px)] pl-0 text-[length:var(--body-size-large,14px)] text-[var(--text-primary)] w-full outline-none placeholder:text-[length:var(--body-size-medium,12px)] placeholder:text-[var(--text-subtlest)]"
                    />
                    {/* Clear button */}
                    {searchQuery && (
                        <div className="flex items-center justify-center pl-[4px] pr-[12px] text-[var(--text-subtle)] shrink-0">
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="flex items-center justify-center w-5 h-5 text-[var(--text-subtlest)] hover:text-[var(--text-primary)] transition-colors border-none bg-transparent p-0 cursor-pointer rounded"
                                aria-label="Clear search"
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Thin divider */}
                <div className="h-6 w-px bg-[var(--border-subtle)] shrink-0" aria-hidden="true" />

                {/* Company */}
                <FilterDropdown
                    id="kanban-company-filter"
                    placeholder="Company"
                    options={filterOptions.companies.filter(c => c !== 'all')}
                    selected={companyFilter}
                    onChange={setCompanyFilter}
                    renderLabel={v => v === 'AT' ? 'Cashy AT' : v === 'DE' ? 'Cashy DE' : v}
                    minWidth={118}
                />

                {/* Branch */}
                <FilterDropdown
                    id="kanban-branch-filter"
                    placeholder="Branch"
                    options={filterOptions.branches.filter(b => b !== 'all')}
                    selected={branchFilter}
                    onChange={setBranchFilter}
                    minWidth={106}
                />

                {/* Business Area */}
                <FilterDropdown
                    id="kanban-business-area-filter"
                    placeholder="Business Area"
                    options={filterOptions.businessAreas.filter(b => b !== 'all')}
                    selected={businessAreaFilter}
                    onChange={setBusinessAreaFilter}
                    minWidth={148}
                />

                {/* Deal Type */}
                <FilterDropdown
                    id="kanban-deal-type-filter"
                    placeholder="Deal Type"
                    options={filterOptions.dealTypes.filter(d => d !== 'all')}
                    selected={dealTypeFilter}
                    onChange={setDealTypeFilter}
                    minWidth={118}
                />

                {/* Clear all — only when filters are active */}
                {(searchQuery || companyFilter.length > 0 || branchFilter.length > 0 || businessAreaFilter.length > 0 || dealTypeFilter.length > 0) && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery('');
                            setCompanyFilter([]);
                            setBranchFilter([]);
                            setBusinessAreaFilter([]);
                            setDealTypeFilter([]);
                        }}
                        className="ml-auto shrink-0 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-error,#EF4444)] hover:text-[#DC2626] transition-colors border-none bg-transparent cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-[#FEF2F2]"
                        aria-label="Clear all filters"
                    >
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        Clear Filters
                    </button>
                )}
            </div>

            {/* ── Filter Bar (Mobile) ────────────────────────────────────────── */}
            <div
                className="flex md:hidden items-center gap-3 shrink-0 px-4 py-3 bg-[var(--background-primary)] border-b border-[var(--border-subtle)] w-full"
                onClick={e => e.stopPropagation()}
            >
                {/* Search — mirrors Input.module.css .inputWrapper + .input */}
                <div
                    className="flex flex-1 items-center min-h-[40px] border border-[var(--border-subtle)] rounded-[var(--radius-200,8px)] bg-[var(--background-primary)] overflow-hidden box-border transition-[border-color,box-shadow] duration-200 focus-within:border-[var(--border-focused)] focus-within:[box-shadow:0_0_0_2px_var(--background-primary),0_0_0_4px_var(--purple-200)] hover:not(:focus-within):border-[var(--border-primary-hover)]"
                >
                    {/* Left icon — mirrors .leftIcon */}
                    <div className="flex items-center justify-center pl-[12px] pr-[4px] text-[var(--text-subtle)] shrink-0">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 1 1-13.333 0 6.667 6.667 0 0 1 13.333 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    {/* Input — mirrors .input */}
                    <input
                        id="kanban-search-mobile"
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="flex-1 border-none bg-transparent py-[8px] px-[16px] pl-0 text-[14px] text-[var(--text-primary)] w-full outline-none placeholder:text-[12px] placeholder:text-[var(--text-subtlest)] font-semibold"
                    />
                    {/* Clear button */}
                    {searchQuery && (
                        <div className="flex items-center justify-center pl-[4px] pr-[12px] text-[var(--text-subtle)] shrink-0">
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="flex items-center justify-center w-5 h-5 text-[var(--text-subtlest)] hover:text-[var(--text-primary)] transition-colors border-none bg-transparent p-0 cursor-pointer rounded"
                                aria-label="Clear search"
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Filters button */}
                <button
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className={`h-10 px-3 text-xs font-extrabold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none ${
                        activeFiltersCount > 0
                            ? 'bg-[var(--background-brand-subtle)] border-[var(--border-brand)] text-[var(--text-brand)] font-black'
                            : 'bg-[var(--background-primary)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--background-secondary)]'
                    }`}
                >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className={activeFiltersCount > 0 ? 'text-[var(--text-brand)]' : 'text-[var(--text-subtle)]'}>
                        <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                        <span className="text-[10px] font-black bg-[var(--background-brand-solid)] text-white px-1.5 py-0.5 rounded-full leading-none animate-in scale-in duration-200">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile Filters Drawer Overlay */}
            {isFilterDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-45 transition-opacity md:hidden animate-in fade-in duration-200" 
                    onClick={() => setIsFilterDrawerOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className={`fixed inset-0 z-50 w-full bg-[var(--background-primary)] flex flex-col h-full overflow-hidden transition-transform duration-300 transform md:hidden ${
                isFilterDrawerOpen ? 'translate-y-0' : 'translate-y-full'
            }`} role="dialog" aria-label="Kanban filters drawer">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--background-secondary)] shrink-0">
                    <div className="flex items-center gap-2.5">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4h12M4 8h8M6 12h4" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span className="text-sm font-extrabold text-[var(--text-primary)]">Filters</span>
                    </div>
                    <div>
                        <button
                            onClick={() => setIsFilterDrawerOpen(false)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-[var(--background-secondary-hover)] rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] border-none bg-transparent"
                            aria-label="Close filters"
                        >
                            <X size={20} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
                        </button>
                    </div>
                </div>

                {/* Scrollable sections */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden slick-scrollbar">
                    {/* Company Filter */}
                    <FilterSection title="Company" defaultOpen={true}>
                        <MultiCheckboxFilter
                            options={filterOptions.companies.filter(c => c !== 'all')}
                            selected={companyFilter}
                            onChange={setCompanyFilter}
                            renderLabel={v => v === 'AT' ? 'Cashy AT' : v === 'DE' ? 'Cashy DE' : v}
                        />
                    </FilterSection>

                    {/* Branch Filter */}
                    <FilterSection title="Branch" defaultOpen={true}>
                        <MultiCheckboxFilter
                            options={filterOptions.branches.filter(b => b !== 'all')}
                            selected={branchFilter}
                            onChange={setBranchFilter}
                        />
                    </FilterSection>

                    {/* Business Area Filter */}
                    <FilterSection title="Business Area" defaultOpen={true}>
                        <MultiCheckboxFilter
                            options={filterOptions.businessAreas.filter(b => b !== 'all')}
                            selected={businessAreaFilter}
                            onChange={setBusinessAreaFilter}
                        />
                    </FilterSection>

                    {/* Deal Type Filter */}
                    <FilterSection title="Deal Type" defaultOpen={true}>
                        <MultiCheckboxFilter
                            options={filterOptions.dealTypes.filter(d => d !== 'all')}
                            selected={dealTypeFilter}
                            onChange={setDealTypeFilter}
                        />
                    </FilterSection>
                </div>

                {/* Mobile footer */}
                <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--background-secondary)] shrink-0 flex items-center justify-between gap-3">
                    <button
                        onClick={() => {
                            setCompanyFilter([]);
                            setBranchFilter([]);
                            setBusinessAreaFilter([]);
                            setDealTypeFilter([]);
                        }}
                        className="flex-1 h-11 text-xs font-semibold text-[var(--text-subtle)] bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--background-secondary-hover)] transition-all cursor-pointer focus:outline-none"
                    >
                        Clear Filters
                    </button>
                    <button
                        onClick={() => setIsFilterDrawerOpen(false)}
                        className="flex-1 h-11 text-xs font-semibold text-white bg-[var(--background-brand-solid)] hover:bg-[var(--background-brand-solid-hover)] rounded-lg transition-all cursor-pointer focus:outline-none"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {isLoading ? (
                    <div className="cashy-kanban-board animate-pulse select-none bg-[var(--background-secondary)]/50">
                        <div className="cashy-kanban-interaction-zone" />
                        {[1, 2, 3, 4].map(idx => (
                            <React.Fragment key={idx}>
                                <div className="cashy-kanban-column">
                                    <div className="cashy-kanban-column-header">
                                        <div className="flex items-center justify-between">
                                            <div className="h-5 w-28 bg-gray-200 rounded-md" />
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                                                <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cashy-kanban-column-body">
                                        {[1, 2].map(cardIdx => (
                                            <div key={cardIdx} className="task-card">
                                                <div className="task-card__row task-card__row--header">
                                                    <div className="task-card__meta">
                                                        <div className="h-3.5 w-16 bg-gray-200 rounded" />
                                                        <span aria-hidden="true">·</span>
                                                        <div className="h-3.5 w-10 bg-gray-200 rounded" />
                                                    </div>
                                                    <div className="h-4 w-4 bg-gray-200 rounded-full" />
                                                </div>
                                                <div className="task-card__row task-card__row--title">
                                                    <div className="h-4 w-5/6 bg-gray-200 rounded" />
                                                </div>
                                                <div className="task-card__row task-card__row--description">
                                                    <div className="h-3.5 w-4/6 bg-gray-100 rounded" />
                                                </div>
                                                <div className="flex gap-1.5 mt-1">
                                                    <div className="h-4 w-12 bg-gray-100 rounded-full" />
                                                    <div className="h-4 w-10 bg-gray-100 rounded-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="cashy-kanban-interaction-zone" />
                            </React.Fragment>
                        ))}
                    </div>
                ) : (
                    <KanBanDndProvider onDealDragOver={onDealDragOver} onDealDragEnd={onDealDragEnd} dealsByColumn={filteredDealsByColumn} onDragEndComplete={onDragEndComplete}>
                    <KanBanBoard onAddColumn={handleAddColumn} className="animate-in fade-in duration-500">
                    {columns.map((column) => {
                        const deals = filteredDealsByColumn[column.id] || [];
                        const tasks = tasksByColumn[column.id] || [];

                        // Show column if it is a custom column, has deals, has tasks, or is being configured/edited
                        const isInitialColumn = [
                            'car-inbox', 'call-attempt', 'send-documents', 'data-received', 
                            'price-research', 'waiting-documents', 'final-control', 
                            'appointment', 'payout-storage', 'archive'
                        ].includes(column.id);

                        if (isInitialColumn && 
                            deals.length === 0 && 
                            tasks.length === 0 && 
                            addingToColumn !== column.id && 
                            activeConfigColumnId !== column.id
                        ) {
                            return null;
                        }

                        const isConfigActive = activeConfigColumnId === column.id;

                        return (
                            <BoardColumnWrapper key={column.id} focused={column.focused} style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                                {/* Top color strip */}
                                {column.color && (
                                    <div 
                                        style={{ 
                                            height: '6px', 
                                            backgroundColor: column.color, 
                                            width: '100%',
                                            flexShrink: 0
                                        }} 
                                    />
                                )}

                                <div className="cashy-kanban-column-header">
                                    <ColumnHeader
                                        title={column.title}
                                        count={(deals.length + (tasksByColumn[column.id]?.length || 0))}
                                        variant="admin"
                                        isConfigActive={isConfigActive}
                                        isAddActive={addingToColumn === column.id}
                                        onConfigClick={() => {
                                            if (isConfigActive) {
                                                setActiveConfigColumnId(null);
                                            } else {
                                                setActiveConfigColumnId(column.id);
                                                setAddingToColumn(null); // close add form when opening config
                                            }
                                        }}
                                        onAddClick={() => {
                                            if (addingToColumn === column.id) {
                                                setAddingToColumn(null); // toggle off
                                            } else {
                                                setAddingToColumn(column.id);
                                                setActiveConfigColumnId(null); // close config when opening add
                                            }
                                        }}
                                    />
                                </div>

                                {isConfigActive ? (
                                    <ColumnConfigPanel
                                        column={column}
                                        onChange={onUpdateColumn}
                                        onClose={() => setActiveConfigColumnId(null)}
                                        disableDelete={column.id === columns[0]?.id}
                                        onDelete={() => {
                                            const deals = dealsByColumn[column.id] || [];
                                            setColumnToDelete(column);
                                            if (deals.length > 0) {
                                                setDeleteModalType('warning');
                                            } else {
                                                setDeleteModalType('confirm');
                                            }
                                            setIsDeleteModalOpen(true);
                                        }}
                                    />
                                ) : (
                                    <KanBanColumn id={column.id} dealIds={deals.map(d => d.id)}>
                                        {addingToColumn === column.id && (
                                            <TaskCreateCardLarge
                                                onAdd={(data) => handleAddTask(column.id, data)}
                                                onCancel={() => setAddingToColumn(null)}
                                            />
                                        )}

                                        {tasksByColumn[column.id]?.map(task => (
                                            editingTaskId === task.id ? (
                                                <TaskCreateCardLarge
                                                    key={task.id}
                                                    initialTitle={task.title}
                                                    initialDescription={task.description}
                                                    initialDueDate={task.dueDate}
                                                    headerTitle="Editing task"
                                                    submitLabel="Save"
                                                    onAdd={(data) => handleSaveTask(column.id, task.id, data)}
                                                    onCancel={() => setEditingTaskId(null)}
                                                />
                                            ) : (
                                                <TaskCardLarge
                                                    key={task.id}
                                                    taskId={task.id.replace('task-', '')}
                                                    title={task.title}
                                                    description={task.description}
                                                    dueDate={task.dueDate}
                                                    priority={task.priority}
                                                    assignee={task.assignee}
                                                    onEdit={() => setEditingTaskId(task.id)}
                                                    onDelete={() => handleDeleteTask(column.id, task.id)}
                                                />
                                            )
                                        ))}

                                        {deals.map(deal => {
                                            const dueDateStr = deal.dueDate || deal.appointmentDate || 'No Date';
                                            const { isHigh, priorityType } = getPriorityFromDueDate(dueDateStr);

                                            return (
                                                <DraggableDealCard
                                                    key={deal.id}
                                                    dealId={deal.id}
                                                    bookingNo={`#${deal.id}`}
                                                    customerName={`${deal.firstName} ${deal.lastName}`}
                                                    amount={deal.amount || ''}
                                                    dueDate={dueDateStr}
                                                    priority={isHigh}
                                                    priorityType={priorityType as "Highest" | "Medium" | "Low"}
                                                    shopLabelCountry={deal.countryCode}
                                                    shopLabelBranch={deal.branch}
                                                    items={deal.items}
                                                    categories={[deal.businessArea || 'General']}
                                                    state={deal.id === selectedDealId ? "Selected" : "Default"}
                                                    onClick={() => onSelectDeal(deal)}
                                                    onArchive={() => handleArchive(deal.id)}
                                                />
                                            );
                                        })}
                                    </KanBanColumn>
                                )}
                            </BoardColumnWrapper>
                        );
                    })}
                </KanBanBoard>
                </KanBanDndProvider>
                )}
            </div>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={deleteModalType === 'warning' ? "Cannot Delete Column" : "Delete Column"}
                description={
                    deleteModalType === 'warning'
                        ? "This column contains active deal cards. You must move all deals in this column to another column first in order to delete it."
                        : `Are you sure you want to delete the column "${columnToDelete?.title}"? All tasks in this column will be permanently deleted. This action cannot be undone.`
                }
                variant={deleteModalType === 'warning' ? "warning" : "danger"}
                confirmText={deleteModalType === 'warning' ? "I Understand" : "Delete Column"}
                cancelText="Cancel"
                onConfirm={() => {
                    if (columnToDelete) {
                        onDeleteColumn(columnToDelete.id);
                        setActiveConfigColumnId(null);
                        setIsDeleteModalOpen(false);
                        setColumnToDelete(null);
                    }
                }}
            />
        </div>
    );
};
