const calculateTax = (grossSalary: number) => {
    let taxRate = 0;
    let pension = 0;
    let netSalary = grossSalary;
  
    if (grossSalary > 600 && grossSalary < 1651) {
      taxRate = grossSalary * 0.1 - 60;
      pension = grossSalary * 0.07;
    } else if (grossSalary > 1650 && grossSalary < 3201) {
      taxRate = grossSalary * 0.15 - 142.5;
      pension = Math.floor(grossSalary * 0.07);
    } else if (grossSalary > 3200 && grossSalary < 5251) {
      taxRate = grossSalary * 0.2 - 302.5;
      pension = grossSalary * 0.07;
    } else if (grossSalary > 5250 && grossSalary < 7801) {
      taxRate = grossSalary * 0.25 - 565;
      pension = grossSalary * 0.07;
    } else if (grossSalary > 7800 && grossSalary < 10901) {
      taxRate = grossSalary * 0.3 - 955;
      pension = grossSalary * 0.07;
    } else if (grossSalary > 10900) {
      taxRate = grossSalary * 0.35 - 1500;
      pension = grossSalary * 0.07;
    }
  
    netSalary = grossSalary - taxRate - pension;
  
    return { taxRate, pension, netSalary };
  };
  module.exports={calculateTax};