
import React from 'react';

interface CalculatorWrapperProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const CalculatorWrapper: React.FC<CalculatorWrapperProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-brand-surface rounded-xl shadow-lg border border-brand-secondary/50 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-brand-secondary/50 flex items-center space-x-4">
        <div className="text-brand-accent">{icon}</div>
        <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default CalculatorWrapper;
