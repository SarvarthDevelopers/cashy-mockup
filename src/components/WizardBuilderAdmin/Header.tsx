import { useNavigate, useLocation } from 'react-router';
import svgPaths from "../../imports/svg-4o201vrq4p";

interface HeaderProps {
  onCreateDealClick?: () => void;
  currentPage?: string;
}

export function Header({ onCreateDealClick, currentPage }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active nav item from route
  const getActivePage = () => {
    if (currentPage) return currentPage;
    if (location.pathname === '/deals') return 'deals';
    return 'wizard';
  };
  const activePage = getActivePage();

  const handleNavClick = (page: string) => {
    switch (page) {
      case 'deals':
        navigate('/deals');
        break;
      case 'items':
        navigate('/items');
        break;
      case 'customers':
        navigate('/customers');
        break;
      default:
        // Other nav items are placeholders for now
        break;
    }
  };

  const handleCreateDeal = () => {
    if (onCreateDealClick) {
      onCreateDealClick();
    } else {
      navigate('/');
    }
  };

  const navItems = [
    { key: 'deals', label: 'Deals', path: '/deals' },
    { key: 'items', label: 'Items', path: '/items' },
    { key: 'customers', label: 'Customers', path: '/customers' },
    { key: 'cashbook', label: 'Cashbook', path: null },
  ];

  return (
    <div className="bg-[#17142b] border-b border-[#252135] h-[64px] relative w-full shrink-0">
      <div className="flex items-center justify-between px-[24px] size-full">
        <div className="content-stretch flex gap-[48px] items-center relative shrink-0">
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

          {/* Navigation */}
          <div className="content-stretch flex font-['Inter',sans-serif] gap-[32px] items-center leading-[1.4] relative shrink-0 text-[16px] whitespace-nowrap">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`relative shrink-0 transition-colors cursor-pointer bg-transparent border-none pb-[2px] ${
                  activePage === item.key
                    ? 'text-[var(--text-white)] font-bold'
                    : 'text-[var(--text-white)]/60 hover:text-[var(--text-white)]'
                }`}
              >
                {item.label}
                {/* Active indicator line */}
                {activePage === item.key && (
                  <div className="absolute -bottom-[19px] left-0 right-0 h-[3px] bg-[var(--background-brand-solid)] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right side actions */}
        <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0">
          <button
            onClick={handleCreateDeal}
            className="bg-[var(--background-brand-solid)] hover:bg-[var(--background-brand-solid-hover)] transition-all cursor-pointer content-stretch flex h-[40px] items-center justify-center px-[16px] py-[12px] relative rounded-[8px] shrink-0 shadow-lg shadow-[var(--lilac-900)]/20"
          >
            <div className="flex flex-col font-['Inter',sans-serif] font-bold justify-end leading-[0] text-[14px] text-[var(--text-white)] whitespace-nowrap">
              <p className="leading-[1.4]">Create a Deal</p>
            </div>
          </button>
          <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0">
            <div className="bg-[#131518] content-stretch flex items-center justify-center p-[12px] relative rounded-[8px] shrink-0 size-[40px] border border-[#4c5564]">
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
            <div className="bg-[#131518] content-stretch flex items-center justify-center p-[12px] relative rounded-[8px] shrink-0 size-[40px] border border-[#4c5564]">
              <div className="overflow-clip relative shrink-0 size-[20px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <g>
                    <path clipRule="evenodd" d={svgPaths.p30a1d300} fill="#FBFCFC" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p3b47d500} fill="#FBFCFC" fillRule="evenodd" />
                  </g>
                </svg>
              </div>
            </div>
            <div className="bg-[#131518] content-stretch flex items-center justify-center p-[12px] relative rounded-[8px] shrink-0 size-[40px] border border-[#4c5564]">
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
      </div>
    </div>
  );
}
