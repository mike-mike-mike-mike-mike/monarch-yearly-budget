const GRAPHQL_URL = 'https://api.monarch.com/graphql';
const GRAPHQL_CLIENT = 'monarch-core-web-app-graphql';
const GRAPHQL_VERSION = 'v1.0.2527';
const CURRENCY = 'USD';
const WindowMode = {
    CALENDAR_YEAR: 0,
    ROLLING: 1,
};

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
    year: new Date().getFullYear(),
    sortCol: null,  // null = default (section order)
    sortDir: 1,     // 1 = descending by value, -1 = ascending
    excludeCurrentMonth: localStorage.getItem('yb-excludeCurrentMonth') === 'true' || false,
    windowMode: parseInt(localStorage.getItem('yb-windowMode')) || WindowMode.CALENDAR_YEAR,
    useYtdBudgetForCurrentYear: localStorage.getItem('yb-useYtdBudgetForCurrentYear') === 'true' || true,
};

// ─── Styles ───────────────────────────────────────────────────────────────────

function injectStyles() {
    document.getElementById('yb-styles')?.remove();
    const colors = getColors();
    const s = document.createElement('style');
    s.id = 'yb-styles';
    s.textContent = `
        #yb-container { font-family: Oracle, sans-serif; padding: 16px 20px 20px; }
        #yb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        #yb-nav { display: flex; align-items: center; gap: 8px; }
        .yb-nav-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 4px; }
        .yb-nav-btn:hover { opacity: 0.7; }
        .yb-cards { display: flex; gap: 16px; margin-bottom: 16px; }
        .yb-card { flex: 1; padding: 16px; border-radius: 8px; box-shadow: rgba(8,40,100,0.04) 0 4px 8px; text-align: center; }
        .yb-card-value { font-size: 20px; font-weight: 600; }
        .yb-card-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; margin-top: 4px; }
        .yb-table { width: 100%;  border-spacing: 0; border-radius: 8px; overflow: hidden; box-shadow: rgba(8,40,100,0.04) 0 4px 8px; padding: 1em;}
        .yb-table th { font-size: 15px; font-weight: 600; height: 40px; padding: 0 8px; position: sticky; top: 0; cursor: pointer; user-select: none; text-align: left; }
        .yb-table th:hover { color: ${colors.highlight}; }
        .yb-table th.num, .yb-table td.num { text-align: right; width: 110px; white-space: nowrap; }
        .yb-table td { font-size: 14px; height: 30px; padding: 4px 8px 0px 8px; }
        .yb-table td.name { max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .yb-table-spacer { height: 1em; }
        .yb-row-group td { font-size: 15px; font-weight: 600; height: 30px; }
        .yb-row-group-header { border-radius: 8px; padding: 0 8px;}
        .yb-row-cat { cursor: pointer; }
        .yb-row-cat:hover { background: rgba(50,170,240,0.1); }
        .yb-row-spacer td { padding: 0; height: 2px; }
        .yb-horizontal-divider { border-top: 1px solid ${colors.headerBg}; }
        .yb-row-subtotal td { font-size: 15px; font-weight: 600; height: 30px; padding: 0 8px; }
        .yb-toggle-btn { font-weight: bold; font-size: 14px; padding: 8px 16px; border: 1px solid ${colors.headerBg}; background: ${colors.bg}; color: ${colors.text}; cursor: pointer; border-radius: 8px; }
        .yb-toggle-btn.active { background: ${colors.monarchOrange}; color: #fff; border-color: ${colors.monarchOrange}; }
        .yb-toggle-btn:hover { opacity: 0.8; }
        .yb-vertical-divider { height: 16px; width: 1px; background-color: rgb(111, 109, 104); margin: 0px 8px;}
        a.yb-cat-link { color: inherit; padding: 4px 0; display: inline-block;}
        a.yb-cat-link:hover { color: ${colors.highlight};  }
        .yb-row-progress td { padding: 0 8px 8px 8px; height: 8px; }
        .yb-progress-bar { height: 3px; border-radius: 2px; transition: width 0.3s ease; opacity: 0.7; }
        .yb-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
        .yb-modal { background: ${colors.bg}; color: ${colors.text}; border-radius: 8px; width: 360px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); overflow: hidden; }
        .yb-modal-header { background: ${colors.headerBg}; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
        .yb-modal-title { font-size: 16px; font-weight: 600; }
        .yb-modal-close { background: none; border: none; cursor: pointer; font-size: 18px; color: ${colors.text}; line-height: 1; padding: 0; opacity: 0.7; }
        .yb-modal-close:hover { opacity: 1; }
        .yb-modal-body { padding: 20px; }
        .yb-setting-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .yb-setting-row-column { flex-direction: column; align-items: flex-start; gap: 8px; }
        .yb-setting-label { font-size: 14px; font-weight: bold; }
        .yb-setting-subtext { font-size: x-small; color: ${colors.grey}; }
        .yb-radio-group { display: flex; flex-direction: column; gap: 6px; }
        .yb-radio-option { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }
        .yb-radio-option input[type="radio"] { cursor: pointer; accent-color: orangered; width: 14px; height: 14px; flex-shrink: 0; }
        .yb-switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
        .yb-switch input { opacity: 0; width: 0; height: 0; }
        .yb-switch-slider { position: absolute; inset: 0; background: ${colors.headerBg}; border-radius: 22px; cursor: pointer; transition: background 0.2s; }
        .yb-switch-slider:before { content: ''; position: absolute; width: 16px; height: 16px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: transform 0.2s; }
        .yb-switch input:checked + .yb-switch-slider { background: ${colors.monarchOrange}; }
        .yb-switch input:checked + .yb-switch-slider:before { transform: translateX(18px); }
        .yb-modal-footer { padding: 12px 20px 16px; display: flex; justify-content: flex-end; }
        .yb-modal-save { background: ${colors.monarchOrange}; color: #fff; border: none; border-radius: 4px; padding: 8px 20px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .yb-modal-save:hover { opacity: 0.85; }
        .yb-tooltip { position: relative; display: inline-block; }
        .yb-tooltip .yb-tooltiptext { visibility: hidden; width: 180px; background-color: #333; color: #fff; text-align: center; padding: 5px 8px; border-radius: 6px; font-size: 12px; position: absolute; z-index: 10000; top: 100%; left: 50%; transform: translateX(-50%); pointer-events: none; }
        .yb-tooltip:hover .yb-tooltiptext { visibility: visible; }
    `;
    document.head.appendChild(s);
}

