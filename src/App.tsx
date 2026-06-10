import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router';
import { arrayMove } from '@dnd-kit/sortable';
import { LandingPage } from './pages/LandingPage';
import { WizardBuilderPage } from './pages/AdminBuilderPage';
import { DealsPage } from './pages/DealsPage';
import { ItemsPage } from './pages/ItemsPage';
import { CustomersPage } from './pages/CustomersPage';
import { OrgSettingsPage } from './pages/OrgSettingsPage';
import { CashbookDashboard } from './pages/CashbookDashboard';
import { Header } from './components/Header/Header';
import { DealWizardModal } from './components/DealWizardModal/DealWizardModal';
import { ExtendDealModal } from './components/ExtendDealModal/ExtendDealModal';
import { PaybackDealModal } from './components/PaybackDealModal/PaybackDealModal';
import { ToastProvider } from './components/Toast/ToastContext';
import { PWAInstallPrompt } from './components/PWAInstallPrompt/PWAInstallPrompt';
import { INITIAL_DEALS } from './data/mockData';
import type { DealData } from './data/mockData';
import type { ColumnConfig } from './components/Board/types';
import { getBusinessAreaForDeal } from './data/businessAreaMapping';

const INITIAL_COLUMNS: ColumnConfig[] = [
  { id: 'car-inbox', title: 'Inbox', color: '#15B8A7', sortBy: 'dueDate', sortOrder: 'desc', visibleToPartners: true, visibleToShops: ['AT / Wein', 'AT / Graz', 'DE / Berlin'] },
  { id: 'call-attempt', title: 'Call Attempt', color: '#15B8A7', sortBy: 'dueDate', sortOrder: 'desc', visibleToPartners: true, visibleToShops: ['AT / Wein', 'AT / Graz', 'DE / Berlin'] },
  { id: 'send-documents', title: 'Send Documents', color: '#EF4544', sortBy: 'dueDate', sortOrder: 'desc', visibleToPartners: true, visibleToShops: ['AT / Wein', 'AT / Graz', 'DE / Berlin'] },
  { id: 'data-received', title: 'Data Received', color: '#CA8B04', sortBy: 'dueDate', sortOrder: 'desc', visibleToPartners: true, visibleToShops: ['AT / Wein', 'AT / Graz', 'DE / Berlin'] },
  { id: 'price-research', title: 'Request Approval', color: '#CA8B04', sortBy: 'dueDate', sortOrder: 'desc', visibleToPartners: true, visibleToShops: ['AT / Wein', 'AT / Graz', 'DE / Berlin'] },
  { id: 'waiting-documents', title: 'Waiting for Documents', color: '#EF4544', sortBy: 'dueDate', sortOrder: 'desc', visibleToPartners: true, visibleToShops: ['AT / Wein', 'AT / Graz', 'DE / Berlin'] },
  { id: 'final-control', title: 'Final Control', color: '#167BDA', sortBy: 'dueDate', sortOrder: 'desc', visibleToPartners: true, visibleToShops: ['AT / Wein', 'AT / Graz', 'DE / Berlin'] },
  { id: 'appointment', title: 'Appointment', color: '#167BDA', sortBy: 'dueDate', sortOrder: 'desc', visibleToPartners: true, visibleToShops: ['AT / Wein', 'AT / Graz', 'DE / Berlin'] },
  { id: 'payout-storage', title: 'Ready for Payout / Storage', color: '#6366F1', sortBy: 'dueDate', sortOrder: 'desc', visibleToPartners: true, visibleToShops: ['AT / Wein', 'AT / Graz', 'DE / Berlin'] },
  { id: 'archive', title: 'Archive', color: '#6366F1', sortBy: 'dueDate', sortOrder: 'desc', visibleToPartners: true, visibleToShops: ['AT / Wein', 'AT / Graz', 'DE / Berlin'] }
];

