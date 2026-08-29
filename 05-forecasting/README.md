# Chapter 5: Forecasting with Linear Regression

## 📁 What's in This Folder?

| File | Description |
|------|-------------|
| `Code.gs` | Backend forecasting with linear regression |
| `Forecast.html` | Web app dashboard with Google Charts |
| `sample-data.csv` | Sample sales data for testing |
| `deployment-guide.md` | Step-by-step deployment instructions |

## 📝 What You'll Build

A sales forecasting dashboard that:
- Reads historical sales data from Google Sheets
- Calculates the trend line using linear regression
- Predicts future sales for any number of months
- Visualizes the forecast with Google Charts
- Provides business recommendations based on the data

## 🚀 Quick Start

1. Copy `Code.gs` into your Apps Script project
2. Create a new HTML file named `Forecast.html` and copy the HTML code
3. Deploy as a web app (see `deployment-guide.md`)
4. Add sample data to your sheet (use `sample-data.csv` as a template)
5. Access the web app and generate your forecast

## 📊 The Math Behind It

- **Linear Regression:** `y = mx + b` (the line of best fit)
- **Slope (m):** How much sales change per period
- **Intercept (b):** The starting point of the trend
- **R²:** How reliable the forecast is (0–1)
  - 0.9+ = Excellent fit
  - 0.7+ = Good fit
  - 0.5+ = Moderate fit
  - < 0.5 = Weak fit (use with caution)

## 📈 Sample Data Format

Your Google Sheet should have these columns (Row 1 = headers):

| Column A | Column B |
|----------|----------|
| **Date** | **Sales** |
| 2024-01-01 | 12000 |
| 2024-02-01 | 12500 |

## 🔧 Key Functions

| Function | Purpose |
|----------|---------|
| `calculateLinearRegression()` | Calculates slope, intercept, and R² |
| `forecastFutureSales()` | Predicts future periods |
| `generateForecast()` | Main function that returns complete forecast |
| `getForecastDataWebApp()` | Web app interface |

## 💡 Business Insights

The dashboard provides:
- **Forecast Accuracy** (R²): How much you can trust the predictions
- **Growth Rate**: Monthly percentage change
- **Next Month Forecast**: What to expect next month
- **Visual Chart**: See the trend and predictions
- **Recommendations**: Actionable business advice

## 📚 Related Chapter Content

This code accompanies **Chapter 5: Forecasting with Linear Regression** of the book *From Spreadsheet to Web App*.

The chapter explains:
- The mathematics of linear regression
- How to calculate slope, intercept, and R²
- How to build a forecasting dashboard
- How to interpret and use forecast results

---

*Part of the [From Spreadsheet to Web App](https://github.com/iwasiu/from-spreadsheet-to-web-app) book repository.*
