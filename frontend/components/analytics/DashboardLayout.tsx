'use client';

import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {React.Children.map(children, (child, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          {child}
        </div>
      ))}
    </div>
  );
}
