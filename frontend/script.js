/**
 * DataLens Frontend Architecture
 * Modular, state-driven UI for AI Data Intelligence.
 */

// ==========================================
// 1. STATE MANAGEMENT
// ==========================================
const DashboardState = {
    fileName: null,
    overview: null,
    dataTypes: null,
    missingValues: null,
    missingPercentage: null,
    duplicateRows: 0,
    numericColumns: 0,
    categoricalColumns: 0,
    statistics: null,
    classImbalance: null,
    correlations: null,
    outliers: null,
    
    // Future placeholders
    healthScore: null,
    anomalies: null,
    recommendations: null,

    set(data, fileName) {
        this.fileName = fileName;
        this.overview = { rows: data.rows, columns: data.columns, columnNames: data.columnNames };
        this.dataTypes = data.dataTypes;
        this.missingValues = data.missingValues;
        this.missingPercentage = data.missingPercentage;
        this.duplicateRows = data.duplicateRows;
        this.numericColumns = data.numericColumns;
        this.categoricalColumns = data.categoricalColumns;
        this.statistics = data.statistics;
        this.classImbalance = data.classImbalance;
        this.correlations = data.correlations;
        this.outliers = data.outliers;
        this.healthScore = data.healthScore;
        this.recommendations = data.recommendations;
        this.targetAnalysis = data.targetAnalysis;
        // Map any future modules here
    }
};

const UIState = {
    activeChartInstances: [],
    
    clearCharts() {
        this.activeChartInstances.forEach(c => c.destroy());
        this.activeChartInstances = [];
    },
    
    addChart(chart) {
        this.activeChartInstances.push(chart);
    }
};

// ==========================================
// 2. THEME & COLORS
// ==========================================
const Theme = {
    bgMain: '#09090b',
    textMain: '#f4f4f5',
    textMuted: '#a1a1aa',
    border: '#3f3f46',
    gridLines: 'rgba(63, 63, 70, 0.5)',
    
    // Palette for categorical charts
    palette: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
        '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', 
        '#14b8a6', '#a855f7'
    ]
};

// ==========================================
// 3. UI COMPONENTS (Reusable Builders)
// ==========================================
const UI = {
    createMetricCard(title, value, iconClass, svgContent, tags = []) {
        const tagHtml = tags.map(t => `<span class="tag-sm ${t.class}">${t.text}</span>`).join('');
        return `
            <div class="card metric-card">
                <div class="metric-icon-wrap ${iconClass}">${svgContent}</div>
                <div class="metric-label">${title}</div>
                <div class="metric-value">${value}</div>
                ${tags.length ? `<div class="feature-split">${tagHtml}</div>` : ''}
            </div>
        `;
    },

    createTableCard(title, subtitle, headers, rowsHtml, emptyMessage = 'No data available.') {
        if (!rowsHtml) {
            return `
                <div class="card">
                    <div class="card-header">
                        <h3>${title}</h3>
                        ${subtitle ? `<span class="text-sm text-muted">${subtitle}</span>` : ''}
                    </div>
                    <div class="empty-state">${emptyMessage}</div>
                </div>
            `;
        }

        const thead = headers.map(h => `<th>${h}</th>`).join('');
        return `
            <div class="card">
                <div class="card-header">
                    <h3>${title}</h3>
                    ${subtitle ? `<span class="text-sm text-muted">${subtitle}</span>` : ''}
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr>${thead}</tr></thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                </div>
            </div>
        `;
    },

    createChartCard(title, canvasId, emptyMessage = 'No data available.', isSuccess = false) {
        return `
            <div class="card">
                <div class="card-header">
                    <h3>${title}</h3>
                </div>
                <div class="chart-container" id="${canvasId}-container">
                    <canvas id="${canvasId}"></canvas>
                </div>
                <div id="${canvasId}-empty" class="chart-empty hidden ${isSuccess ? 'success' : ''}">
                    ${emptyMessage}
                </div>
            </div>
        `;
    }
};

