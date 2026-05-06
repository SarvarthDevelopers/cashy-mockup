import { useState } from 'react';
import { Routes, Route } from 'react-router';
import { LandingPage } from './pages/LandingPage';
import { WizardBuilderPage } from './pages/AdminBuilderPage';
import { Header } from './components/Header/Header';
import { DealWizardModal } from './components/DealWizardModal/DealWizardModal';
import { ToastProvider } from './components/Toast/ToastContext';
import type { DealData } from './data/mockData';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<DealData | null>(null);
  const [isNewDeal, setIsNewDeal] = useState(false);

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

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <Header
          onCreateDealClick={handleCreateDeal}
        />
        <main className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<LandingPage onSelectDeal={handleSelectDeal} />} />
            <Route path="/wizard-builder" element={<WizardBuilderPage />} />
            <Route path="/wizard-builder/builder/:id" element={<WizardBuilderPage />} />
            <Route path="*" element={<LandingPage onSelectDeal={handleSelectDeal} />} />
          </Routes>
        </main>

        <DealWizardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isNew={isNewDeal}
          dealData={selectedDeal || undefined}
        />
      </div>
    </ToastProvider>
  )
}

export default App