// ─── Colors ───────────────────────────────────────────────────────────────────

function getColors() {
    const root = document.querySelector('[class*=Page__Root]');
    const dark = root && window.getComputedStyle(root).backgroundColor === 'rgb(25, 25, 24)';
    return {
        green:      dark ? '#3dd68c' : '#2a7e3b',
        red:        dark ? '#f9918e' : '#d13415',
        grey:       dark ? '#989691' : '#777573',
        bg:         dark ? '#222221' : '#ffffff',
        text:       dark ? '#ffffff' : '#22201d',
        headerBg:   dark ? 'rgb(68,68,68)' : '#e6e4e0',
        subtotalBg: dark ? 'rgb(48,48,48)' : '#f9f6f3',
        highlight: dark ? 'rgb(50,170,240)' : 'rgb(0,120,212)',
        monarchOrange: 'rgb(255, 105, 45)',
    };
}

// ─── API ──────────────────────────────────────────────────────────────────────

function getToken() {
    const m = document.cookie.match(new RegExp(/(^|;\s*)csrftoken=([^;]+)/));
    const userToken = m ? m[2] : null;
    if(!userToken) {
        console.error(GRAPHQL_CLIENT,GRAPHQL_VERSION,'X-Csrftoken Error');
    }
    return userToken;
}

async function callGraphQL(data) {
    const userToken = getToken();
    if(!userToken) {
        console.error(GRAPHQL_CLIENT,GRAPHQL_VERSION,'X-Csrftoken Error');return null;
    }

    return fetch(GRAPHQL_URL, {
        mode: 'cors',
        method: 'POST',
        credentials: 'include',
        headers: { accept: '*/*','X-Csrftoken': `${userToken}`,'content-type': 'application/json','monarch-client': `${GRAPHQL_CLIENT}`,'monarch-client-version': `${GRAPHQL_VERSION}`},
        body: JSON.stringify(data)
    });
}

