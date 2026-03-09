# Privacy Policy

**Monarch Money - Annual Budget View**
Last updated: March 9, 2026

## Overview

Monarch Money - Annual Budget View is a Chrome extension that adds an annual budget summary view to the Monarch Money web application at `app.monarch.com`. This policy describes how the extension handles your data.

## Information We Collect

### Information collected automatically

This extension does not collect, transmit, or store any personal or financial data on any external server. The extension operates entirely within your browser.

To display your annual budget data, the extension:

- **Reads your Monarch Money authentication token** from your browser's `localStorage`. This token is already present from your existing Monarch Money login session and is used solely to make API requests to Monarch Money on your behalf.
- **Fetches budget and category data** from the Monarch Money GraphQL API (`api.monarch.com/graphql`), including your budget category names, icons, planned amounts, and actual spending amounts for the selected year. This data is fetched directly from Monarch Money's servers using your existing authenticated session — no different from what the Monarch Money web app itself does.

### Information you provide

The extension does not ask you to provide any information directly.

### Preferences stored locally

The extension stores the following preferences in your browser's `localStorage`:

- `YTD_BudgetViewMode` — whether you last used the monthly or yearly view
- `YTD_BudgetViewYear` — the year you last selected in the yearly view

These values are stored only on your device and are never transmitted anywhere.

## How We Use the Information

The authentication token and budget data are used exclusively to render the annual budget summary view within your browser. No data is analyzed, logged, profiled, or used for any purpose other than displaying your budget information to you.

## Information We Share

**We do not share any information with anyone.** The extension does not transmit any data to any server other than Monarch Money's own API (`api.monarch.com`), which you are already communicating with by using the Monarch Money web app. No data is sent to the extension developer or any third party.

## Data Retention

The extension does not retain any of your financial or personal data. Budget data fetched from the Monarch Money API is held in memory only for as long as the page is open and is discarded when you navigate away or close the tab. The only persistent data is the two view-state values stored in `localStorage`, which contain no personal or financial information.

## Changes to This Policy

If this extension's data practices change in a future version, this policy will be updated accordingly. The "Last updated" date at the top of this document reflects when the policy was last revised.

## Contact

If you have questions about this privacy policy, please open an issue on the project's GitHub repository.
