const GRAPHQL = 'https://api.monarch.com/graphql';
const CURRENCY = 'USD';

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
    year: new Date().getFullYear(),
    sortCol: null,  // null = default (section order)
    sortDir: 1,     // 1 = descending by value, -1 = ascending
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
        .yb-row-subtotal td { font-size: 15px; font-weight: 600; height: 30px; padding: 0 8px; }
        .yb-toggle-btn { font-size: 14px; padding: 8px 16px; border: 1px solid ${colors.headerBg}; background: ${colors.bg}; color: ${colors.text}; cursor: pointer; border-radius: 4px; }
        .yb-toggle-btn.active { background: ${colors.monarchOrange}; color: #fff; border-color: ${colors.monarchOrange}; }
        .yb-toggle-btn:hover { opacity: 0.8; }
        .yb-vertical-divider { height: 16px; width: 1px; background-color: rgb(111, 109, 104); margin: 0px 8px;}
        a.yb-cat-link { color: inherit; padding: 4px 0; display: inline-block;}
        a.yb-cat-link:hover { color: ${colors.highlight};  }
        .yb-row-progress td { padding: 0 8px 8px 8px; height: 8px; }
        .yb-progress-bar { height: 3px; border-radius: 2px; transition: width 0.3s ease; opacity: 0.7; }
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
    return JSON.parse(JSON.parse(localStorage.getItem('persist:root')).user).token;
}

async function fetchBudgetData(year) {
    const today = new Date();
    const curYear = today.getFullYear();
    const pad = n => String(n).padStart(2, '0');
    const startDate = `${year}-01-01`;
    const endDate = year === curYear
        ? `${year}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
        : `${year}-12-31`;

    const query = `query Common_GetJointPlanningData($startDate: Date!, $endDate: Date!) {
        budgetData(startMonth: $startDate, endMonth: $endDate) {
            monthlyAmountsByCategory {
                category { id }
                monthlyAmounts { plannedCashFlowAmount actualAmount }
            }
        }
        categoryGroups {
            id name order type
            categories { id name icon order budgetVariability }
        }
    }`;

    const res = await fetch(GRAPHQL, {
        mode: 'cors', method: 'POST',
        headers: { accept: '*/*', authorization: `Token ${getToken()}`, 'content-type': 'application/json' },
        body: JSON.stringify({ operationName: 'Common_GetJointPlanningData', variables: { startDate, endDate }, query }),
    });
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
            catInfo[cat.id] = { ...cat, groupType: group.type };
        }
    }

    const byId = {};
    for (const { category, monthlyAmounts } of budgetData.monthlyAmountsByCategory) {
        const info = catInfo[category.id];
        if (!info) continue;
        const budget = monthlyAmounts.reduce((s, m) => s + (m.plannedCashFlowAmount || 0), 0);
        const actual = monthlyAmounts.reduce((s, m) => s + (m.actualAmount || 0), 0);
        if (budget === 0 && actual === 0) continue;
        byId[category.id] = { ...info, budget, actual };
    }

    return SECTIONS.map(sec => ({
        ...sec,
        categories: Object.values(byId).filter(c =>
            sec.type === 'income'
                ? c.groupType === 'income'
                : c.groupType !== 'income' && c.budgetVariability === sec.variability
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
        const totalBudget = cats.reduce((s, c) => s + c.budget, 0);
        const totalActual = cats.reduce((s, c) => s + c.actual, 0);
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
            link.href = `/categories/${cat.id}?date=${state.year}-01-01&timeframe=year`;
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
                spacerCell.style.borderTop = `1px solid ${colors.headerBg}`;
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

function buildYearlyView(sections) {
    const colors = getColors();
    const curYear = new Date().getFullYear();

    const container = document.createElement('div');
    container.id = 'yb-container';

    // Header: title on left, year nav + toggles on right
    const header = document.createElement('div');
    header.id = 'yb-header';

    const title = document.createElement('span');
    title.style.cssText = `font-size:18px; font-weight:500; color:${colors.text}`;
    title.textContent = (state.year === curYear ? `${state.year} YTD` : state.year) + ' Budget';
    header.appendChild(title);

    const nav = document.createElement('div');
    nav.id = 'yb-nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'yb-nav-btn';
    prevBtn.textContent = '◀';
    prevBtn.style.color = colors.text;
    prevBtn.setAttribute('aria-label', 'Previous year');
    prevBtn.addEventListener('click', () => { state.year--; saveYear(); showYearlyView(); });
    nav.appendChild(prevBtn);

    const yearLabel = document.createElement('span');
    yearLabel.style.cssText = `font-weight:600; color:${colors.text}`;
    yearLabel.textContent = state.year;
    nav.appendChild(yearLabel);

    if (state.year < curYear) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'yb-nav-btn';
        nextBtn.textContent = '▶';
        nextBtn.style.color = colors.text;
        nextBtn.setAttribute('aria-label', 'Next year');
        nextBtn.addEventListener('click', () => { state.year++; saveYear(); showYearlyView(); });
        nav.appendChild(nextBtn);
    } else {
        yearLabel.style.marginRight = '24px';
    }

    appendToggleButtons(nav, 1);
    header.appendChild(nav);

    container.appendChild(header);
    container.appendChild(buildCards(sections, colors));
    container.appendChild(buildTable(sections, colors));

    return container;
}

function appendToggleButtons(parent, activeMode) {
    // create divider
    const dividerElement = document.createElement('div');
    dividerElement.className = 'yb-vertical-divider';
    parent.appendChild(dividerElement);

    for (const [i, label] of [[0, 'Monthly'], [1, 'Yearly']]) {
        const btn = document.createElement('button');
        btn.className = 'yb-toggle-btn' + (i === activeMode ? ' active' : '');
        btn.textContent = label;
        btn.addEventListener('click', () => onToggleMode(i));
        parent.appendChild(btn);
    }
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

    const loading = document.createElement('div');
    loading.id = 'yb-container';
    loading.style.cssText = 'padding:40px; text-align:center; font-size:15px; font-weight:600';
    loading.textContent = 'Loading yearly budget...';
    scrollRoot.prepend(loading);

    let data;
    try { data = await fetchBudgetData(state.year); }
    catch { loading.textContent = 'Error loading budget data.'; return; }

    if (!data?.budgetData || !data?.categoryGroups) {
        loading.textContent = `No budget data available for ${state.year}.`;
        return;
    }

    loading.replaceWith(buildYearlyView(processData(data)));
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