function calculateDateRange(year) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    // Reference date: last day of prev month if excluding current month, otherwise today
    const referenceDate = state.excludeCurrentMonth
        ? new Date(today.getFullYear(), today.getMonth(), 0)
        : today;

    if (state.windowMode === WindowMode.ROLLING) {
        const startDate = new Date(referenceDate);
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setDate(startDate.getDate() + 1); // move to first day of next month to get a clean month range
        return { startDate: fmt(startDate), endDate: fmt(referenceDate) };
    }

    // Calendar year mode
    if (year === currentYear) {
        // viewing current year
        const endDate = state.useYtdBudgetForCurrentYear
            ? fmt(referenceDate)
            : fmt(new Date(year, 11, 31));
        return { startDate: `${year}-01-01`, endDate };
    } else {
        return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
    }
}

async function fetchBudgetData(year) {
    const { startDate, endDate } = calculateDateRange(year);

    const query = `query Common_GetJointPlanningData($startDate: Date!, $endDate: Date!) {
        budgetData(startMonth: $startDate, endMonth: $endDate) {
            monthlyAmountsByCategory {
                category { id }
                monthlyAmounts { plannedCashFlowAmount actualAmount }
            }
            monthlyAmountsByCategoryGroup {
                categoryGroup { id }
                monthlyAmounts { plannedCashFlowAmount actualAmount }
            }
            monthlyAmountsForFlexExpense {
                monthlyAmounts { plannedCashFlowAmount actualAmount }
            }
        }
        categoryGroups {
            id name order type budgetVariability groupLevelBudgetingEnabled
            categories { id name icon order budgetVariability }
        }
    }`;

    const res = await callGraphQL({ operationName: 'Common_GetJointPlanningData', variables: { startDate, endDate }, query });
    return (await res.json()).data;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
    { type: 'income',  variability: null,          label: 'Income' },
    { type: 'expense', variability: 'fixed',        label: 'Fixed Expenses' },
    { type: 'expense', variability: 'flexible',     label: 'Flexible Expenses' },
    { type: 'expense', variability: 'non_monthly',  label: 'Non-Monthly Expenses' },
];

function processData({ budgetData, categoryGroups }) {
    const catInfo = {};
    for (const group of categoryGroups) {
        if (group.type === 'transfer') continue;
        for (const cat of group.categories) {
            catInfo[cat.id] = { ...cat, groupType: group.type, groupLevelBudgetingEnabled: group.groupLevelBudgetingEnabled };
        }
    }

    // Build lookup from group ID → monthly amounts for group-level-budgeted groups
    const groupAmounts = {};
    for (const { categoryGroup, monthlyAmounts } of (budgetData.monthlyAmountsByCategoryGroup || [])) {
        groupAmounts[categoryGroup.id] = monthlyAmounts;
    }

    const entries = {};

    // One rolled-up entry per group-level-budgeted group
    for (const group of categoryGroups) {
        if (group.type === 'transfer' || !group.groupLevelBudgetingEnabled) continue;
        const monthlyAmounts = groupAmounts[group.id] || [];
        const budget = monthlyAmounts.reduce((s, m) => s + (m.plannedCashFlowAmount || 0), 0);
        const actual = monthlyAmounts.reduce((s, m) => s + (m.actualAmount || 0), 0);
        if (budget === 0 && actual === 0) continue;
        entries[`group-${group.id}`] = {
            id: group.id,
            name: group.name,
            icon: '📁',
            groupType: group.type,
            budgetVariability: group.budgetVariability,
            kind: 'group',
            linkPath: `/category-groups/${group.id}`,
            budget,
            actual,
        };
    }

    // Per-category entries, skipping categories in group-level-budgeted groups
    for (const { category, monthlyAmounts } of budgetData.monthlyAmountsByCategory) {
        const info = catInfo[category.id];
        if (!info || info.groupLevelBudgetingEnabled) continue;
        const budget = monthlyAmounts.reduce((s, m) => s + (m.plannedCashFlowAmount || 0), 0);
        const actual = monthlyAmounts.reduce((s, m) => s + (m.actualAmount || 0), 0);
        if (budget === 0 && actual === 0) continue;
        entries[category.id] = {
            ...info,
            kind: 'category',
            linkPath: `/categories/${category.id}`,
            budget,
            actual,
        };
    }

    const flexMonthlyAmounts = budgetData.monthlyAmountsForFlexExpense?.monthlyAmounts ?? [];
    const flexSectionBudget = flexMonthlyAmounts.reduce((s, m) => s + (m.plannedCashFlowAmount || 0), 0);
    const flexSectionActual = flexMonthlyAmounts.reduce((s, m) => s + (m.actualAmount || 0), 0);

    return SECTIONS.map(sec => ({
        ...sec,
        ...(sec.variability === 'flexible' && flexSectionBudget !== 0 && {
            sectionBudget: flexSectionBudget,
            sectionActual: flexSectionActual,
        }),
        categories: Object.values(entries).filter(e =>
            sec.type === 'income'
                ? e.groupType === 'income'
                : e.groupType !== 'income' && e.budgetVariability === sec.variability
        ),
    }));
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function fmtMoney(n) {
    return Math.round(n ?? 0).toLocaleString('en-US', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 });
}

