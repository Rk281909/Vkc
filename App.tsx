import React, { useState } from 'react';
import EmiCalculator from './components/EmiCalculator';
import SipCalculator from './components/SipCalculator';
import InterestCalculator from './components/InterestCalculator';
import { CalculatorType } from './types';

const App: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>(CalculatorType.EMI);

  const renderCalculator = () => {
    switch (activeCalculator) {
      case CalculatorType.EMI:
        return <EmiCalculator />;
      case CalculatorType.SIP:
        return <SipCalculator />;
      case CalculatorType.INTEREST:
        return <InterestCalculator />;
      default:
        return <EmiCalculator />;
    }
  };

  const NavButton: React.FC<{ type: CalculatorType; label: string }> = ({ type, label }) => (
    <button
      onClick={() => setActiveCalculator(type)}
      className={`px-4 py-2 text-sm md:text-base font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-accent ${
        activeCalculator === type
          ? 'bg-brand-primary text-white shadow-glow'
          : 'bg-brand-secondary text-gray-300 hover:bg-brand-accent/50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-primary tracking-wider">
            RAKESH KURMI CALCULATION
          </h1>
          <p className="text-gray-400 mt-2">Precision Calculators for Modern Planning</p>
        </header>

        <nav className="flex justify-center space-x-2 md:space-x-4 mb-8 bg-brand-surface p-2 rounded-lg shadow-lg">
          <NavButton type={CalculatorType.EMI} label="EMI Calculator" />
          <NavButton type={CalculatorType.SIP} label="SIP Calculator" />
          <NavButton type={CalculatorType.INTEREST} label="Interest Calculator" />
        </nav>

        <main>
          {renderCalculator()}
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} RAKESH KURMI CALCULATION. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;