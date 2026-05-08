import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import SendModal from '../components/SendModal';
import { Search, Filter, MoreHorizontal, Download, FileText, Send } from 'lucide-react';

interface LedgerPageProps {
  type: 'quotation' | 'salesorder' | 'invoice';
}

const LedgerPage = ({ type }: LedgerPageProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>({});

  const titles = {
    quotation: 'Quotations',
    salesorder: 'Sales Orders',
    invoice: 'Tax Invoices'
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setItems(res.data.filter((item: any) => item.type === type));
    } catch (err) {
      console.error('Error fetching ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type]);

  const openSend = (row: any) => {
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
    <div className="flex flex-col h-full bg-bg">
      <SendModal 
        isOpen={isSendModalOpen} 
        onClose={() => setIsSendModalOpen(false)} 
        type={type} 
        data={modalData} 
      />
      
      <div className="page-topbar px-5 py-2.5 bg-white border-b border-border flex items-center gap-2.5 shrink-0">
        <div className="pt-title text-[13px] font-semibold text-black flex-1">
          {titles[type]}
          <div className="pt-sub text-[10px] text-gray-400 mt-px">Manage and track your branded {titles[type].toLowerCase()}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder={`Search ${titles[type].toLowerCase()}...`} 
              className="fi pl-8 pr-2.5 py-1.5 border border-border rounded-r text-[12px] bg-white text-black outline-none w-[200px] focus:border-slate transition-all"
            />
          </div>
          <button className="nav-btn px-3 py-1.5 border border-border rounded-r text-[11px] bg-white text-gray-600 font-medium flex items-center gap-1.5 hover:bg-bg transition-all">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </div>

      <div className="page-content p-5 overflow-y-auto flex-1">
        <div className="card bg-white border border-border rounded-rl p-0 overflow-hidden shadow-sm">
          <div className="tbl-wrap">
            <table className="dt w-full border-collapse text-[11px] table-fixed">
              <thead>
                <tr className="bg-bg">
                  <th className="text-left p-2.5 border-b border-border text-gray-600 font-semibold text-[10px] w-1/4">Ref / Account</th>
                  <th className="text-left p-2.5 border-b border-border text-gray-600 font-semibold text-[10px] w-1/6">Brand</th>
                  <th className="text-left p-2.5 border-b border-border text-gray-600 font-semibold text-[10px] w-1/6">Date</th>
                  <th className="text-left p-2.5 border-b border-border text-gray-600 font-semibold text-[10px] w-1/6">Amount</th>
                  <th className="text-left p-2.5 border-b border-border text-gray-600 font-semibold text-[10px] w-1/5">Status</th>
                  <th className="text-left p-2.5 border-b border-border text-gray-600 font-semibold text-[10px] w-[60px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-400">Loading {titles[type].toLowerCase()}...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-400">No {titles[type].toLowerCase()} found.</td></tr>
                ) : items.map((row, i) => (
                  <tr key={i} className="hover:bg-bg2 cursor-pointer transition-all border-b border-border2 last:border-0" onClick={() => openSend(row)}>
                    <td className="p-2.5">
                      <div className="font-semibold text-black">{row.order_number}</div>
                      <div className="text-[10px] text-gray-500">{row.account_name}</div>
                    </td>
                    <td className="p-2.5">
                      <span className="badge inline-block text-[9px] font-semibold rounded px-1.5 py-0.5 text-white" style={{ backgroundColor: row.brand_color }}>
                        {row.brand_name}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-600">
                      {new Date(row.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="p-2.5 font-semibold text-black">
                      AED {row.total.toLocaleString()}
                    </td>
                    <td className="p-2.5">
                      <span className={`badge inline-block text-[9px] font-semibold rounded px-1.5 py-0.5 ${row.status === 'Paid' || row.status === 'Confirmed' ? 'b-ok' : 'b-info'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2 text-gray-400">
                        <FileText className="w-3.5 h-3.5 hover:text-slate transition-colors" />
                        <Send className="w-3.5 h-3.5 hover:text-ok transition-colors" />
                        <MoreHorizontal className="w-3.5 h-3.5 hover:text-black transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerPage;