function remainingColor(remaining, isIncome, colors) {
    if (isIncome) return remaining > 0 ? colors.green : colors.grey;
    return remaining >= 0 ? colors.green : colors.red;
}

function sortedCats(cats, isIncome) {
    const sorted = [...cats];
    if (!state.sortCol) return sorted;
    return sorted.sort((a, b) => {
        if (state.sortCol === 'name') return state.sortDir * a.name.localeCompare(b.name);
        const val = c => {
            if (state.sortCol === 'budget') return c.budget;
            if (state.sortCol === 'actual') return c.actual;
            const rem = c.budget - c.actual;
            return isIncome ? Math.max(rem, 0) : rem;
        };
        return state.sortDir * (val(b) - val(a));
    });
}

function buildTable(sections, colors) {
    const table = document.createElement('table');
    table.className = 'yb-table';
    table.style.cssText = `background:${colors.bg}; color:${colors.text}`;

    // Header row
    const hrow = table.createTHead().insertRow();
    hrow.style.background = colors.bg;
    for (const [col, label] of [['name', 'Category'], ['budget', 'Budget'], ['actual', 'Actual'], ['remaining', 'Remaining']]) {
        const th = document.createElement('th');
        th.className = col === 'name' ? '' : 'num';
        th.dataset.col = col;
        const indicator = state.sortCol === col ? (state.sortDir === 1 ? ' ▼' : ' ▲') : '';
        th.textContent = label + indicator;
        th.addEventListener('click', () => {
            state.sortDir = state.sortCol === col ? state.sortDir * -1 : 1;
            state.sortCol = col;
            table.replaceWith(buildTable(sections, colors));
        });
        hrow.appendChild(th);
    }

    const tbody = table.createTBody();

    for (const sec of sections) {
        const isIncome = sec.type === 'income';
        const cats = sortedCats(sec.categories, isIncome);
        const totalBudget = sec.sectionBudget ?? cats.reduce((s, c) => s + c.budget, 0);
        const totalActual = sec.sectionActual ?? cats.reduce((s, c) => s + c.actual, 0);
        const totalRem = isIncome ? Math.max(totalBudget - totalActual, 0) : totalBudget - totalActual;

        // Group header
        const grow = tbody.insertRow();
        grow.className = 'yb-row-group';
        
        const ghNameCell = grow.insertCell();
        ghNameCell.className = 'yb-row-group-header';
        ghNameCell.style.cssText = `background:${colors.headerBg}; border-radius: 8px 0 0 8px; padding: 0 8px`;
        ghNameCell.textContent = sec.label;
        
        const headerCols = [[totalBudget, false], [totalActual, false], [totalRem, true]];
        headerCols.forEach(([val, isRem], i) => {
            const td = grow.insertCell();
            td.className = 'num';
            td.style.cssText = `font-size: 15px; font-weight: 600; padding: 0 8px; background: ${colors.headerBg};`;
            if (i === headerCols.length - 1) td.style.borderRadius = '0 8px 8px 0';
            if (isRem) td.style.color = remainingColor(totalRem, isIncome, colors);
            td.textContent = fmtMoney(val);
        });

        // Category rows
        for (const [idx, cat] of cats.entries()) {
            const rem = isIncome ? Math.max(cat.budget - cat.actual, 0) : cat.budget - cat.actual;
            const row = tbody.insertRow();
            row.className = 'yb-row-cat';

            const nameCell = row.insertCell();
            nameCell.className = 'name';
            const link = document.createElement('a');
            link.className = 'yb-cat-link';
            link.href = `${cat.linkPath}?date=${state.year}-01-01&timeframe=year`;
            link.textContent = `${cat.icon || ''} ${cat.name}`;
            nameCell.appendChild(link);

            for (const [val, isRem] of [[cat.budget, false], [cat.actual, false], [rem, true]]) {
                const td = row.insertCell();
                td.className = 'num';
                if (isRem) td.style.color = remainingColor(rem, isIncome, colors);
                td.textContent = fmtMoney(val);
            }
            
            if (cat.budget !== 0) {
                // Progress bar row if budgeted amount is non-zero
                const progressRow = tbody.insertRow();
                progressRow.className = 'yb-row-progress';
                const progressCell = progressRow.insertCell();
                progressCell.colSpan = 4;
                progressCell.className = 'yb-progress-cell';
                
                const progressPercentage = cat.budget === 0 ? 0 : Math.min((Math.abs(cat.actual) / Math.abs(cat.budget)) * 100, 100);
                const isOverBudget = !isIncome && Math.abs(cat.actual) > Math.abs(cat.budget);
                const barColor = isIncome ? colors.green : (isOverBudget ? colors.red : colors.green);
                
                const progressBar = document.createElement('div');
                progressBar.className = 'yb-progress-bar';
                progressBar.style.cssText = `width: ${progressPercentage}%; background-color: ${barColor};`;
                progressCell.appendChild(progressBar);
            }
            
            // Spacer row between categories
            if (idx < cats.length - 1) {
                const spacerRow = tbody.insertRow();
                spacerRow.className = 'yb-row-spacer';
                const spacerCell = spacerRow.insertCell();
                spacerCell.colSpan = 4;
                spacerCell.className = 'yb-horizontal-divider';
            }
        }

        // Subtotal row
        const srow = tbody.insertRow();
        srow.className = 'yb-row-subtotal';
        const snameCell = srow.insertCell();
        snameCell.style.cssText = `background:${colors.subtotalBg}; border-radius: 8px 0 0 8px; padding: 0 8px`;
        // snameCell.textContent = `${sec.label} Total`;
        const subtotalCols = [[totalBudget, false], [totalActual, false], [totalRem, true]];
        subtotalCols.forEach(([val, isRem], i) => {
            const td = srow.insertCell();
            td.className = 'num';
            td.style.background = colors.subtotalBg;
            if (i === subtotalCols.length - 1) td.style.borderRadius = '0 8px 8px 0';
            if (isRem) td.style.color = remainingColor(totalRem, isIncome, colors);
            td.textContent = fmtMoney(val);
        });

        // Spacer row between sections
        tbody.insertRow().className = 'yb-table-spacer';
    }

    return table;
}

