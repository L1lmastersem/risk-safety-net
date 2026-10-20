// Trading Research · scripts

// Tabs: switch between the two sections, remember the choice in the URL (#scorecard / #safety-net)
(function () {
  "use strict";
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var ids = tabs.map(function (t) { return t.dataset.tab; });

  function show(id, push) {
    if (ids.indexOf(id) === -1) id = ids[0];
    tabs.forEach(function (t) {
      var on = t.dataset.tab === id;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.dataset.tab).hidden = !on;
    });
    if (push) history.replaceState(null, "", "#" + id);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { show(t.dataset.tab, true); });
    t.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      show(next.dataset.tab, true);
      next.focus();
    });
  });

  window.addEventListener("hashchange", function () { show(location.hash.slice(1), false); });
  show(location.hash.slice(1), false);
})();


// ---------- Strategy Scorecard ----------
// A curated selection from the full scorecard (86 strategies). No dollar amounts on purpose.

(function () {
  "use strict";

  var VERDICTS = {
    pass:     { label: "Pass",     hint: "Met every pre-set rule" },
    noedge:   { label: "No edge",  hint: "Honest code, but too thin or inconsistent to trust" },
    fail:     { label: "Fail",     hint: "Missed one or more rules" },
    artifact: { label: "Artifact", hint: "The result came from a backtest flaw, not the strategy" }
  };

  var RESULTS = [
    {
      name: "RSI(2) pullback, daily",
      market: "Nasdaq-100, 2003–2026",
      claim: "Textbook rule: buy when RSI(2) drops below 10 while price is above its 200-day average.",
      result: "PF 2.45 on 209 trades, 18 of 24 years positive.",
      verdict: "pass",
      why: "An untuned rule that kept working years after it was published. It holds positions overnight, which is where the index earns most of its move."
    },
    {
      name: "50-day trend following",
      market: "BTC and ETH, daily, 2017–2026",
      claim: "Hold while price is above its 50-day average, sit out below it.",
      result: "Out of sample: BTC PF 4.7, ETH PF 3.4. BTC max drawdown −51% vs −83% for buy and hold.",
      verdict: "pass",
      why: "The first rule to hold up on years of data it was never fitted to. A few huge trades carry it, with a win rate around 21%."
    },
    {
      name: "High funding rate → go long",
      market: "11 crypto coins, daily, 2020–2026",
      claim: "When traders pay a lot to stay long, momentum tends to continue.",
      result: "PF 1.64 on 7 coins it was never tested on, profitable on 7 of 7.",
      verdict: "pass",
      why: "Passed a check I wrote down before running it. The edge is real but mostly comes from bull markets."
    },
    {
      name: "Community strategy with PF 20",
      market: "XRP, 15 min",
      claim: "Profit factor 20.4, 78% win rate, 0.41% drawdown.",
      result: "Not worth rerunning: it reads the future.",
      verdict: "artifact",
      why: "The code requested a higher-timeframe candle's close before that candle had finished. Combined with zero fees, that produced a too-good-to-be-true result."
    },
    {
      name: "Opening range breakout, replicated",
      market: "SOL and XRP, 15 min",
      claim: "TradingView backtest on SOL: PF 1.50, 20 of 21 months positive.",
      result: "Line-for-line Python port with real costs: SOL PF 1.13, XRP PF 1.01.",
      verdict: "fail",
      why: "The TradingView number had zero commission. Rebuilding it independently showed how much fees and data details matter."
    },
    {
      name: "Initial balance fade",
      market: "Nasdaq-100 and S&P 500, 15 min",
      claim: "Fade breaks of the first trading hour's range.",
      result: "After the fix: PF 1.00 on Nasdaq, 0.96 on S&P.",
      verdict: "fail",
      why: "An earlier promising result was caused by a one-hour timezone bug in summer data (daylight saving time). Fixing the bug removed the edge."
    },
    {
      name: "4-hour fair value gap pullback",
      market: "11 crypto coins, 15 min",
      claim: "Buy the pullback to the middle of a 4-hour price gap, 2R target.",
      result: "PF 1.22–1.28, positive on 10 of 11 coins, both halves positive on SOL, XRP and BTC.",
      verdict: "noedge",
      why: "The most consistent short-term result, but just under the 1.3 bar. Good candidate for a forward test, not for trading yet."
    },
    {
      name: "Squeeze Momentum (LazyBear)",
      market: "XRP, 15 min",
      claim: "The most-liked indicator on TradingView, around 97K likes.",
      result: "PF 0.61 on 2,352 trades. PF 0.89 even before fees.",
      verdict: "fail",
      why: "Squeeze releases did worse than random. Popularity says nothing about performance."
    },
    {
      name: "ICT order block retest",
      market: "XRP, 15 min",
      claim: "After a break of structure, price returns to the last opposite candle and bounces.",
      result: "PF 0.68 on 2,686 trades. 33.3% win rate, exactly breakeven for a 2R target before fees.",
      verdict: "fail",
      why: "A coin flip before costs. Tight stops meant fees took about 24% of each trade's risk."
    },
    {
      name: "CME gap fill",
      market: "11 crypto coins, 15 min",
      claim: "Weekend gaps against the CME Friday close always get filled.",
      result: "Gaps filled within a week only 48% of the time, on BTC only 36%. PF 1.02.",
      verdict: "fail",
      why: "A popular belief that turned out to be a coin flip, and weakest on BTC, where it's talked about most."
    },
    {
      name: "Supertrend (10, 3)",
      market: "XRP and SOL, 15 min",
      claim: "Always-in trend follower that flips on each signal.",
      result: "PF 1.05–1.06 before fees on both coins, 0.79–0.87 after.",
      verdict: "fail",
      why: "The only classic indicator with a real raw edge, but about 0.05% per trade can't cover a 0.12% round-trip fee."
    },
    {
      name: "Keltner snapback (\"rubber band\")",
      market: "Nasdaq-100 1 min and 11 crypto coins",
      claim: "When price stretches far outside its band after a key level breaks, fade it.",
      result: "Nasdaq PF 0.74, lost every year. Crypto PF 0.68, lost on 11 of 11 coins.",
      verdict: "fail",
      why: "Stretched moves keep going more often than they snap back. The more stretched, the worse fading does."
    }
  ];

  var LESSONS = [
    { title: "Too-good results are usually lookahead.", text: "A profit factor of 20 came from one line of code that read a candle's close before it happened." },
    { title: "Zero-fee backtests mislead.", text: "Several strategies had a small real edge before costs that fees completely erased." },
    { title: "Rebuild it to trust it.", text: "Porting a strategy line for line to Python, with real costs, gave a very different answer than the original backtest." },
    { title: "Bugs can look like an edge.", text: "A one-hour timezone error in summer data created a result that disappeared once it was fixed." },
    { title: "Popularity doesn't predict performance.", text: "The three most-liked TradingView scripts I tested all failed honestly." },
    { title: "Removing bad trades afterwards proves nothing.", text: "Results that only look good after dropping the losers were chosen by their outcome, not by a rule." }
  ];

  var filtersEl = document.getElementById("filters");
  var resultsEl = document.getElementById("results");
  var lessonsEl = document.getElementById("lessons");
  var active = "all";

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function countBy(verdict) {
    return RESULTS.filter(function (r) { return r.verdict === verdict; }).length;
  }

  function renderFilters() {
    var options = [{ key: "all", label: "All", count: RESULTS.length }];
    Object.keys(VERDICTS).forEach(function (key) {
      var n = countBy(key);
      if (n > 0) options.push({ key: key, label: VERDICTS[key].label, count: n });
    });
    filtersEl.innerHTML = options.map(function (o) {
      return '<button class="filter-btn' + (o.key === active ? " active" : "") + '" data-key="' + o.key + '" aria-pressed="' + (o.key === active) + '">' +
        escapeHtml(o.label) + ' <span class="filter-count">' + o.count + "</span></button>";
    }).join("");
    filtersEl.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        active = btn.dataset.key;
        renderFilters();
        renderResults();
      });
    });
  }

  function renderResults() {
    var rows = RESULTS.filter(function (r) { return active === "all" || r.verdict === active; });
    resultsEl.innerHTML = rows.map(function (r) {
      var v = VERDICTS[r.verdict];
      return '<article class="result">' +
        '<div class="result-top">' +
          '<div><h3 class="result-name">' + escapeHtml(r.name) + '</h3>' +
          '<p class="result-market">' + escapeHtml(r.market) + "</p></div>" +
          '<span class="verdict ' + r.verdict + '" title="' + escapeHtml(v.hint) + '">' + escapeHtml(v.label) + "</span>" +
        "</div>" +
        '<dl class="result-body">' +
          "<div><dt>Claim</dt><dd>" + escapeHtml(r.claim) + "</dd></div>" +
          "<div><dt>Honest result</dt><dd class=\"mono\">" + escapeHtml(r.result) + "</dd></div>" +
          "<div><dt>Why</dt><dd>" + escapeHtml(r.why) + "</dd></div>" +
        "</dl>" +
      "</article>";
    }).join("");
  }

  function renderLessons() {
    lessonsEl.innerHTML = LESSONS.map(function (l) {
      return '<div class="lesson"><p><strong>' + escapeHtml(l.title) + "</strong> " + escapeHtml(l.text) + "</p></div>";
    }).join("");
  }

  renderFilters();
  renderResults();
  renderLessons();
})();


