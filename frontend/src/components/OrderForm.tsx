import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Trash2, Save, FileText, CheckCircle } from 'lucide-react';

interface OrderFormProps {
  type: 'quotation' | 'salesorder' | 'invoice';
}

const OrderForm = ({ type }: OrderFormProps) => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    brand_id: '',
    customer_id: '',
    notes: '',
    delivery_date: '',
    items: [{ inventory_id: '', quantity: 1, unit_price: 0, discount_percent: 0, total: 0 }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [b, c, i] = await Promise.all([
          api.get('/brands'),
          api.get('/customers'),
          api.get('/inventory')
        ]);
        setBrands(b.data);
        setCustomers(c.data);
        setInventory(i.data);
        if (b.data.length > 0) setFormData(prev => ({ ...prev, brand_id: b.data[0].id.toString() }));
        if (c.data.length > 0) setFormData(prev => ({ ...prev, customer_id: c.data[0].id.toString() }));
      } catch (err) {
        console.error('Error fetching form data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { inventory_id: '', quantity: 1, unit_price: 0, discount_percent: 0, total: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'inventory_id') {
      const product = inventory.find(i => i.id.toString() === value);
      if (product) item.unit_price = product.unit_price;
    }
    
    const gross = item.quantity * item.unit_price;
    item.total = gross - (gross * (item.discount_percent / 100));
    newItems[index] = item;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const vat = subtotal * 0.05;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  };

  const { subtotal, vat, total } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/orders', {
        ...formData,
        type,
        subtotal,
        vat,
        total
      });
      if (res.data.success) {
        navigate('/');
      }
    } catch (err) {
      console.error('Error saving order:', err);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading form...</div>;

  const selectedBrand = brands.find(b => b.id.toString() === formData.brand_id);

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="page-topbar px-5 py-2.5 bg-white border-b border-border flex items-center gap-2.5 shrink-0">
        <div className="pt-title text-[13px] font-semibold text-black flex-1">
          Create New {type === 'quotation' ? 'Quotation' : type === 'salesorder' ? 'Sales Order' : 'Invoice'}
          <div className="pt-sub text-[10px] text-gray-400 mt-px">Drafting a branded document for your customer</div>
        </div>
      </div>

      <div className="page-content p-5 overflow-y-auto flex-1 max-w-[1000px] mx-auto w-full">
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-5">
          <div className="col-span-8 space-y-4">
            <div className="card bg-white border border-border rounded-rl p-4 shadow-sm">
              <div className="ch flex items-center justify-between mb-3.5">
                <span className="ct text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Document configuration</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="fg flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Select Brand</label>
                  <select 
                    className="fi px-2.5 py-1.5 border border-border rounded-r text-[12px] bg-white text-black outline-none focus:border-slate"
                    value={formData.brand_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                  >
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="fg flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Customer / Account</label>
                  <select 
                    className="fi px-2.5 py-1.5 border border-border rounded-r text-[12px] bg-white text-black outline-none focus:border-slate"
                    value={formData.customer_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                  >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.account_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="fg flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Required delivery date</label>
                  <input 
                    type="date"
                    className="fi px-2.5 py-1.5 border border-border rounded-r text-[12px] bg-white text-black outline-none focus:border-slate"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                  />
                </div>
                <div className="fg flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Market</label>
                  <input className="fi px-2.5 py-1.5 border border-border rounded-r text-[12px] bg-gray-50 text-gray-500 outline-none" value="UAE" readOnly />
                </div>
              </div>
            </div>

            <div className="card bg-white border border-border rounded-rl p-4 shadow-sm">
              <div className="ch flex items-center justify-between mb-3.5">
                <span className="ct text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Order items</span>
              </div>
              <table className="dt w-full border-collapse text-[11px] table-fixed mb-3">
                <thead>
                  <tr className="bg-bg">
                    <th className="text-left p-2 border-b border-border text-gray-600 font-semibold text-[10px] w-1/3">Product / SKU</th>
                    <th className="text-left p-2 border-b border-border text-gray-600 font-semibold text-[10px] w-1/6">Qty</th>
                    <th className="text-left p-2 border-b border-border text-gray-600 font-semibold text-[10px] w-1/6">Price</th>
                    <th className="text-left p-2 border-b border-border text-gray-600 font-semibold text-[10px] w-1/6">Disc %</th>
                    <th className="text-left p-2 border-b border-border text-gray-600 font-semibold text-[10px] w-1/6">Total</th>
                    <th className="text-left p-2 border-b border-border text-gray-600 font-semibold text-[10px] w-[30px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-1 border-b border-border2">
                        <select 
                          className="fi w-full px-2 py-1 border border-border rounded text-[11px] bg-white"
                          value={item.inventory_id}
                          onChange={(e) => updateItem(i, 'inventory_id', e.target.value)}
                        >
                          <option value="">Select SKU...</option>
                          {inventory.filter(inv => inv.brand_id.toString() === formData.brand_id).map(inv => (
                            <option key={inv.id} value={inv.id}>{inv.sku} - {inv.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1 border-b border-border2">
                        <input 
                          type="number" 
                          className="fi w-full px-2 py-1 border border-border rounded text-[11px]" 
                          value={item.quantity}
                          onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-1 border-b border-border2">
                        <input 
                          type="number" 
                          className="fi w-full px-2 py-1 border border-border rounded text-[11px]" 
                          value={item.unit_price}
                          onChange={(e) => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-1 border-b border-border2">
                        <input 
                          type="number" 
                          className="fi w-full px-2 py-1 border border-border rounded text-[11px]" 
                          value={item.discount_percent}
                          onChange={(e) => updateItem(i, 'discount_percent', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-1 border-b border-border2 font-semibold">AED {item.total.toLocaleString()}</td>
                      <td className="p-1 border-b border-border2 text-center">
                        <Trash2 className="w-3.5 h-3.5 text-bad cursor-pointer" onClick={() => removeItem(i)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                type="button"
                onClick={addItem}
                className="nav-btn w-full py-1.5 border border-border rounded-r text-[11px] bg-white text-gray-600 font-medium hover:bg-bg transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3 h-3" /> Add item
              </button>
            </div>
          </div>

          <div className="col-span-4 space-y-4">
            <div className="card bg-white border border-border rounded-rl p-4 shadow-sm">
              <div className="ch flex items-center justify-between mb-3.5">
                <span className="ct text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Summary</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-black">AED {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">VAT (5%)</span>
                  <span className="font-medium text-black">AED {vat.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between">
                  <span className="text-[12px] font-bold text-black uppercase">Total</span>
                  <span className="text-[14px] font-bold text-ok">AED {total.toLocaleString()}</span>
                </div>
              </div>
              <div className="fg flex flex-col gap-1 mb-4">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Order notes</label>
                <textarea 
                  className="fi px-2.5 py-2 border border-border rounded-r text-[11px] bg-white text-black outline-none focus:border-slate min-h-[60px]"
                  placeholder="Special instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                ></textarea>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  type="submit"
                  className="nav-btn-primary w-full py-2.5 bg-slate text-white border border-slate rounded-r text-[12px] font-semibold hover:bg-navy transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save {type === 'quotation' ? 'Quotation' : 'Order'}
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/')}
                  className="nav-btn w-full py-2.5 border border-border rounded-r text-[11px] bg-white text-gray-600 font-medium hover:bg-bg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="card bg-white border border-border rounded-rl p-4 shadow-sm">
              <div className="ch flex items-center justify-between mb-3.5">
                <span className="ct text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Brand Preview</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-bg2 rounded-r border border-border2">
                <div className="w-10 h-10 rounded bg-white border border-border flex items-center justify-center text-[10px] font-bold overflow-hidden">
                  {selectedBrand ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white" style={{ backgroundColor: selectedBrand.color }}>
                      {selectedBrand.code}
                    </div>
                  ) : '—'}
                </div>
                <div>
                  <div className="text-[12px] font-bold text-black">{selectedBrand ? selectedBrand.name : 'No brand selected'}</div>
                  <div className="text-[10px] text-gray-400 font-mono">{selectedBrand ? selectedBrand.prefix + 'XXXX' : 'REF-0000'}</div>
                </div>
              </div>
            </div>

            <div className="card bg-white border border-border rounded-rl p-4 shadow-sm">
              <div className="ch flex items-center justify-between mb-3.5">
                <span className="ct text-[10px] font-semibold text-gray-600 uppercase tracking-wider">What happens next</span>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-slate"></div>
                    <div className="w-[1px] h-full bg-border my-1"></div>
                  </div>
                  <div className="pb-2">
                    <div className="text-[11px] font-semibold text-black leading-none">Order created</div>
                    <div className="text-[9px] text-gray-400 mt-1">Stock reserved automatically</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-gold"></div>
                    <div className="w-[1px] h-full bg-border my-1"></div>
                  </div>
                  <div className="pb-2">
                    <div className="text-[11px] font-semibold text-black leading-none">Branded invoice issued</div>
                    <div className="text-[9px] text-gray-400 mt-1">VAT calculated & sent</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-ok"></div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-black leading-none">Fulfilment queue</div>
                    <div className="text-[9px] text-gray-400 mt-1">Warehouse team notified</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-white border border-border rounded-rl p-4 shadow-sm">
              <div className="ch flex items-center justify-between mb-2.5">
                <span className="ct text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Stock availability</span>
              </div>
              <div className="bg-bg2 border border-border rounded-r p-2.5 text-[10px] text-gray-500 text-center">
                Add products to check live stock availability from Dubai warehouse
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
