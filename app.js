/* =========================================================
   Casino Session Dashboard
   - localStorage persistence
   - import/export JSON
   - CRUD (add/edit/delete)
   - dark/light mode support
   - Chart.js cumulative/daily P/L with up/down segment coloring
   - Enhanced statistics (biggest win/loss, streaks, ROI)
   - Toast notifications
   - Accessibility improvements
   ========================================================= */

(() => {
  "use strict";

  // ---------------------------
  // Storage Keys
  // ---------------------------
  const STORAGE_KEY = "casino:sessions:v1";
  const THEME_KEY = "casino:theme:v1";
  const MODE_KEY = "casino:mode:v1";
  const CHART_VIEW_KEY = "casino:chart-view:v1";

  // ---------------------------
  // DOM
  // ---------------------------
  const el = {
    form: document.getElementById("sessionForm"),
    date: document.getElementById("date"),
    buyIn: document.getElementById("buyIn"),
    cashOut: document.getElementById("cashOut"),
    resetBtn: document.getElementById("resetBtn"),
    formError: document.getElementById("formError"),

    totalBuyIn: document.getElementById("totalBuyIn"),
    totalCashOut: document.getElementById("totalCashOut"),
    netPL: document.getElementById("netPL"),
    winRate: document.getElementById("winRate"),
    sessionCount: document.getElementById("sessionCount"),
    avgPL: document.getElementById("avgPL"),

    biggestWin: document.getElementById("biggestWin"),
    biggestLoss: document.getElementById("biggestLoss"),
    currentStreak: document.getElementById("currentStreak"),
    roi: document.getElementById("roi"),

    tableBody: document.getElementById("tableBody"),
    emptyState: document.getElementById("emptyState"),

    exportBtn: document.getElementById("exportBtn"),
    importFile: document.getElementById("importFile"),
    clearBtn: document.getElementById("clearBtn"),

    themeSelect: document.getElementById("themeSelect"),
    modeToggle: document.getElementById("modeToggle"),

    cumulativeBtn: document.getElementById("cumulativeBtn"),
    dailyBtn: document.getElementById("dailyBtn"),

    editModal: document.getElementById("editModal"),
    editForm: document.getElementById("editForm"),
    editId: document.getElementById("editId"),
    editDate: document.getElementById("editDate"),
    editBuyIn: document.getElementById("editBuyIn"),
    editCashOut: document.getElementById("editCashOut"),
    saveEditBtn: document.getElementById("saveEditBtn"),
    editError: document.getElementById("editError"),

    clearModal: document.getElementById("clearModal"),
    closeClearModal: document.getElementById("closeClearModal"),
    cancelClear: document.getElementById("cancelClear"),
    confirmClear: document.getElementById("confirmClear"),
    clearSessionCount: document.getElementById("clearSessionCount"),

    chartCanvas: document.getElementById("plChart"),
    toast: document.getElementById("toast"),
  };

  // ---------------------------
  // State
  // ---------------------------
  /** @type {{id:string, date:string, buyIn:number, cashOut:number}[]} */
  let sessions = loadSessions();
  let chart = null;
  let chartView = loadChartView(); // "cumulative" or "daily"

  // ---------------------------
  // Utilities
  // ---------------------------
  const uid = () =>
    (crypto?.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`);

  const money = (n) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD" });

  const asNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const sortByDateAsc = (a, b) => a.date.localeCompare(b.date);

  const computePL = (s) => s.cashOut - s.buyIn;

  function setError(targetEl, msg) {
    targetEl.textContent = msg || "";
  }

  function confirmDanger(message) {
    return window.confirm(message);
  }

  // ---------------------------
  // Toast Notifications
  // ---------------------------
  function showToast(message, type = "success") {
    el.toast.textContent = message;
    el.toast.className = `toast ${type} show`;
    
    setTimeout(() => {
      el.toast.classList.remove("show");
    }, 3000);
  }

  // ---------------------------
  // Theme & Mode
  // ---------------------------
  function loadTheme() {
    return localStorage.getItem(THEME_KEY) || "midnight";
  }

  function loadMode() {
    const saved = localStorage.getItem(MODE_KEY);
    if (saved) return saved;
    
    // Detect system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return "light";
    }
    return "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    if (el.themeSelect) el.themeSelect.value = theme;
    renderChart();
  }

  function applyMode(mode) {
    document.documentElement.setAttribute("data-mode", mode);
    localStorage.setItem(MODE_KEY, mode);
    updateModeIcon(mode);
    renderChart();
  }

  function updateModeIcon(mode) {
    const icon = el.modeToggle.querySelector('.mode-icon');
    icon.textContent = mode === "dark" ? "☀️" : "🌙";
    el.modeToggle.setAttribute('aria-label', 
      mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  function toggleMode() {
    const current = document.documentElement.getAttribute("data-mode");
    const newMode = current === "dark" ? "light" : "dark";
    applyMode(newMode);
  }

  // ---------------------------
  // Chart View
  // ---------------------------
  function loadChartView() {
    return localStorage.getItem(CHART_VIEW_KEY) || "cumulative";
  }

  function saveChartView(view) {
    chartView = view;
    localStorage.setItem(CHART_VIEW_KEY, view);
  }

  function updateChartViewButtons() {
    el.cumulativeBtn.classList.toggle("active", chartView === "cumulative");
    el.dailyBtn.classList.toggle("active", chartView === "daily");
    
    el.cumulativeBtn.setAttribute("aria-pressed", chartView === "cumulative");
    el.dailyBtn.setAttribute("aria-pressed", chartView === "daily");
  }

  // ---------------------------
  // Persistence
  // ---------------------------
  function loadSessions() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(x => x && typeof x.date === "string")
        .map(x => ({
          id: typeof x.id === "string" ? x.id : uid(),
          date: x.date,
          buyIn: Number(x.buyIn) || 0,
          cashOut: Number(x.cashOut) || 0,
        }))
        .sort(sortByDateAsc);
    } catch (err) {
      console.error("Error loading sessions:", err);
      showToast("Error loading saved data", "error");
      return [];
    }
  }

  function saveSessions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (err) {
      console.error("Error saving sessions:", err);
      if (err.name === 'QuotaExceededError') {
        showToast("Storage quota exceeded. Consider exporting and clearing old data.", "error");
      } else {
        showToast("Error saving data", "error");
      }
    }
  }

  // ---------------------------
  // Validation
  // ---------------------------
  function validateInputs(date, buyIn, cashOut) {
    if (!date) return "Date is required.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Date must be YYYY-MM-DD.";
    if (!Number.isFinite(buyIn) || buyIn < 0) return "Buy-in must be a number ≥ 0.";
    if (!Number.isFinite(cashOut) || cashOut < 0) return "Cash-out must be a number ≥ 0.";
    return "";
  }

  // ---------------------------
  // Derived Metrics
  // ---------------------------
  function summarize(list) {
    const totalBuyIn = list.reduce((sum, s) => sum + s.buyIn, 0);
    const totalCashOut = list.reduce((sum, s) => sum + s.cashOut, 0);
    const net = totalCashOut - totalBuyIn;

    const wins = list.filter(s => computePL(s) > 0).length;
    const count = list.length;
    const winRate = count ? (wins / count) * 100 : 0;

    const avg = count ? (list.reduce((sum, s) => sum + computePL(s), 0) / count) : 0;

    // Biggest win/loss
    let biggestWin = 0;
    let biggestLoss = 0;
    list.forEach(s => {
      const pl = computePL(s);
      if (pl > biggestWin) biggestWin = pl;
      if (pl < biggestLoss) biggestLoss = pl;
    });

    // Current streak
    let currentStreak = 0;
    if (count > 0) {
      const sorted = [...list].sort(sortByDateAsc);
      const lastPL = computePL(sorted[sorted.length - 1]);
      const isWinStreak = lastPL > 0;
      
      for (let i = sorted.length - 1; i >= 0; i--) {
        const pl = computePL(sorted[i]);
        if ((isWinStreak && pl > 0) || (!isWinStreak && pl <= 0)) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      if (!isWinStreak) currentStreak = -currentStreak;
    }

    // ROI
    const roi = totalBuyIn > 0 ? ((net / totalBuyIn) * 100) : 0;

    return { totalBuyIn, totalCashOut, net, winRate, count, avg, biggestWin, biggestLoss, currentStreak, roi };
  }

  function buildChartSeries(list) {
    let cum = 0;
    const labels = [];
    const cumulative = [];
    const dailyPL = [];

    list.forEach(s => {
      const pl = computePL(s);
      cum += pl;
      labels.push(s.date);
      dailyPL.push(pl);
      cumulative.push(cum);
    });

    return { labels, cumulative, dailyPL };
  }

  // ---------------------------
  // Render: Summary & Stats
  // ---------------------------
  function renderSummary() {
    const { totalBuyIn, totalCashOut, net, winRate, count, avg, biggestWin, biggestLoss, currentStreak, roi } = summarize(sessions);

    el.totalBuyIn.textContent = money(totalBuyIn);
    el.totalCashOut.textContent = money(totalCashOut);

    el.netPL.textContent = money(net);
    el.netPL.classList.remove("good", "bad");
    if (net > 0) el.netPL.classList.add("good");
    if (net < 0) el.netPL.classList.add("bad");

    el.winRate.textContent = `${winRate.toFixed(0)}%`;
    el.sessionCount.textContent = String(count);

    el.avgPL.textContent = money(avg);
    el.avgPL.classList.remove("good", "bad");
    if (avg > 0) el.avgPL.classList.add("good");
    if (avg < 0) el.avgPL.classList.add("bad");

    // Statistics
    el.biggestWin.textContent = money(biggestWin);
    el.biggestLoss.textContent = money(biggestLoss);
    
    if (currentStreak === 0) {
      el.currentStreak.textContent = "-";
      el.currentStreak.classList.remove("good", "bad");
    } else if (currentStreak > 0) {
      el.currentStreak.textContent = `${currentStreak}W`;
      el.currentStreak.classList.remove("bad");
      el.currentStreak.classList.add("good");
    } else {
      el.currentStreak.textContent = `${Math.abs(currentStreak)}L`;
      el.currentStreak.classList.remove("good");
      el.currentStreak.classList.add("bad");
    }

    el.roi.textContent = `${roi.toFixed(1)}%`;
    el.roi.classList.remove("good", "bad");
    if (roi > 0) el.roi.classList.add("good");
    if (roi < 0) el.roi.classList.add("bad");
  }

  // ---------------------------
  // Render: Table
  // ---------------------------
  function renderTable() {
    el.tableBody.innerHTML = "";

    const showEmpty = sessions.length === 0;
    el.emptyState.style.display = showEmpty ? "block" : "none";

    for (const s of sessions) {
      const pl = computePL(s);

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><span class="mono">${escapeHtml(s.date)}</span></td>
        <td class="num">${escapeHtml(money(s.buyIn))}</td>
        <td class="num">${escapeHtml(money(s.cashOut))}</td>
        <td class="num">
          <span class="${pl > 0 ? "good" : pl < 0 ? "bad" : ""}">${escapeHtml(money(pl))}</span>
        </td>
        <td class="actions">
          <div class="row-actions">
            <button class="icon" data-action="edit" data-id="${s.id}" type="button" aria-label="Edit session from ${s.date}">Edit</button>
            <button class="icon danger" data-action="delete" data-id="${s.id}" type="button" aria-label="Delete session from ${s.date}">Delete</button>
          </div>
        </td>
      `;

      el.tableBody.appendChild(tr);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ---------------------------
  // Render: Chart
  // ---------------------------
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function buildChartConfig(series) {
    const { labels, cumulative, dailyPL } = series;

    const text = cssVar("--text");
    const muted = cssVar("--muted");
    const grid = cssVar("--grid");
    const good = cssVar("--good");
    const bad = cssVar("--bad");
    const panelBg = "rgba(0,0,0,.10)";

    const mode = document.documentElement.getAttribute("data-mode");
    const panelBgLight = "rgba(0,0,0,.04)";

    const pointColors = dailyPL.map(pl => (pl > 0 ? good : pl < 0 ? bad : muted));

    const dataToShow = chartView === "cumulative" ? cumulative : dailyPL;
    const chartType = chartView === "cumulative" ? "line" : "bar";

    const config = {
      type: chartType,
      data: {
        labels,
        datasets: [{
          label: chartView === "cumulative" ? "Cumulative Profit/Loss" : "Daily Profit/Loss",
          data: dataToShow,
          tension: chartView === "cumulative" ? 0.35 : 0,
          borderWidth: 2,
          pointRadius: chartView === "cumulative" ? 3.5 : 0,
          pointHoverRadius: chartView === "cumulative" ? 6 : 0,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          fill: chartView === "cumulative" ? true : false,
          backgroundColor: chartView === "cumulative" 
            ? (mode === "light" ? panelBgLight : panelBg)
            : pointColors,
          borderColor: chartView === "cumulative" ? good : undefined,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (items) => `Date: ${items?.[0]?.label ?? ""}`,
              label: (item) => {
                const idx = item.dataIndex;
                const daily = dailyPL[idx] ?? 0;
                const cum = cumulative[idx] ?? 0;
                const sign = daily > 0 ? "Win" : daily < 0 ? "Loss" : "Even";
                
                if (chartView === "cumulative") {
                  return [
                    `Daily (${sign}): ${money(daily)}`,
                    `Cumulative: ${money(cum)}`
                  ];
                } else {
                  return `P/L (${sign}): ${money(daily)}`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: grid },
            ticks: { color: muted, maxRotation: 0, autoSkip: true },
          },
          y: {
            grid: { color: grid },
            ticks: {
              color: muted,
              callback: (v) => money(Number(v)),
            },
          }
        }
      }
    };

    // Segment coloring only for cumulative line chart
    if (chartView === "cumulative") {
      config.data.datasets[0].segment = {
        borderColor: (ctx) => {
          const y0 = ctx.p0.parsed.y;
          const y1 = ctx.p1.parsed.y;
          if (y1 > y0) return good;
          if (y1 < y0) return bad;
          return muted;
        }
      };
    }

    return config;
  }

  function renderChart() {
    const series = buildChartSeries(sessions);

    if (chart) {
      chart.destroy();
      chart = null;
    }

    const ctx = el.chartCanvas.getContext("2d");
    chart = new Chart(ctx, buildChartConfig(series));
  }

  // ---------------------------
  // Render: All
  // ---------------------------
  function renderAll() {
    sessions.sort(sortByDateAsc);
    renderSummary();
    renderTable();
    renderChart();
    updateChartViewButtons();
  }

  // ---------------------------
  // CRUD
  // ---------------------------
  function addSession(date, buyIn, cashOut) {
    sessions.push({ id: uid(), date, buyIn, cashOut });
    sessions.sort(sortByDateAsc);
    saveSessions();
    renderAll();
    showToast("Session added successfully");
  }

  function deleteSession(id) {
    sessions = sessions.filter(s => s.id !== id);
    saveSessions();
    renderAll();
    showToast("Session deleted");
  }

  function updateSession(id, patch) {
    const idx = sessions.findIndex(s => s.id === id);
    if (idx === -1) return;
    sessions[idx] = { ...sessions[idx], ...patch };
    sessions.sort(sortByDateAsc);
    saveSessions();
    renderAll();
    showToast("Session updated successfully");
  }

  // ---------------------------
  // Export / Import
  // ---------------------------
  function exportJson() {
    if (sessions.length === 0) {
      showToast("No data to export", "error");
      return;
    }

    const payload = JSON.stringify(sessions, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `casino-sessions-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    showToast("Data exported successfully");
  }

  async function importJsonFile(file) {
    const text = await file.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("That file is not valid JSON.");
    }
    if (!Array.isArray(parsed)) {
      throw new Error("Import file must be an array of sessions.");
    }

    const normalized = parsed.map(x => ({
      id: typeof x.id === "string" ? x.id : uid(),
      date: String(x.date || ""),
      buyIn: Number(x.buyIn),
      cashOut: Number(x.cashOut),
    }));

    for (const s of normalized) {
      const err = validateInputs(s.date, s.buyIn, s.cashOut);
      if (err) throw new Error(`Import error for date "${s.date}": ${err}`);
    }

    sessions = normalized.sort(sortByDateAsc);
    saveSessions();
    renderAll();
    showToast(`Successfully imported ${sessions.length} sessions`);
  }

  // ---------------------------
  // Edit Modal
  // ---------------------------
  function openEditModal(session) {
    setError(el.editError, "");

    el.editId.value = session.id;
    el.editDate.value = session.date;
    el.editBuyIn.value = String(session.buyIn);
    el.editCashOut.value = String(session.cashOut);

    el.editModal.showModal();
    
    // Focus first input for accessibility
    setTimeout(() => el.editDate.focus(), 100);
  }

  function closeEditModal() {
    el.editModal.close();
  }

  function handleSaveEdit() {
    const id = el.editId.value;

    const date = el.editDate.value;
    const buyIn = asNumber(el.editBuyIn.value);
    const cashOut = asNumber(el.editCashOut.value);

    const err = validateInputs(date, buyIn, cashOut);
    if (err) {
      setError(el.editError, err);
      return;
    }

    updateSession(id, { date, buyIn, cashOut });
    closeEditModal();
  }

  // ---------------------------
  // Events
  // ---------------------------
  function wireEvents() {
    // Theme & Mode
    applyTheme(loadTheme());
    applyMode(loadMode());
    
    el.themeSelect.addEventListener("change", (e) => {
      applyTheme(e.target.value);
    });

    el.modeToggle.addEventListener("click", toggleMode);

    // Chart view toggle
    el.cumulativeBtn.addEventListener("click", () => {
      saveChartView("cumulative");
      renderChart();
      updateChartViewButtons();
    });

    el.dailyBtn.addEventListener("click", () => {
      saveChartView("daily");
      renderChart();
      updateChartViewButtons();
    });

    // Add form
    el.form.addEventListener("submit", (e) => {
      e.preventDefault();
      setError(el.formError, "");

      const date = el.date.value;
      const buyIn = asNumber(el.buyIn.value);
      const cashOut = asNumber(el.cashOut.value);

      const err = validateInputs(date, buyIn, cashOut);
      if (err) {
        setError(el.formError, err);
        return;
      }

      addSession(date, buyIn, cashOut);
      el.form.reset();
      el.date.focus();
    });

    el.resetBtn.addEventListener("click", () => {
      setError(el.formError, "");
      el.form.reset();
      el.date.focus();
    });

    // Table actions (event delegation)
    el.tableBody.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const action = btn.dataset.action;
      const id = btn.dataset.id;

      const session = sessions.find(s => s.id === id);
      if (!session) return;

      if (action === "edit") {
        openEditModal(session);
        return;
      }

      if (action === "delete") {
        const pl = computePL(session);
        const ok = confirmDanger(
          `Delete session on ${session.date}?\n\nBuy-in: ${money(session.buyIn)}\nCash-out: ${money(session.cashOut)}\nP/L: ${money(pl)}`
        );
        if (ok) deleteSession(id);
      }
    });

    // Export
    el.exportBtn.addEventListener("click", exportJson);

    // Import
    el.importFile.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        await importJsonFile(file);
      } catch (err) {
        showToast(err?.message || "Import failed", "error");
      } finally {
        e.target.value = "";
      }
    });

    // Clear all
    el.clearBtn.addEventListener("click", () => {
      if (!sessions.length) {
        showToast("No data to clear", "error");
        return;
      }

      // Update count in modal
      const count = sessions.length;
      el.clearSessionCount.textContent = `${count} session${count !== 1 ? 's' : ''}`;
      
      // Show confirmation modal
      el.clearModal.showModal();
    });

    // Clear modal actions
    el.closeClearModal.addEventListener("click", () => {
      el.clearModal.close();
    });

    el.cancelClear.addEventListener("click", () => {
      el.clearModal.close();
    });

    el.confirmClear.addEventListener("click", () => {
      sessions = [];
      saveSessions();
      renderAll();
      el.clearModal.close();
      showToast("All data cleared");
    });

    // Close modal on Escape
    el.clearModal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        el.clearModal.close();
      }
    });

    // Edit modal save
    el.saveEditBtn.addEventListener("click", handleSaveEdit);

    // Edit form submit (for keyboard)
    el.editForm.addEventListener("submit", (e) => {
      setError(el.editError, "");
    });

    // Modal keyboard handling
    el.editModal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeEditModal();
      }
    });

    // System theme change detection
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        const hasManualPreference = localStorage.getItem(MODE_KEY);
        if (!hasManualPreference) {
          applyMode(e.matches ? "dark" : "light");
        }
      });
    }
  }

  // ---------------------------
  // Init
  // ---------------------------
  function init() {
    wireEvents();
    renderAll();
  }

  init();
})();