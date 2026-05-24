import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Menu, X, Settings, Layers } from 'lucide-react';
import svgPaths from "../../imports/svg-4o201vrq4p";

interface HeaderProps {
  onCreateDealClick?: () => void;
  currentPage?: string;
  onViewChange?: (view: 'kanban' | 'admin') => void;
  currentView?: 'kanban' | 'admin';
}

export function Header({ onCreateDealClick, currentPage }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSettingsOpen]);

  // Determine active nav item from route
  const getActivePage = () => {
    if (currentPage) return currentPage;
    if (location.pathname === '/wizard-builder') return 'wizard-builder';
    if (location.pathname === '/deals') return 'deals';
    if (location.pathname === '/items') return 'items';
    if (location.pathname === '/customers') return 'customers';
    if (location.pathname === '/settings/business-areas') return 'business-areas';
    return '';
  };
  const activePage = getActivePage();

  const handleNavClick = (page: string) => {
    switch (page) {
      case 'deals':
        navigate('/deals');
        break;
      case 'wizard-builder':
        navigate('/wizard-builder');
        break;
      case 'items':
        navigate('/items');
        break;
      case 'business-areas':
        navigate('/settings/business-areas');
        break;
      case 'customers':
        navigate('/customers');
        break;
      default:
        break;
    }
  };

  const navItems = [
    { key: 'deals', label: 'Deals', path: '/' },
    { key: 'items', label: 'Items', path: '/items' },
    { key: 'customers', label: 'Customers', path: '/customers' },
    { key: 'cashbook', label: 'Cashbook', path: null },
  ];

  return (
    <>
      <div className="bg-[#17142b] border-b border-[#252135] h-[64px] relative w-full shrink-0 z-[100]">
        <div className="flex items-center justify-between px-[24px] size-full">
          <div className="flex gap-[48px] items-center relative shrink-0">
            {/* Logo */}
            <div
              className="h-[26px] overflow-clip relative shrink-0 w-[87px] cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="absolute inset-[3.52%_72.41%_3.52%_0]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24.1684">
                  <path d={svgPaths.p31dad700} fill="white" />
                </svg>
              </div>
              <div className="absolute inset-[33.77%_0.47%_33.92%_37.64%]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53.8469 8.4">
                  <path d={svgPaths.p2dfd2f70} fill="white" />
                </svg>
              </div>
            </div>

            {/* Navigation (Desktop) */}
            <div className="hidden md:flex font-sans gap-[32px] items-center leading-[1.4] relative shrink-0 text-[16px] whitespace-nowrap">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`relative shrink-0 transition-colors cursor-pointer bg-transparent border-none pb-[2px] ${
                    activePage === item.key
                      ? 'text-white font-medium'
                      : 'text-[#fbfcfc]/60 hover:text-[#fbfcfc]'
                  }`}
                >
                  {item.label}
                  {/* Active indicator line */}
                  {activePage === item.key && (
                    <div className="absolute -bottom-[19px] left-0 right-0 h-[2px] bg-[#4649e5] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right side actions (Desktop) */}
          <div className="hidden md:flex gap-[10px] items-center justify-end relative shrink-0">
            <button
              onClick={onCreateDealClick}
              className="bg-[#4649e5] hover:bg-[#3b3ec3] transition-colors cursor-pointer flex h-[40px] items-center justify-center px-[12px] py-[12px] relative rounded-[8px] shrink-0 border-none"
            >
              <div className="flex flex-col font-sans font-semibold justify-end leading-[0] text-[14px] text-white whitespace-nowrap">
                <p className="leading-[1.4]">Create a Deal</p>
              </div>
            </button>
            <div className="flex gap-[10px] items-center justify-end relative shrink-0">
              <div className="bg-[#131518] flex items-center justify-center p-[12px] relative rounded-[8px] shrink-0 size-[40px] border border-[#4c5564]">
                <div className="overflow-clip relative shrink-0 size-[20px]">
                  <div className="absolute inset-[4.17%]">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
                      <g>
                        <path clipRule="evenodd" d={svgPaths.p2b793800} fill="#FBFCFC" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p29839e80} fill="#FBFCFC" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p12593c00} fill="#FBFCFC" fillRule="evenodd" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
              <div ref={settingsRef} className="relative shrink-0">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`flex items-center justify-center p-[12px] rounded-[8px] size-[40px] border transition-all cursor-pointer focus:outline-none ${
                    isSettingsOpen
                      ? 'bg-[#1f2227] border-[#4c5564]/80 text-white'
                      : 'bg-[#131518] border-[#4c5564] text-[#FBFCFC] hover:bg-[#1f2227] hover:border-[#4c5564]/80'
                  }`}
                  aria-label="Settings"
                  aria-expanded={isSettingsOpen}
                >
                  <div className="overflow-clip relative shrink-0 size-[20px]">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g>
                        <path clipRule="evenodd" d={svgPaths.p30a1d300} fill="#FBFCFC" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p3b47d500} fill="#FBFCFC" fillRule="evenodd" />
                      </g>
                    </svg>
                  </div>
                </button>

                {isSettingsOpen && (
                  <div className="absolute right-0 top-[50px] bg-white border border-gray-200 rounded-[8px] shadow-xl py-2 w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1 text-[10px] font-sans font-bold tracking-widest text-gray-400 uppercase select-none">
                      Settings
                    </div>
                    <button
                      onClick={() => {
                        handleNavClick('wizard-builder');
                        setIsSettingsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm font-sans flex items-center gap-2 hover:bg-gray-50 hover:text-gray-900 transition-colors border-none bg-transparent cursor-pointer ${
                        activePage === 'wizard-builder'
                          ? 'text-[#4649e5] font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      <Settings className="size-4" />
                      <span>Wizard Builder</span>
                    </button>
                    <button
                      onClick={() => {
                        handleNavClick('business-areas');
                        setIsSettingsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm font-sans flex items-center gap-2 hover:bg-gray-50 hover:text-gray-900 transition-colors border-none bg-transparent cursor-pointer ${
                        activePage === 'business-areas'
                          ? 'text-[#4649e5] font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      <Layers className="size-4" />
                      <span>Business Areas</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-[#131518] flex items-center justify-center p-[12px] relative rounded-[8px] shrink-0 size-[40px] border border-[#4c5564]">
                <div className="overflow-clip relative shrink-0 size-[20px]">
                  <div className="absolute inset-[8.33%]">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                      <g>
                        <path clipRule="evenodd" d={svgPaths.p1069e600} fill="#FBFCFC" fillRule="evenodd" />
                        <path d={svgPaths.pc221200} fill="#FBFCFC" />
                        <path d={svgPaths.p32e48500} fill="#FBFCFC" />
                        <path d={svgPaths.p131d8900} fill="#FBFCFC" />
                        <path d={svgPaths.p32559200} fill="#FBFCFC" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Actions Header */}
          <div className="flex md:hidden items-center gap-[10px]">
            <button
              onClick={onCreateDealClick}
              className="bg-[#4649e5] hover:bg-[#3b3ec3] transition-colors cursor-pointer flex h-[40px] items-center justify-center px-[12px] py-[12px] relative rounded-[8px] shrink-0 border-none animate-none"
            >
              <div className="flex flex-col font-sans font-semibold justify-end leading-[0] text-[13px] text-white whitespace-nowrap">
                <p className="leading-[1.4]">Create Deal</p>
              </div>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-[8px] bg-[#131518]/60 border border-[#4c5564]/40 hover:bg-[#131518]/95 hover:border-[#4c5564]/80 text-white transition-all cursor-pointer"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION SIDE SHEET (DRAWER) */}
      <div className={`fixed inset-0 z-[1000] md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        {/* Drawer Content */}
        <div className={`absolute top-0 bottom-0 right-0 w-[280px] bg-[#17142b] border-l border-[#252135] shadow-2xl transition-transform duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Header */}
          <div className="p-4 border-b border-[#252135] flex items-center justify-between bg-[#17142b] shrink-0">
            {/* Logo */}
            <div className="h-[22px] overflow-clip relative shrink-0 w-[74px]">
              <div className="absolute inset-[3.52%_72.41%_3.52%_0]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24.1684">
                  <path d={svgPaths.p31dad700} fill="white" />
                </svg>
              </div>
              <div className="absolute inset-[33.77%_0.47%_33.92%_37.64%]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53.8469 8.4">
                  <path d={svgPaths.p2dfd2f70} fill="white" />
                </svg>
              </div>
            </div>
            {/* Close Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full text-white transition-colors border-none bg-transparent"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#17142b]">
            {navItems.map((item) => {
              const isActive = activePage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    handleNavClick(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border-none bg-transparent cursor-pointer ${
                    isActive 
                      ? 'bg-[#4649e5]/25 text-white font-bold' 
                      : 'hover:bg-white/5 text-[#fbfcfc]/70 hover:text-[#fbfcfc]'
                  }`}
                >
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              );
            })}

            {/* Settings Section */}
            <div className="h-px bg-[#252135] my-4" />
            <div className="px-3 py-1.5 text-[10px] font-sans font-bold tracking-widest text-[#fbfcfc]/40 uppercase select-none">
              Settings
            </div>
            <button
              onClick={() => {
                handleNavClick('wizard-builder');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border-none bg-transparent cursor-pointer ${
                activePage === 'wizard-builder'
                  ? 'bg-[#4649e5]/25 text-white font-bold'
                  : 'hover:bg-white/5 text-[#fbfcfc]/70 hover:text-[#fbfcfc]'
              }`}
            >
              <Settings className="size-4" />
              <span className="text-sm font-semibold">Wizard Builder</span>
            </button>
            <button
              onClick={() => {
                handleNavClick('business-areas');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border-none bg-transparent cursor-pointer ${
                activePage === 'business-areas'
                  ? 'bg-[#4649e5]/25 text-white font-bold'
                  : 'hover:bg-white/5 text-[#fbfcfc]/70 hover:text-[#fbfcfc]'
              }`}
            >
              <Layers className="size-4" />
              <span className="text-sm font-semibold">Business Areas</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
