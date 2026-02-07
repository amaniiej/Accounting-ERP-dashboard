import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-6 pb-0">
          <Header />
        </div>
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
           <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;