import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader, StudentMobileNav } from '@/components/navigation';
import { PageContainer, PageTransition, Footer } from '@/components/layout';

export const StudentLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Application Header */}
      <AppHeader variant="student" />

      {/* Main Content Body */}
      <main className="flex-1 w-full">
        <PageContainer>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </PageContainer>
      </main>

      {/* Bottom Mobile Navigation Bar */}
      <StudentMobileNav />

      {/* Footer */}
      <Footer minimal className="hidden md:block" />
    </div>
  );
};
