import { useState } from 'react';
import { Routes, Route } from 'react-router';
import { LandingPage } from './pages/LandingPage';
import { WizardBuilderPage } from './pages/AdminBuilderPage';
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

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <Header
          onCreateDealClick={handleCreateDeal}
        />
        <main className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<LandingPage onSelectDeal={handleSelectDeal} dealsByColumn={dealsByColumn} />} />
            <Route path="/wizard-builder" element={<WizardBuilderPage />} />
            <Route path="/wizard-builder/builder/:id" element={<WizardBuilderPage />} />
            <Route path="*" element={<LandingPage onSelectDeal={handleSelectDeal} dealsByColumn={dealsByColumn} />} />
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
