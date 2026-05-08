import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Info, Check } from 'lucide-react';
import api from '../lib/api';

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
    date?: string;
  };
}

const SendModal = ({ isOpen, onClose, type, data }: SendModalProps) => {
  const [channel, setChannel] = useState<'wa' | 'email'>('wa');
  const [templates, setTemplates] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [waMsg, setWaMsg] = useState('');
  const [emailSubj, setEmailSubj] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [t, c] = await Promise.all([api.get('/templates'), api.get('/customers')]);
        setTemplates(t.data);
        setContacts(c.data);
      } catch (err) {
        console.error('Error fetching modal meta:', err);
      }
    };
    if (isOpen) fetchMeta();
  }, [isOpen]);

  const contact = contacts.find(c => c.account_name === data.account) || { name: 'Contact', role: 'Buyer', email: 'buyer@company.com', phone: '+971XXXXXXXXX', wa: '+971XXXXXXXXX' };

  useEffect(() => {
    if (isOpen && templates && type) {
      const tmpl = templates[type.toLowerCase().replace(' ', '')] || templates.quotation;
      const fill = (str: string) => {
        return str
          .replace(/{name}/g, contact.contact_name || contact.name)
          .replace(/{ref}/g, data.ref || '')
          .replace(/{soref}/g, data.soref || data.ref || '')
          .replace(/{account}/g, data.account || '')
          .replace(/{brand}/g, data.brand || '')
          .replace(/{amount}/g, data.amount || '')
          .replace(/{date}/g, data.date || '')
          .replace(/{items}/g, 'Selected items');
      };
      setWaMsg(fill(tmpl.wa));
      setEmailSubj(fill(tmpl.email.subject));
      setEmailBody(fill(tmpl.email.body));
    }
  }, [isOpen, templates, type, data, contact]);

  if (!isOpen) return null;

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black/45 z-[9999] flex items-center justify-center p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box bg-white rounded-rl w-full max-w-[760px] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="modal-hdr flex items-center gap-2.5 px-4.5 py-3.5 border-b border-border shrink-0">
          <div className="flex-1">
            <div className="modal-title text-[13px] font-semibold text-black">
              Send document — <span className="capitalize">{type.replace(/_/g, ' ')}</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Ref: <span className="font-mono">{data.ref}</span> · {data.amount}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body grid grid-cols-[200px_1fr] flex-1 overflow-hidden">
          {/* LEFT PANEL */}
          <div className="modal-left border-r border-border p-3.5 flex flex-col gap-2.5 overflow-y-auto">
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Recipient</div>
              <div className="contact-card">
                <div className="cc-avatar bg-slate text-white flex items-center justify-center font-semibold text-[12px]">
                  {(contact.contact_name || 'C').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="cc-name">{contact.contact_name || contact.name}</div>
                <div className="cc-role">{contact.role} — {data.account}</div>
                <div className="cc-row flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-border2 text-[10px] text-gray-500">
                  <Mail className="w-3 h-3 shrink-0" /> <span className="truncate">{contact.email}</span>
                </div>
                <div className="cc-row flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500 border-none pt-0">
                  <Phone className="w-3 h-3 shrink-0" /> <span>{contact.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Document</div>
              <div className="doc-info-card bg-bg2 border border-border rounded-r p-2.5 space-y-1.5">
                <div className="flex justify-between text-[11px]"><span className="text-gray-500">Type</span><span className="font-semibold text-black capitalize">{type.replace(/_/g, ' ')}</span></div>
                <div className="flex justify-between text-[11px]"><span className="text-gray-500">Reference</span><span className="font-mono font-semibold text-black">{data.ref}</span></div>
                <div className="flex justify-between text-[11px]"><span className="text-gray-500">Amount</span><span className="font-semibold text-ok">{data.amount}</span></div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Attach</div>
              <div className="attach-section bg-bg2 border border-border rounded-r p-2.5 flex flex-col gap-1">
                <div className="flex items-center gap-2 py-1 border-b border-border2 last:border-0">
                  <div className="w-3.5 h-3.5 rounded bg-slate flex items-center justify-center text-white text-[9px]"><Check className="w-2.5 h-2.5" /></div>
                  <span className="text-[11px] text-black flex-1">Document PDF</span>
                  <span className="text-[9px] text-gray-400">Auto</span>
                </div>
                <div className="flex items-center gap-2 py-1 border-b border-border2 last:border-0">
                  <div className="w-3.5 h-3.5 rounded bg-slate flex items-center justify-center text-white text-[9px]"><Check className="w-2.5 h-2.5" /></div>
                  <span className="text-[11px] text-black flex-1">Brand catalogue</span>
                  <span className="text-[9px] text-gray-400">4.2 MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="modal-right flex flex-col overflow-hidden">
            <div className="ch-tabs flex border-b border-border shrink-0">
              <button 
                className={`flex-1 p-2.5 text-center cursor-pointer text-[12px] font-medium transition-all flex items-center justify-center gap-2 border-b-2 ${channel === 'wa' ? 'text-[#075E54] border-[#25D366]' : 'text-gray-500 border-transparent'}`}
                onClick={() => setChannel('wa')}
              >
                <div className={`w-2 h-2 rounded-full ${channel === 'wa' ? 'bg-[#25D366]' : 'bg-gray-300'}`}></div>
                WhatsApp
              </button>
              <button 
                className={`flex-1 p-2.5 text-center cursor-pointer text-[12px] font-medium transition-all flex items-center justify-center gap-2 border-b-2 ${channel === 'email' ? 'text-slate border-slate' : 'text-gray-500 border-transparent'}`}
                onClick={() => setChannel('email')}
              >
                <div className={`w-2 h-2 rounded-full ${channel === 'email' ? 'bg-slate' : 'bg-gray-300'}`}></div>
                Email
              </button>
            </div>

            <div className="panel p-3.5 overflow-y-auto flex-1">
              {channel === 'wa' ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">WhatsApp number</label>
                    <input className="fi" value={contact.wa} readOnly />
                  </div>
                  <div className="wa-preview bg-[#f0ece4] rounded-r p-2.5">
                    <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message preview</div>
                    <div className="wa-bubble bg-[#DCF8C6] rounded-l-lg rounded-br-lg p-2.5 text-[11px] text-black leading-relaxed whitespace-pre-wrap ml-auto max-w-[85%] shadow-sm">
                      {waMsg}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Edit message</label>
                    <textarea 
                      className="fi min-h-[140px] leading-relaxed" 
                      value={waMsg}
                      onChange={(e) => setWaMsg(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">To</label>
                    <input className="fi" value={contact.email} readOnly />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Subject</label>
                    <input className="fi" value={emailSubj} onChange={(e) => setEmailSubj(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Message body</label>
                    <textarea 
                      className="fi min-h-[200px] leading-relaxed" 
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer px-4.5 py-3 border-t border-border bg-bg2 flex items-center gap-2 shrink-0">
              <div className="flex-1 text-[10px] text-gray-400 italic">
                Message is pre-filled from document data · you can edit before sending
              </div>
              <button className="nav-btn px-4 py-1.5 border border-border rounded-r text-[11px] bg-white text-gray-600 font-medium hover:bg-bg" onClick={onClose}>Cancel</button>
              <button 
                className={`px-6 py-2 rounded-r text-[12px] font-semibold text-white transition-all ${channel === 'wa' ? 'bg-[#25D366] hover:bg-[#128C7E]' : 'bg-slate hover:bg-navy'} disabled:opacity-50`}
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
