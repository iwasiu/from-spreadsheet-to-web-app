# Chapter 7: Inventory Management with Algebra

## 📁 What's in This Folder?

| File | Description |
|------|-------------|
| `Code.gs` | Backend inventory management logic |
| `InventoryManager.html` | Web app for tracking inventory and generating POs |
| `sample-data.csv` | Sample inventory data |
| `deployment-guide.md` | Step-by-step deployment instructions |

## 📝 What You'll Build

An inventory management system that:
- Tracks current stock levels for all products
- Calculates reorder points using algebra
- Flags items that need reordering
- Generates purchase orders with one click
- Filters by supplier

## 🚀 Quick Start

1. Copy `Code.gs` into your Apps Script project
2. Create a new HTML file named `InventoryManager.html` and copy the HTML code
3. Deploy as a web app (see `deployment-guide.md`)
4. Add sample data using the web app or manually
5. Start tracking your inventory!

## 📊 The Math Behind It

| Formula | What It Does |
|---------|--------------|
| **EOQ** | `√(2 × D × S / H)` | Optimal order quantity |
| **ROP** | `(Daily Demand × Lead Time) + Safety Stock` | When to reorder |
| **Safety Stock** | `(Max Demand × Max Lead Time) - (Avg Demand × Avg Lead Time)` | Buffer stock |
| **Turnover** | `COGS / Average Inventory` | Efficiency measure |

## 📈 Features

- **Inventory Dashboard:** See all products at a glance
- **Low Stock Alerts:** Red highlights for items below reorder point
- **Purchase Order Generator:** Create POs grouped by supplier
- **Supplier Filter:** View inventory by supplier
- **Sample Data:** Quick start with pre-populated data

## 📚 Related Chapter Content

This code accompanies **Chapter 7: Inventory Management with Algebra** of the book *From Spreadsheet to Web App*.

The chapter explains:
- Economic Order Quantity (EOQ)
- Reorder Points (ROP) and Safety Stock
- Inventory Turnover
- How to build an automated inventory system

---

*Part of the [From Spreadsheet to Web App](https://github.com/iwasiu/from-spreadsheet-to-web-app) book repository.*