function buildCards(sections, colors) {
    const incomeCats = sections.find(s => s.type === 'income')?.categories ?? [];
    const expenseCats = sections.filter(s => s.type !== 'income').flatMap(s => s.categories);
    const totalIncome   = incomeCats.reduce((s, c) => s + c.actual, 0);
    const totalBudgeted = expenseCats.reduce((s, c) => s + c.budget, 0);
    const totalSpent    = expenseCats.reduce((s, c) => s + c.actual, 0);
    const budgetRem     = totalBudgeted - totalSpent;
    const savings       = Math.max(totalIncome - totalSpent, 0);

    const cards = [
        ['Income',           totalIncome,   colors.green],
        ['Budgeted',         totalBudgeted, colors.grey],
        ['Spent',            totalSpent,    totalSpent > totalBudgeted ? colors.red : colors.green],
        ['Budget Remaining', budgetRem,     budgetRem < 0 ? colors.red : colors.green],
        ['Savings',          savings,       savings > 0 ? colors.green : colors.grey],
    ];

    const wrap = document.createElement('div');
    wrap.className = 'yb-cards';
    for (const [label, val, color] of cards) {
        const card = document.createElement('div');
        card.className = 'yb-card';
        card.style.background = colors.bg;
        card.innerHTML = `
            <div class="yb-card-value" style="color:${color}">${fmtMoney(val)}</div>
            <div class="yb-card-label" style="color:${colors.grey}">${label}</div>
        `;
        wrap.appendChild(card);
    }
    return wrap;
}

function buildYearlyView(container, sections) {
    const colors = getColors();

    container.appendChild(buildCards(sections, colors));
    container.appendChild(buildTable(sections, colors));

    return container;
}

