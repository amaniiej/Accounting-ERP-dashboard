// src/utils/payroll.ts

export const calculateEthiopianTax = (grossSalary: number) => {
  let incomeTax = 0;
  const pensionEmployee = grossSalary * 0.07;
  const pensionEmployer = grossSalary * 0.11;
  const taxableIncome = grossSalary - pensionEmployee;

  // Ethiopian Tax Brackets (Monthly)
  if (taxableIncome <= 600) incomeTax = 0;
  else if (taxableIncome <= 1650) incomeTax = (taxableIncome * 0.10) - 60;
  else if (taxableIncome <= 3200) incomeTax = (taxableIncome * 0.15) - 142.5;
  else if (taxableIncome <= 5250) incomeTax = (taxableIncome * 0.20) - 302.5;
  else if (taxableIncome <= 7800) incomeTax = (taxableIncome * 0.25) - 565;
  else if (taxableIncome <= 10900) incomeTax = (taxableIncome * 0.30) - 955;
  else incomeTax = (taxableIncome * 0.35) - 1500;

  return {
    pensionEmployee,
    pensionEmployer,
    incomeTax: Math.max(0, incomeTax),
    netSalary: grossSalary - pensionEmployee - Math.max(0, incomeTax)
  };
};