// ==========================================
// 4. CHART UTILITIES (Reusable Renderers)
// ==========================================
const Charts = {
    init() {
        Chart.defaults.color = Theme.textMuted;
        Chart.defaults.font.family = '-apple-system, sans-serif';
    },

    renderBarChart(canvasId, labels, data, label, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const container = document.getElementById(`${canvasId}-container`);
        const emptyState = document.getElementById(`${canvasId}-empty`);

        if (!data || data.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: color,
                    borderRadius: 4,
                    barThickness: labels.length <= 6 ? 40 : undefined
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: Theme.textMuted } },
                    y: { grid: { color: Theme.gridLines }, border: { display: false }, ticks: { color: Theme.textMuted } }
                }
            }
        });
        UIState.addChart(chart);
    },

    renderDoughnutChart(canvasId, labels, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const chart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: Theme.palette.slice(0, labels.length),
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: Theme.textMain, padding: 12, font: { size: 12 } }
                    },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } }
                }
            }
        });
        UIState.addChart(chart);
    }
};

// ==========================================
// 5. SECTION RENDERERS
// ==========================================
const Renderers = {
    renderOverview() {
        const s = DashboardState;
        const container = document.getElementById('overview-metrics-container');
        
        const rowsSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
        const colsSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
        const featSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;

        let html = '';
        html += UI.createMetricCard('Total Rows', (s.overview?.rows || 0).toLocaleString(), 'icon-blue', rowsSvg);
        html += UI.createMetricCard('Total Columns', s.overview?.columns || 0, 'icon-emerald', colsSvg);
        
        const typeTags = [
            { text: `${s.numericColumns || 0} Num`, class: 'numeric' },
            { text: `${s.categoricalColumns || 0} Cat`, class: 'categorical' }
        ];
        html += UI.createMetricCard('Features', s.overview?.columns || 0, 'icon-rose', featSvg, typeTags);

        container.innerHTML = html;

        // Dataset Health Score
        const healthContainer = document.getElementById('overview-health-container');
        if (healthContainer && s.healthScore !== undefined && s.healthScore !== null) {
            const scoreValue = typeof s.healthScore === 'object' ? s.healthScore.score : s.healthScore;
            let colorCode = 'var(--semantic-success)';
            let icon = '🛡️';
            let statusText = 'Excellent';

            if (scoreValue < 50) {
                colorCode = 'var(--semantic-danger)';
                icon = '⚠️';
                statusText = 'Critical';
            } else if (scoreValue < 80) {
                colorCode = 'var(--semantic-warning)';
                icon = '🔔';
                statusText = 'Needs Improvement';
            }

            healthContainer.innerHTML = `
                <div class="card-header">
                    <h3>Dataset Health</h3>
                    <span class="text-sm text-muted">Overall Readiness Score</span>
                </div>
                <div style="display: flex; align-items: center; gap: 1.5rem; margin-top: 1rem;">
                    <div style="font-size: 3.5rem; font-weight: 700; color: ${colorCode}; line-height: 1;">
                        ${scoreValue}<span style="font-size: 1.5rem;">/100</span>
                    </div>
                    <div>
                        <div style="font-size: 1.2rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">${icon} Status: ${statusText}</div>
                        <p class="text-muted text-sm max-w-md">Computed based on missing data percentage, duplicate records, outliers, and class imbalance.</p>
                    </div>
                </div>
            `;
        }
    },

    renderDataQuality() {
        const s = DashboardState;
        
        // 1. Quality Metrics
        const dqMetrics = document.getElementById('dq-metrics-container');
        const dupSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="2" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
        
        let metricsHtml = UI.createMetricCard(
            'Duplicate Rows', 
            (s.duplicateRows || 0).toLocaleString(), 
            s.duplicateRows > 0 ? 'icon-amber' : 'icon-emerald', 
            dupSvg
        );
        dqMetrics.innerHTML = metricsHtml;

        // 2. Missing Values Charts
        const chartsContainer = document.getElementById('dq-charts-container');
        chartsContainer.innerHTML = 
            UI.createChartCard('Missing Values (Count)', 'missingCountChart', 'No missing values found ✓', true) +
            UI.createChartCard('Missing Values (%)', 'missingPctChart', 'No missing values found ✓', true);

        // Filter missing values > 0
        const mvEntries = Object.entries(s.missingValues || {}).filter(([, v]) => v > 0);
        const mpEntries = Object.entries(s.missingPercentage || {}).filter(([, v]) => v > 0);

        Charts.renderBarChart('missingCountChart', mvEntries.map(e => e[0]), mvEntries.map(e => e[1]), 'Missing Count', '#f59e0b');
        Charts.renderBarChart('missingPctChart', mpEntries.map(e => e[0]), mpEntries.map(e => e[1]), 'Missing %', '#ef4444');

        // 3. Outliers (IQR)
        const outliersContainer = document.getElementById('dq-outliers-container');
        if (outliersContainer) {
            const outEntries = Object.entries(s.outliers || {}).filter(([, count]) => count > 0);
            if (outEntries.length === 0) {
                outliersContainer.innerHTML = UI.createTableCard('Outliers Detected (IQR)', 'Statistical outliers per column', [], '', 'No statistical outliers detected.');
            } else {
                let outRows = '';
                outEntries.forEach(([col, count]) => {
                    // We only have count from backend, let's calculate % if we have rows
                    const rows = s.overview?.rows || 1;
                    const pct = ((count / rows) * 100).toFixed(2);
                    outRows += `<tr>
                        <td><code>${col}</code></td>
                        <td>${count.toLocaleString()}</td>
                        <td>${pct}%</td>
                    </tr>`;
                });
                outliersContainer.innerHTML = UI.createTableCard('Outliers Detected (IQR)', 'Statistical outliers per numeric column', ['Feature', 'Outlier Count', '% of Data'], outRows);
            }
        }
    },

    renderStatistics() {
        const s = DashboardState;
        
        // 1. Numeric Statistics
        let statsRows = '';
        const statsEntries = Object.entries(s.statistics || {});
        statsEntries.forEach(([col, stats]) => {
            statsRows += `<tr>
                <td><code>${col}</code></td>
                <td class="font-mono">${stats.mean ?? '—'}</td>
                <td class="font-mono">${stats.median ?? '—'}</td>
                <td class="font-mono">${stats.min ?? '—'}</td>
                <td class="font-mono">${stats.max ?? '—'}</td>
            </tr>`;
        });
        document.getElementById('statistics-table-container').innerHTML = 
            UI.createTableCard('Numeric Statistics', 'Distribution of numeric variables', ['Column', 'Mean', 'Median', 'Min', 'Max'], statsRows, 'No numeric columns found.');

        // 2. Data Types
        let typeRows = '';
        const typeEntries = Object.entries(s.dataTypes || {});
        typeEntries.forEach(([col, dtype]) => {
            typeRows += `<tr>
                <td><code>${col}</code></td>
                <td><span class="dtype-badge">${dtype}</span></td>
            </tr>`;
        });
        document.getElementById('data-types-table-container').innerHTML = 
            UI.createTableCard('Data Types', 'Inferred data type for each column', ['Column', 'Type'], typeRows);
    },

    renderFeatureAnalysis() {
        const s = DashboardState;

        // 1. Correlations
        let corrRows = '';
        const corrs = s.correlations || [];
        corrs.forEach(item => {
            const absVal = Math.abs(item.correlation);
            const colorClass = item.correlation >= 0 ? 'corr-positive' : 'corr-negative';
            let strength = absVal >= 0.95 ? 'Perfect' : (absVal >= 0.85 ? 'Very Strong' : 'Strong');
            
            corrRows += `<tr>
                <td><code>${item.featureA}</code></td>
                <td><code>${item.featureB}</code></td>
                <td>
                    <span class="corr-badge ${colorClass}">${item.correlation.toFixed(2)}</span>
                    <span class="text-xs text-muted ml-2">${strength}</span>
                </td>
            </tr>`;
        });
        document.getElementById('correlations-container').innerHTML = 
            UI.createTableCard('Top Correlations', 'Feature pairs with |r| ≥ 0.70', ['Feature A', 'Feature B', 'Correlation'], corrRows, 'No strong correlations found (|r| < 0.70).');

        // 2. Class Imbalance
        const imbalanceContainer = document.getElementById('class-imbalance-container');
        const imbEntries = Object.entries(s.classImbalance || {});
        
        if (imbEntries.length === 0) {
            imbalanceContainer.innerHTML = UI.createTableCard('Class Imbalance', 'Categorical columns distribution', [], '', 'No categorical columns found.');
            return;
        }

        let chartsHtml = `<div class="card"><div class="card-header"><h3>Class Imbalance</h3><span class="text-sm text-muted">Distribution of categorical columns</span></div><div class="grid grid-cols-2 mt-2">`;
        imbEntries.forEach(([col], i) => {
            chartsHtml += `<div class="chart-wrapper"><h4 class="text-sm mb-2 text-center font-mono">${col}</h4><div class="chart-container" style="height: 200px;"><canvas id="imbChart${i}"></canvas></div></div>`;
        });
        chartsHtml += `</div></div>`;
        imbalanceContainer.innerHTML = chartsHtml;

        // Render charts after DOM insertion
        imbEntries.forEach(([col, dist], i) => {
            Charts.renderDoughnutChart(`imbChart${i}`, Object.keys(dist), Object.values(dist));
        });
    },

    renderRecommendations() {
        const s = DashboardState;
        const recs = s.recommendations || [];
        const container = document.getElementById('section-recommendations');
        
        if (container) {
            if (recs.length > 0) {
                let recHtml = `
                    <div class="card">
                        <div class="card-header">
                            <h3>Actionable Recommendations</h3>
                            <span class="text-sm text-muted">AI-generated data cleaning suggestions</span>
                        </div>
                        <ul class="mt-4" style="list-style-type: none; padding-left: 0;">
                `;
                recs.forEach(r => {
                    recHtml += `<li class="mb-3" style="display: flex; gap: 0.75rem; align-items: flex-start;">
                        <span style="color: var(--accent-primary); margin-top: 2px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                        </span>
                        <span>${r}</span>
                    </li>`;
                });
                recHtml += `</ul></div>`;
                container.innerHTML = recHtml;
            } else {
                container.innerHTML = `
                    <div class="card module-placeholder">
                        <div class="placeholder-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <h3>Actionable Recommendations</h3>
                        <p class="text-muted">No recommendations generated.</p>
                    </div>
                `;
            }
        }
    },

    renderAnalystInsights() {
        const s = DashboardState;
        const container = document.getElementById('analyst-insights-container');
        if (!container) return;

        let insightsHtml = `
            <div class="analyst-message">
                <div style="color: var(--accent-primary);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div>
                    <h3 style="margin-bottom: 0.5rem;">DataLens AI Analyst</h3>
                    <p class="text-muted text-sm mb-2">I have analyzed your dataset and prepared an initial exploratory data analysis. The dataset contains <strong>${(s.overview?.rows || 0).toLocaleString()}</strong> rows and <strong>${s.overview?.columns || 0}</strong> features.</p>
                    <p class="text-muted text-sm">Please review the EDA sections and then proceed to <strong>Target Analysis</strong> to configure advanced Machine Learning modeling.</p>
                </div>
            </div>
        `;
        container.innerHTML = insightsHtml;
    },

    renderTargetAnalysis() {
        const s = DashboardState;
        const ta = s.targetAnalysis;
        const container = document.getElementById('target-candidates-container');
        const select = document.getElementById('manual-target-select');
        const btnContinue = document.getElementById('btn-continue-ml');

        if (!ta || !container || !select) return;

        // Reset state
        btnContinue.disabled = true;
        btnContinue.style.opacity = '0.5';
        btnContinue.style.cursor = 'not-allowed';

        // Populate dropdown
        select.innerHTML = '<option value="">Select a column...</option>';
        (ta.allColumns || []).forEach(col => {
            const opt = document.createElement('option');
            opt.value = col;
            opt.textContent = col;
            select.appendChild(opt);
        });

        // Render Candidates
        container.innerHTML = '';
        const candidates = ta.candidates || [];
        
        candidates.forEach((cand, idx) => {
            let confClass = 'conf-high';
            if (cand.confidence < 80) confClass = 'conf-med';
            if (cand.confidence < 60) confClass = 'conf-low';

            const card = document.createElement('div');
            card.className = 'card target-card';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; align-items: center;">
                    <div style="font-weight: 600; font-family: var(--font-mono); font-size: 1.1rem; color: var(--text-primary);">⭐ ${cand.name}</div>
                    <div class="conf-badge ${confClass}">${cand.confidence}% Match</div>
                </div>
                <p class="text-muted text-sm" style="flex: 1;">${cand.reason}</p>
            `;

            card.addEventListener('click', () => {
                // Deselect others
                container.querySelectorAll('.target-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                // Sync select dropdown
                select.value = cand.name;
                
                // Update state
                ta.selectedTarget = cand.name;
                enableContinueButton();
            });

            container.appendChild(card);
            
            // Auto-select the top candidate
            if (idx === 0) {
                card.click();
            }
        });

        // Handle dropdown manual override
        select.addEventListener('change', (e) => {
            ta.selectedTarget = e.target.value;
            // Deselect cards
            container.querySelectorAll('.target-card').forEach(c => c.classList.remove('selected'));
            
            // Check if selected value matches a card
            const matchCard = Array.from(container.children).find(c => c.querySelector('.font-mono').textContent.includes(e.target.value));
            if (matchCard) matchCard.classList.add('selected');

            if (ta.selectedTarget) enableContinueButton();
            else disableContinueButton();
        });

        function enableContinueButton() {
            btnContinue.disabled = false;
            btnContinue.style.opacity = '1';
            btnContinue.style.cursor = 'pointer';
        }

        function disableContinueButton() {
            btnContinue.disabled = true;
            btnContinue.style.opacity = '0.5';
            btnContinue.style.cursor = 'not-allowed';
        }
    },

    renderMLReadiness() {
        const s = DashboardState;
        const container = document.getElementById('section-ml-readiness');
        if (!container) return;

        const target = s.targetAnalysis?.selectedTarget;
        if (!target) return;

        // Real ML Readiness Score from backend problemType
        let score = s.healthScore?.score || 70;
        let reasons = [];
        
        const problemType = s.mlAnalysis?.problemType || { type: 'Unknown', reason: 'Could not determine' };
        
        const targetMissing = s.missingPercentage?.[target] || 0;
        if (targetMissing > 0) {
            score -= 20;
            reasons.push(`Target column '${target}' has ${targetMissing}% missing values. Rows with missing targets must be dropped.`);
        } else {
            reasons.push(`Target column '${target}' is fully populated.`);
        }

        reasons.push(problemType.reason);

        score = Math.max(0, Math.min(100, score));
        let colorCode = score >= 80 ? 'var(--semantic-success)' : score >= 50 ? 'var(--semantic-warning)' : 'var(--semantic-danger)';

        // Use feature importance from backend
        const features = s.mlAnalysis?.featureImportance || [];

        container.innerHTML = `
            <div class="card" style="border-left: 4px solid var(--accent-primary);">
                <div class="card-header">
                    <h3>ML Readiness Score</h3>
                    <span class="text-sm text-muted">Analysis for predicting '${target}'</span>
                </div>
                <div style="display: flex; align-items: center; gap: 2rem; margin-top: 1.5rem;">
                    <div style="text-align: center;">
                        <div style="font-size: 4rem; font-weight: 700; color: ${colorCode}; line-height: 1;">${score}</div>
                        <div class="text-muted text-sm mt-2">/ 100 Readiness</div>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">Problem Type: <span style="color: var(--accent-primary);">${problemType.type}</span></h4>
                        <ul style="padding-left: 1.25rem; color: var(--text-secondary); line-height: 1.8;">
                            ${reasons.map(r => `<li>${r}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 mt-4">
                <div class="card">
                    <div class="card-header">
                        <h3>Feature Predictive Power</h3>
                        <span class="text-sm text-muted">Tree-based Feature Importance for ${target}</span>
                    </div>
                    <div style="margin-top: 1rem; color: var(--text-muted); font-size: 0.9rem;">
                        <p>Computed using Random Forest feature importances.</p>
                        <div style="margin-top: 1rem; border-left: 3px solid var(--border-strong); padding-left: 1rem;">
                            ${features.map(f => {
                                return `<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span>${f.feature}</span>
                                    <span style="font-family: var(--font-mono); color: var(--accent-primary);">${(f.importance * 100).toFixed(1)}%</span>
                                </div>`;
                            }).join('') || '<p>No features found.</p>'}
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3>Data Quality Concerns</h3>
                        <span class="text-sm text-muted">Items to resolve before modeling</span>
                    </div>
                    <ul style="margin-top: 1rem; padding-left: 1.25rem; color: var(--semantic-warning); line-height: 1.6;">
                        ${(s.recommendations || []).slice(0, 4).map(r => `<li style="margin-bottom: 0.5rem;">${r}</li>`).join('') || '<li style="color: var(--semantic-success)">No major concerns!</li>'}
                    </ul>
                </div>
            </div>
        `;
    },

    renderAIInsights() {
        const s = DashboardState;
        const container = document.getElementById('section-ai-insights');
        if (!container) return;

        const target = s.targetAnalysis?.selectedTarget || 'unknown';
        const problemType = s.mlAnalysis?.problemType?.type || 'Predictive Modeling';

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>AI Executive Summary</h3>
                    <span class="text-sm text-muted">Generated by DataLens Intelligence</span>
                </div>
                <div style="margin-top: 1.5rem; line-height: 1.8; color: var(--text-primary); font-size: 1.05rem;">
                    <p style="margin-bottom: 1rem;">
                        The dataset contains <strong>${(s.overview?.rows || 0).toLocaleString()}</strong> observations and <strong>${s.overview?.columns || 0}</strong> features. 
                        Based on the selection of <strong>'${target}'</strong> as the target variable, this represents a <strong>${problemType}</strong> task.
                    </p>
                    <p style="margin-bottom: 1rem;">
                        Overall dataset health is <strong>${s.healthScore?.score || 'moderate'}%</strong>. 
                        There are <strong>${s.numericColumns}</strong> numeric features and <strong>${s.categoricalColumns}</strong> categorical features. 
                        Missing data affects <strong>${Object.values(s.missingPercentage || {}).filter(v => v > 0).length}</strong> columns, which will require imputation strategies before training a model.
                    </p>
                    <p>
                        <strong>Next Steps:</strong> We recommend handling missing values in the affected columns, encoding the categorical variables, and establishing a baseline model using algorithms suitable for the target cardinality.
                    </p>
                </div>
            </div>
        `;
    }
};

// ==========================================
// 6. CONTROLLER & NAVIGATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    Charts.init();

    const views = {
        upload: document.getElementById('view-upload'),
        loading: document.getElementById('view-loading'),
        error: document.getElementById('view-error'),
        dashboard: document.getElementById('view-dashboard')
    };

    function showView(viewName) {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        if (views[viewName]) views[viewName].classList.remove('hidden');
    }

    // --- Upload Handlers ---
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('upload-zone');
    
    document.getElementById('browse-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('dragover'); if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', e => { if (e.target.files.length) processFile(e.target.files[0]); });

    // --- Topbar Actions ---
    document.getElementById('new-analysis-btn').addEventListener('click', () => {
        showView('upload');
        document.getElementById('new-analysis-btn').classList.add('hidden');
        fileInput.value = '';
    });
    document.getElementById('retry-btn').addEventListener('click', () => showView('upload'));

    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');

    function navigateToSection(sectionId) {
        // Update Nav
        navItems.forEach(item => {
            if (item.dataset.section === sectionId) item.classList.add('active');
            else item.classList.remove('active');
        });

        // Update Content
        sections.forEach(sec => {
            if (sec.id === `section-${sectionId}`) sec.classList.remove('hidden');
            else sec.classList.add('hidden');
        });

        // Update Title
        const activeNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
        if (activeNav) document.getElementById('section-title').textContent = activeNav.textContent;
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToSection(e.target.dataset.section);
        });
    });

    // --- Continue ML Trigger ---
    document.getElementById('btn-continue-ml')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-continue-ml');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Analyzing...';
        btn.disabled = true;

        try {
            const target = DashboardState.targetAnalysis?.selectedTarget;
            const fileName = DashboardState.savedFileName;

            const response = await fetch('http://localhost:5000/api/ml-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName, targetColumn: target })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'ML Analysis failed');

            DashboardState.mlAnalysis = data;

            // Unlock ML Sections
            const mlGroup = document.getElementById('nav-group-ml');
            if (mlGroup) {
                mlGroup.style.opacity = '1';
                mlGroup.style.pointerEvents = 'auto';
                mlGroup.querySelector('.nav-title').innerHTML = 'Phase 3: ML Analysis';
            }
            
            // Compute and Render Phase 3 Modules purely in Frontend
            Renderers.renderMLReadiness();
            Renderers.renderAIInsights();
            
            // Transition to ML Readiness
            navigateToSection('ml-readiness');
        } catch (err) {
            alert('Error running ML Analysis: ' + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // --- Core Processing ---
    async function processFile(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            document.getElementById('upload-error').textContent = 'Please upload a .csv file.';
            document.getElementById('upload-error').classList.remove('hidden');
            return;
        }

        document.getElementById('upload-error').classList.add('hidden');
        showView('loading');
        
        // Simulating progress
        const progressBar = document.getElementById('progress-bar');
        let progress = 0;
        const loader = setInterval(() => { progress += 10; if(progress <= 90) progressBar.style.width = `${progress}%`; }, 200);

        try {
            const formData = new FormData();
            formData.append('dataset', file);
            
            const response = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: formData });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message || 'Upload failed');

            clearInterval(loader);
            progressBar.style.width = '100%';

            setTimeout(() => {
                initializeDashboard(data, file.name);
            }, 500);

        } catch (error) {
            clearInterval(loader);
            document.getElementById('error-message').textContent = error.message;
            showView('error');
        }
    }

    function initializeDashboard(apiData, fileName) {
        UIState.clearCharts();
        DashboardState.set(apiData, fileName);
        DashboardState.savedFileName = apiData.savedFileName || fileName; // Store saved name for ML API

        // Update Header
        document.getElementById('sidebar-filename').textContent = fileName;
        document.getElementById('new-analysis-btn').classList.remove('hidden');

        // Render Active Data Modules
        Renderers.renderOverview();
        Renderers.renderDataQuality();
        Renderers.renderStatistics();
        Renderers.renderFeatureAnalysis();
        Renderers.renderRecommendations();
        Renderers.renderAnalystInsights();
        Renderers.renderTargetAnalysis();

        // Show Dashboard and Reset to Overview
        showView('dashboard');
        navigateToSection('analyst-insights');
    }
});