import React, { useState, useEffect } from 'react';
import { X, Mail, MessageSquare, Check, Phone, Info } from 'lucide-react';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  data: {
    ref?: string;
    soref?: string;
    account?: string;
    brand?: string;
    amount?: string;
    exvat?: string;
    vat?: string;
    date?: string;
    items?: string;
    tracking?: string;
    resolution?: string;
    reason?: string;
    nextsteps?: string;
  };
}

const CONTACTS: Record<string, any> = {
  'Lulu Hypermarket UAE': { name: 'Ahmed Al Rashid', role: 'Category buyer', email: 'ahmed.alrashid@luluhypermarket.com', phone: '+971501234567', wa: '+971501234567' },
  'Homecentre Kuwait': { name: 'Fatima Hassan', role: 'Purchasing manager', email: 'fatima.hassan@homecentre.com', phone: '+96599876543', wa: '+96599876543' },
  'Union Coop UAE': { name: 'James Park', role: 'Kitchen buyer', email: 'james.park@unioncoop.ae', phone: '+971552345678', wa: '+971552345678' },
};

const MSG_TEMPLATES: Record<string, any> = {
  quotation: {
    wa: `Hi {name},\n\nPlease find attached our quotation *{ref}* for {account}.\n\n📋 *Summary*\nBrand: {brand}\nTotal: {amount} (incl. VAT)\nValid until: {date}\n\nKindly review and let us know if you have any questions or would like to discuss the terms.\n\nBest regards,\nHouseMart Group\n+971 4 226 0012`,
    email: { subject: 'Quotation {ref} — {brand} — HouseMart Group', body: `Dear {name},\n\nPlease find attached our quotation {ref} for your review.\n\nQuotation details:\n• Brand: {brand}\n• Account: {account}\n• Total amount: {amount} (inclusive of 5% UAE VAT)\n• Valid until: {date}\n• Payment terms: Net 30 days\n\nPlease do not hesitate to contact us if you have any questions or require amendments. We look forward to your confirmation.\n\nKind regards,\nHouseMart Group` }
  },
  salesorder: {
    wa: `Hi {name},\n\n✅ Your order *{ref}* has been confirmed.\n\n📦 *Order details*\nBrand: {brand}\nTotal: {amount}\nExpected delivery: {date}\n\nThank you for your business!`,
    email: { subject: 'Sales order confirmed — {ref} — {brand}', body: `Dear {name},\n\nThank you for your order. We are pleased to confirm that sales order {ref} has been received and is now being processed.\n\nOrder summary:\n• Order reference: {ref}\n• Brand: {brand}\n• Total amount: {amount}\n• Expected delivery: {date}\n\nKind regards,\nHouseMart Group` }
  }
};