// ---------- Risk Safety Net ----------

(function(){
  "use strict";

  var PRESETS = {
    "50k":  { label: "50K account",  size: 50000,  daily: 1500, dd: 2500, ddType: "static" },
    "100k": { label: "100K account", size: 100000, daily: 3000, dd: 6000, ddType: "static" },
    "custom": { label: "Custom", size: null }
  };

  var els = {
    presetRow: document.getElementById('presetRow'),
    accSize: document.getElementById('accSize'),
    dailyLimit: document.getElementById('dailyLimit'),
    ddLimit: document.getElementById('ddLimit'),
    ddType: document.getElementById('ddType'),
    netToggle: document.getElementById('netToggle'),
    headroom: document.getElementById('headroom'),
    hardCap: document.getElementById('hardCap'),
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    sampleBtn: document.getElementById('sampleBtn'),
    sampleNote: document.getElementById('sampleNote'),
    fileList: document.getElementById('fileList'),
    errorMsg: document.getElementById('errorMsg'),
    runBtn: document.getElementById('runBtn'),
    resultsSection: document.getElementById('resultsSection'),
    emptyState: document.getElementById('emptyState'),
    baselineMetrics: document.getElementById('baselineMetrics'),
    netMetrics: document.getElementById('netMetrics'),
    worstBefore: document.getElementById('worstBefore'),
    worstAfter: document.getElementById('worstAfter'),
    payoffNote: document.getElementById('payoffNote'),
    equityChart: document.getElementById('equityChart')
  };

  var loadedFiles = []; // {name, trades: [{date, pnl}], span, count, sample}
  var netEnabled = true;

  // ---------- Presets ----------
  function selectPreset(key) {
    document.querySelectorAll('.preset-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.key === key); });
    var p = PRESETS[key];
    if (key !== 'custom') {
      els.accSize.value = p.size;
      els.dailyLimit.value = p.daily;
      els.ddLimit.value = p.dd;
      els.ddType.value = p.ddType;
    }
  }

  Object.keys(PRESETS).forEach(function(key){
    var btn = document.createElement('button');
    btn.className = 'preset-btn' + (key === '100k' ? ' active' : '');
    btn.textContent = PRESETS[key].label;
    btn.dataset.key = key;
    btn.addEventListener('click', function(){ selectPreset(key); });
    els.presetRow.appendChild(btn);
  });

  els.netToggle.addEventListener('click', function(){
    netEnabled = !netEnabled;
    els.netToggle.classList.toggle('on', netEnabled);
  });

  // ---------- CSV parsing ----------
  function parseCSVLine(line) {
    var out = [], cur = '', inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (inQuotes) {
        if (c === '"') { if (line[i+1] === '"') { cur += '"'; i++; } else { inQuotes = false; } }
        else cur += c;
      } else {
        if (c === '"') inQuotes = true;
        else if (c === ',') { out.push(cur); cur = ''; }
        else cur += c;
      }
    }
    out.push(cur);
    return out;
  }

  function parseCSVText(text) {
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    var lines = text.split(/\r?\n/).filter(function(l){ return l.trim().length > 0; });
    if (lines.length < 2) throw new Error('File looks empty or has no data rows.');
    var headers = parseCSVLine(lines[0]).map(function(h){ return h.trim(); });
    var typeIdx = headers.indexOf('Type');
    var dateIdx = headers.indexOf('Date and time');
    var pnlIdx = headers.indexOf('Net PnL USD');
    if (typeIdx === -1 || dateIdx === -1 || pnlIdx === -1) {
      throw new Error('Missing expected columns (Type, Date and time, Net PnL USD). Is this a Strategy Tester trade export?');
    }
    var trades = [];
    for (var i = 1; i < lines.length; i++) {
      var row = parseCSVLine(lines[i]);
      var type = (row[typeIdx] || '').trim();
      if (type.indexOf('Exit') !== 0) continue;
      var dateStr = row[dateIdx];
      var pnl = parseFloat(row[pnlIdx]);
      if (!dateStr || isNaN(pnl)) continue;
      var parts = dateStr.trim().split(' ');
      var dParts = parts[0].split('-').map(Number);
      var tParts = (parts[1] || '00:00').split(':').map(Number);
      var d = new Date(dParts[0], dParts[1]-1, dParts[2], tParts[0]||0, tParts[1]||0);
      trades.push({ date: d, pnl: pnl });
    }
    if (trades.length === 0) throw new Error('No closed trades (Exit rows) found in this file.');
    trades.sort(function(a,b){ return a.date - b.date; });
    return trades;
  }

  // ---------- Sample data ----------
  // Seeded random so every visitor sees the same result.
  function mulberry32(seed) {
    return function() {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function makeSampleSymbol(seed, firstHour, badDayLosses) {
    var rand = mulberry32(seed);
    var trades = [];
    var day = new Date(2025, 0, 2);
    var tradingDay = 0;
    var BAD_DAY = 168;
    while (tradingDay < 250) {
      var dow = day.getDay();
      if (dow !== 0 && dow !== 6) {
        if (tradingDay === BAD_DAY) {
          // One day where every trade on both symbols loses
          badDayLosses.forEach(function(loss, i){
            trades.push({ date: new Date(day.getFullYear(), day.getMonth(), day.getDate(), firstHour + i * 2, 0), pnl: loss });
          });
        } else {
          var n = rand() < 0.35 ? 0 : (rand() < 0.65 ? 1 : 2);
          for (var k = 0; k < n; k++) {
            var risk = 450 + rand() * 250;
            var pnl = rand() < 0.36 ? risk * (1.75 + rand() * 0.5) : -risk;
            trades.push({
              date: new Date(day.getFullYear(), day.getMonth(), day.getDate(), firstHour + k * 3, Math.floor(rand() * 60)),
              pnl: Math.round(pnl * 100) / 100
            });
          }
        }
        tradingDay++;
      }
      day.setDate(day.getDate() + 1);
    }
    return trades;
  }

  function loadSample() {
    var a = makeSampleSymbol(11, 9,  [-1000, -880, -790]);
    var b = makeSampleSymbol(29, 10, [-720, -660]);
    loadedFiles = [a, b].map(function(trades, i){
      return {
        name: i === 0 ? 'SAMPLE_SYMBOL_A.csv' : 'SAMPLE_SYMBOL_B.csv',
        trades: trades, count: trades.length, sample: true,
        first: trades[0].date, last: trades[trades.length-1].date,
        span: Math.round((trades[trades.length-1].date - trades[0].date) / 86400000)
      };
    });
    selectPreset('100k');
    renderFileList();
    hideError();
    run();
  }

  els.sampleBtn.addEventListener('click', loadSample);

  // ---------- File handling ----------
  function addFile(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var trades = parseCSVText(e.target.result);
        loadedFiles = loadedFiles.filter(function(f){ return !f.sample; });
        var span = Math.round((trades[trades.length-1].date - trades[0].date) / 86400000);
        loadedFiles.push({ name: file.name, trades: trades, span: span, count: trades.length,
          first: trades[0].date, last: trades[trades.length-1].date });
        renderFileList();
        hideError();
      } catch (err) {
        showError(file.name + ': ' + err.message);
      }
    };
    reader.onerror = function(){ showError('Could not read ' + file.name + '.'); };
    reader.readAsText(file);
  }

  function removeFile(idx) {
    loadedFiles.splice(idx, 1);
    renderFileList();
  }

  function fmtDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function renderFileList() {
    els.fileList.innerHTML = '';
    loadedFiles.forEach(function(f, idx){
      var row = document.createElement('div');
      row.className = 'file-row';
      row.innerHTML = '<span class="file-name">' + escapeHtml(f.name) + '</span>' +
        '<span><span class="file-meta">' + f.count + ' trades · ' + f.span + 'd · ' + fmtDate(f.first) + ' to ' + fmtDate(f.last) + '</span>' +
        '<button class="file-remove" data-idx="' + idx + '">remove</button></span>';
      els.fileList.appendChild(row);
    });
    els.fileList.querySelectorAll('.file-remove').forEach(function(btn){
      btn.addEventListener('click', function(){ removeFile(parseInt(btn.dataset.idx, 10)); });
    });
    els.runBtn.disabled = loadedFiles.length === 0;
    els.runBtn.textContent = loadedFiles.length === 0 ? 'Add at least one CSV to run' : 'Run simulation';
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
  }

  function showError(msg) { els.errorMsg.textContent = msg; els.errorMsg.style.display = 'block'; }
  function hideError() { els.errorMsg.style.display = 'none'; }

  els.dropzone.addEventListener('click', function(){ els.fileInput.click(); });
  els.fileInput.addEventListener('change', function(e){
    Array.from(e.target.files).forEach(addFile);
    e.target.value = '';
  });
  ['dragover','dragenter'].forEach(function(evt){
    els.dropzone.addEventListener(evt, function(e){ e.preventDefault(); els.dropzone.classList.add('dragover'); });
  });
  ['dragleave','drop'].forEach(function(evt){
    els.dropzone.addEventListener(evt, function(e){ e.preventDefault(); els.dropzone.classList.remove('dragover'); });
  });
  els.dropzone.addEventListener('drop', function(e){
    var files = Array.from(e.dataTransfer.files).filter(function(f){ return f.name.toLowerCase().endsWith('.csv'); });
    if (files.length === 0) { showError('Drop .csv files exported from Strategy Tester.'); return; }
    files.forEach(addFile);
  });

  // ---------- Simulation ----------
  function simulate(allTrades, account, applyNet, headroomPct, hardCapPct) {
    var size = account.size, dailyLimit = account.daily, trailing = account.ddType === 'trailing';
    var equity = size, peak = size, maxDd = 0;
    var daily = {};
    var dayRunning = {};
    var equityCurve = [{ x: allTrades[0].date, y: equity }];
    var scaledCount = 0, blockedCount = 0;

    allTrades.forEach(function(t){
      var dayKey = fmtDate(t.date);
      var pnl = t.pnl;

      if (applyNet) {
        var soFar = dayRunning[dayKey] || 0;
        var remaining = dailyLimit - Math.max(0, -soFar);
        var usableDynamic = Math.max(0, remaining) * (headroomPct/100);
        var usableHardCap = dailyLimit * (hardCapPct/100);
        var usableBudget = Math.min(usableDynamic, usableHardCap);
        if (usableBudget <= 0) { blockedCount++; return; }
        var worstCase = pnl < 0 ? Math.abs(pnl) : Math.abs(pnl)/2;
        var scale = worstCase > 0 ? Math.min(1, usableBudget / worstCase) : 1;
        if (scale < 0.999) scaledCount++;
        pnl = pnl * scale;
        dayRunning[dayKey] = soFar + pnl;
      } else {
        dayRunning[dayKey] = (dayRunning[dayKey] || 0) + pnl;
      }

      equity += pnl;
      daily[dayKey] = (daily[dayKey] || 0) + pnl;
      equityCurve.push({ x: t.date, y: equity });

      if (trailing) {
        peak = Math.max(peak, equity);
        maxDd = Math.max(maxDd, peak - equity);
      } else {
        maxDd = Math.max(maxDd, size - equity);
      }
    });

    var worstDayKey = null, worstDayVal = 0;
    Object.keys(daily).forEach(function(k){ if (daily[k] < worstDayVal) { worstDayVal = daily[k]; worstDayKey = k; } });

    var spanDays = (allTrades[allTrades.length-1].date - allTrades[0].date) / 86400000;
    var total = equity - size;
    var annualized = spanDays > 0 ? total / spanDays * 365 : 0;

    return {
      total: total, maxDd: maxDd, worstDayKey: worstDayKey, worstDayVal: worstDayVal,
      annualized: annualized, scaledCount: scaledCount, blockedCount: blockedCount,
      totalTrades: allTrades.length, equityCurve: equityCurve
    };
  }

  function riskPill(usedPct) {
    var cls = usedPct >= 100 ? 'danger' : usedPct >= 70 ? 'warn' : 'safe';
    var label = usedPct >= 100 ? 'breach' : usedPct >= 70 ? 'tight' : 'safe margin';
    return '<span class="pill ' + cls + '">' + usedPct.toFixed(1) + '% of limit · ' + label + '</span>';
  }

  function fmtMoney(v) {
    var sign = v < 0 ? '−' : '';
    return sign + '$' + Math.abs(v).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
  }

  function renderMetrics(container, result, account) {
    var ddPct = result.maxDd / account.dd * 100;
    var dailyPct = Math.abs(result.worstDayVal) / account.daily * 100;
    var html = '';
    html += metricRow('Total P&L', fmtMoney(result.total));
    html += metricRow('Max drawdown', fmtMoney(result.maxDd), riskPill(ddPct));
    html += metricRow('Worst single day', fmtMoney(result.worstDayVal) + (result.worstDayKey ? '<span class="metric-sub">' + result.worstDayKey + '</span>' : ''), riskPill(dailyPct));
    html += metricRow('Annualized pace', fmtMoney(result.annualized) + '/yr');
    if (result.scaledCount || result.blockedCount) {
      html += metricRow('Trades adjusted', result.scaledCount + ' scaled, ' + result.blockedCount + ' blocked', null, result.totalTrades + ' total');
    }
    container.innerHTML = html;
  }

  function metricRow(label, value, pill, sub) {
    return '<div class="metric-row"><span class="metric-label">' + label + '</span>' +
      '<span class="metric-value">' + value + (pill ? '<br>' + pill : '') + (sub ? '<span class="metric-sub">' + sub + '</span>' : '') + '</span></div>';
  }

  // ---------- Chart ----------
  function renderChart(baseCurve, netCurve) {
    var w = 960, h = 320, padL = 10, padR = 10, padT = 16, padB = 16;
    var allPoints = baseCurve.concat(netCurve);
    var xMin = Math.min.apply(null, allPoints.map(function(p){ return p.x.getTime(); }));
    var xMax = Math.max.apply(null, allPoints.map(function(p){ return p.x.getTime(); }));
    var yMin = Math.min.apply(null, allPoints.map(function(p){ return p.y; }));
    var yMax = Math.max.apply(null, allPoints.map(function(p){ return p.y; }));
    var yPad = (yMax - yMin) * 0.08 || 1;
    yMin -= yPad; yMax += yPad;

    function sx(t) { return padL + (xMax > xMin ? (t - xMin)/(xMax - xMin) : 0) * (w - padL - padR); }
    function sy(v) { return h - padB - ((v - yMin)/(yMax - yMin || 1)) * (h - padT - padB); }

    function toPath(curve) {
      return curve.map(function(p, i){
        return (i === 0 ? 'M' : 'L') + sx(p.x.getTime()).toFixed(1) + ',' + sy(p.y).toFixed(1);
      }).join(' ');
    }

    els.equityChart.innerHTML =
      '<line x1="' + padL + '" y1="' + sy(baseCurve[0].y).toFixed(1) + '" x2="' + (w-padR) + '" y2="' + sy(baseCurve[0].y).toFixed(1) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="3,3"/>' +
      '<path d="' + toPath(baseCurve) + '" fill="none" stroke="var(--text-faint)" stroke-width="1.75" vector-effect="non-scaling-stroke"/>' +
      '<path d="' + toPath(netCurve) + '" fill="none" stroke="var(--accent)" stroke-width="1.75" vector-effect="non-scaling-stroke"/>';
  }

  // ---------- Run ----------
  function run() {
    if (loadedFiles.length === 0) return;
    var allTrades = [];
    loadedFiles.forEach(function(f){ allTrades = allTrades.concat(f.trades); });
    allTrades.sort(function(a,b){ return a.date - b.date; });

    var account = {
      size: parseFloat(els.accSize.value),
      daily: parseFloat(els.dailyLimit.value),
      dd: parseFloat(els.ddLimit.value),
      ddType: els.ddType.value
    };
    var headroomPct = parseFloat(els.headroom.value);
    var hardCapPct = parseFloat(els.hardCap.value);

    var baseline = simulate(allTrades, account, false, headroomPct, hardCapPct);
    var withNet = simulate(allTrades, account, netEnabled, headroomPct, hardCapPct);

    renderMetrics(els.baselineMetrics, baseline, account);
    renderMetrics(els.netMetrics, withNet, account);

    els.worstBefore.textContent = fmtMoney(baseline.worstDayVal);
    els.worstAfter.textContent = fmtMoney(withNet.worstDayVal);
    var beforePct = Math.abs(baseline.worstDayVal)/account.daily*100;
    var afterPct = Math.abs(withNet.worstDayVal)/account.daily*100;
    els.payoffNote.textContent = beforePct.toFixed(1) + '% of daily limit → ' + afterPct.toFixed(1) + '% of daily limit' +
      (netEnabled ? '' : ' (safety net is off, so both sides show the same baseline)');

    renderChart(baseline.equityCurve, withNet.equityCurve);

    els.sampleNote.style.display = loadedFiles.some(function(f){ return f.sample; }) ? 'block' : 'none';
    els.resultsSection.style.display = 'block';
    els.emptyState.style.display = 'none';
    els.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  els.runBtn.addEventListener('click', run);

})();
