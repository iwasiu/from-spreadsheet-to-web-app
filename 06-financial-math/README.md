# Chapter 6: Financial Math for Business Apps

## 📁 What's in This Folder?

| File | Description |
|------|-------------|
| `Code.gs` | Backend financial calculations |
| `FinancialCalculator.html` | Web app with loan calculator, comparison, and ROI tools |
| `sample-data.csv` | Sample loan data for testing |
| `deployment-guide.md` | Step-by-step deployment instructions |

## 📝 What You'll Build

A comprehensive financial calculator that:
- Calculates loan payments using the PMT formula
- Generates full amortization schedules
- Compares two loan options side by side
- Calculates ROI for investments
- Shows total interest and cost savings

## 🚀 Quick Start

1. Copy `Code.gs` into your Apps Script project
2. Create a new HTML file named `FinancialCalculator.html` and copy the HTML code
3. Deploy as a web app (see `deployment-guide.md`)
4. Access the web app and start calculating!

## 📊 The Math Behind It

| Formula | What It Does |
|---------|--------------|
| **PMT** | `P × [r(1+r)^n] / [(1+r)^n - 1]` | Calculates monthly payment |
| **Compound Interest** | `A = P × (1 + r/n)^(n × t)` | Calculates growth over time |
| **ROI** | `(Net Profit / Investment) × 100` | Measures investment returns |
| **Amortization** | Principal/interest breakdown | Shows how loan is paid off |

## 📈 Features

- **Loan Calculator:** Amount, rate, term, extra payments
- **Amortization Schedule:** Full breakdown of every payment
- **Loan Comparison:** Side-by-side comparison of two loans
- **ROI Calculator:** Investment returns and profitability

## 📚 Related Chapter Content

This code accompanies **Chapter 6: Financial Math for Business Apps** of the book *From Spreadsheet to Web App*.

The chapter explains:
- Compound interest and loan payment formulas
- How to build amortization schedules
- How to compare loan options
- ROI and investment calculations

---

*Part of the [From Spreadsheet to Web App](https://github.com/iwasiu/from-spreadsheet-to-web-app) book repository.*
