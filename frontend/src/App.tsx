import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Feed from './pages/Feed';
import LedgerPage from './pages/LedgerPage';
import OrderForm from './components/OrderForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Feed />} />
          <Route path="new-quotation" element={<OrderForm type="quotation" />} />
          <Route path="new-order" element={<OrderForm type="salesorder" />} />
          <Route path="new-invoice" element={<OrderForm type="invoice" />} />
          
          <Route path="quotations" element={<LedgerPage type="quotation" />} />
          <Route path="sales-orders" element={<LedgerPage type="salesorder" />} />
          <Route path="invoices" element={<LedgerPage type="invoice" />} />
          <Route path="fulfilment" element={<div className="p-10 text-center text-gray-400">Fulfilment Hub (Integrated with Orders)</div>} />
          <Route path="returns" element={<div className="p-10 text-center text-gray-400">Returns Management (Direct Ledger)</div>} />
          <Route path="payments" element={<div className="p-10 text-center text-gray-400">Payment Tracker (Automatic from Invoices)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