const SendModal = ({ isOpen, onClose, type, data }: SendModalProps) => {
  const [channel, setChannel] = useState<'wa' | 'email'>('wa');
  const [waMsg, setWaMsg] = useState('');
  const [emailSubj, setEmailSubj] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);

  const contact = CONTACTS[data.account || ''] || { name: 'Contact', role: 'Buyer', email: 'buyer@company.com', phone: '+971XXXXXXXXX', wa: '+971XXXXXXXXX' };

  useEffect(() => {
    if (isOpen && type && MSG_TEMPLATES[type]) {
      const fill = (str: string) => {
        return str
          .replace(/{name}/g, contact.name)
          .replace(/{ref}/g, data.ref || '')
          .replace(/{account}/g, data.account || '')
          .replace(/{brand}/g, data.brand || '')
          .replace(/{amount}/g, data.amount || '')
          .replace(/{date}/g, data.date || '');
      };
      setWaMsg(fill(MSG_TEMPLATES[type].wa));
      setEmailSubj(fill(MSG_TEMPLATES[type].email.subject));
      setEmailBody(fill(MSG_TEMPLATES[type].email.body));
    }
  }, [isOpen, type, data, contact]);

  if (!isOpen) return null;

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onClose();
      // In a real app, trigger a toast notification here
    }, 1500);
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black/45 z-[9999] flex items-center justify-center p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box bg-white rounded-rl w-full max-w-[760px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="modal-hdr flex items-center gap-2.5 px-4.5 py-3.5 border-b border-border shrink-0">
          <div className="flex-1">
            <div className="modal-title text-[13px] font-semibold text-black">
              Send document — {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Ref: <span className="font-mono">{data.ref}</span> · {data.amount}
            </div>
          </div>
          <button className="modal-close w-7 h-7 rounded-full border border-border bg-bg cursor-pointer flex items-center justify-center text-gray-500 hover:text-black transition-all" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body grid grid-cols-[200px_1fr] flex-1 overflow-hidden">
          {/* LEFT PANEL */}
          <div className="modal-left border-r border-border p-3.5 flex flex-col gap-2.5 overflow-y-auto bg-white">
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Recipient</div>
              <div className="contact-card bg-bg2 border border-border rounded-r p-2.5">
                <div className="cc-avatar w-9 h-9 rounded-full bg-slate flex items-center justify-center text-[12px] font-semibold text-white mb-2">
                  {contact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="cc-name text-[12px] font-semibold text-black">{contact.name}</div>
                <div className="cc-role text-[10px] text-gray-500 mt-0.5">{contact.role} — {data.account}</div>
                <div className="cc-row flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-border2 text-[10px] text-gray-500">
                  <Mail className="w-3 h-3" /> {contact.email}
                </div>
                <div className="cc-row flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500">
                  <Phone className="w-3 h-3" /> {contact.phone}
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Attachments</div>
              <div className="attach-section bg-bg2 border border-border rounded-r p-2.5 flex flex-col gap-1">
                <div className="flex items-center gap-2 py-1 border-b border-border2 last:border-0">
                  <div className="w-3.5 h-3.5 rounded bg-slate flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>
                  <span className="text-[11px] text-black flex-1">Document PDF</span>
                </div>
                <div className="flex items-center gap-2 py-1 border-b border-border2 last:border-0 opacity-50">
                  <div className="w-3.5 h-3.5 rounded border border-border"></div>
                  <span className="text-[11px] text-black flex-1">Brand catalogue</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="modal-right flex flex-col overflow-hidden bg-white">
            <div className="ch-tabs flex border-b border-border shrink-0">
              <button 
                className={`flex-1 p-2.5 text-center cursor-pointer text-[12px] font-medium transition-all flex items-center justify-center gap-1.5 border-b-2 ${channel === 'wa' ? 'text-ok border-ok bg-ok/5' : 'text-gray-500 border-transparent hover:bg-gray-50'}`}
                onClick={() => setChannel('wa')}
              >
                <div className={`w-2 h-2 rounded-full ${channel === 'wa' ? 'bg-ok' : 'bg-gray-300'}`}></div>
                WhatsApp
              </button>
              <button 
                className={`flex-1 p-2.5 text-center cursor-pointer text-[12px] font-medium transition-all flex items-center justify-center gap-1.5 border-b-2 ${channel === 'email' ? 'text-slate border-slate bg-slate/5' : 'text-gray-500 border-transparent hover:bg-gray-50'}`}
                onClick={() => setChannel('email')}
              >
                <div className={`w-2 h-2 rounded-full ${channel === 'email' ? 'bg-slate' : 'bg-gray-300'}`}></div>
                Email
              </button>
            </div>

            <div className="panel p-3.5 overflow-y-auto flex-1">
              {channel === 'wa' ? (
                <div className="space-y-3">
                  <div className="sm-fg flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">WhatsApp number</label>
                    <input className="fi px-2.5 py-1.5 border border-border rounded-r text-[11px] bg-white text-black outline-none focus:border-slate" value={contact.wa} readOnly />
                  </div>
                  <div className="wa-preview bg-[#f0ece4] rounded-r p-2.5">
                    <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message preview</div>
                    <div className="wa-bubble bg-[#DCF8C6] rounded-l-lg rounded-br-lg p-2.5 text-[11px] text-black leading-relaxed whitespace-pre-wrap ml-auto max-w-[85%] shadow-sm">
                      {waMsg}
                    </div>
                  </div>
                  <div className="sm-fg flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Edit message</label>
                    <textarea 
                      className="fi px-2.5 py-2 border border-border rounded-r text-[11px] bg-white text-black outline-none focus:border-slate min-h-[120px] leading-relaxed" 
                      value={waMsg}
                      onChange={(e) => setWaMsg(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="sm-fg flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">To</label>
                    <input className="fi px-2.5 py-1.5 border border-border rounded-r text-[11px] bg-white text-black outline-none focus:border-slate" value={contact.email} readOnly />
                  </div>
                  <div className="sm-fg flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Subject</label>
                    <input className="fi px-2.5 py-1.5 border border-border rounded-r text-[11px] bg-white text-black outline-none focus:border-slate" value={emailSubj} onChange={(e) => setEmailSubj(e.target.value)} />
                  </div>
                  <div className="sm-fg flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Message body</label>
                    <textarea 
                      className="fi px-2.5 py-2 border border-border rounded-r text-[11px] bg-white text-black outline-none focus:border-slate min-h-[200px] leading-relaxed" 
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer px-4.5 py-3 border-t border-border bg-bg2 flex items-center gap-2 shrink-0">
              <div className="flex-1 flex items-center gap-1.5 text-gray-400">
                <Info className="w-3 h-3" />
                <span className="text-[10px]">Message is pre-filled from document data</span>
              </div>
              <button className="nav-btn px-4 py-1.5 border border-border rounded-r text-[11px] bg-white text-gray-600 font-medium hover:bg-bg transition-all" onClick={onClose}>Cancel</button>
              <button 
                className={`px-6 py-2 rounded-r text-[12px] font-semibold text-white transition-all ${channel === 'wa' ? 'bg-ok hover:bg-[#128C7E]' : 'bg-slate hover:bg-navy'} disabled:opacity-50`}
                disabled={sending}
                onClick={handleSend}
              >
                {sending ? 'Sending...' : channel === 'wa' ? 'Send via WhatsApp' : 'Send email'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendModal;
