import type { Meta, StoryObj } from '@storybook/react';
import { HeaderDesktop } from './HeaderDesktop';
import CashyLogoUrl from '../../../../logo/Cashy_Logo_White.svg';
import { HelpIcon } from '../icons/HelpIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { LogoutIcon } from '../icons/LogoutIcon';

const meta = {
  title: 'Header/HeaderDesktop',
  component: HeaderDesktop,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    logo: { control: 'text', description: 'ReactNode containing the Logo' },
    actions: { control: 'text', description: 'ReactNode for action icon buttons' },
    primaryAction: { control: 'text', description: 'ReactNode for the main layout CTA' }
  },
  decorators: [
    (Story, context) => (
      <div 
        data-theme="dark" 
        style={{ 
          width: context.viewMode === 'docs' ? '100%' : '100vw', 
          backgroundColor: '#131518' // Force the background outside the header to match the dark theme for visuals
        }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeaderDesktop>;

export default meta;
type Story = StoryObj<typeof meta>;

// Remove mocked MockLogoSVG and MockIconSVG definitions

const ActionButtons = () => (
   <>
      <button className="cashy-header-icon-btn" aria-label="Help">
        <HelpIcon width="20" height="20" />
      </button>
      <button className="cashy-header-icon-btn" aria-label="Settings">
        <SettingsIcon width="20" height="20" />
      </button>
      <button className="cashy-header-icon-btn" aria-label="Logout">
        <LogoutIcon width="20" height="20" />
      </button>
   </>
);


const defaultNavItems = [
  { label: 'Deals', href: '#' },
  { label: 'Items', href: '#' },
  { label: 'Customers', href: '#' },
];


export const ConfigurableHeader: Story = {
  args: {
    logo: <img src={CashyLogoUrl} alt="Cashy Logo" style={{ width: '100%', height: '100%', display: 'block' }} />,
    navItems: defaultNavItems,
    primaryAction: <span>Create a Deal</span>,
    actions: <ActionButtons />,
  },
};

export const HeaderWithoutActions: Story = {
  args: {
    logo: <img src={CashyLogoUrl} alt="Cashy Logo" style={{ width: '100%', height: '100%', display: 'block' }} />,
    navItems: defaultNavItems,
    primaryAction: <span>Create a Deal</span>,
  },
};

export const HeaderWithoutNav: Story = {
  args: {
    logo: <img src={CashyLogoUrl} alt="Cashy Logo" style={{ width: '100%', height: '100%', display: 'block' }} />,
    navItems: [],
    primaryAction: <span>Create a Deal</span>,
    actions: <ActionButtons />,
  },
};
