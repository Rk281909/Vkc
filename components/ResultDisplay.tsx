
import React from 'react';

interface ResultDisplayProps {
  label: string;
  value: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ label, value }) => {
  return (
    <div className="bg-brand-secondary/50 p-4 rounded-lg text-center">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-brand-primary">{value}</p>
    </div>
  );
};

export default ResultDisplay;
