import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import CalculatorWrapper from './CalculatorWrapper';
import SliderInput from './SliderInput';
import ResultDisplay from './ResultDisplay';

interface AmortizationData {
  month: number;
  paymentDate: string;
  principalPaid: number;
  interestPaid: number;
  totalPayment: number;
  remainingBalance: number;
}

interface LoanScenario {
  id: number;
  principal: number;
  rate: number;
  tenure: number;
  repaymentType: 'emi' | 'equalPrincipal';
}

interface CalculatedMetrics {
  amortizationSchedule: AmortizationData[];
  firstPayment: number;
  totalInterest: number;
  totalPayment: number;
}

const calculateLoanMetrics = (scenario: LoanScenario): CalculatedMetrics => {
    const { principal, rate, tenure, repaymentType } = scenario;
    if (principal <= 0 || rate <= 0 || tenure <= 0) {
      return { amortizationSchedule: [], firstPayment: 0, totalInterest: 0, totalPayment: 0 };
    }

    const schedule: AmortizationData[] = [];
    const monthlyRate = rate / 12 / 100;
    const totalMonths = tenure * 12;
    const startDate = new Date();
    let remainingBalance = principal;

    if (repaymentType === 'emi') {
      const emiValue = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      if (isNaN(emiValue) || !isFinite(emiValue)) return { amortizationSchedule: [], firstPayment: 0, totalInterest: 0, totalPayment: 0 };

      for (let month = 1; month <= totalMonths; month++) {
        const interestPaid = remainingBalance * monthlyRate;
        let principalPaid = emiValue - interestPaid;
        const currentPayment = month === totalMonths ? remainingBalance + interestPaid : emiValue;
        
        if (month === totalMonths) {
          principalPaid = remainingBalance;
          remainingBalance = 0;
        } else {
          remainingBalance -= principalPaid;
        }

        const paymentDate = new Date(startDate);
        paymentDate.setMonth(startDate.getMonth() + month);
        
        schedule.push({
          month,
          paymentDate: paymentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          principalPaid,
          interestPaid,
          totalPayment: currentPayment,
          remainingBalance: remainingBalance < 0 ? 0 : remainingBalance,
        });
      }
    } else { // 'equalPrincipal'
      const principalPaidPerMonth = principal / totalMonths;
      for (let month = 1; month <= totalMonths; month++) {
        const interestPaid = remainingBalance * monthlyRate;
        const totalPaymentForMonth = principalPaidPerMonth + interestPaid;
        remainingBalance -= principalPaidPerMonth;
        
        const paymentDate = new Date(startDate);
        paymentDate.setMonth(startDate.getMonth() + month);
        
        schedule.push({
          month,
          paymentDate: paymentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          principalPaid: principalPaidPerMonth,
          interestPaid,
          totalPayment: totalPaymentForMonth,
          remainingBalance: remainingBalance < 0 ? 0 : remainingBalance,
        });
      }
    }
    
    const totalInterestValue = schedule.reduce((acc, curr) => acc + curr.interestPaid, 0);
    const firstPaymentValue = schedule[0]?.totalPayment || 0;

    return {
        amortizationSchedule: schedule,
        firstPayment: Math.round(firstPaymentValue),
        totalInterest: Math.round(totalInterestValue),
        totalPayment: Math.round(principal + totalInterestValue),
    };
};