function buildHeader() {
    // Header: title on left, year nav + toggles on right
    const colors = getColors();
    const curYear = new Date().getFullYear();
    const header = document.createElement('div');
    header.id = 'yb-header';

    const title = document.createElement('span');
    title.style.cssText = `font-size:18px; font-weight:500; color:${colors.text}`;
    if (state.windowMode === WindowMode.ROLLING) {
        const { startDate, endDate } = calculateDateRange(state.year);
        const fmtLabel = iso => { const [y, m, d] = iso.split('-'); return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
        title.textContent = `${fmtLabel(startDate)} – ${fmtLabel(endDate)} Budget`;
    } else {
        const ytd = state.year === curYear && state.useYtdBudgetForCurrentYear;
        title.textContent = `${state.year}${ytd ? ' YTD' : ''} Budget`;
    }
    header.appendChild(title);

    const nav = document.createElement('div');
    nav.id = 'yb-nav';

    // Year navigation group
    const yearNav = document.createElement('div');
    yearNav.style.cssText = 'display:inline-flex; align-items:center; gap:8px;';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'yb-nav-btn';
    prevBtn.textContent = '◀';
    prevBtn.style.color = colors.text;
    prevBtn.setAttribute('aria-label', 'Previous year');

    const yearLabel = document.createElement('span');
    yearLabel.style.cssText = `font-weight:600; color:${colors.text}`;
    yearLabel.textContent = state.year;

    yearNav.appendChild(prevBtn);
    yearNav.appendChild(yearLabel);

    if (state.year < curYear) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'yb-nav-btn';
        nextBtn.textContent = '▶';
        nextBtn.style.color = colors.text;
        nextBtn.setAttribute('aria-label', 'Next year');
        if (state.windowMode !== WindowMode.ROLLING) {
            nextBtn.addEventListener('click', () => { state.year++; saveYear(); showYearlyView(); });
        }
        yearNav.appendChild(nextBtn);
    } else {
        yearLabel.style.marginRight = '24px';
    }

    if (state.windowMode === WindowMode.ROLLING) {
        yearNav.style.opacity = '0.3';
        yearNav.style.cursor = 'not-allowed';
        const tooltip = document.createElement('div');
        tooltip.className = 'yb-tooltip';
        tooltip.appendChild(yearNav);
        const tip = document.createElement('span');
        tip.className = 'yb-tooltiptext';
        tip.textContent = 'Rolling 12-month mode always shows the latest 12 months';
        tooltip.appendChild(tip);
        nav.appendChild(tooltip);
    } else {
        prevBtn.addEventListener('click', () => { state.year--; saveYear(); showYearlyView(); });
        nav.appendChild(yearNav);
    }

    appendSettingsButton(nav);
    appendToggleButtons(nav, 1);

    header.appendChild(nav);

    return header;
}

function createVerticalDivider() {
    const dividerElement = document.createElement('div');
    dividerElement.className = 'yb-vertical-divider';
    return dividerElement;
}

function createHorizontalDivider() {
    const dividerElement = document.createElement('div');
    dividerElement.className = 'yb-horizontal-divider';
    return dividerElement;
}

function appendSettingsButton(parent) {
    const divider = createVerticalDivider();
    parent.appendChild(divider);

    const colors = getColors();
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'yb-toggle-btn';
    settingsBtn.setAttribute('aria-label', 'Annual budget settings');
    settingsBtn.innerHTML = '<span role="img" class="Icon__MonarchIcon-sc-1ja3cr5-0 bBsWwa ButtonIcon-bnt4i8-0 YaRtL monarch-icon"></span><span>Settings</span>';
    settingsBtn.addEventListener('click', toggleSettings);
    parent.appendChild(settingsBtn);
}


function appendToggleButtons(parent, activeMode) {
    // create divider
    const divider = createVerticalDivider();
    parent.appendChild(divider);

    for (const [i, label] of [[0, 'Monthly'], [1, 'Yearly']]) {
        const btn = document.createElement('button');
        btn.className = 'yb-toggle-btn' + (i === activeMode ? ' active' : '');
        btn.textContent = label;
        btn.addEventListener('click', () => onToggleMode(i));
        parent.appendChild(btn);
    }
}

// ─── Settings Modal ───────────────────────────────────────────────────────────

