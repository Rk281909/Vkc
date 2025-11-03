
import React, { useState, useMemo } from 'react';
import CalculatorWrapper from './CalculatorWrapper';
import SliderInput from './SliderInput';
import ResultDisplay from './ResultDisplay';

const InterestCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(6);
  const [time, setTime] = useState(5);

  const { totalInterest, totalAmount } = useMemo(() => {
    const p = principal;
    const r = rate;
    const t = time;

    if (p <= 0 || r <= 0 || t <= 0) {
      return { totalInterest: 0, totalAmount: 0 };
    }

    const simpleInterest = (p * r * t) / 100;
    const amount = p + simpleInterest;

    return {
      totalInterest: Math.round(simpleInterest),
      totalAmount: Math.round(amount),
    };
  }, [principal, rate, time]);
  
  const SavingsIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
     </svg>
  );


  return (
    <CalculatorWrapper title="Simple Interest Calculator" icon={<SavingsIcon />}>
      <div className="space-y-6 max-w-lg mx-auto">
          <SliderInput label="Principal Amount" value={principal} min={1000} max={10000000} step={1000} onChange={setPrincipal} unit="₹" />
          <SliderInput label="Rate of Interest" value={rate} min={1} max={25} step={0.25} onChange={setRate} unit="%" />
          <SliderInput label="Time Period" value={time} min={1} max={30} step={1} onChange={setTime} unit="Yr" />
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
        <ResultDisplay label="Principal Amount" value={`₹ ${principal.toLocaleString('en-IN')}`} />
        <ResultDisplay label="Total Interest" value={`₹ ${totalInterest.toLocaleString('en-IN')}`} />
        <ResultDisplay label="Total Amount" value={`₹ ${totalAmount.toLocaleString('en-IN')}`} />
      </div>
    </CalculatorWrapper>
  );
};

export default InterestCalculator;
