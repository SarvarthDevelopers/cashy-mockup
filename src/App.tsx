import { useState } from 'react';
import { Routes, Route } from 'react-router';
import { arrayMove } from '@dnd-kit/sortable';
import { LandingPage } from './pages/LandingPage';
import { WizardBuilderPage } from './pages/AdminBuilderPage';
import { DealsPage } from './pages/DealsPage';
import { Header } from './components/Header/Header';
import { DealWizardModal } from './components/DealWizardModal/DealWizardModal';
import { ToastProvider } from './components/Toast/ToastContext';
import { INITIAL_DEALS } from './data/mockData';
import type { DealData, ColumnId } from './data/mockData';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<DealData | null>(null);
  const [isNewDeal, setIsNewDeal] = useState(false);
  const [dealsByColumn, setDealsByColumn] = useState<Record<ColumnId, DealData[]>>(INITIAL_DEALS);

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

  const handleDealDragOver = (dealId: string, fromColumn: ColumnId, toColumn: ColumnId, toIndex: number) => {
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

  const handleDealDragEnd = (columnId: ColumnId, oldIndex: number, newIndex: number) => {
    setDealsByColumn(prev => {
      const deals = prev[columnId] || [];
      if (!deals.length || oldIndex === newIndex) return prev;
      return {
        ...prev,
        [columnId]: arrayMove(deals, oldIndex, newIndex)
      };
    });
  };

  const handleUpdateDeal = (updatedDeal: DealData) => {
    setDealsByColumn(prev => {
      const newDeals = { ...prev };
      for (const colId in newDeals) {
        const col = colId as ColumnId;
        const index = newDeals[col].findIndex(d => d.id === updatedDeal.id);
        if (index !== -1) {
          const updatedCol = [...newDeals[col]];
          updatedCol[index] = updatedDeal;
          newDeals[col] = updatedCol;
          break;
        }
      }
      return newDeals;
    });
    // Also update selectedDeal to keep wizard in sync
    setSelectedDeal(updatedDeal);
  };

  const handleCreateDealSuccess = (newDeal: DealData) => {
    setDealsByColumn(prev => ({
      ...prev,
      'car-inbox': [newDeal, ...prev['car-inbox']]
    }));
    setSelectedDeal(newDeal);
    setIsNewDeal(false);
  };

  const handleArchiveDeal = (dealId: string) => {
    setDealsByColumn(prev => {
      const newDeals = { ...prev };
      let dealToArchive: DealData | null = null;
      for (const colId in newDeals) {
        const col = colId as ColumnId;
        const index = newDeals[col].findIndex(d => d.id === dealId);
        if (index !== -1) {
          dealToArchive = newDeals[col][index];
          newDeals[col] = newDeals[col].filter(d => d.id !== dealId);
          break;
        }
      }
      if (dealToArchive) {
        newDeals['archive'] = [dealToArchive, ...(newDeals['archive'] || [])];
      }
      return newDeals;
    });
  };

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <Header
          onCreateDealClick={handleCreateDeal}
        />
        <main className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<LandingPage onSelectDeal={handleSelectDeal} dealsByColumn={dealsByColumn} onDealDragOver={handleDealDragOver} onDealDragEnd={handleDealDragEnd} onArchiveDeal={handleArchiveDeal} />} />
            <Route path="/deals" element={<DealsPage onSelectDeal={handleSelectDeal} />} />
            <Route path="/wizard-builder" element={<WizardBuilderPage />} />
            <Route path="/wizard-builder/builder/:id" element={<WizardBuilderPage />} />
            <Route path="*" element={<LandingPage onSelectDeal={handleSelectDeal} dealsByColumn={dealsByColumn} onDealDragOver={handleDealDragOver} onDealDragEnd={handleDealDragEnd} onArchiveDeal={handleArchiveDeal} />} />
          </Routes>
        </main>

        <DealWizardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isNew={isNewDeal}
          dealData={selectedDeal || undefined}
          onCreateDeal={handleCreateDealSuccess}
          onUpdateDeal={handleUpdateDeal}
        />
      </div>
    </ToastProvider>
  )
}

export default App