const parseDealDate = (dateStr?: string): Date => {
  if (!dateStr || dateStr === 'No Date') {
    return new Date(2099, 11, 31);
  }

  // Handle YYYY-MM-DD as local date to stay consistent with other local dates
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const parts = dateStr.split(' ');
  if (parts.length === 2) {
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const monthStr = parts[0].toLowerCase().slice(0, 3);
    const day = parseInt(parts[1], 10);
    if (monthStr in months && !isNaN(day)) {
      return new Date(2026, months[monthStr], day);
    }
  }
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return new Date(parsed);
  return new Date(2099, 11, 31);
};

const parseDealAmount = (amountStr?: string): number => {
  if (!amountStr) return 0;
  const clean = amountStr.replace(/,/g, '').replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

const sortDealsForColumn = (deals: DealData[], sortBy: string, sortOrder: 'asc' | 'desc'): DealData[] => {
  if (sortBy === 'manual') return deals;
  
  return [...deals].sort((a, b) => {
    let valA: number | string;
    let valB: number | string;
    
    if (sortBy === 'dueDate') {
      const dateA = parseDealDate(a.dueDate || a.appointmentDate);
      const dateB = parseDealDate(b.dueDate || b.appointmentDate);
      valA = dateA.getTime();
      valB = dateB.getTime();
    } else if (sortBy === 'amount') {
      valA = parseDealAmount(a.amount);
      valB = parseDealAmount(b.amount);
    } else if (sortBy === 'customerName') {
      valA = `${a.firstName} ${a.lastName}`.toLowerCase();
      valB = `${b.firstName} ${b.lastName}`.toLowerCase();
    } else if (sortBy === 'id') {
      valA = a.id;
      valB = b.id;
    } else {
      return 0;
    }
    
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isPaybackModalOpen, setIsPaybackModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<DealData | null>(null);
  const [isNewDeal, setIsNewDeal] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  
  const [dealsByColumn, setDealsByColumn] = useState<Record<string, DealData[]>>(() => {
    const sorted = JSON.parse(JSON.stringify(INITIAL_DEALS)) as Record<string, DealData[]>;

    // Dynamically seed due dates so priorities reflect real time
    const todayDate = new Date();
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fmtDate = (d: Date) => `${monthNames[d.getMonth()]} ${d.getDate()}`;
    const todayStr = fmtDate(todayDate);
    const tomorrowStr = fmtDate(tomorrowDate);

    for (const colId in sorted) {
      sorted[colId] = sorted[colId].map(deal => {
        const area = getBusinessAreaForDeal(deal.items);
        let dueDate = deal.dueDate;
        if (deal.id === '000001') dueDate = todayStr;
        if (deal.id === '000002') dueDate = tomorrowStr;
        return {
          ...deal,
          dueDate,
          businessArea: area,
          wizardData: {
            ...deal.wizardData,
            businessArea: area,
            categoryPath: `${area} > ${deal.wizardData?.item || 'General'}`
          }
        };
      });
    }
    INITIAL_COLUMNS.forEach(col => {
      if (sorted[col.id] && col.sortBy && col.sortBy !== 'manual') {
        sorted[col.id] = sortDealsForColumn(sorted[col.id], col.sortBy, col.sortOrder || 'desc');
      }
    });
    return sorted;
  });

  useEffect(() => {
    const handleUpdate = () => {
      setDealsByColumn(prev => {
        const next = { ...prev };
        for (const colId in next) {
          next[colId] = next[colId].map(deal => {
            const area = getBusinessAreaForDeal(deal.items);
            return {
              ...deal,
              businessArea: area,
              wizardData: {
                ...deal.wizardData,
                businessArea: area,
                categoryPath: `${area} > ${deal.wizardData?.item || 'General'}`
              }
            };
          });
        }
        return next;
      });
    };
    window.addEventListener('cashy_business_areas_updated', handleUpdate);
    return () => window.removeEventListener('cashy_business_areas_updated', handleUpdate);
  }, []);

  const justDraggedRef = useRef(false);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (isModalOpen) return;
      if (justDraggedRef.current) return;

      const target = e.target as HTMLElement;
      if (target.closest('.deal-card')) {
        return;
      }

      setSelectedDeal(null);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isModalOpen]);

  const handleDragEndComplete = (dealId: string) => {
    justDraggedRef.current = true;
    setTimeout(() => {
      justDraggedRef.current = false;
    }, 100);

    let foundDeal: DealData | null = null;
    let foundColumnId: string | null = null;
    for (const colId in dealsByColumn) {
      const deal = dealsByColumn[colId].find(d => d.id === dealId);
      if (deal) {
        foundDeal = deal;
        foundColumnId = colId;
        break;
      }
    }

    if (foundColumnId) {
      setDealsByColumn(prev => {
        const colConfig = columns.find(c => c.id === foundColumnId);
        if (colConfig && colConfig.sortBy && colConfig.sortBy !== 'manual') {
          const sorted = sortDealsForColumn(prev[foundColumnId!], colConfig.sortBy, colConfig.sortOrder || 'desc');
          return {
            ...prev,
            [foundColumnId!]: sorted
          };
        }
        return prev;
      });
    }

    if (foundDeal) {
      setSelectedDeal(foundDeal);
    }
  };

  const handleCreateDeal = () => {
    setIsNewDeal(true);
    setSelectedDeal(null);
    setIsModalOpen(true);
  };

  const handleSelectDeal = (deal: DealData) => {
    setIsNewDeal(false);
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const handleExtendDeal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setIsExtendModalOpen(true);
    }, 150);
  };

  const handlePaybackDeal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setIsPaybackModalOpen(true);
    }, 150);
  };

  const handleDealDragOver = (dealId: string, fromColumn: string, toColumn: string, toIndex: number) => {
    setDealsByColumn(prev => {
      const sourceDeals = prev[fromColumn] || [];
      const targetDeals = prev[toColumn] || [];
      
      const dealIndex = sourceDeals.findIndex(d => d.id === dealId);
      if (dealIndex === -1) return prev;
      
      const deal = sourceDeals[dealIndex];
      const newSourceDeals = sourceDeals.filter(d => d.id !== dealId);
      const newTargetDeals = [
        ...targetDeals.slice(0, toIndex),
        deal,
        ...targetDeals.slice(toIndex)
      ];

      return {
        ...prev,
        [fromColumn]: newSourceDeals,
        [toColumn]: newTargetDeals
      };
    });
  };

  const handleDealDragEnd = (columnId: string, oldIndex: number, newIndex: number) => {
    setDealsByColumn(prev => {
      const deals = prev[columnId] || [];
      if (!deals.length) return prev;
      let newDeals = oldIndex === newIndex ? deals : arrayMove(deals, oldIndex, newIndex);
      
      const colConfig = columns.find(c => c.id === columnId);
      if (colConfig && colConfig.sortBy && colConfig.sortBy !== 'manual') {
        newDeals = sortDealsForColumn(newDeals, colConfig.sortBy, colConfig.sortOrder || 'desc');
      }

      return {
        ...prev,
        [columnId]: newDeals
      };
    });
  };

  const handleUpdateDeal = (updatedDeal: DealData) => {
    const resolvedArea = getBusinessAreaForDeal(updatedDeal.items);
    const resolvedDeal = {
      ...updatedDeal,
      businessArea: resolvedArea,
      wizardData: {
        ...updatedDeal.wizardData,
        businessArea: resolvedArea,
        categoryPath: `${resolvedArea} > ${updatedDeal.wizardData?.item || 'General'}`
      }
    };

    setDealsByColumn(prev => {
      const newDeals = { ...prev };
      let foundColId: string | null = null;
      let dealIndex = -1;
      
      for (const colId in newDeals) {
        const idx = newDeals[colId].findIndex(d => d.id === resolvedDeal.id);
        if (idx !== -1) {
          foundColId = colId;
          dealIndex = idx;
          break;
        }
      }

      if (foundColId !== null && dealIndex !== -1) {
        const isClosed = resolvedDeal.specialNote?.startsWith('PAYBACK_META:');
        const isPayedAndStored = resolvedDeal.status === 'PAYED_AND_STORED';
        if ((isClosed || isPayedAndStored) && foundColId !== 'archive') {
          // Remove from old column
          newDeals[foundColId] = newDeals[foundColId].filter(d => d.id !== resolvedDeal.id);
          // Add to archive
          newDeals['archive'] = [resolvedDeal, ...(newDeals['archive'] || [])];
          const colConfig = columns.find(c => c.id === 'archive');
          if (colConfig && colConfig.sortBy && colConfig.sortBy !== 'manual') {
            newDeals['archive'] = sortDealsForColumn(newDeals['archive'], colConfig.sortBy, colConfig.sortOrder || 'desc');
          }
        } else {
          // Update in place
          const updatedCol = [...newDeals[foundColId]];
          updatedCol[dealIndex] = resolvedDeal;
          newDeals[foundColId] = updatedCol;
          const colConfig = columns.find(c => c.id === foundColId);
          if (colConfig && colConfig.sortBy && colConfig.sortBy !== 'manual') {
            newDeals[foundColId] = sortDealsForColumn(newDeals[foundColId], colConfig.sortBy, colConfig.sortOrder || 'desc');
          }
        }
      }
      return newDeals;
    });
    setSelectedDeal(resolvedDeal);
  };

  const handleCreateDealSuccess = (newDeal: DealData) => {
    const resolvedArea = getBusinessAreaForDeal(newDeal.items);
    const resolvedDeal = {
      ...newDeal,
      businessArea: resolvedArea,
      wizardData: {
        ...newDeal.wizardData,
        businessArea: resolvedArea,
        categoryPath: `${resolvedArea} > ${newDeal.wizardData?.item || 'General'}`
      }
    };

    setDealsByColumn(prev => {
      let newInboxDeals = [resolvedDeal, ...(prev['car-inbox'] || [])];
      const colConfig = columns.find(c => c.id === 'car-inbox');
      if (colConfig && colConfig.sortBy && colConfig.sortBy !== 'manual') {
        newInboxDeals = sortDealsForColumn(newInboxDeals, colConfig.sortBy, colConfig.sortOrder || 'desc');
      }
      return {
        ...prev,
        'car-inbox': newInboxDeals
      };
    });
    setSelectedDeal(resolvedDeal);
    setIsNewDeal(false);
  };

  const handleArchiveDeal = (dealId: string) => {
    setDealsByColumn(prev => {
      const newDeals = { ...prev };
      let dealToArchive: DealData | null = null;
      for (const colId in newDeals) {
        const index = newDeals[colId].findIndex(d => d.id === dealId);
        if (index !== -1) {
          dealToArchive = newDeals[colId][index];
          newDeals[colId] = newDeals[colId].filter(d => d.id !== dealId);
          break;
        }
      }
      if (dealToArchive) {
        let newArchiveDeals = [dealToArchive, ...(newDeals['archive'] || [])];
        const colConfig = columns.find(c => c.id === 'archive');
        if (colConfig && colConfig.sortBy && colConfig.sortBy !== 'manual') {
          newArchiveDeals = sortDealsForColumn(newArchiveDeals, colConfig.sortBy, colConfig.sortOrder || 'desc');
        }
        newDeals['archive'] = newArchiveDeals;
      }
      return newDeals;
    });
  };

  const handleUpdateColumn = (updatedColumn: ColumnConfig) => {
    setColumns(prev => prev.map(col => col.id === updatedColumn.id ? updatedColumn : col));
    
    setDealsByColumn(prev => {
      const deals = prev[updatedColumn.id] || [];
      if (deals.length && updatedColumn.sortBy && updatedColumn.sortBy !== 'manual') {
        const sorted = sortDealsForColumn(deals, updatedColumn.sortBy, updatedColumn.sortOrder || 'desc');
        return {
          ...prev,
          [updatedColumn.id]: sorted
        };
      }
      return prev;
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    setDealsByColumn(prev => {
      const dealsToArchive = prev[columnId] || [];
      if (dealsToArchive.length === 0) {
        const nextDeals: Record<string, DealData[]> = { ...prev };
        delete nextDeals[columnId];
        return nextDeals;
      }
      
      let newArchiveDeals = [...(prev['archive'] || []), ...dealsToArchive];
      const colConfig = columns.find(c => c.id === 'archive');
      if (colConfig && colConfig.sortBy && colConfig.sortBy !== 'manual') {
        newArchiveDeals = sortDealsForColumn(newArchiveDeals, colConfig.sortBy, colConfig.sortOrder || 'desc');
      }
      
      const nextDeals: Record<string, DealData[]> = {
        ...prev,
        'archive': newArchiveDeals
      };
      delete nextDeals[columnId];
      return nextDeals;
    });

    setColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const handleAddColumn = (index: number): string => {
    const newId = `col-${Date.now()}`;
    const newColumn: ColumnConfig = {
      id: newId,
      title: 'New Column',
      sortBy: 'dueDate',
      sortOrder: 'desc',
      visibleToPartners: true,
      visibleToShops: ['AT / Wein', 'AT / Graz', 'DE / Berlin'],
      focused: true
    };

    setColumns(prev => {
      const nextCols = prev.map(c => c.focused ? { ...c, focused: false } : c);
      nextCols.splice(index, 0, newColumn);
      return nextCols;
    });

    setDealsByColumn(prev => ({
      ...prev,
      [newId]: []
    }));

    return newId;
  };

  const handleClearColumnsFocus = () => {
    setColumns(prev => prev.map(col => col.focused ? { ...col, focused: false } : col));
  };

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen w-full">
        <Header
          onCreateDealClick={handleCreateDeal}
        />
        <main className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<LandingPage onSelectDeal={handleSelectDeal} selectedDealId={selectedDeal?.id} dealsByColumn={dealsByColumn} columns={columns} onUpdateColumn={handleUpdateColumn} onDeleteColumn={handleDeleteColumn} onAddColumn={handleAddColumn} onClearColumnsFocus={handleClearColumnsFocus} onDealDragOver={handleDealDragOver} onDealDragEnd={handleDealDragEnd} onArchiveDeal={handleArchiveDeal} onDragEndComplete={handleDragEndComplete} />} />
            <Route path="/deals" element={<DealsPage onSelectDeal={handleSelectDeal} />} />
            <Route path="/items" element={<ItemsPage onSelectDeal={handleSelectDeal} />} />
            <Route path="/customers" element={<CustomersPage onSelectDeal={handleSelectDeal} />} />
            <Route path="/settings/org" element={<OrgSettingsPage />} />
            <Route path="/cashbook" element={<CashbookDashboard />} />
            <Route path="/wizard-builder" element={<WizardBuilderPage />} />
            <Route path="/wizard-builder/builder/:id" element={<WizardBuilderPage />} />
            <Route path="*" element={<LandingPage onSelectDeal={handleSelectDeal} selectedDealId={selectedDeal?.id} dealsByColumn={dealsByColumn} columns={columns} onUpdateColumn={handleUpdateColumn} onDeleteColumn={handleDeleteColumn} onAddColumn={handleAddColumn} onClearColumnsFocus={handleClearColumnsFocus} onDealDragOver={handleDealDragOver} onDealDragEnd={handleDealDragEnd} onArchiveDeal={handleArchiveDeal} onDragEndComplete={handleDragEndComplete} />} />
          </Routes>
        </main>

        <DealWizardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isNew={isNewDeal}
          dealData={selectedDeal || undefined}
          onCreateDeal={handleCreateDealSuccess}
          onUpdateDeal={handleUpdateDeal}
          onExtend={handleExtendDeal}
          onPayback={handlePaybackDeal}
        />
        <ExtendDealModal
          isOpen={isExtendModalOpen}
          onClose={() => setIsExtendModalOpen(false)}
          dealData={selectedDeal || undefined}
          onUpdateDeal={handleUpdateDeal}
        />
        <PaybackDealModal
          key={selectedDeal?.id ? `payback-${selectedDeal.id}` : 'payback-closed'}
          isOpen={isPaybackModalOpen}
          onClose={() => setIsPaybackModalOpen(false)}
          dealData={selectedDeal || undefined}
          onUpdateDeal={handleUpdateDeal}
        />
        <PWAInstallPrompt />
      </div>
    </ToastProvider>
  )
}

export default App
