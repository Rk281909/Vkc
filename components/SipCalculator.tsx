import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import CalculatorWrapper from './CalculatorWrapper';
import SliderInput from './SliderInput';
import ResultDisplay from './ResultDisplay';

interface SipProjectionData {
  year: number;
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
}

const SipCalculator: React.FC = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [returnRate, setReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(15);

  const { totalValue, investedAmount, estimatedReturns } = useMemo(() => {
    const p = monthlyInvestment;
    const r = returnRate / 12 / 100;
    const n = timePeriod * 12;

    if (p <= 0 || r < 0 || n <= 0) {
      return { totalValue: p * n, investedAmount: p * n, estimatedReturns: 0 };
    }

    const futureValue = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const totalInvested = p * n;
    const returns = futureValue - totalInvested;

    return {
      totalValue: Math.round(futureValue),
      investedAmount: Math.round(totalInvested),
      estimatedReturns: Math.round(returns),
    };
  }, [monthlyInvestment, returnRate, timePeriod]);
  
  const yearlyProjection = useMemo<SipProjectionData[]>(() => {
    const p = monthlyInvestment;
    const r = returnRate / 12 / 100;
    const years = timePeriod;
    if (p <= 0 || r < 0 || years <= 0) return [];

    const projection: SipProjectionData[] = [];
    
    for (let year = 1; year <= years; year++) {
        const n = year * 12;
        const futureValue = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const totalInvested = p * n;
        const returns = futureValue - totalInvested;

        projection.push({
            year,
            investedAmount: Math.round(totalInvested),
            estimatedReturns: Math.round(returns),
            totalValue: Math.round(futureValue),
        });
    }
    return projection;
  }, [monthlyInvestment, returnRate, timePeriod]);


  const chartData = [
    { name: 'Invested Amount', value: investedAmount },
    { name: 'Estimated Returns', value: estimatedReturns },
  ];

  const COLORS = ['#38BDF8', '#00BFFF'];

  const GrowthIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );

  const formatCurrency = (value: number) => `₹ ${value.toLocaleString('en-IN')}`;

  const handleExport = () => {
    if (yearlyProjection.length === 0) return;

    const headers = ['Year', 'Invested Amount (₹)', 'Estimated Returns (₹)', 'Total Value (₹)'];
    const csvContent = [
      headers.join(','),
      ...yearlyProjection.map(row => [
        row.year,
        row.investedAmount,
        row.estimatedReturns,
        row.totalValue
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sip-yearly-projection.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <CalculatorWrapper title="SIP Calculator" icon={<GrowthIcon />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <SliderInput label="Monthly Investment" value={monthlyInvestment} min={500} max={100000} step={500} onChange={setMonthlyInvestment} unit="₹" />
          <SliderInput label="Expected Return Rate" value={returnRate} min={1} max={30} step={0.5} onChange={setReturnRate} unit="%" />
          <SliderInput label="Time Period" value={timePeriod} min={1} max={40} step={1} onChange={setTimePeriod} unit="Yr" />
        </div>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #38BDF8', borderRadius: '8px' }}
                  itemStyle={{ color: '#E2E8F0' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#38BDF8]"></div>
                    <span className="text-xs text-gray-400">Invested</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#00BFFF]"></div>
                    <span className="text-xs text-gray-400">Returns</span>
                </div>
            </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ResultDisplay label="Invested Amount" value={formatCurrency(investedAmount)} />
        <ResultDisplay label="Estimated Returns" value={formatCurrency(estimatedReturns)} />
        <ResultDisplay label="Total Value" value={formatCurrency(totalValue)} />
      </div>

      {yearlyProjection.length > 0 && (
        <div className="mt-10 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Yearly Projection</h3>
            <button 
              onClick={handleExport}
              className="flex items-center px-3 py-1 bg-brand-secondary text-sm text-brand-accent rounded-md hover:bg-brand-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <ExportIcon />
              Export CSV
            </button>
          </div>
          <div className="bg-brand-secondary/30 rounded-lg p-4 overflow-x-auto max-h-80">
            <table className="w-full min-w-[500px] text-sm text-left">
              <thead className="border-b border-brand-secondary/50">
                <tr>
                  <th className="p-3 font-semibold text-gray-400">Year</th>
                  <th className="p-3 font-semibold text-gray-400">Invested Amount</th>
                  <th className="p-3 font-semibold text-gray-400">Est. Returns</th>
                  <th className="p-3 font-semibold text-gray-400">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {yearlyProjection.map((row) => (
                  <tr key={row.year} className="border-b border-brand-secondary/20 hover:bg-brand-secondary/40 transition-colors">
                    <td className="p-3 text-gray-300">{row.year}</td>
                    <td className="p-3 text-gray-300">{formatCurrency(row.investedAmount)}</td>
                    <td className="p-3 text-green-400">{formatCurrency(row.estimatedReturns)}</td>
                    <td className="p-3 text-brand-accent">{formatCurrency(row.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </CalculatorWrapper>
  );
};

export default SipCalculator;