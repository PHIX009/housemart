import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, ClipboardList, Receipt, Truck, RotateCcw, CreditCard } from 'lucide-react';

const TopNav = () => {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: LayoutDashboard, path: '/' },
    { id: 'quotations', label: 'Quotations', icon: FileText, path: '/quotations' },
    { id: 'salesorders', label: 'Sales orders', icon: ClipboardList, path: '/sales-orders' },
    { id: 'invoices', label: 'Invoices', icon: Receipt, path: '/invoices' },
    { id: 'fulfilment', label: 'Fulfilment', icon: Truck, path: '/fulfilment' },
    { id: 'returns', label: 'Returns', icon: RotateCcw, path: '/returns' },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: '/payments' },
  ];

  return (
    <nav className="top-nav bg-white border-b border-border px-5 flex items-center h-[44px] sticky top-0 z-[100]">
      <div className="nav-brand flex items-center gap-2 mr-5 shrink-0">
        <div className="nav-logo w-7 h-7 bg-slate rounded-[7px] flex items-center justify-center">
          <div className="nav-logo-box w-3.5 h-3.5 bg-white rounded-[3px]"></div>
        </div>
        <span className="nav-brand-name text-[12px] font-semibold text-black">HouseMart</span>
      </div>

      <div className="flex h-full">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              `nav-tab px-3.5 h-[44px] flex items-center text-[12px] font-medium transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'text-slate border-slate font-semibold'
                  : 'text-gray-500 border-transparent hover:text-black'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <div className="nav-right ml-auto flex items-center gap-2">
        <NavLink to="/new-quotation" className="nav-btn px-3 py-1.5 border border-border rounded-r text-[11px] bg-white text-gray-600 font-medium hover:bg-bg transition-all whitespace-nowrap">
          New Quotation
        </NavLink>
        <NavLink to="/new-order" className="nav-btn-primary px-3 py-1.5 bg-slate text-white border border-slate rounded-r text-[11px] font-medium hover:bg-navy transition-all whitespace-nowrap">
          New Order
        </NavLink>
      </div>
    </nav>
  );
};

export default TopNav;
