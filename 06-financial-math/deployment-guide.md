# Chapter 6: Deployment Guide
## Financial Calculator Web App

### Prerequisites

- A Google account
- The code from this folder (`Code.gs` and `FinancialCalculator.html`)
- Google Chrome or modern browser

---

### Step 1: Open Apps Script

1. Open a Google Sheet (any sheet works as the container)
2. Click **Extensions > Apps Script**
3. Name your project "Financial Calculator"
4. Delete the placeholder code

---

### Step 2: Add the Backend Code

1. Copy the entire contents of `Code.gs`
2. Paste it into the `Code.gs` file in Apps Script
3. Click **Save** (💾)

---

### Step 3: Add the HTML File

1. In the Apps Script editor, click the **+** icon next to "Files"
2. Select **HTML**
3. Name the new file `FinancialCalculator`
4. Copy the entire contents of `FinancialCalculator.html`
5. Paste it into the new file
6. Click **Save**

---

### Step 4: Deploy as Web App

1. Click **Deploy** (🚀) in the top-right
2. Select **New deployment**
3. Under **Select type**, choose **Web app**
4. Under **Execute as**, choose **Me**
5. Under **Who has access**, choose **Anyone**
6. Click **Deploy**
7. **Important:** Grant permissions when prompted
8. Copy the URL (e.g., `https://script.google.com/macros/s/.../exec`)

---

### Step 5: Test Your Web App

1. Open a new browser tab
2. Paste the URL
3. The loan calculator should auto-calculate on load
4. Test different tabs:
   - **Loan Calculator:** Enter amount, rate, term
   - **Compare Loans:** Compare two loan options
   - **Investment Tools:** Calculate ROI

---

### Understanding the Dashboard

| Tab | What It Does |
|-----|--------------|
| **Loan Calculator** | Calculates monthly payment, total cost, and interest |
| **Compare Loans** | Side-by-side comparison of two loans |
| **Investment Tools** | Calculates ROI and profitability |

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| **Calculator not loading** | Refresh the page or check your internet connection |
| **"Please enter valid loan amount"** | Make sure all fields have numbers > 0 |
| **Amortization table blank** | Check that your loan term is reasonable (1-30 years) |
| **Compare shows same result** | Make sure Loan A and Loan B have different values |

---

### Customization Tips

1. **Add more tabs:** Add a "Savings Calculator" or "Retirement Planner"
2. **Change colors:** Modify the CSS in `FinancialCalculator.html`
3. **Add currency formatting:** The code already uses $, but you can change to other currencies
4. **Export reports:** Add a button to generate PDF reports

---

### Business Applications

- **Personal Finance:** Calculate mortgage or car loan payments
- **Business Loans:** Compare bank loan options
- **Investment Analysis:** Calculate ROI for business investments
- **Financial Planning:** Help clients understand loan costs

---

*Part of [From Spreadsheet to Web App](https://github.com/iwasiu/from-spreadsheet-to-web-app) book repository.*
