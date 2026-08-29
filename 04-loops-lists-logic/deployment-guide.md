# Chapter 4: Deployment Guide
## Bulk Email Sender Web App

### Prerequisites

- A Google account
- The code from this folder (`Code.gs` and `EmailSender.html`)
- Google Chrome or modern browser
- A Google Sheet with customer data

---

### Step 1: Prepare Your Google Sheet

1. Open a new Google Sheet
2. Add the following headers in Row 1:
   - Column A: `Name`
   - Column B: `Email`
   - Column C: `Balance`
   - Column D: `LastPurchase`
   - Column E: `Tier`

3. Add customer data (use `sample-data.csv` as a template)

### Step 2: Open Apps Script

1. Click **Extensions > Apps Script**
2. Name your project "Bulk Email Sender"
3. Delete the placeholder code

### Step 3: Add the Backend Code

1. Copy the entire contents of `Code.gs`
2. Paste it into the `Code.gs` file in Apps Script
3. Click **Save** (💾)

### Step 4: Add the HTML File

1. In the Apps Script editor, click the **+** icon next to "Files"
2. Select **HTML**
3. Name the new file `EmailSender`
4. Copy the entire contents of `EmailSender.html`
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
3. You should see the Bulk Email Sender interface
4. Click **Refresh Count** to verify your data loaded
5. Click **Preview First Email** to see what customers will receive
6. If everything looks good, click **Send All Emails**

### Step 7: Add the Custom Menu (Optional)

The script also adds a custom menu to your Google Sheet:

1. Refresh your Google Sheet
2. You'll see a new menu called **📧 Email Tools**
3. You can now trigger the script directly from the sheet

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| **Customer count shows 0** | Make sure your data starts at row 2 (row 1 must be headers) |
| **Preview shows "No customer data"** | Check that your sheet has at least one row of data |
| **Emails not sending** | Check Gmail quota limits (100/day for free accounts) |
| **Authorization errors** | Re-deploy and grant all permissions |
| **Blank web app page** | Open Developer Console (F12) and check for errors |

---

### Gmail Quota Limits

| Account Type | Daily Limit | Per-minute Limit |
|--------------|-------------|------------------|
| Free Gmail | ~100 emails/day | ~20 emails/minute |
| Google Workspace | ~1,500 emails/day | ~60 emails/minute |

**Teacher's Tip:** Always test with a small subset of data first (5-10 customers) to avoid hitting rate limits.

---

### Security Best Practices

1. **Restrict access:** Set "Who has access" to "Anyone with Google Account" (not "Anyone")
2. **Test thoroughly:** Always use `previewFirstEmailWebApp()` before sending to all customers
3. **Check data:** Verify emails are formatted correctly before sending
4. **Add confirmation:** The web app has a confirmation dialog—keep it!

---

### Next Steps

Once your email sender is working:

1. **Customize the email template:** Modify `generateEmail()` in `Code.gs`
2. **Add more tiers:** Add more `case` statements in the switch block
3. **Add attachments:** Use `GmailApp.sendEmail()` with the `attachments` parameter
4. **Schedule emails:** Use Google Apps Script Triggers to send emails automatically

---

*Part of [From Spreadsheet to Web App](https://github.com/iwasiu/from-spreadsheet-to-web-app) book repository.*
