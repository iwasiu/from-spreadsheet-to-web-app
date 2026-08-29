# Chapter 7: Deployment Guide
## Inventory Manager Web App

### Prerequisites

- A Google account
- The code from this folder (`Code.gs` and `InventoryManager.html`)
- Google Chrome or modern browser

---

### Step 1: Open Apps Script

1. Open a Google Sheet (any sheet works as the container)
2. Click **Extensions > Apps Script**
3. Name your project "Inventory Manager"
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
3. Name the new file `InventoryManager`
4. Copy the entire contents of `InventoryManager.html`
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
3. Click **Add Sample Data** to populate the sheet
4. Click **Refresh Inventory** to see your data
5. Try generating a purchase order

---

### Understanding the Dashboard

| Element | What It Does |
|---------|--------------|
| **Total Products** | Number of products in inventory |
| **Low Stock Items** | Items below reorder point |
| **Low Stock %** | Percentage of items needing reorder |
| **Items to Order** | Products that need restocking |
| **Inventory Table** | Shows all products and their status |
| **Generate PO** | Creates a purchase order |

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| **No data showing** | Click "Add Sample Data" or add data manually |
| **Reorder Point not calculated** | Make sure Daily Demand and Lead Time have values |
| **PO empty** | No items below reorder point |
| **Supplier filter empty** | Make sure products have supplier values |

---

### Customization Tips

1. **Add more fields:** Add columns for cost, supplier contact, etc.
2. **Change the formula:** Modify the reorder point calculation
3. **Add email alerts:** Use `MailApp.sendEmail()` for notifications
4. **Add barcodes:** Generate QR codes for each product

---

### Business Applications

- **Retail:** Track store inventory across locations
- **Manufacturing:** Manage raw materials and finished goods
- **Warehousing:** Optimize stocking levels
- **E-commerce:** Sync inventory with online store

---

*Part of [From Spreadsheet to Web App](https://github.com/iwasiu/from-spreadsheet-to-web-app) book repository.*