const EmiCalculator: React.FC = () => {
  const [loanScenarios, setLoanScenarios] = useState<LoanScenario[]>([
    { id: 1, principal: 1000000, rate: 8.5, tenure: 20, repaymentType: 'emi' },
  ]);
  const [activeLoanId, setActiveLoanId] = useState(1);
  const [nextId, setNextId] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  const comparisonResults = useMemo(() => {
    return loanScenarios.map(scenario => ({
      ...scenario,
      ...calculateLoanMetrics(scenario),
    }));
  }, [loanScenarios]);
  
  const activeLoan = useMemo(() => {
    return comparisonResults.find(r => r.id === activeLoanId) || comparisonResults[0];
  }, [activeLoanId, comparisonResults]);

  const totalPages = Math.ceil(activeLoan.amortizationSchedule.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return activeLoan.amortizationSchedule.slice(startIndex, startIndex + rowsPerPage);
  }, [activeLoan, currentPage]);

  const handleLoanChange = (id: number, field: keyof Omit<LoanScenario, 'id'>, value: number | string) => {
    setLoanScenarios(prev =>
      prev.map(scenario =>
        scenario.id === id ? { ...scenario, [field]: value } : scenario
      )
    );
    setCurrentPage(1);
  };
  
  const addLoan = () => {
      if (loanScenarios.length < 3) {
        const newLoan: LoanScenario = {
          id: nextId,
          principal: 1000000,
          rate: 8.5,
          tenure: 20,
          repaymentType: 'emi',
        };
        setLoanScenarios([...loanScenarios, newLoan]);
        setActiveLoanId(nextId);
        setNextId(nextId + 1);
      }
    };

    const removeLoan = (idToRemove: number) => {
      if (loanScenarios.length > 1) {
        const updatedScenarios = loanScenarios.filter(l => l.id !== idToRemove);
        setLoanScenarios(updatedScenarios);
        if (activeLoanId === idToRemove) {
          setActiveLoanId(updatedScenarios[0].id);
        }
      }
    };
    
  const activeScenario = loanScenarios.find(l => l.id === activeLoanId) || loanScenarios[0];

  const chartData = [
    { name: 'Principal Amount', value: activeLoan.principal },
    { name: 'Total Interest', value: activeLoan.totalInterest },
  ];

  const COLORS = ['#38BDF8', '#00BFFF'];

  const LoanIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
  
  const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );

  const formatCurrency = (value: number) => `₹ ${Math.round(value).toLocaleString('en-IN')}`;
  
  const handleExport = () => {
    if (activeLoan.amortizationSchedule.length === 0) return;

    const headers = ['Month', 'Date', 'Principal Paid (₹)', 'Interest Paid (₹)', 'Total Payment (₹)', 'Remaining Balance (₹)'];
    const csvContent = [
      headers.join(','),
      ...activeLoan.amortizationSchedule.map(row => [
        row.month,
        `"${row.paymentDate}"`,
        row.principalPaid.toFixed(2),
        row.interestPaid.toFixed(2),
        row.totalPayment.toFixed(2),
        row.remainingBalance.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `loan-${activeLoan.id}-amortization-schedule.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <CalculatorWrapper title="EMI Calculator & Loan Comparison" icon={<LoanIcon />}>
      {/* Tabs */}
      <div className="flex items-center border-b border-brand-secondary/50 mb-6">
        {loanScenarios.map((loan, index) => (
          <div key={loan.id} className="relative">
            <button
              onClick={() => setActiveLoanId(loan.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeLoanId === loan.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Loan {index + 1}
            </button>
            {loanScenarios.length > 1 && (
                 <button onClick={() => removeLoan(loan.id)} className="absolute top-1 right-0 text-gray-500 hover:text-white transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
             )}
          </div>
        ))}
        {loanScenarios.length < 3 && (
          <button onClick={addLoan} className="ml-2 px-3 py-1 text-sm bg-brand-secondary/50 text-brand-accent rounded-md hover:bg-brand-accent/30 transition-colors">
            + Add Loan
          </button>
        )}
      </div>

      {/* Inputs for Active Loan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <SliderInput label="Loan Amount" value={activeScenario.principal} min={100000} max={20000000} step={50000} onChange={(v) => handleLoanChange(activeScenario.id, 'principal', v)} unit="₹" />
          <SliderInput label="Interest Rate" value={activeScenario.rate} min={1} max={20} step={0.1} onChange={(v) => handleLoanChange(activeScenario.id, 'rate', v)} unit="%" />
          <SliderInput label="Loan Tenure" value={activeScenario.tenure} min={1} max={30} step={1} onChange={(v) => handleLoanChange(activeScenario.id, 'tenure', v)} unit="Yr" />
        </div>
        <div className="flex flex-col justify-center items-center space-y-4 bg-brand-secondary/20 p-4 rounded-lg">
           <h4 className="text-md font-semibold text-gray-300">Repayment Method</h4>
           <div className="flex justify-center bg-brand-secondary/50 p-1 rounded-lg w-full max-w-sm">
            <button
                onClick={() => handleLoanChange(activeScenario.id, 'repaymentType', 'emi')}
                className={`w-1/2 py-2 text-xs font-medium rounded-md transition-all duration-300 focus:outline-none ${activeScenario.repaymentType === 'emi' ? 'bg-brand-primary text-white shadow-glow' : 'text-gray-300 hover:bg-brand-accent/20'}`}
            >
                Equal Monthly Installment
            </button>
            <button
                onClick={() => handleLoanChange(activeScenario.id, 'repaymentType', 'equalPrincipal')}
                className={`w-1/2 py-2 text-xs font-medium rounded-md transition-all duration-300 focus:outline-none ${activeScenario.repaymentType === 'equalPrincipal' ? 'bg-brand-primary text-white shadow-glow' : 'text-gray-300 hover:bg-brand-accent/20'}`}
            >
                Equal Principal Payment
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      {loanScenarios.length > 0 && (
      <div className="mt-10 animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Loan Comparison</h3>
        <div className="bg-brand-secondary/30 rounded-lg p-4 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm text-left">
            <thead>
              <tr className="border-b border-brand-secondary/50">
                <th className="p-3 font-semibold text-gray-400">Metric</th>
                {comparisonResults.map((result, index) => (
                  <th key={result.id} className="p-3 font-semibold text-center text-gray-200">Loan {index + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Loan Amount', key: 'principal', format: formatCurrency },
                { label: 'Interest Rate', key: 'rate', format: (v: number) => `${v} %` },
                { label: 'Loan Tenure', key: 'tenure', format: (v: number) => `${v} Yr` },
                { label: 'Repayment Type', key: 'repaymentType', format: (v: string) => v === 'emi' ? 'EMI' : 'Equal Principal' },
                { label: 'Monthly Payment', key: 'firstPayment', format: formatCurrency, highlight: true },
                { label: 'Total Interest', key: 'totalInterest', format: formatCurrency, highlight: true },
                { label: 'Total Payment', key: 'totalPayment', format: formatCurrency, highlight: true },
              ].map((metric) => (
                <tr key={metric.label} className="border-b border-brand-secondary/20">
                  <td className={`p-3 font-medium ${metric.highlight ? 'text-brand-accent' : 'text-gray-300'}`}>
                    {metric.label}
                  </td>
                  {comparisonResults.map((result) => (
                    <td key={result.id} className={`p-3 text-center font-semibold ${metric.highlight ? 'text-brand-primary text-lg' : 'text-gray-300'}`}>
                      {/* FIX: TypeScript cannot correlate the value type with the format function's parameter type. Casting the function to 'any' bypasses this check. */}
                      {(metric.format as any)((result as any)[metric.key])}
                      {metric.key === 'firstPayment' && (
                        <span className="block text-xs text-gray-500 font-normal mt-1">
                          {result.repaymentType === 'emi' ? '(EMI)' : '(First Month)'}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Details for Active Loan */}
      <div className="mt-10 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Details for Loan {loanScenarios.findIndex(l => l.id === activeLoanId) + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="w-full h-56">
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
                <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#38BDF8]"></div>
                        <span className="text-xs text-gray-400">Principal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#00BFFF]"></div>
                        <span className="text-xs text-gray-400">Interest</span>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <ResultDisplay label={activeLoan.repaymentType === 'emi' ? 'Monthly EMI' : "First Month's Payment"} value={formatCurrency(activeLoan.firstPayment)} />
                <ResultDisplay label="Total Interest" value={formatCurrency(activeLoan.totalInterest)} />
                <ResultDisplay label="Total Payment" value={formatCurrency(activeLoan.totalPayment)} />
            </div>
          </div>
          {paginatedData.length > 0 && (
            <div className="mt-8">
              <h4 className="text-md font-semibold text-gray-300 mb-4 text-center">Monthly Payment Breakdown (Page {currentPage})</h4>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paginatedData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                    <XAxis 
                      dataKey="paymentDate" 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                      axisLine={{ stroke: '#4B5563' }} 
                      tickLine={{ stroke: '#4B5563' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${Number(value) / 1000}k`} 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      axisLine={{ stroke: '#4B5563' }}
                      tickLine={{ stroke: '#4B5563' }}
                    />
                    <Tooltip
                      cursor={{fill: 'rgba(56, 189, 248, 0.1)'}}
                      contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #38BDF8', borderRadius: '8px' }}
                      itemStyle={{ color: '#E2E8F0' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend wrapperStyle={{fontSize: "12px", color: "#9CA3AF"}}/>
                    <Bar dataKey="principalPaid" name="Principal" stackId="a" fill={COLORS[0]} />
                    <Bar dataKey="interestPaid" name="Interest" stackId="a" fill={COLORS[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
      </div>
      
      {/* Amortization Schedule */}
      {paginatedData.length > 0 && (
        <div className="mt-10 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Amortization Schedule</h3>
            <button 
              onClick={handleExport}
              className="flex items-center px-3 py-1 bg-brand-secondary text-sm text-brand-accent rounded-md hover:bg-brand-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <ExportIcon />
              Export CSV
            </button>
          </div>
          <div className="bg-brand-secondary/30 rounded-lg p-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm text-left">
              <thead className="border-b border-brand-secondary/50">
                <tr>
                  <th className="p-3 font-semibold text-gray-400">Month</th>
                  <th className="p-3 font-semibold text-gray-400">Date</th>
                  <th className="p-3 font-semibold text-gray-400">Principal</th>
                  <th className="p-3 font-semibold text-gray-400">Interest</th>
                  <th className="p-3 font-semibold text-gray-400">Payment</th>
                  <th className="p-3 font-semibold text-gray-400">Balance</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row) => (
                  <tr key={row.month} className="border-b border-brand-secondary/20 hover:bg-brand-secondary/40 transition-colors">
                    <td className="p-3 text-gray-300">{row.month}</td>
                    <td className="p-3 text-gray-300">{row.paymentDate}</td>
                    <td className="p-3 text-green-400">{formatCurrency(row.principalPaid)}</td>
                    <td className="p-3 text-red-400">{formatCurrency(row.interestPaid)}</td>
                    <td className="p-3 text-gray-300">{formatCurrency(row.totalPayment)}</td>
                    <td className="p-3 text-brand-accent">{formatCurrency(row.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center text-gray-400">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-brand-secondary rounded-md hover:bg-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-brand-secondary rounded-md hover:bg-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </CalculatorWrapper>
  );
};

export default EmiCalculator;