function updateSetting(key, value) {
    localStorage.setItem(key, value);
    if (key === 'yb-excludeCurrentMonth') state.excludeCurrentMonth = value;
    if (key === 'yb-windowMode') state.windowMode = parseInt(value);
    if (key === 'yb-useYtdBudgetForCurrentYear') state.useYtdBudgetForCurrentYear = value;
}

function createSettingsModal() {
    const colors = getColors();

    const overlay = document.createElement('div');
    overlay.className = 'yb-modal-overlay';
    overlay.id = 'yb-settings-modal';

    const modal = document.createElement('div');
    modal.className = 'yb-modal';

    // Header
    const header = document.createElement('div');
    header.className = 'yb-modal-header';
    const title = document.createElement('span');
    title.className = 'yb-modal-title';
    title.style.color = colors.text;
    title.textContent = 'Annual Budget Settings';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'yb-modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close settings');
    closeBtn.addEventListener('click', closeSettingsModal);
    header.appendChild(title);
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement('div');
    body.className = 'yb-modal-body';

    const makeSettingToggleRow = (labelText, inputId, checked, subtext = null) => {
        const row = document.createElement('div');
        row.className = 'yb-setting-row';
        const labelWrap = document.createElement('div');
        const lbl = document.createElement('label');
        lbl.className = 'yb-setting-label';
        lbl.textContent = labelText;
        lbl.htmlFor = inputId;
        labelWrap.appendChild(lbl);
        if (subtext) {
            const sub = document.createElement('div');
            sub.className = 'yb-setting-subtext';
            sub.textContent = subtext;
            labelWrap.appendChild(sub);
        }
        const switchWrap = document.createElement('label');
        switchWrap.className = 'yb-switch';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = inputId;
        cb.checked = checked;
        const slider = document.createElement('span');
        slider.className = 'yb-switch-slider';
        switchWrap.appendChild(cb);
        switchWrap.appendChild(slider);
        row.appendChild(labelWrap);
        row.appendChild(switchWrap);
        return { row, cb };
    };

    const makeSettingRadioRow = (labelText, name, options, selectedValue) => {
        const row = document.createElement('div');
        row.className = 'yb-setting-row yb-setting-row-column';
        const lbl = document.createElement('span');
        lbl.className = 'yb-setting-label';
        lbl.textContent = labelText;
        const radioGroup = document.createElement('div');
        radioGroup.className = 'yb-radio-group';
        const radios = options.map(([optLabel, value]) => {
            const optRow = document.createElement('label');
            optRow.className = 'yb-radio-option';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = name;
            radio.value = value;
            radio.checked = selectedValue === value;
            const span = document.createElement('span');
            span.textContent = optLabel;
            optRow.appendChild(radio);
            optRow.appendChild(span);
            radioGroup.appendChild(optRow);
            return radio;
        });
        row.appendChild(lbl);
        row.appendChild(radioGroup);
        return { row, radios };
    };

    const { row: windowModeRow, radios: [radioCalendar, radioRolling] } = makeSettingRadioRow(
        'Window Type',
        'yb-window-mode',
        [['Calendar year', WindowMode.CALENDAR_YEAR], ['Rolling 12 months', WindowMode.ROLLING]],
        state.windowMode
    );
    const { row: ytdBudgetRow, cb: checkboxYtdBudget } = makeSettingToggleRow('Use YTD budget', 'yb-toggle-total-budget', state.useYtdBudgetForCurrentYear, 'Only include budget amounts YTD for the current year (Calendar year view only)');
    const { row: excludeCurrentRow, cb: checkboxExcludeCurrent } = makeSettingToggleRow('Exclude current month', 'yb-toggle-exclude-month', state.excludeCurrentMonth, 'Only include budget/actual from completed months (YTD view only)');

    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '16px';
    body.appendChild(windowModeRow);
    body.appendChild(createHorizontalDivider());
    body.appendChild(ytdBudgetRow);
    body.appendChild(excludeCurrentRow);

    const footer = document.createElement('div');
    footer.className = 'yb-modal-footer';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'yb-modal-save';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
        updateSetting('yb-excludeCurrentMonth', checkboxExcludeCurrent.checked);
        updateSetting('yb-windowMode', radioRolling.checked ? WindowMode.ROLLING : WindowMode.CALENDAR_YEAR);
        updateSetting('yb-useYtdBudgetForCurrentYear', checkboxYtdBudget.checked);
        closeSettingsModal();
        showYearlyView();
    });
    footer.appendChild(saveBtn);

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);

    // Close on overlay click (outside modal)
    overlay.addEventListener('click', e => { if (e.target === overlay) closeSettingsModal(); });

    return overlay;
}

