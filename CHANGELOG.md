# Changelog

## [1.2.0] - 2026-06-15

### Added
- **Group-level budgets**: Group-level budgets now display in the table as a single rolled-up row showing the group total. (Per-category breakdown within groups is not yet supported.)
- **Full year budget setting**: New "Use YTD budget" toggle in settings to compare spending against the prorated YTD budget (default) or the full annual budget. Applies to calendar year view only.

### Changed
- **Window mode select**: The rolling 12-month toggle has been replaced with a "Window mode" radio selector (Calendar year / Rolling 12 months), making the active mode clearer and making it easier to scope other settings to a specific mode.

## [1.1.1] - 2026-05-18

### Fixed
- Updated API authorization method to match Monarch Money's new security approach
- Navigation header is now shown even when an error occurs, allowing recovery without a page reload

## [1.1.0] - 2026-04-30

### Added
- Settings modal (gear icon in the header) with two optional toggles:
  - **Exclude current month in YTD**: Calculates YTD through the last completed month only, ignoring the current in-progress month
  - **Rolling 12-month window**: Switches from a calendar-year view to a rolling 12-month window ending today (or the last completed month if the above toggle is also enabled)
- Year navigation arrows are disabled when rolling 12-month mode is active

### Miscellaneous
- Adjusted button styles in the header to better match Monarch Money's native controls

## [1.0.1] - 2026-03-13

### Fixed
- Fixed `content_scripts` match pattern in `manifest.json` so the extension loads correctly for the Monarch Money SPA

## [1.0.0] - 2026-02-27

### Added
- Initial release of the Monarch Money Annual Budget View extension
- Toggle between standard monthly view and yearly view from the budget header
- Year navigation with previous/next arrow controls
- Annualized totals (Budget, Actual, Remaining) per category across all months in the selected year
- YTD data for the current year; full-year data for past years
- Categories grouped by section (Income, Fixed Expenses, Flexible Expenses, Non-Monthly Expenses), each sortable by column
- Summary cards showing totals for Income, Budgeted, Spent, Remaining, and Savings
- Progress bars on summary cards
- Dark mode support — automatically detects and adapts to Monarch Money's theme, including live theme changes
