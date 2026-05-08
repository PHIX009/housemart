import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Feed from './pages/Feed';
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
          
          <Route path="quotations" element={<div>Quotations Ledger (Coming Soon)</div>} />
          <Route path="sales-orders" element={<div>Sales Orders Ledger (Coming Soon)</div>} />
          <Route path="invoices" element={<div>Invoices Ledger (Coming Soon)</div>} />
          <Route path="fulfilment" element={<div>Fulfilment Hub (Coming Soon)</div>} />
          <Route path="returns" element={<div>Returns Management (Coming Soon)</div>} />
          <Route path="payments" element={<div>Payment Tracker (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
