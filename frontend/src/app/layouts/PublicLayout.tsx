import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/navigation';
import { PageTransition, Footer } from '@/components/layout';

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-blue-500/30 selection:text-blue-200">
      {/* Header */}
      <AppHeader variant="public" />

      {/* Main Content */}
      <main className="flex-1 pt-14 w-full">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
