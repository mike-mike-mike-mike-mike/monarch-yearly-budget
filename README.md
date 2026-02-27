# Monarch Money - Yearly Budget View

A UserScript that adds a **yearly budget view** to the [Monarch Money](https://www.monarchmoney.com/) budget page, allowing you to see your full annual budget performance at a glance.

## Features

- **Toggle Between Views**: Switch between the standard monthly budget view and the yearly view using toggle buttons in the budget header.
- **Year Navigation**: Navigate between years using previous/next arrow controls.
- **Annualized Totals**: See total Budget, Actual spending, and Remaining budget for each category across all months in the selected year.
- **YTD for Current Year**: The current year displays year-to-date data; previous years show the full year.
- **Organized Categories**: Categories are grouped the same way as the standard budget view (Income, Fixed Expenses, Flexible Expenses, Non-Monthly Expenses) and can be sorted by any column.
- **Summary Cards**: At-a-glance totals for Income, Budgeted, Spent, Remaining, and Savings.
- **Persistent State**: View mode and selected year reset to defaults when navigating to the budget page, but are preserved on page refresh.
- **Dark Mode Support**: Automatically detects and adapts to Monarch Money's dark mode.

## Usage

1. Navigate to the **Budget** page (Plan section) in Monarch Money.
2. Click the **"Yearly"** toggle button that appears in the budget header.
3. Use the **← / →** arrow buttons to navigate between years.
4. Click **"Monthly"** to return to the standard monthly view.

## How It Works

This script injects a button into the Monarch Money budget page header. When activated, it queries the Monarch Money GraphQL API using your existing authenticated session (no separate login required) to fetch budget and transaction data for the selected year. It then renders a sortable summary table alongside summary stat cards.

No data is sent to any third-party server. All processing happens locally in your browser.

## License

MIT License — see [LICENSE](./LICENSE) for details.
