import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader, AdminSidebar, AdminMobileNav } from '@/components/navigation';
import { PageTransition, Footer } from '@/components/layout';

export const AdminLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Application Header */}
      <AppHeader
        variant="admin"
        onMobileMenuToggle={() => setMobileNavOpen(true)}
      />

      {/* Admin Shell Body */}
      <div className="flex flex-1 pt-14">
        {/* Desktop Sidebar */}
        <AdminSidebar />

        {/* Mobile Navigation Drawer */}
        <AdminMobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-60 p-4 sm:p-6 lg:p-8 w-full min-w-0 pb-16">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* Minimal Footer */}
      <Footer minimal className="lg:ml-60" />
    </div>
  );
};