function closeSettingsModal() {
    document.getElementById('yb-settings-modal')?.remove();
    document.removeEventListener('keydown', onSettingsEsc);
}

function onSettingsEsc(e) {
    if (e.key === 'Escape') closeSettingsModal();
}

function toggleSettings() {
    if (document.getElementById('yb-settings-modal')) {
        closeSettingsModal();
        return;
    }
    document.addEventListener('keydown', onSettingsEsc);
    document.body.appendChild(createSettingsModal());
}

// ─── Page Flow ────────────────────────────────────────────────────────────────

function onToggleMode(mode) {
    localStorage.setItem('YTD_BudgetViewMode', mode);
    if (mode === 0) {
        localStorage.setItem('YTD_BudgetViewYear', new Date().getFullYear());
        window.location.href = '/plan';
    } else {
        showYearlyView();
    }
}

function saveYear() {
    localStorage.setItem('YTD_BudgetViewYear', state.year);
}

function isBudgetPageLoaded() {
    return !!document.querySelector('[class*="Plan__SectionsContainer"]');
}

async function showYearlyView() {
    document.getElementById('yb-container')?.remove();
    document.querySelectorAll('[class*="PlanHeader"], [class*="Plan__Container"], [class*="Page__ScrollHeaderContainer"]').forEach(el => el.remove());

    const scrollRoot = document.querySelector('[class*="Scroll__Root-sc"]');
    if (!scrollRoot) return;

    const container = document.createElement('div');
    container.id = 'yb-container';
    scrollRoot.appendChild(container);
    
    const header = buildHeader();
    container.appendChild(header);

    const loading = document.createElement('div');
    loading.style.cssText = 'padding:40px; text-align:center; font-size:15px; font-weight:600';
    loading.textContent = 'Loading yearly budget...';
    container.appendChild(loading);

    const data = await fetchBudgetData(state.year);

    if (!data?.budgetData || !data?.categoryGroups) {
        loading.textContent = `Error loading budget data.`;
        return;
    }

    const sections = processData(data);
    loading.remove();
    buildYearlyView(container, sections);
    createThemeObserver();
}

function addToggleToMonthlyHeader() {
    const header = document.querySelector('[class*="PlanHeader"]');
    if (!header || header.querySelector('.yb-toggle-btn')) return;
    const wrap = document.createElement('span');
    wrap.style.cssText = 'display:inline-flex; gap:8px; margin-left:8px; align-items:center;';
    appendToggleButtons(wrap, 0);
    header.appendChild(wrap);
}

function onBudgetPageLoad(hardNav) {
    injectStyles();

    // Reset to monthly view when navigating from a different section of the app
    if (hardNav) {
        localStorage.setItem('YTD_BudgetViewMode', '0');
        localStorage.setItem('YTD_BudgetViewYear', new Date().getFullYear());
    }
    state.year = parseInt(localStorage.getItem('YTD_BudgetViewYear')) || new Date().getFullYear();
    const mode = parseInt(localStorage.getItem('YTD_BudgetViewMode') || '0');
    if (mode === 1) { showYearlyView(); } else { addToggleToMonthlyHeader(); }
}

// ─── Theme Observer ────────────────────────────────────────────────────────────────

function createThemeObserver() {
    disconnectThemeObserver?.();

    const root = document.querySelector('[class*=Page__Root]');
    if (!root) return;

    const observer = new MutationObserver(() => onBudgetPageLoad(false));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    disconnectThemeObserver = () => observer.disconnect();
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

let lastPath = '';
let budgetCheckInterval = null;
let disconnectThemeObserver = null;

setInterval(() => {
    const path = window.location.pathname;
    if (path === lastPath) return;

    const prevPath = lastPath;
    lastPath = path;

    if (!path.startsWith('/plan')) return;

    // Hard navigation = arriving from a non-budget section
    const hardNav = !!prevPath && !prevPath.startsWith('/plan');

    clearInterval(budgetCheckInterval);
    budgetCheckInterval = setInterval(() => {
        if (isBudgetPageLoaded()) {
            clearInterval(budgetCheckInterval);
            onBudgetPageLoad(hardNav);
        }
    }, 100);
}, 300);
