# Chapter 2: Deployment Guide

## Deploying Your First Web App

This guide walks you through deploying the Sales Analyzer Web App.

### Prerequisites

- A Google account
- The code from this folder (Code.gs and Index.html)
- Google Chrome or modern browser

---

### Step 1: Prepare Your Code

1. Open Google Sheets
2. Go to **Extensions > Apps Script**
3. Delete placeholder code
4. Copy `Code.gs` into the `Code.gs` file
5. Create a new HTML file named `Index`
6. Copy `Index.html` into the new file

---

### Step 2: Deploy as Web App

1. Click **Deploy** (🚀) in the top-right
2. Select **New deployment**
3. Under **Select type**, choose **Web app**
4. Under **Execute as**, choose **Me**
5. Under **Who has access**, choose **Anyone**
6. Click **Deploy**
7. Grant permissions when prompted
8. Copy the URL (e.g., `https://script.google.com/macros/s/.../exec`)

---

### Step 3: Test Your App

1. Open a new browser tab
2. Paste the URL
3. Enter some numbers
4. Click **Analyze Sales**
5. Verify results appear

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Script function not found | Check that `analyzeSalesWebApp` is spelled correctly |
| Authorization required | Click "Review Permissions" and grant access |
| Blank page | Open Developer Console (F12) and check for errors |

---

*Part of [From Spreadsheet to Web App](https://github.com/iwasiu/from-spreadsheet-to-web-app)*
