import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import StatCard from '../components/StatCard';
import SendModal from '../components/SendModal';
import api from '../lib/api';
import { Search, Filter, MoreHorizontal, MessageSquare, Send, RefreshCcw } from 'lucide-react';

const Feed = () => {
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>({});
  const [modalType, setModalType] = useState('quotation');
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/stats'),
        api.get('/orders')
      ]);
      setStats(statsRes.data);
      setRecentActivity(ordersRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statConfig = [
    { label: 'Active Quotations', key: 'activeQuotations', subKey: 'quotationValue', trend: 'up', color: 'var(--color-slate)' },
    { label: 'Pending Orders', key: 'pendingOrders', subKey: 'orderValue', trend: 'up', color: 'var(--color-gold)' },
    { label: 'Unpaid Invoices', key: 'unpaidInvoices', subKey: 'invoiceValue', trend: 'neutral', color: 'var(--color-bad)' },
    { label: 'Fulfilment Rate', key: 'fulfilmentRate', subKey: 'rateTrend', trend: 'up', color: 'var(--color-ok)' },
    { label: 'Returns', key: 'returns', subKey: 'returnValue', trend: 'down', color: 'var(--color-da)' },
  ];

  const openSend = (row: any) => {
    setModalType(row.type);
    setModalData({
      ref: row.order_number,
      account: row.account_name,
      brand: row.brand_name,
      amount: `AED ${row.total.toLocaleString()}`,
      date: new Date(row.created_at).toLocaleDateString()
    });
    setIsSendModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <SendModal 
        isOpen={isSendModalOpen} 
        onClose={() => setIsSendModalOpen(false)} 
        type={modalType} 
        data={modalData} 
      />
      <div className="page-topbar px-5 py-2.5 bg-white border-b border-border flex items-center gap-2.5 shrink-0">
        <div className="pt-title text-[13px] font-semibold text-black flex-1">
          Command Feed
          <div className="pt-sub text-[10px] text-gray-400 mt-px">Real-time order activity across all HouseMart brands</div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            className="nav-btn px-2.5 py-1.5 border border-border rounded-r text-[11px] bg-white text-gray-600 font-medium flex items-center gap-1.5 hover:bg-bg transition-all"
            disabled={loading}
          >
            <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="fi pl-8 pr-2.5 py-1.5 border border-border rounded-r text-[12px] bg-white text-black outline-none w-[200px] focus:border-slate transition-all"
            />
          </div>
        </div>
      </div>

      <div className="page-content p-5 overflow-y-auto flex-1">
        <div className="grid grid-cols-5 gap-2 mb-4">
          {statConfig.map((s, i) => (
            <StatCard 
              key={i} 
              label={s.label} 
              value={stats ? stats[s.key] : '—'} 
              subValue={stats ? stats[s.subKey] || '+0% this month' : '—'} 
              trend={s.trend as any} 
              color={s.color} 
            />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-8">
            <div className="card bg-white border border-border rounded-rl p-3.5 mb-3">
              <div className="ch flex items-center justify-between mb-2.5 gap-2 flex-wrap">
                <span className="ct text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Latest operations</span>
                <span className="ca text-[11px] text-slate cursor-pointer font-semibold">View all activity</span>
              </div>
              
              <div className="tbl-wrap border border-border rounded-rl overflow-hidden min-h-[200px]">
                <table className="dt w-full border-collapse text-[11px] table-fixed">
                  <thead>
                    <tr className="bg-bg">
                      <th className="text-left p-2 border-b border-border text-gray-600 font-semibold text-[10px] w-1/4">Ref / Account</th>
                      <th className="text-left p-2 border-b border-border text-gray-600 font-semibold text-[10px] w-1/5">Type</th>
                      <th className="text-left p-2 border-b border-border text-gray-600 font-semibold text-[10px] w-1/6">Brand</th>
                      <th className="text-left p-2 border-b border-border text-gray-600 font-semibold text-[10px] w-1/6">Amount</th>
                      <th className="text-left p-2 border-b border-border text-gray-600 font-semibold text-[10px] w-1/4">Status</th>
                      <th className="text-left p-2 border-b border-border text-gray-600 font-semibold text-[10px] w-[40px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="p-10 text-center text-gray-400">Loading operations...</td></tr>
                    ) : recentActivity.length === 0 ? (
                      <tr><td colSpan={6} className="p-10 text-center text-gray-400">No recent activity found.</td></tr>
                    ) : recentActivity.map((row, i) => (
                      <tr key={i} className="hover:bg-bg2 cursor-pointer transition-all" onClick={() => openSend(row)}>
                        <td className="p-2 border-b border-border2">
                          <div className="font-semibold text-black">{row.order_number}</div>
                          <div className="text-[10px] text-gray-500">{row.account_name}</div>
                        </td>
                        <td className="p-2 border-b border-border2 text-gray-600 capitalize">{row.type}</td>
                        <td className="p-2 border-b border-border2">
                          <span className={`badge inline-block text-[9px] font-semibold rounded px-1.5 py-0.5 text-white`} style={{ backgroundColor: row.brand_color }}>
                            {row.brand_name}
                          </span>
                        </td>
                        <td className="p-2 border-b border-border2 font-semibold text-black">AED {row.total.toLocaleString()}</td>
                        <td className="p-2 border-b border-border2">
                          <span className={`badge inline-block text-[9px] font-semibold rounded px-1.5 py-0.5 ${row.status === 'Paid' ? 'b-ok' : 'b-info'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-2 border-b border-border2 text-center text-gray-400">
                          <MoreHorizontal className="w-4 h-4" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-span-4">
            <div className="card bg-white border border-border rounded-rl p-3.5">
              <div className="ch flex items-center justify-between mb-2.5 gap-2 flex-wrap">
                <span className="ct text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Quick actions</span>
              </div>
              <div className="flex flex-col gap-2">
                <NavLink to="/new-quotation" className="nav-btn-primary w-full py-2 bg-slate text-white border border-slate rounded-r text-[11px] font-medium hover:bg-navy transition-all flex items-center justify-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Create new quotation
                </NavLink>
                <NavLink to="/new-order" className="nav-btn w-full py-2 border border-border rounded-r text-[11px] bg-white text-gray-600 font-medium hover:bg-bg transition-all flex items-center justify-center gap-2">
                  <ClipboardList className="w-3.5 h-3.5" /> Start sales order
                </NavLink>
                <NavLink to="/new-invoice" className="nav-btn w-full py-2 border border-border rounded-r text-[11px] bg-white text-gray-600 font-medium hover:bg-bg transition-all flex items-center justify-center gap-2">
                  <Receipt className="w-3.5 h-3.5" /> Issue tax invoice
                </NavLink>
              </div>
              
              <div className="mt-5 pt-4 border-t border-border2">
                <div className="ch flex items-center justify-between mb-2.5 gap-2 flex-wrap">
                  <span className="ct text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Communication queue</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 p-2 bg-bg2 rounded-r border border-border2">
                    <div className="w-8 h-8 rounded-full bg-ok text-white flex items-center justify-center text-[10px] font-bold shrink-0">AL</div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold text-black truncate">Ahmed Al Rashid</span>
                        <span className="text-[9px] text-gray-400">2m ago</span>
                      </div>
                      <div className="text-[10px] text-gray-500 line-clamp-1 italic">"Please confirm availability of HMS-2026-X..."</div>
                    </div>
                    <MessageSquare className="w-3 h-3 text-slate shrink-0" />
                  </div>
                  <div className="flex items-start gap-3 p-2 hover:bg-bg2 rounded-r transition-all">
                    <div className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center text-[10px] font-bold shrink-0">FH</div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold text-black truncate">Fatima Hassan</span>
                        <span className="text-[9px] text-gray-400">1h ago</span>
                      </div>
                      <div className="text-[10px] text-gray-500 line-clamp-1">Quotation QT-2026-0091 viewed...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);

const ClipboardList = ({ className }: { className?: string }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
);

const Receipt = ({ className }: { className?: string }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5V18.5"/><path d="M12 5.5V6.5"/></svg>
);

export default Feed;
