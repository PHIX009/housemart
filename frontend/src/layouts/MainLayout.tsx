import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from '../components/TopNav';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
