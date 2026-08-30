import React from 'react';

interface FooterProps {
  className?: string;
  minimal?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ className = '', minimal = false }) => {
  if (minimal) {
    return (
      <footer
        className={`border-t border-white/10 py-4 px-6 text-xs text-[#71717a] text-center ${className}`}
      >
        <p>IIITDM Kancheepuram — GymSync Campus Facility Management</p>
      </footer>
    );
  }

  return (
    <footer
      className={`border-t border-white/10 py-6 px-4 sm:px-6 text-xs text-[#71717a] bg-[#09090b] ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#fafafa]">GymSync</span>
          <span>•</span>
          <span>IIITDM Kancheepuram Sports Complex</span>
        </div>
        <div>Indian Institute of Information Technology, Design and Manufacturing</div>
      </div>
    </footer>
  );
};
