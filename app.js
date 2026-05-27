/*
 * Claude Certified Architect — Exam Prep Module
 * Vanilla JS. No build step. All state in localStorage per-user.
 */

(function () {
  'use strict';

  // ============================================================
  // Data globals — rebuilt one domain at a time.
  // Default to empty so the app boots before a domain's data file exists.
  // (Anti-patterns + scenarios ship with real data; the rest are placeholders.)
  // ============================================================
  window.STUDY_CONTENT = window.STUDY_CONTENT || {};
  window.DOMAIN_DEEPDIVE = window.DOMAIN_DEEPDIVE || {};
  window.QUESTIONS = window.QUESTIONS || [];
  window.REAL_EXAM_QUESTIONS = window.REAL_EXAM_QUESTIONS || [];
  window.FLASHCARDS = window.FLASHCARDS || [];

  // ============================================================
  // State / Persistence (per-user via localStorage)
  // ============================================================
  const DEFAULT_USER = 'default';
  const STORAGE_PREFIX = 'cca_prep::';

  function currentUser() {
    return (document.getElementById('userName').value || DEFAULT_USER).trim() || DEFAULT_USER;
  }
  function key(name) { return STORAGE_PREFIX + currentUser() + '::' + name; }
  function loadJSON(name, fallback) {
    try {
      const raw = localStorage.getItem(key(name));
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }
  function saveJSON(name, val) {
    localStorage.setItem(key(name), JSON.stringify(val));
  }
  function getProgress() {
    return loadJSON('progress', { attempts: {}, mockHistory: [], flashStats: {} });
  }
  function saveProgress(p) { saveJSON('progress', p); }

  // Telemetry helpers — feed the dashboard.
  function logAttempt(qid, domain, topic, correct, mode) {
    const p = getProgress();
    if (!p.attempts) p.attempts = {};
    p.attempts[qid] = { correct: !!correct, domain: domain, topic: topic, mode: mode, ts: Date.now() };
    saveProgress(p);
  }
  function logMockResult(mode, score, total, perDomain, passMark, durationSec) {
    const p = getProgress();
    if (!p.mockHistory) p.mockHistory = [];
    p.mockHistory.unshift({
      mode: mode, score: score, total: total,
      pct: total ? Math.round((score / total) * 100) : 0,
      perDomain: perDomain || {},
      passMark: passMark,
      durationSec: durationSec || 0,
      ts: Date.now()
    });
    if (p.mockHistory.length > 20) p.mockHistory = p.mockHistory.slice(0, 20);
    saveProgress(p);
  }

  // ============================================================
  // Tabs / Views
  // ============================================================
  const tabs = document.querySelectorAll('.tab');
  const VALID_VIEWS = Array.from(tabs).map(t => t.dataset.view);
  const LAST_VIEW_KEY = STORAGE_PREFIX + '_lastView';
  tabs.forEach(t => t.addEventListener('click', () => showView(t.dataset.view)));
  function showView(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.view === name));
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('active', v.id === 'view-' + name);
    });
    if (name === 'dashboard') renderDashboard();
    if (name === 'domains') renderDomainsView();
    if (name === 'study') renderStudy();
    if (name === 'antipatterns') renderAntiPatterns();
    if (name === 'scenarios') renderScenarios();
    if (name === 'quiz') renderQuizPicker();
    if (name === 'mock') renderMockIntro();
    if (name === 'realmock') renderRealMockIntro();
    if (name === 'flashcards') renderFlashcard();
    // Persist the active view so a reload returns the user to it.
    try { localStorage.setItem(LAST_VIEW_KEY, name); } catch (_) {}
  }

  // ============================================================
  // User name change → reload progress views
  // ============================================================
  const userInput = document.getElementById('userName');
  userInput.value = localStorage.getItem(STORAGE_PREFIX + '_lastUser') || '';
  userInput.addEventListener('change', () => {
    localStorage.setItem(STORAGE_PREFIX + '_lastUser', userInput.value);
    // Re-render whatever view is active
    const active = document.querySelector('.tab.active');
    if (active) showView(active.dataset.view);
  });
  document.getElementById('resetProgress').addEventListener('click', () => {
    if (confirm('Reset all progress for "' + currentUser() + '"? This cannot be undone.')) {
      localStorage.removeItem(key('progress'));
      // Also clear the exam engine's "seen" sets so the question pool refills.
      const prefix = key('exam::seen::');
      Object.keys(localStorage).forEach(k => { if (k.indexOf(prefix) === 0) localStorage.removeItem(k); });
      const active = document.querySelector('.tab.active');
      if (active) showView(active.dataset.view);
    }
  });

  // ============================================================
  // DASHBOARD
  // ============================================================
  function renderDashboard() {
    const p = getProgress();
    const attempts = p.attempts || {};
    const history = p.mockHistory || [];

    // Bank totals from the new exam bank (window.EXAM_BANK), not the old
    // window.QUESTIONS global which is empty in the rebuilt system.
    const bank = window.EXAM_BANK || {};
    const domains = ['D1', 'D2', 'D3', 'D4', 'D5'];
    const titles = {
      D1: 'Agentic Architecture',
      D2: 'Tool Design & MCP',
      D3: 'Claude Code Config',
      D4: 'Prompt Engineering',
      D5: 'Context & Reliability'
    };
    const weights = { D1: 0.27, D2: 0.18, D3: 0.20, D4: 0.20, D5: 0.15 };
    const totalQuestions = domains.reduce((s, d) => s + (bank[d] || []).length, 0);

    // Per-domain rollups: unique IDs attempted, correctness on the LAST
    // attempt of each id (so retries can improve the score), pool size.
    const perD = {};
    domains.forEach(d => {
      const pool = (bank[d] || []);
      const poolSize = pool.length;
      const inDomain = Object.values(attempts).filter(a => a.domain === d);
      const ids = {};
      inDomain.forEach(a => { /* per id, last write wins */ });
      // attempts is keyed by id; collect ids that are in this domain
      const domainAttempts = Object.entries(attempts).filter(([_id, a]) => a.domain === d);
      const attemptedIds = new Set(domainAttempts.map(([id]) => id));
      const correctCount = domainAttempts.filter(([_id, a]) => a.correct).length;
      const totalCount = domainAttempts.length;
      const accuracy = totalCount ? correctCount / totalCount : 0;
      const coverage = poolSize ? attemptedIds.size / poolSize : 0;
      perD[d] = {
        poolSize: poolSize,
        attempted: attemptedIds.size,
        attemptsCount: totalCount,
        correctCount: correctCount,
        accuracy: accuracy,
        coverage: coverage
      };
    });

    // Top-line stats
    const totalAttemptsCount = Object.keys(attempts).length;
    const correctCount = Object.values(attempts).filter(a => a.correct).length;
    const overallAccuracy = totalAttemptsCount ? Math.round(correctCount / totalAttemptsCount * 100) : 0;
    const bestMock = history.length ? Math.max.apply(null, history.map(h => h.pct)) : null;
    document.getElementById('stat-questions').textContent = totalQuestions;
    document.getElementById('stat-attempted').textContent = totalAttemptsCount;
    document.getElementById('stat-accuracy').textContent = totalAttemptsCount ? overallAccuracy + '%' : '—';
    document.getElementById('stat-bestmock').textContent = bestMock === null ? '—' : bestMock + '%';

    // Readiness: weighted (exam-weight) blend of per-domain accuracy AND
    // per-domain coverage. Both matter — accuracy alone with 1 attempt is noise.
    // readiness_d = accuracy_d * min(coverage_d / 0.30, 1)  (cap at 30% coverage)
    let readinessNum = 0, readinessDen = 0;
    domains.forEach(d => {
      const w = weights[d];
      const covWeight = Math.min(perD[d].coverage / 0.30, 1);
      readinessNum += w * perD[d].accuracy * covWeight;
      readinessDen += w;
    });
    const readinessPct = Math.round((readinessDen ? readinessNum / readinessDen : 0) * 100);
    let verdict, verdictClass;
    if (totalAttemptsCount === 0)   { verdict = 'Not started — pick a domain to begin'; verdictClass = 'r-none'; }
    else if (readinessPct < 30)     { verdict = 'Building foundations'; verdictClass = 'r-low'; }
    else if (readinessPct < 60)     { verdict = 'On track — keep practising'; verdictClass = 'r-mid'; }
    else if (readinessPct < 80)     { verdict = 'Strong — time for a Mock Exam'; verdictClass = 'r-good'; }
    else                            { verdict = 'Exam-ready (≥80%)'; verdictClass = 'r-ready'; }

    const readinessEl = document.getElementById('readinessCard');
    if (readinessEl) {
      readinessEl.className = 'readiness-card ' + verdictClass;
      readinessEl.innerHTML = `
        <div class="readiness-left">
          <div class="readiness-label">Exam readiness</div>
          <div class="readiness-score">${readinessPct}<span>%</span></div>
          <div class="readiness-verdict">${escapeHTML(verdict)}</div>
        </div>
        <div class="readiness-right">
          <div class="readiness-formula">Weighted across all five domains by official exam weighting (27 / 18 / 20 / 20 / 15). Coverage capped at 30% — small samples don't earn a high score.</div>
          <div class="readiness-bar"><div class="readiness-fill" style="width:${readinessPct}%"></div></div>
        </div>`;
    }

    // Per-domain cards
    const accents = { D1: '#6366f1', D2: '#06b6d4', D3: '#10b981', D4: '#f59e0b', D5: '#ec4899' };
    const dpEl = document.getElementById('domainProgress');
    dpEl.innerHTML = '';
    domains.forEach(d => {
      const s = perD[d];
      const accPct = Math.round(s.accuracy * 100);
      const covPct = Math.round(s.coverage * 100);
      const card = document.createElement('div');
      card.className = 'domain-card';
      card.setAttribute('data-d', d);
      const accent = accents[d];
      card.innerHTML = `
        <div class="domain-card-head">
          <div class="domain-card-tag" style="background:${accent}1a;color:${accent}">${d}</div>
          <div class="domain-card-weight">${Math.round(weights[d] * 100)}% exam weight</div>
        </div>
        <div class="domain-card-title">${escapeHTML(titles[d])}</div>
        <div class="domain-card-stats">
          <div class="dcs-stat">
            <div class="dcs-num" style="color:${accent}">${accPct}%</div>
            <div class="dcs-label">Accuracy <span class="dcs-sub">(${s.correctCount}/${s.attemptsCount})</span></div>
          </div>
          <div class="dcs-stat">
            <div class="dcs-num">${s.attempted}<span class="dcs-of">/${s.poolSize}</span></div>
            <div class="dcs-label">Coverage <span class="dcs-sub">(${covPct}% of pool)</span></div>
          </div>
        </div>
        <div class="domain-card-bars">
          <div class="dcb-row">
            <div class="dcb-lab">Accuracy</div>
            <div class="dcb-bar"><div class="dcb-fill" style="width:${accPct}%;background:${accent}"></div></div>
          </div>
          <div class="dcb-row">
            <div class="dcb-lab">Coverage</div>
            <div class="dcb-bar"><div class="dcb-fill dcb-fill-soft" style="width:${covPct}%;background:${accent}80"></div></div>
          </div>
        </div>
        <div class="domain-card-actions">
          <button class="btn-primary" data-go-quiz="${d}">Practise ${d}</button>
        </div>`;
      dpEl.appendChild(card);
    });
    document.querySelectorAll('[data-go-quiz]').forEach(btn => {
      btn.addEventListener('click', () => {
        showView('quiz');
        // After the picker renders, auto-click the matching domain card's start.
        setTimeout(() => {
          const startBtn = document.querySelector('#drillPicker [data-go="' + btn.dataset.goQuiz + '"]');
          if (startBtn) startBtn.click();
        }, 60);
      });
    });

    // Next action — context-aware recommendation.
    const nextEl = document.getElementById('nextAction');
    if (nextEl) {
      let title, body, cta, ctaLabel;
      if (totalAttemptsCount === 0) {
        title = 'Start with Domain 1 — the largest slice of the exam (27%).';
        body  = 'D1 covers agentic loops, hub-and-spoke orchestration, hooks and session management. Get comfortable here before branching out.';
        cta = 'quiz'; ctaLabel = 'Start Domain Quiz →';
      } else {
        // Find the domain with the worst (accuracy × coverage_weight) score.
        let worst = null, worstScore = Infinity;
        domains.forEach(d => {
          const s = perD[d];
          const covW = Math.min(s.coverage / 0.30, 1);
          const compositeScore = s.attempted === 0 ? -1 : (s.accuracy * covW);
          if (compositeScore < worstScore) { worstScore = compositeScore; worst = d; }
        });
        const ws = perD[worst];
        if (ws.attempted === 0) {
          title = 'Open up ' + worst + ' next — you haven\'t practised it yet.';
          body  = '' + titles[worst] + ' is ' + Math.round(weights[worst] * 100) + '% of the exam. Even a short drill builds coverage.';
          cta = 'quiz'; ctaLabel = 'Drill ' + worst + ' →';
        } else if (ws.accuracy < 0.7) {
          title = worst + ' is your weakest domain — accuracy ' + Math.round(ws.accuracy * 100) + '%.';
          body  = 'Drill ' + titles[worst] + ' until you\'re consistently above 70%, then come back for a Mock Exam.';
          cta = 'quiz'; ctaLabel = 'Drill ' + worst + ' →';
        } else if (history.length === 0) {
          title = 'You\'re solid on per-domain drills — time for your first Mock Exam.';
          body  = 'A 40-question weighted mock with a timer will surface gaps drilling alone won\'t show.';
          cta = 'mock'; ctaLabel = 'Start Mock Exam →';
        } else if (bestMock !== null && bestMock < 72) {
          title = 'Best mock so far: ' + bestMock + '%. Pass mark is 72%.';
          body  = 'Review the weakest domains from your last mock, then retake.';
          cta = 'mock'; ctaLabel = 'Retake Mock Exam →';
        } else {
          title = 'You\'re passing Mocks — try a full Real Exam under exam conditions.';
          body  = 'Real Exam uses real weighting and a 72% pass mark. No source filters, results-only at the end.';
          cta = 'realmock'; ctaLabel = 'Start Real Exam Simulation →';
        }
      }
      nextEl.innerHTML = `
        <div class="next-action-content">
          <div class="next-action-badge">Next action</div>
          <h3 class="next-action-title">${escapeHTML(title)}</h3>
          <p class="next-action-body">${escapeHTML(body)}</p>
        </div>
        <button class="btn-primary next-action-cta" data-next-cta="${cta}">${escapeHTML(ctaLabel)}</button>`;
      const ctaBtn = nextEl.querySelector('[data-next-cta]');
      if (ctaBtn) ctaBtn.addEventListener('click', () => showView(ctaBtn.dataset.nextCta));
    }

    // Recent activity (mock / real exam history)
    const recentEl = document.getElementById('recentActivity');
    if (recentEl) {
      if (!history.length) {
        recentEl.innerHTML = '<div class="empty-state">No mock or real exam attempts yet — they\'ll appear here once you\'ve sat one.</div>';
      } else {
        const rows = history.slice(0, 5).map(h => {
          const date = new Date(h.ts);
          const dateStr = date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
          const pass = h.passMark != null && (h.score / h.total) >= h.passMark;
          const passBadge = h.passMark != null
            ? `<span class="ra-badge ${pass ? 'ra-pass' : 'ra-fail'}">${pass ? 'PASS' : 'FAIL'}</span>`
            : '';
          const mins = Math.floor(h.durationSec / 60), secs = h.durationSec % 60;
          return `<div class="ra-row">
            <div class="ra-mode">${h.mode === 'real' ? 'Real Exam Sim' : 'Mock Exam'}</div>
            <div class="ra-score">${h.pct}% <span class="ra-sub">(${h.score}/${h.total})</span> ${passBadge}</div>
            <div class="ra-time">${mins}m ${secs}s</div>
            <div class="ra-date">${escapeHTML(dateStr)}</div>
          </div>`;
        }).join('');
        recentEl.innerHTML = rows;
      }
    }
  }

  // ============================================================
  // DOMAINS — DEEP DIVE (narrative explanations)
  // ============================================================
  let activeDomainKey = 'D1';

  // Inline markdown: **bold**, *italic*, `code`
  function renderInline(text) {
    if (!text) return '';
    return escapeHTML(text)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function renderBlocks(blocks) {
    if (!blocks) return '';
    return blocks.map(b => {
      if (b.type === 'p') return `<p>${renderInline(b.text)}</p>`;
      if (b.type === 'bullets') {
        return `<ul class="dd-bullets">${b.items.map(i => `<li>${renderInline(i)}</li>`).join('')}</ul>`;
      }
      if (b.type === 'code') {
        return `<pre><code>${escapeHTML(b.body)}</code></pre>`;
      }
      if (b.type === 'callout') {
        const kind = b.kind || 'tip';
        const label = kind === 'key' ? 'Key Point' : kind === 'warn' ? 'Watch Out' : 'Tip';
        return `<div class="dd-callout dd-callout-${kind}">
          <div class="dd-callout-label">${label}</div>
          <div>${renderInline(b.text)}</div>
        </div>`;
      }
      return '';
    }).join('');
  }

  function renderDomainsView() {
    const sb = document.getElementById('domainsSidebar');
    sb.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'sb-domain';
    header.textContent = 'Domain Deep Dive';
    sb.appendChild(header);

    Object.keys(window.DOMAIN_DEEPDIVE).forEach(dKey => {
      const d = window.DOMAIN_DEEPDIVE[dKey];
      const btn = document.createElement('button');
      btn.className = 'sb-topic dd-sb';
      btn.dataset.id = dKey;
      btn.innerHTML = `
        <div style="font-weight:600">Domain ${d.number} <span style="color:#94a3b8;font-weight:400">· ${d.weight}</span></div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">${escapeHTML(d.title)}</div>
      `;
      btn.addEventListener('click', () => showDomainDeepDive(dKey));
      sb.appendChild(btn);
    });

    showDomainDeepDive(activeDomainKey);
  }

  const DOMAIN_ACCENTS = {
    D1: '#4f46e5',
    D2: '#0ea5e9',
    D3: '#10b981',
    D4: '#f59e0b',
    D5: '#ec4899'
  };

  function showDomainDeepDive(dKey) {
    activeDomainKey = dKey;
    document.querySelectorAll('.dd-sb').forEach(b => b.classList.toggle('active', b.dataset.id === dKey));
    const d = window.DOMAIN_DEEPDIVE[dKey];
    if (!d) {
      const c0 = document.getElementById('domainsContent');
      if (c0) c0.innerHTML = '<p class="lead">No deep-dive content yet — domains are being rebuilt one at a time.</p>';
      return;
    }
    const accent = DOMAIN_ACCENTS[dKey] || '#4f46e5';
    const c = document.getElementById('domainsContent');

    c.innerHTML = `
      <div class="dd-hero" style="background:linear-gradient(135deg, ${accent}, ${accent}cc);">
        <div class="dd-meta">Domain ${d.number} · ${d.weight} of exam</div>
        <h1 class="dd-title">${escapeHTML(d.title)}</h1>
        <p class="dd-tagline">${escapeHTML(d.tagline)}</p>
      </div>

      <div class="dd-why">
        <div class="dd-why-label">Why this domain matters</div>
        <p>${renderInline(d.why)}</p>
      </div>

      ${d.sections.map((sec, i) => `
        <section class="dd-section">
          <div class="dd-section-num" style="background:${accent}">${i + 1}</div>
          <h2 class="dd-section-h">${escapeHTML(sec.heading)}</h2>
          ${renderBlocks(sec.body)}
        </section>
      `).join('')}

      <div class="dd-panel">
        <h3 class="dd-panel-h">What the exam tests in this domain</h3>
        <ul class="dd-bullets">
          ${d.examFocus.map(f => `<li>${renderInline(f)}</li>`).join('')}
        </ul>
      </div>

      <div class="dd-panel dd-panel-ref">
        <h3 class="dd-panel-h">Quick Reference</h3>
        <ul class="dd-bullets">
          ${d.quickRef.map(r => `<li>${renderInline(r)}</li>`).join('')}
        </ul>
      </div>

      <div class="dd-nav">
        ${renderDomainNav(dKey)}
      </div>
    `;
    // Scroll the article back to top when switching domains
    c.scrollTop = 0;
    window.scrollTo({ top: c.offsetTop - 80, behavior: 'smooth' });
  }

  function renderDomainNav(dKey) {
    const keys = Object.keys(window.DOMAIN_DEEPDIVE);
    const idx = keys.indexOf(dKey);
    const prev = idx > 0 ? keys[idx - 1] : null;
    const next = idx < keys.length - 1 ? keys[idx + 1] : null;
    let html = '<div class="dd-nav-row">';
    if (prev) {
      const p = window.DOMAIN_DEEPDIVE[prev];
      html += `<button class="dd-nav-btn" data-go="${prev}">
        <div class="dd-nav-dir">← Previous</div>
        <div class="dd-nav-title">Domain ${p.number}: ${escapeHTML(p.title)}</div>
      </button>`;
    } else html += '<div></div>';
    if (next) {
      const n = window.DOMAIN_DEEPDIVE[next];
      html += `<button class="dd-nav-btn dd-nav-next" data-go="${next}">
        <div class="dd-nav-dir">Next →</div>
        <div class="dd-nav-title">Domain ${n.number}: ${escapeHTML(n.title)}</div>
      </button>`;
    } else html += '<div></div>';
    html += '</div>';
    setTimeout(() => {
      document.querySelectorAll('.dd-nav-btn').forEach(b => {
        b.addEventListener('click', () => showDomainDeepDive(b.dataset.go));
      });
    }, 0);
    return html;
  }

  // ============================================================
  // STUDY GUIDE
  // ============================================================
  let activeTopicId = null;

  function renderStudy() {
    const sb = document.getElementById('studySidebar');
    sb.innerHTML = '';
    Object.keys(window.STUDY_CONTENT).forEach(dKey => {
      const d = window.STUDY_CONTENT[dKey];
      const header = document.createElement('div');
      header.className = 'sb-domain';
      header.textContent = d.title.replace('Domain ', 'D').split(' —')[0] + ' ' + d.weight;
      sb.appendChild(header);
      const overviewBtn = document.createElement('button');
      overviewBtn.className = 'sb-topic';
      overviewBtn.textContent = 'Overview';
      overviewBtn.addEventListener('click', () => showTopic(dKey, null));
      sb.appendChild(overviewBtn);
      d.topics.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'sb-topic';
        btn.textContent = t.id + '  ' + t.title;
        btn.dataset.id = dKey + '::' + t.id;
        btn.addEventListener('click', () => showTopic(dKey, t.id));
        sb.appendChild(btn);
      });
    });
    // Default: first domain overview
    if (!activeTopicId) showTopic('D1', null);
    else {
      const [d, t] = activeTopicId.split('::');
      showTopic(d, t === 'null' ? null : t);
    }
  }

  function showTopic(dKey, topicId) {
    activeTopicId = dKey + '::' + topicId;
    document.querySelectorAll('.sb-topic').forEach(b => {
      b.classList.toggle('active', b.dataset.id === activeTopicId);
    });
    const c = document.getElementById('studyContent');
    const d = window.STUDY_CONTENT[dKey];
    if (!d) {
      c.innerHTML = '<p class="lead">No study content yet — this domain is being rebuilt.</p>';
      return;
    }
    if (!topicId) {
      // Domain overview
      c.innerHTML = `
        <div class="topic-id">${d.weight}</div>
        <h1>${d.title}</h1>
        <p class="lead">${d.summary}</p>
        <h3>Topics in this Domain</h3>
        <ul class="bullets">
          ${d.topics.map(t => `<li><strong>${t.id}</strong> — ${t.title}</li>`).join('')}
        </ul>
        <h3>Exam Tips for this Domain</h3>
        <ol class="bullets">
          ${d.examTips.map(tip => `<li>${tip}</li>`).join('')}
        </ol>
        <div class="callout">
          Use the sidebar to drill into each topic. Each topic includes concepts, anti-patterns, a deep dive, code, comparisons, and an exam tip.
        </div>
      `;
      return;
    }
    const topic = d.topics.find(t => t.id === topicId);
    if (!topic) return;
    c.innerHTML = `
      <div class="topic-id">${topic.id}</div>
      <h1>${topic.title}</h1>
      <p class="lead">${topic.intro}</p>

      <h3>Core Concepts</h3>
      <ul class="bullets">
        ${topic.concepts.map(c => `<li>${escapeHTML(c)}</li>`).join('')}
      </ul>

      <div class="anti-list">
        <h4>Anti-Patterns to Avoid</h4>
        <ul>${topic.antiPatterns.map(a => `<li>${escapeHTML(a)}</li>`).join('')}</ul>
      </div>

      <h3>Deep Dive</h3>
      ${topic.deepDive.map(p => `<p>${escapeHTML(p)}</p>`).join('')}

      <h3>Code Example — ${escapeHTML(topic.code.title)}</h3>
      <pre><code>${escapeHTML(topic.code.body)}</code></pre>

      ${topic.compare ? `
        <h3>Compare: Anti-Pattern vs Correct Approach</h3>
        <div class="compare">
          <div class="col-bad"><h4>✗ Anti-Pattern</h4><pre><code>${escapeHTML(topic.compare.bad)}</code></pre></div>
          <div class="col-good"><h4>✓ Correct</h4><pre><code>${escapeHTML(topic.compare.good)}</code></pre></div>
        </div>` : ''}

      <div class="exam-tip">
        <strong>🎯 Exam Tip:</strong> ${escapeHTML(topic.examTip)}
      </div>
    `;
  }

  // ============================================================
  // ANTI-PATTERNS
  // ============================================================
  let apFilter = 'all';
  function renderAntiPatterns() {
    const list = document.getElementById('antipatternsList');
    list.innerHTML = '';
    const filt = (p) => {
      if (apFilter === 'all') return true;
      if (['critical', 'high', 'medium'].includes(apFilter)) return p.severity === apFilter;
      return p.domain === apFilter;
    };
    window.ANTI_PATTERNS.filter(filt).forEach(ap => {
      const sevTag = `<span class="tag tag-${ap.severity}">${ap.severity}</span>`;
      const dom = `<span class="ap-domain">${ap.domain}</span>`;
      const card = document.createElement('div');
      card.className = 'ap-card';
      card.innerHTML = `
        <div class="ap-head">
          <div class="ap-title">✗ ${escapeHTML(ap.title)}</div>
          ${sevTag}
          ${dom}
        </div>
        <p class="ap-why"><strong>Why it's wrong:</strong> ${escapeHTML(ap.why)}</p>
        <div class="ap-fix">
          <p><strong>✓ Correct:</strong> ${escapeHTML(ap.fix)}</p>
          <p style="color:#166534">${escapeHTML(ap.fixWhy)}</p>
        </div>
      `;
      list.appendChild(card);
    });
  }
  document.querySelectorAll('#view-antipatterns .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#view-antipatterns .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      apFilter = chip.dataset.filter;
      renderAntiPatterns();
    });
  });

  // ============================================================
  // SCENARIOS
  // ============================================================
  function renderScenarios() {
    const c = document.getElementById('scenariosList');
    c.innerHTML = '';
    window.SCENARIOS.forEach(s => {
      const div = document.createElement('div');
      div.className = 'scenario';
      div.innerHTML = `
        <h2><span class="scen-num">Scenario ${s.id}</span>${escapeHTML(s.title)}</h2>
        <p class="lead">${escapeHTML(s.summary)}</p>
        <div class="scen-tests">${s.focus.map(f => `<span class="scen-tag">${escapeHTML(f)}</span>`).join('')}</div>
        <h3>Key Architectural Decisions</h3>
        ${s.decisions.map(d => `
          <div class="decision">
            <div class="q">Q: ${escapeHTML(d.q)}</div>
            <div class="dec-row"><span class="label ok">✓ Correct</span><span>${escapeHTML(d.correct)}</span></div>
            <div class="dec-row"><span class="label bad">✗ Anti-Pattern</span><span>${escapeHTML(d.anti)}</span></div>
          </div>
        `).join('')}
        <h3>Domains Tested</h3>
        <ul class="bullets">${s.domainsTested.map(d => `<li>${escapeHTML(d)}</li>`).join('')}</ul>
        <div class="exam-strat"><strong>Exam Strategy:</strong> ${escapeHTML(s.strategy)}</div>
      `;
      c.appendChild(div);
    });
  }

  // ============================================================
  // EXAM ENGINE (shared by Domain Quiz, Mock Exam, Real Exam)
  // ------------------------------------------------------------
  // Reads from window.EXAM_BANK[D1..D5]. Each bank question carries:
  //   { id, source:"sim"|"extra", domain, topic, topicTitle, question,
  //     options:[4], answer:0-3 (pre-shuffle), rationales:[4] }
  //
  // - No-repeat within a session, persisted per mode in localStorage.
  //   Auto-resets and warns the user when a pool is exhausted.
  // - Options shuffled per attempt; the correct-answer index and the
  //   per-option rationales are permuted in lockstep so feedback stays
  //   aligned to what the user actually sees.
  // - AI-ready seam: ExamEngine.pullFromDomain / pullWeighted is the
  //   single boundary. A serverless /api/generate-questions could later
  //   replace or augment them without touching the renderers.
  // ============================================================
  const EXAM_WEIGHTS = { D1: 0.27, D2: 0.18, D3: 0.20, D4: 0.20, D5: 0.15 };
  const REAL_EXAM_PASS_MARK = 0.72; // 72% per current exam guidance
  function domainTitle(d) {
    return (window.DOMAIN_DEEPDIVE && window.DOMAIN_DEEPDIVE[d] && window.DOMAIN_DEEPDIVE[d].title) || d;
  }

  const ExamEngine = (function () {
    function bankFor(d) { return (window.EXAM_BANK && window.EXAM_BANK[d]) || []; }
    function loadedDomains() {
      return ['D1','D2','D3','D4','D5'].filter(d => bankFor(d).length > 0);
    }
    function seenKey(mode) { return key('exam::seen::' + mode); }
    function getSeen(mode) {
      try { return new Set(JSON.parse(localStorage.getItem(seenKey(mode)) || '[]')); }
      catch (_) { return new Set(); }
    }
    function saveSeen(mode, set) {
      localStorage.setItem(seenKey(mode), JSON.stringify(Array.from(set)));
    }
    function markSeen(ids, mode) {
      const s = getSeen(mode); ids.forEach(id => s.add(id)); saveSeen(mode, s);
    }
    function resetSeen(mode) { localStorage.removeItem(seenKey(mode)); }
    function filterBySource(bank, sourceFilter) {
      if (!sourceFilter || sourceFilter === 'all') return bank;
      return bank.filter(q => q.source === sourceFilter);
    }
    function poolStatus(domain, mode, sourceFilter) {
      const bank = filterBySource(bankFor(domain), sourceFilter);
      const seen = getSeen(mode);
      const remaining = bank.filter(q => !seen.has(q.id)).length;
      return { total: bank.length, seen: bank.length - remaining, remaining };
    }
    function shuf(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    // Pull N from one domain, excluding seen. If pool runs out, auto-reset
    // and wrap (depleted:true so the UI can warn).
    function pullFromDomain(domain, n, mode, sourceFilter) {
      const bank = filterBySource(bankFor(domain), sourceFilter);
      let seen = getSeen(mode);
      const pool = bank.filter(q => !seen.has(q.id));
      if (pool.length >= n) return { questions: shuf(pool).slice(0, n), depleted: false };
      // Wrap: keep what's left, reset, then add fresh shuffled from the rest.
      const leftover = shuf(pool);
      seen = new Set(); saveSeen(mode, seen);
      const fresh = shuf(bank.filter(q => !leftover.some(p => p.id === q.id)));
      return { questions: leftover.concat(fresh).slice(0, n), depleted: true };
    }
    // Pull N weighted across loaded domains, excluding seen.
    function pullWeighted(n, mode, sourceFilter, weights) {
      weights = weights || EXAM_WEIGHTS;
      const avail = loadedDomains();
      if (avail.length === 0) return { questions: [], depleted: false };
      const totalW = avail.reduce((s, d) => s + (weights[d] || 0), 0);
      let picks = [];
      let depleted = false;
      avail.forEach(d => {
        const want = Math.max(1, Math.round(n * ((weights[d] || 0) / totalW)));
        const res = pullFromDomain(d, want, mode, sourceFilter);
        if (res.depleted) depleted = true;
        picks.push.apply(picks, res.questions);
      });
      picks = shuf(picks);
      if (picks.length > n) picks = picks.slice(0, n);
      if (picks.length < n) {
        const seen = getSeen(mode);
        const extras = [];
        avail.forEach(d => {
          filterBySource(bankFor(d), sourceFilter).forEach(q => {
            if (!seen.has(q.id) && !picks.some(p => p.id === q.id)) extras.push(q);
          });
        });
        picks = picks.concat(shuf(extras).slice(0, n - picks.length));
      }
      return { questions: picks, depleted };
    }
    // Shuffle options for presentation. answer index and rationales are
    // permuted in lockstep so the feedback panel stays correct.
    function present(q) {
      const perm = shuf([0, 1, 2, 3]);
      return {
        id: q.id, source: q.source, domain: q.domain,
        topic: q.topic, topicTitle: q.topicTitle,
        question: q.question,
        options: perm.map(i => q.options[i]),
        rationales: perm.map(i => q.rationales[i]),
        answer: perm.indexOf(q.answer)
      };
    }
    return {
      bankFor, loadedDomains, poolStatus,
      pullFromDomain, pullWeighted, present,
      markSeen, resetSeen
    };
  })();
  window.ExamEngine = ExamEngine;

  // ============================================================
  // DOMAIN QUIZ — one domain, untimed, instant per-question feedback
  // ============================================================
  let drillState = null;
  function renderQuizPicker() {
    const view = document.getElementById('view-quiz');
    view.innerHTML = `
      <h1>Domain Quiz</h1>
      <p class="lead">Drill scenario-based exam-sim questions one domain at a time.
        Instant feedback per question with the rationale for every option.
        Questions don't repeat within your seen pool and options are shuffled every attempt.</p>
      <div class="exam-source-row">
        <label>Source filter:
          <select id="drillSource">
            <option value="all">All (sim + authored extras)</option>
            <option value="sim">Sim only (verbatim Exam-Sim)</option>
            <option value="extra">Extras only (authored)</option>
          </select>
        </label>
      </div>
      <div class="domain-picker" id="drillPicker"></div>
      <div id="drillArea" class="quiz-area"></div>
    `;
    function buildPicker() {
      const src = document.getElementById('drillSource').value;
      const picker = document.getElementById('drillPicker');
      picker.innerHTML = '';
      ['D1','D2','D3','D4','D5'].forEach(d => {
        const hasBank = ExamEngine.bankFor(d).length > 0;
        const status = ExamEngine.poolStatus(d, 'drill:' + d, src);
        const card = document.createElement('div');
        card.className = 'exam-domain-card' + (hasBank ? '' : ' empty');
        card.setAttribute('data-d', d);
        if (!hasBank) {
          card.innerHTML = `
            <div class="exam-dc-h">${d}</div>
            <div class="exam-dc-t">${escapeHTML(domainTitle(d))}</div>
            <div class="exam-dc-meta">Bank not loaded</div>
            <button class="btn-ghost" disabled>Paste questions to enable</button>`;
        } else {
          card.innerHTML = `
            <div class="exam-dc-h">${d}</div>
            <div class="exam-dc-t">${escapeHTML(domainTitle(d))}</div>
            <div class="exam-dc-meta">${status.remaining} / ${status.total} remaining
              <span class="exam-dc-seen">(${status.seen} seen)</span></div>
            <div class="exam-dc-actions">
              <button class="btn-primary" data-go="${d}">Start drill</button>
              ${status.seen > 0 ? `<button class="btn-ghost" data-reset="${d}">Reset seen</button>` : ''}
            </div>`;
        }
        picker.appendChild(card);
      });
      picker.querySelectorAll('[data-go]').forEach(b =>
        b.addEventListener('click', () => startDrill(b.dataset.go, src)));
      picker.querySelectorAll('[data-reset]').forEach(b =>
        b.addEventListener('click', () => { ExamEngine.resetSeen('drill:' + b.dataset.reset); buildPicker(); }));
    }
    document.getElementById('drillSource').addEventListener('change', buildPicker);
    buildPicker();
    document.getElementById('drillArea').innerHTML =
      '<p class="lead" style="text-align:center;margin-top:24px">Choose a domain above to begin.</p>';
  }
  function startDrill(domain, source) {
    drillState = { domain, source, current: null, total: 0, correct: 0 };
    nextDrillQuestion();
  }
  function nextDrillQuestion() {
    const s = drillState; if (!s) return;
    const mode = 'drill:' + s.domain;
    const res = ExamEngine.pullFromDomain(s.domain, 1, mode, s.source);
    if (!res.questions.length) {
      document.getElementById('drillArea').innerHTML =
        '<p class="lead">No questions available for that source filter.</p>';
      return;
    }
    s.current = { raw: res.questions[0], presented: ExamEngine.present(res.questions[0]),
                  depleted: res.depleted, answered: null };
    renderDrillQuestion();
  }
  function renderDrillQuestion() {
    const s = drillState; const q = s.current.presented;
    const status = ExamEngine.poolStatus(s.domain, 'drill:' + s.domain, s.source);
    const sourceTag = q.source === 'sim'
      ? '<span class="exam-tag exam-tag-sim">verbatim sim</span>'
      : '<span class="exam-tag exam-tag-extra">authored</span>';
    const depletedBanner = s.current.depleted
      ? '<div class="exam-banner exam-banner-info">Seen pool exhausted — it was auto-reset. Questions may repeat from earlier in this session.</div>'
      : '';
    document.getElementById('drillArea').innerHTML = `
      ${depletedBanner}
      <div class="q-progress">
        ${s.domain} · ${q.topic} ${escapeHTML(q.topicTitle)} ${sourceTag}
        <span style="float:right">Pool: ${status.remaining}/${status.total} · Score ${s.correct}/${s.total}</span>
      </div>
      <div class="q-block">
        <div class="q-stem">${escapeHTML(q.question)}</div>
        <div class="options" id="drillOptions">
          ${q.options.map((opt, i) => `
            <div class="option" data-i="${i}">
              <div class="letter">${String.fromCharCode(65 + i)}</div>
              <div style="flex:1">${escapeHTML(opt)}</div>
              <span class="kbd">${i + 1}</span>
            </div>`).join('')}
        </div>
        <div id="drillFeedback"></div>
      </div>`;
    document.querySelectorAll('#drillOptions .option').forEach(o => {
      o.addEventListener('click', () => {
        if (s.current.answered !== null) return;
        const chosen = parseInt(o.dataset.i, 10);
        s.current.answered = chosen;
        s.total++;
        if (chosen === q.answer) s.correct++;
        ExamEngine.markSeen([s.current.raw.id], 'drill:' + s.domain);
        logAttempt(s.current.raw.id, s.current.raw.domain, s.current.raw.topic,
                   chosen === q.answer, 'drill');
        revealDrillFeedback();
      });
    });
  }
  function revealDrillFeedback() {
    const s = drillState; const q = s.current.presented; const chosen = s.current.answered;
    document.querySelectorAll('#drillOptions .option').forEach((el, i) => {
      el.classList.remove('correct', 'wrong', 'selected');
      if (i === q.answer) el.classList.add('correct');
      else if (i === chosen) el.classList.add('wrong');
    });
    const verdict = chosen === q.answer
      ? '<div class="result-line ok">✓ Correct</div>'
      : '<div class="result-line bad">✗ Incorrect — correct answer: ' + String.fromCharCode(65 + q.answer) + '</div>';
    const rationaleHtml = q.options.map((_opt, i) => {
      const tag = (i === q.answer) ? 'ok' : (i === chosen ? 'bad' : 'neutral');
      const label = (i === q.answer) ? 'Why right' : 'Why wrong';
      return `<div class="rationale-row rationale-${tag}">
        <div class="rationale-letter">${String.fromCharCode(65 + i)}</div>
        <div class="rationale-body">
          <div class="rationale-label">${label}:</div>
          <div>${escapeHTML(q.rationales[i])}</div>
        </div></div>`;
    }).join('');
    document.getElementById('drillFeedback').innerHTML = `
      ${verdict}
      <div class="rationale-list">${rationaleHtml}</div>
      <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn-primary" id="drillNext">Next question →</button>
        <button class="btn-ghost"   id="drillAiVariant" title="Generate a fresh AI variant via Gemini">✨ AI variant →</button>
        <button class="btn-ghost"   id="drillExit">Back to domain picker</button>
      </div>`;
    document.getElementById('drillNext').addEventListener('click', nextDrillQuestion);
    document.getElementById('drillAiVariant').addEventListener('click', nextDrillAiVariant);
    document.getElementById('drillExit').addEventListener('click', renderQuizPicker);
  }

  // ============================================================
  // AI VARIANT — calls /api/generate-questions (Gemini) for one fresh
  // scenario question for the active drill's domain/topic. Falls back
  // silently to the static bank if the endpoint isn't deployed or hits
  // an error (so local dev / static hosting still works).
  // ============================================================
  async function nextDrillAiVariant() {
    const s = drillState; if (!s) return;
    const btn = document.getElementById('drillAiVariant');
    const next = document.getElementById('drillNext');
    if (btn) { btn.disabled = true; btn.textContent = 'Generating…'; }
    if (next) next.disabled = true;
    try {
      // Build a small style reference from up to 2 sim questions on the same topic.
      const pool = (window.EXAM_BANK && window.EXAM_BANK[s.domain]) || [];
      const sameTopic = pool.filter(q => q.topic === s.current.raw.topic);
      const styleRef = (sameTopic.length ? sameTopic : pool)
        .slice(0, 2)
        .map(q => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
          rationales: q.rationales
        }));
      const resp = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain:     s.domain,
          topic:      s.current.raw.topic,
          topicTitle: s.current.raw.topicTitle,
          styleRef:   styleRef
        })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || ('HTTP ' + resp.status));
      }
      const raw = await resp.json();
      // Plug the AI question into drillState exactly like a static one.
      s.current = { raw: raw, presented: ExamEngine.present(raw), depleted: false, answered: null };
      renderDrillQuestion();
    } catch (err) {
      // Graceful fallback: just advance to the next static question.
      console.warn('[AI variant] falling back to static bank:', err && err.message);
      const fallbackBanner = document.getElementById('drillFeedback');
      if (fallbackBanner) {
        const note = document.createElement('div');
        note.className = 'exam-banner exam-banner-warn';
        note.style.marginTop = '12px';
        note.textContent = 'Couldn\'t reach the AI generator (' + (err && err.message || 'error') + '). Advancing to the next static question instead.';
        fallbackBanner.appendChild(note);
      }
      setTimeout(nextDrillQuestion, 900);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '✨ AI variant →'; }
      if (next) next.disabled = false;
    }
  }

  // ============================================================
  // TIMED EXAM (shared engine for Mock Exam + Real Exam)
  // ============================================================
  let timedState = null;
  let timedTimer = null;
  function clearTimed() {
    if (timedTimer) { clearInterval(timedTimer); timedTimer = null; }
    timedState = null;
  }
  function renderMockIntro() {
    clearTimed();
    renderTimedIntro({
      mode: 'mock', viewId: 'view-mock',
      title: 'Mock Exam',
      lead: 'A weighted, timed cross-domain mock. Questions are drawn by domain weight (27/18/20/20/15), shuffled, and don\'t repeat within your seen pool. Per-domain breakdown at the end.',
      defaults: { count: 40, time: 60, source: 'all' },
      countOptions: [20, 40, 60],
      timeOptions: [30, 60, 90, 0],
      showSourceFilter: true,
      passMark: null
    });
  }
  function renderTimedIntro(cfg) {
    const view = document.getElementById(cfg.viewId);
    const loaded = ExamEngine.loadedDomains();
    const totalAvail = loaded.reduce((sum, d) => sum + ExamEngine.bankFor(d).length, 0);
    const allFive = loaded.length === 5;
    let banner = '';
    let startDisabled = false;
    if (loaded.length === 0) {
      banner = '<div class="exam-banner exam-banner-warn">No exam banks loaded yet. Paste domain exam-sim questions to enable this mode.</div>';
      startDisabled = true;
    } else if (cfg.mode === 'mock' && loaded.length < 5) {
      banner = `<div class="exam-banner exam-banner-info">Only ${loaded.length} of 5 domains loaded (${loaded.join(', ')}). Mock will draw from those and renormalise weights. ${totalAvail} questions available.</div>`;
    } else if (cfg.mode === 'real' && !allFive) {
      banner = `<div class="exam-banner exam-banner-warn">Real Exam needs all 5 domains loaded for true weighting. Currently ${loaded.length}/5 (${loaded.join(', ')}). You can still run a partial real exam below for practice.</div>`;
    }
    const sourceFilter = cfg.showSourceFilter ? `
      <div class="config-row">
        <label>Source filter</label>
        <select id="${cfg.mode}Source">
          <option value="all" ${cfg.defaults.source==='all'?'selected':''}>All (sim + extras)</option>
          <option value="sim" ${cfg.defaults.source==='sim'?'selected':''}>Sim only</option>
          <option value="extra" ${cfg.defaults.source==='extra'?'selected':''}>Extras only</option>
        </select>
      </div>` : '';
    view.innerHTML = `
      <h1>${cfg.title}</h1>
      <p class="lead">${cfg.lead}</p>
      ${banner}
      <div class="card config" id="${cfg.mode}Intro">
        <div class="config-row">
          <label>Number of questions</label>
          <select id="${cfg.mode}QCount">
            ${cfg.countOptions.map(c => `<option value="${c}" ${c===cfg.defaults.count?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="config-row">
          <label>Time limit (minutes)</label>
          <select id="${cfg.mode}Time">
            ${cfg.timeOptions.map(t => `<option value="${t}" ${t===cfg.defaults.time?'selected':''}>${t===0?'No limit':t}</option>`).join('')}
          </select>
        </div>
        ${sourceFilter}
        <div class="config-row" style="gap:12px">
          <button class="btn-primary" id="${cfg.mode}Start" ${startDisabled?'disabled':''}>Start ${cfg.title}</button>
          <button class="btn-ghost" id="${cfg.mode}ResetSeen">Reset seen pool</button>
        </div>
      </div>
      <div id="${cfg.mode}Running" class="hidden"></div>
      <div id="${cfg.mode}Results" class="hidden"></div>`;
    if (!startDisabled) {
      document.getElementById(cfg.mode + 'Start').addEventListener('click', () => startTimed(cfg));
    }
    document.getElementById(cfg.mode + 'ResetSeen').addEventListener('click', () => {
      ExamEngine.resetSeen('timed:' + cfg.mode);
      renderTimedIntro(cfg);
    });
  }
  function startTimed(cfg) {
    const count = parseInt(document.getElementById(cfg.mode + 'QCount').value, 10);
    const timeMin = parseInt(document.getElementById(cfg.mode + 'Time').value, 10);
    const source = cfg.showSourceFilter
      ? document.getElementById(cfg.mode + 'Source').value : 'all';
    const res = ExamEngine.pullWeighted(count, 'timed:' + cfg.mode, source, EXAM_WEIGHTS);
    if (!res.questions.length) { alert('No questions available. Load at least one domain bank first.'); return; }
    const presented = res.questions.map(q => ExamEngine.present(q));
    timedState = {
      cfg, raw: res.questions, questions: presented, idx: 0, answers: {},
      timeLimit: timeMin, timeLeft: timeMin * 60, depleted: res.depleted,
      startTs: Date.now(), passMark: cfg.passMark
    };
    document.getElementById(cfg.mode + 'Intro').classList.add('hidden');
    document.getElementById(cfg.mode + 'Running').classList.remove('hidden');
    document.getElementById(cfg.mode + 'Results').classList.add('hidden');
    if (timeMin > 0) {
      timedTimer = setInterval(() => {
        timedState.timeLeft--;
        updateTimedTimer();
        if (timedState.timeLeft <= 0) finishTimed();
      }, 1000);
    }
    renderTimedQuestion();
  }
  function updateTimedTimer() {
    const t = timedState.timeLeft;
    const m = Math.floor(t / 60), sec = t % 60;
    const el = document.getElementById('timedTimerEl');
    if (!el) return;
    el.textContent = `Time remaining: ${m}:${sec.toString().padStart(2, '0')}`;
    el.parentElement.classList.toggle('warn', t < 300 && t >= 60);
    el.parentElement.classList.toggle('danger', t < 60);
  }
  function renderTimedQuestion() {
    const s = timedState; const cfg = s.cfg;
    const q = s.questions[s.idx];
    const sel = s.answers[q.id];
    const timerHtml = s.timeLimit > 0
      ? `<div class="timer"><span id="timedTimerEl">Time remaining: --:--</span><span>Q ${s.idx + 1} / ${s.questions.length}</span></div>`
      : `<div class="timer" style="background:#10b981"><span>No time limit</span><span>Q ${s.idx + 1} / ${s.questions.length}</span></div>`;
    document.getElementById(cfg.mode + 'Running').innerHTML = `
      ${timerHtml}
      <div class="q-progress">${q.domain} · ${q.topic} ${escapeHTML(q.topicTitle)}</div>
      <div class="q-block">
        <div class="q-stem">${escapeHTML(q.question)}</div>
        <div class="options" id="timedOptions">
          ${q.options.map((opt, i) => {
            let cls = 'option';
            if (sel !== undefined && i === sel) cls += ' selected';
            return `<div class="${cls}" data-i="${i}">
              <div class="letter">${String.fromCharCode(65 + i)}</div>
              <div style="flex:1">${escapeHTML(opt)}</div>
              <span class="kbd">${i + 1}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="nav-row">
        <button class="btn-ghost" id="tPrev" ${s.idx === 0 ? 'disabled' : ''}>← Previous</button>
        ${s.idx < s.questions.length - 1
          ? '<button class="btn-primary" id="tNext">Next →</button>'
          : '<button class="btn-primary" id="tFinish">Finish exam</button>'}
        <button class="btn-ghost" id="tAbort">Abort</button>
      </div>`;
    document.querySelectorAll('#timedOptions .option').forEach(o => {
      o.addEventListener('click', () => {
        s.answers[q.id] = parseInt(o.dataset.i, 10);
        renderTimedQuestion();
      });
    });
    const tPrev = document.getElementById('tPrev');
    if (tPrev) tPrev.addEventListener('click', () => { s.idx--; renderTimedQuestion(); });
    const tNext = document.getElementById('tNext');
    if (tNext) tNext.addEventListener('click', () => { s.idx++; renderTimedQuestion(); });
    const tFinish = document.getElementById('tFinish');
    if (tFinish) tFinish.addEventListener('click', () => {
      const unanswered = s.questions.length - Object.keys(s.answers).length;
      if (unanswered > 0 && !confirm(unanswered + ' question(s) unanswered. Finish anyway?')) return;
      finishTimed();
    });
    document.getElementById('tAbort').addEventListener('click', () => {
      if (!confirm('Abort the exam? Your progress will be lost and no questions will be marked seen.')) return;
      clearTimed();
      if (cfg.mode === 'mock') renderMockIntro(); else renderRealMockIntro();
    });
    if (s.timeLimit > 0) updateTimedTimer();
  }
  function finishTimed() {
    const s = timedState; const cfg = s.cfg;
    if (timedTimer) { clearInterval(timedTimer); timedTimer = null; }
    ExamEngine.markSeen(s.raw.map(q => q.id), 'timed:' + cfg.mode);
    let correct = 0;
    const perDomain = { D1:{c:0,t:0}, D2:{c:0,t:0}, D3:{c:0,t:0}, D4:{c:0,t:0}, D5:{c:0,t:0} };
    s.questions.forEach((q, i) => {
      perDomain[q.domain].t++;
      const isCorrect = s.answers[q.id] === q.answer;
      if (isCorrect) { correct++; perDomain[q.domain].c++; }
      // Telemetry per question — uses the raw (pre-shuffle) question id so
      // dashboard accuracy reflects every attempt across modes.
      const raw = s.raw[i];
      if (raw) logAttempt(raw.id, raw.domain, raw.topic, isCorrect, cfg.mode);
    });
    const total = s.questions.length;
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    const pass = s.passMark !== null && (correct / total) >= s.passMark;
    const durationSec = Math.round((Date.now() - s.startTs) / 1000);
    logMockResult(cfg.mode, correct, total, perDomain, s.passMark, durationSec);
    document.getElementById(cfg.mode + 'Running').classList.add('hidden');
    const resWrap = document.getElementById(cfg.mode + 'Results');
    resWrap.classList.remove('hidden');
    const passBanner = s.passMark !== null
      ? `<div class="exam-banner ${pass ? 'exam-banner-pass' : 'exam-banner-fail'}">
           ${pass ? '✓ PASS' : '✗ FAIL'} — required ${Math.round(s.passMark*100)}%, scored ${pct}%
         </div>` : '';
    const perDomainHtml = ['D1','D2','D3','D4','D5']
      .filter(d => perDomain[d].t > 0)
      .map(d => {
        const dpct = Math.round((perDomain[d].c / perDomain[d].t) * 100);
        return `<div class="per-domain-row">
          <div class="pd-h">${d} ${escapeHTML(domainTitle(d))}</div>
          <div class="pd-bar"><div class="pd-fill" style="width:${dpct}%"></div></div>
          <div class="pd-score">${perDomain[d].c}/${perDomain[d].t} (${dpct}%)</div>
        </div>`;
      }).join('');
    const reviewHtml = s.questions.map((q, i) => {
      const chosen = s.answers[q.id];
      const ok = chosen === q.answer;
      const chosenText = chosen !== undefined
        ? `<strong>Your answer:</strong> ${String.fromCharCode(65 + chosen)}. ${escapeHTML(q.options[chosen])}`
        : '<strong>Your answer:</strong> (not answered)';
      const correctText = `<strong>Correct:</strong> ${String.fromCharCode(65 + q.answer)}. ${escapeHTML(q.options[q.answer])}`;
      const rationaleHtml = q.options.map((_opt, oi) => {
        const tag = (oi === q.answer) ? 'ok' : (oi === chosen ? 'bad' : 'neutral');
        const label = (oi === q.answer) ? 'Why right' : 'Why wrong';
        return `<div class="rationale-row rationale-${tag}">
          <div class="rationale-letter">${String.fromCharCode(65 + oi)}</div>
          <div class="rationale-body">
            <div class="rationale-label">${label}:</div>
            <div>${escapeHTML(q.rationales[oi])}</div>
          </div></div>`;
      }).join('');
      return `<div class="q-block">
        <div class="q-meta">${i + 1}. ${q.domain} · ${q.topic} ${escapeHTML(q.topicTitle)} ${ok ? '✓' : '✗'}</div>
        <div class="q-stem">${escapeHTML(q.question)}</div>
        <div>${chosenText}</div>
        <div>${correctText}</div>
        <div class="rationale-list">${rationaleHtml}</div>
      </div>`;
    }).join('');
    resWrap.innerHTML = `
      <div class="results-summary">
        <div class="score">${pct}%</div>
        <div class="label">${correct} of ${total} correct</div>
        ${passBanner}
      </div>
      <h3>Per-domain breakdown</h3>
      <div class="per-domain-list">${perDomainHtml}</div>
      <h3>Question review</h3>
      ${reviewHtml}
      <div style="margin-top:24px;display:flex;gap:10px">
        <button class="btn-primary" id="timedRestart">Back to setup</button>
        <button class="btn-ghost" id="timedBackDash">Back to dashboard</button>
      </div>`;
    document.getElementById('timedRestart').addEventListener('click', () => {
      if (cfg.mode === 'mock') renderMockIntro(); else renderRealMockIntro();
    });
    document.getElementById('timedBackDash').addEventListener('click', () => showView('dashboard'));
    timedState = null;
  }

  // ============================================================
  // FLASHCARDS
  // ============================================================
  let fcIdx = 0;
  let fcFlipped = false;

  function renderFlashcard() {
    const card = document.getElementById('flashcard');
    const cards = window.FLASHCARDS;
    if (!cards.length) return;
    if (fcIdx >= cards.length) fcIdx = 0;
    const c = cards[fcIdx];
    card.classList.toggle('flipped', fcFlipped);
    card.querySelector('.fc-front').textContent = c.front;
    card.querySelector('.fc-back').textContent = c.back;

    const p = getProgress();
    const stats = p.flashStats || {};
    const knew = Object.values(stats).filter(v => v === 'knew').length;
    const missed = Object.values(stats).filter(v => v === 'missed').length;
    document.getElementById('fcStatus').textContent =
      `Card ${fcIdx + 1} of ${cards.length} • Knew: ${knew} • Missed: ${missed}`;
  }

  document.getElementById('flashcard').addEventListener('click', () => {
    fcFlipped = !fcFlipped;
    renderFlashcard();
  });
  document.getElementById('fcFlip').addEventListener('click', () => {
    fcFlipped = !fcFlipped;
    renderFlashcard();
  });
  document.getElementById('fcPrev').addEventListener('click', () => {
    fcIdx = (fcIdx - 1 + window.FLASHCARDS.length) % window.FLASHCARDS.length;
    fcFlipped = false;
    renderFlashcard();
  });
  document.getElementById('fcNext').addEventListener('click', () => {
    fcIdx = (fcIdx + 1) % window.FLASHCARDS.length;
    fcFlipped = false;
    renderFlashcard();
  });
  document.getElementById('fcKnew').addEventListener('click', () => {
    const p = getProgress();
    p.flashStats = p.flashStats || {};
    p.flashStats[fcIdx] = 'knew';
    saveProgress(p);
    fcIdx = (fcIdx + 1) % window.FLASHCARDS.length;
    fcFlipped = false;
    renderFlashcard();
  });
  document.getElementById('fcMissed').addEventListener('click', () => {
    const p = getProgress();
    p.flashStats = p.flashStats || {};
    p.flashStats[fcIdx] = 'missed';
    saveProgress(p);
    fcIdx = (fcIdx + 1) % window.FLASHCARDS.length;
    fcFlipped = false;
    renderFlashcard();
  });

  // ============================================================
  // REAL EXAM — full-length, real weighting, timed, pass mark
  // ============================================================
  function renderRealMockIntro() {
    clearTimed();
    renderTimedIntro({
      mode: 'real', viewId: 'view-realmock',
      title: 'Real Exam Simulation',
      lead: `Full-length exam under real conditions: real weighting (27/18/20/20/15), shuffled options, no repeats within your seen pool, single results screen at the end. Pass mark ${Math.round(REAL_EXAM_PASS_MARK*100)}%.`,
      defaults: { count: 60, time: 90, source: 'all' },
      countOptions: [40, 60, 80, 100],
      timeOptions: [60, 90, 120, 0],
      showSourceFilter: false,
      passMark: REAL_EXAM_PASS_MARK
    });
  }

  // ============================================================
  // Utilities
  // ============================================================
  function escapeHTML(str) {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ============================================================
  // Keyboard shortcuts
  // ------------------------------------------------------------
  // In Domain Quiz: 1-4 select option, N (or Enter/Space) advances to the
  // next question once feedback is shown.
  // In Mock / Real Exam: 1-4 select the option for the current question;
  // arrow keys ←/→ navigate between questions.
  // Disabled while typing in inputs/selects/textareas.
  // ============================================================
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const activeView = document.querySelector('.view.active');
    if (!activeView) return;
    const viewId = activeView.id;

    // Domain Quiz
    if (viewId === 'view-quiz' && drillState && drillState.current) {
      // 1-4 select option
      if (/^[1-4]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const opt = document.querySelector('#drillOptions .option[data-i="' + idx + '"]');
        if (opt) { e.preventDefault(); opt.click(); }
        return;
      }
      // N / Enter / Space — next question once answered
      if (drillState.current.answered !== null && (e.key === 'n' || e.key === 'N' || e.key === 'Enter' || e.key === ' ')) {
        const btn = document.getElementById('drillNext');
        if (btn) { e.preventDefault(); btn.click(); }
        return;
      }
    }

    // Mock / Real Exam
    if ((viewId === 'view-mock' || viewId === 'view-realmock') && timedState) {
      if (/^[1-4]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const opt = document.querySelector('#timedOptions .option[data-i="' + idx + '"]');
        if (opt) { e.preventDefault(); opt.click(); }
        return;
      }
      if (e.key === 'ArrowLeft') {
        const b = document.getElementById('tPrev');
        if (b && !b.disabled) { e.preventDefault(); b.click(); }
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        const next = document.getElementById('tNext');
        const finish = document.getElementById('tFinish');
        if (next) { e.preventDefault(); next.click(); }
        else if (finish && e.key === 'Enter') { /* require explicit click on Finish */ }
        return;
      }
    }
  });

  // ============================================================
  // Boot — restore the last-active view if one was persisted, so a reload
  // keeps the user on the section they were already working in.
  // ============================================================
  (function bootRestoreView() {
    let saved = null;
    try { saved = localStorage.getItem(LAST_VIEW_KEY); } catch (_) {}
    if (saved && VALID_VIEWS.indexOf(saved) !== -1) showView(saved);
    else renderDashboard();
  })();

})();
