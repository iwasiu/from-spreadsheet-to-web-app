# Chapter 5: Deployment Guide
## Sales Forecasting Dashboard

### Prerequisites

- A Google account
- The code from this folder (`Code.gs` and `Forecast.html`)
- Google Chrome or modern browser
- A Google Sheet with historical sales data

---

### Step 1: Prepare Your Google Sheet

1. Open a new Google Sheet
2. Add the following headers in Row 1:
   - Column A: `Date`
   - Column B: `Sales`
3. Add historical sales data (use `sample-data.csv` as a template)

### Step 2: Open Apps Script

1. Click **Extensions > Apps Script**
2. Name your project "Sales Forecast"
3. Delete the placeholder code

### Step 3: Add the Backend Code

1. Copy the entire contents of `Code.gs`
2. Paste it into the `Code.gs` file in Apps Script
3. Click **Save** (💾)

### Step 4: Add the HTML File

1. In the Apps Script editor, click the **+** icon next to "Files"
2. Select **HTML**
3. Name the new file `Forecast`
4. Copy the entire contents of `Forecast.html`
5. Paste it into the new file
6. Click **Save**

### Step 5: Deploy as Web App

1. Click **Deploy** (🚀) in the top-right
2. Select **New deployment**
3. Under **Select type**, choose **Web app**
4. Under **Execute as**, choose **Me**
5. Under **Who has access**, choose **Anyone**
6. Click **Deploy**
7. **Important:** Grant permissions when prompted
8. Copy the URL (e.g., `https://script.google.com/macros/s/.../exec`)

### Step 6: Test Your Web App

1. Open a new browser tab
2. Paste the URL
3. The dashboard should automatically generate a forecast
4. Try different forecast periods (3, 6, 12, 24 months)
5. Verify the chart and statistics update

### Step 7: Add Sample Data (Optional)

1. In your Google Sheet, click **Extensions > Forecast Tools**
2. Select **Add Sample Data**
3. The sheet will populate with 24 months of sample data
4. Refresh the web app

---

### Understanding the Dashboard

| Element | What It Shows |
|---------|---------------|
| **Forecast Accuracy** | R² value (how reliable the forecast is) |
| **Growth Rate** | Monthly percentage change in sales |
| **Next Month Forecast** | Predicted sales for next period |
| **Last Month Actual** | Actual sales from the most recent period |
| **Chart** | Visual trend line with historical and predicted data |
| **Table** | Detailed breakdown of historical and predicted values |

### Interpreting R² Values

| R² Value | Meaning | Action |
| :---: | :--- | :--- |
| 0.9+ | Excellent fit | Very reliable forecast |
| 0.7–0.9 | Good fit | Reliable forecast |
| 0.5–0.7 | Moderate fit | Use with caution |
| < 0.5 | Weak fit | Consider other methods |

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| **"No data found"** | Make sure your sheet has data starting at row 2 |
| **Chart not showing** | Check that Google Charts loads (may take a moment) |
| **"Need at least 2 data points"** | Add more historical data |
| **R² is very low** | The data doesn't follow a linear trend. Consider seasonality. |
| **Forecast shows negative values** | The trend is downward. Check your business strategy. |

---

### Customization Tips

1. **Add more data:** The more historical data you have, the more reliable the forecast
2. **Change the color scheme:** Modify the `colors` array in `Forecast.html`
3. **Add seasonality:** Modify the regression to account for monthly patterns
4. **Export to PDF:** Add a button to generate a PDF report

---

### Business Applications

- **Inventory Planning:** Order the right amount of stock
- **Staffing:** Hire or reduce staff based on expected demand
- **Budgeting:** Plan expenses based on projected revenue
- **Goal Setting:** Set realistic sales targets
- **Investor Presentations:** Show growth projections

---

*Part of [From Spreadsheet to Web App](https://github.com/iwasiu/from-spreadsheet-to-web-app) book repository.*
