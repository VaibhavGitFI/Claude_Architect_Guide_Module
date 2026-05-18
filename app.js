/*
 * Claude Certified Architect — Exam Prep Module
 * Vanilla JS. No build step. All state in localStorage per-user.
 */

(function () {
  'use strict';

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

  // ============================================================
  // Tabs / Views
  // ============================================================
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(t => t.addEventListener('click', () => showView(t.dataset.view)));
  function showView(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.view === name));
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('active', v.id === 'view-' + name);
    });
    if (name === 'dashboard') renderDashboard();
    if (name === 'study') renderStudy();
    if (name === 'antipatterns') renderAntiPatterns();
    if (name === 'scenarios') renderScenarios();
    if (name === 'quiz') renderQuizPicker();
    if (name === 'mock') renderMockIntro();
    if (name === 'flashcards') renderFlashcard();
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
      const active = document.querySelector('.tab.active');
      if (active) showView(active.dataset.view);
    }
  });

  // ============================================================
  // DASHBOARD
  // ============================================================
  function renderDashboard() {
    document.getElementById('stat-questions').textContent = window.QUESTIONS.length;

    const p = getProgress();
    const attempts = Object.values(p.attempts || {});
    const totalAttempted = attempts.length;
    const totalCorrect = attempts.filter(a => a.correct).length;
    document.getElementById('stat-attempted').textContent = totalAttempted;
    document.getElementById('stat-accuracy').textContent =
      totalAttempted ? Math.round(totalCorrect / totalAttempted * 100) + '%' : '0%';

    // Domain mastery bars
    const domains = ['D1', 'D2', 'D3', 'D4', 'D5'];
    const titles = {
      D1: 'Domain 1 — Agentic Architecture',
      D2: 'Domain 2 — Tool Design & MCP',
      D3: 'Domain 3 — Claude Code Config',
      D4: 'Domain 4 — Prompt Engineering',
      D5: 'Domain 5 — Context & Reliability'
    };
    const dpEl = document.getElementById('domainProgress');
    dpEl.innerHTML = '';
    domains.forEach(d => {
      const dQs = window.QUESTIONS.filter(q => q.domain === d);
      const dAtt = dQs.filter(q => p.attempts[q.id]);
      const dCor = dAtt.filter(q => p.attempts[q.id].correct);
      const pct = dAtt.length ? Math.round(dCor.length / dAtt.length * 100) : 0;
      const row = document.createElement('div');
      row.className = 'dp-row';
      row.innerHTML = `
        <div>${titles[d]}</div>
        <div class="dp-bar"><div class="dp-fill" style="width:${pct}%"></div></div>
        <div class="dp-pct">${pct}% <span style="color:#94a3b8;font-weight:400">(${dCor.length}/${dAtt.length}/${dQs.length})</span></div>
      `;
      dpEl.appendChild(row);
    });
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
  // QUIZ ENGINE (shared with Mock Exam)
  // ============================================================
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ----- Domain Quiz -----
  let quizState = null;
  function renderQuizPicker() {
    const picker = document.getElementById('domainPicker');
    picker.innerHTML = '';
    const opts = [
      { d: 'D1', label: 'Domain 1 — Agentic Architecture' },
      { d: 'D2', label: 'Domain 2 — Tool Design & MCP' },
      { d: 'D3', label: 'Domain 3 — Claude Code Config' },
      { d: 'D4', label: 'Domain 4 — Prompt Engineering' },
      { d: 'D5', label: 'Domain 5 — Context & Reliability' },
      { d: 'ALL', label: 'Mixed (all domains)' }
    ];
    opts.forEach(o => {
      const btn = document.createElement('button');
      btn.className = 'btn-primary';
      btn.style.background = o.d === 'ALL' ? '#10b981' : '';
      btn.textContent = o.label;
      btn.addEventListener('click', () => startQuiz(o.d));
      picker.appendChild(btn);
    });
    document.getElementById('quizArea').innerHTML = '<p class="lead" style="text-align:center;margin-top:24px">Choose a domain above to begin.</p>';
  }

  function startQuiz(domain) {
    const pool = domain === 'ALL' ? window.QUESTIONS : window.QUESTIONS.filter(q => q.domain === domain);
    quizState = {
      questions: shuffle(pool),
      idx: 0,
      mode: 'quiz', // immediate feedback per question
      answers: {}
    };
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const area = document.getElementById('quizArea');
    const s = quizState;
    if (!s) return;
    if (s.idx >= s.questions.length) return renderQuizResults();
    const q = s.questions[s.idx];
    const sel = s.answers[q.id];

    area.innerHTML = `
      <div class="q-progress">Question ${s.idx + 1} of ${s.questions.length}  •  Domain ${q.domain.slice(1)}  •  Topic ${q.topic}</div>
      <div class="q-block">
        <div class="q-stem">${escapeHTML(q.q)}</div>
        <div class="options">
          ${q.options.map((opt, i) => {
            let cls = 'option';
            if (sel !== undefined) {
              if (i === q.answer) cls += ' correct';
              else if (i === sel) cls += ' wrong';
            }
            return `<div class="${cls}" data-i="${i}">
              <div class="letter">${String.fromCharCode(65 + i)}</div>
              <div>${escapeHTML(opt)}</div>
            </div>`;
          }).join('')}
        </div>
        ${sel !== undefined ? `<div class="explain"><strong>Explanation:</strong> ${escapeHTML(q.explain)}</div>` : ''}
        <div class="q-controls">
          <button class="btn-ghost" id="qPrev" ${s.idx === 0 ? 'disabled' : ''}>← Previous</button>
          <div class="right">
            <button class="btn-primary" id="qNext">${s.idx === s.questions.length - 1 ? 'Finish' : 'Next →'}</button>
          </div>
        </div>
      </div>
    `;

    area.querySelectorAll('.option').forEach(o => {
      o.addEventListener('click', () => {
        if (s.answers[q.id] !== undefined) return; // already answered
        const idx = parseInt(o.dataset.i, 10);
        s.answers[q.id] = idx;
        // Record in long-term progress
        const p = getProgress();
        p.attempts[q.id] = {
          correct: idx === q.answer,
          chosen: idx,
          ts: Date.now()
        };
        saveProgress(p);
        renderQuizQuestion();
      });
    });
    document.getElementById('qPrev').addEventListener('click', () => { s.idx--; renderQuizQuestion(); });
    document.getElementById('qNext').addEventListener('click', () => {
      s.idx++;
      if (s.idx >= s.questions.length) renderQuizResults();
      else renderQuizQuestion();
    });
  }

  function renderQuizResults() {
    const s = quizState;
    const total = s.questions.length;
    const correct = s.questions.filter(q => s.answers[q.id] === q.answer).length;
    const pct = Math.round(correct / total * 100);
    document.getElementById('quizArea').innerHTML = `
      <div class="results-summary">
        <div class="score">${pct}%</div>
        <div class="label">${correct} of ${total} correct</div>
        <div class="${pct >= 80 ? 'pass' : 'fail'}" style="margin-top:8px">
          ${pct >= 80 ? '✓ On track for the real exam' : '✗ Below 80% — review explanations and the matching domain'}
        </div>
      </div>
      <h3>Review</h3>
      ${s.questions.map((q, i) => {
        const chosen = s.answers[q.id];
        const ok = chosen === q.answer;
        return `<div class="q-block">
          <div class="q-meta">${i + 1}. ${q.domain} • ${q.topic} ${ok ? '✓' : '✗'}</div>
          <div class="q-stem">${escapeHTML(q.q)}</div>
          <div><strong>Your answer:</strong> ${chosen !== undefined ? escapeHTML(q.options[chosen]) : '(skipped)'}</div>
          <div><strong>Correct:</strong> ${escapeHTML(q.options[q.answer])}</div>
          <div class="explain"><strong>Why:</strong> ${escapeHTML(q.explain)}</div>
        </div>`;
      }).join('')}
      <button class="btn-primary" id="quizRestart">Back to Domain Picker</button>
    `;
    document.getElementById('quizRestart').addEventListener('click', renderQuizPicker);
  }

  // ============================================================
  // MOCK EXAM
  // ============================================================
  let mockState = null;
  let mockTimer = null;

  function renderMockIntro() {
    document.getElementById('mockIntro').classList.remove('hidden');
    document.getElementById('mockRunning').classList.add('hidden');
    document.getElementById('mockResults').classList.add('hidden');
  }
  document.getElementById('startMock').addEventListener('click', startMock);

  function startMock() {
    const qCount = parseInt(document.getElementById('mockQCount').value, 10);
    const timeMin = parseInt(document.getElementById('mockTime').value, 10);
    const explain = document.getElementById('mockExplain').checked;

    // Weighted selection by domain weights
    const weights = { D1: 0.25, D2: 0.20, D3: 0.20, D4: 0.20, D5: 0.15 };
    const picked = [];
    Object.keys(weights).forEach(d => {
      const need = Math.round(qCount * weights[d]);
      const pool = shuffle(window.QUESTIONS.filter(q => q.domain === d));
      picked.push(...pool.slice(0, need));
    });
    // Trim/extend to exact count
    let final = shuffle(picked).slice(0, qCount);
    if (final.length < qCount) {
      const remaining = shuffle(window.QUESTIONS.filter(q => !final.includes(q)));
      final = final.concat(remaining.slice(0, qCount - final.length));
    }

    mockState = {
      questions: final,
      idx: 0,
      answers: {},
      showExplain: explain,
      timeLeft: timeMin * 60,
      timeLimit: timeMin,
      startTs: Date.now()
    };

    document.getElementById('mockIntro').classList.add('hidden');
    document.getElementById('mockRunning').classList.remove('hidden');
    document.getElementById('mockResults').classList.add('hidden');

    if (timeMin > 0) {
      mockTimer = setInterval(() => {
        mockState.timeLeft--;
        updateMockTimer();
        if (mockState.timeLeft <= 0) finishMock();
      }, 1000);
    }
    renderMockQuestion();
  }

  function updateMockTimer() {
    const t = mockState.timeLeft;
    const m = Math.floor(t / 60);
    const s = t % 60;
    const el = document.getElementById('mockTimerEl');
    if (!el) return;
    el.textContent = `Time remaining: ${m}:${s.toString().padStart(2, '0')}`;
    el.parentElement.classList.toggle('warn', t < 300 && t >= 60);
    el.parentElement.classList.toggle('danger', t < 60);
  }

  function renderMockQuestion() {
    const wrap = document.getElementById('mockRunning');
    const s = mockState;
    const q = s.questions[s.idx];
    const sel = s.answers[q.id];

    const timerHTML = s.timeLimit > 0
      ? `<div class="timer"><span id="mockTimerEl">Time remaining: --:--</span><span>Q ${s.idx + 1} / ${s.questions.length}</span></div>`
      : `<div class="timer" style="background:#10b981"><span>No time limit</span><span>Q ${s.idx + 1} / ${s.questions.length}</span></div>`;

    wrap.innerHTML = `
      ${timerHTML}
      <div class="q-progress">Domain ${q.domain.slice(1)} • Topic ${q.topic}</div>
      <div class="q-block">
        <div class="q-stem">${escapeHTML(q.q)}</div>
        <div class="options">
          ${q.options.map((opt, i) => {
            let cls = 'option';
            if (sel !== undefined) {
              if (s.showExplain) {
                if (i === q.answer) cls += ' correct';
                else if (i === sel) cls += ' wrong';
              } else if (i === sel) {
                cls += ' selected';
              }
            }
            return `<div class="${cls}" data-i="${i}">
              <div class="letter">${String.fromCharCode(65 + i)}</div>
              <div>${escapeHTML(opt)}</div>
            </div>`;
          }).join('')}
        </div>
        ${(sel !== undefined && s.showExplain) ? `<div class="explain"><strong>Explanation:</strong> ${escapeHTML(q.explain)}</div>` : ''}
        <div class="q-controls">
          <button class="btn-ghost" id="mPrev" ${s.idx === 0 ? 'disabled' : ''}>← Previous</button>
          <div class="right">
            <button class="btn-warn" id="mFinish">Finish Now</button>
            <button class="btn-primary" id="mNext">
              ${s.idx === s.questions.length - 1 ? 'Submit Exam' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    `;

    if (s.timeLimit > 0) updateMockTimer();

    wrap.querySelectorAll('.option').forEach(o => {
      o.addEventListener('click', () => {
        const idx = parseInt(o.dataset.i, 10);
        if (s.showExplain && s.answers[q.id] !== undefined) return;
        s.answers[q.id] = idx;
        // Save to long-term progress too
        const p = getProgress();
        p.attempts[q.id] = { correct: idx === q.answer, chosen: idx, ts: Date.now() };
        saveProgress(p);
        renderMockQuestion();
      });
    });
    document.getElementById('mPrev').addEventListener('click', () => { s.idx--; renderMockQuestion(); });
    document.getElementById('mNext').addEventListener('click', () => {
      s.idx++;
      if (s.idx >= s.questions.length) finishMock();
      else renderMockQuestion();
    });
    document.getElementById('mFinish').addEventListener('click', () => {
      if (confirm('Submit exam now? Unanswered questions will be marked incorrect.')) finishMock();
    });
  }

  function finishMock() {
    if (mockTimer) clearInterval(mockTimer);
    const s = mockState;
    const total = s.questions.length;
    const correct = s.questions.filter(q => s.answers[q.id] === q.answer).length;
    const pct = Math.round(correct / total * 100);
    const timeUsed = Math.round((Date.now() - s.startTs) / 1000);
    const mm = Math.floor(timeUsed / 60);
    const ss = timeUsed % 60;

    // Per-domain breakdown
    const byDomain = {};
    ['D1', 'D2', 'D3', 'D4', 'D5'].forEach(d => {
      const dqs = s.questions.filter(q => q.domain === d);
      const dCorrect = dqs.filter(q => s.answers[q.id] === q.answer).length;
      byDomain[d] = { total: dqs.length, correct: dCorrect };
    });

    // Save to history
    const p = getProgress();
    p.mockHistory = p.mockHistory || [];
    p.mockHistory.push({
      ts: Date.now(),
      total, correct, pct,
      timeSec: timeUsed,
      byDomain
    });
    saveProgress(p);

    document.getElementById('mockRunning').classList.add('hidden');
    const res = document.getElementById('mockResults');
    res.classList.remove('hidden');

    const dTitles = {
      D1: 'Agentic Architecture',
      D2: 'Tool Design & MCP',
      D3: 'Claude Code Config',
      D4: 'Prompt Engineering',
      D5: 'Context & Reliability'
    };

    res.innerHTML = `
      <div class="results-summary">
        <div class="score">${pct}%</div>
        <div class="label">${correct} of ${total} correct</div>
        <div class="label">Time: ${mm}m ${ss}s</div>
        <div class="${pct >= 80 ? 'pass' : 'fail'}" style="margin-top:8px;font-size:18px">
          ${pct >= 80 ? '✓ PASS (≥80%) — you are exam ready' : '✗ Below 80% — review weak domains below'}
        </div>
      </div>

      <h2>Domain Breakdown</h2>
      <div class="results-breakdown">
        ${Object.keys(byDomain).map(d => {
          const b = byDomain[d];
          const dp = b.total ? Math.round(b.correct / b.total * 100) : 0;
          return `<div class="rb-row">
            <div>
              <div class="name">${d} — ${dTitles[d]}</div>
              <div style="color:#94a3b8;font-size:12px">${b.correct}/${b.total} questions</div>
            </div>
            <div class="score">${dp}%</div>
          </div>`;
        }).join('')}
      </div>

      <h2>Question Review</h2>
      ${s.questions.map((q, i) => {
        const chosen = s.answers[q.id];
        const ok = chosen === q.answer;
        return `<div class="q-block">
          <div class="q-meta">${i + 1}. ${q.domain} • ${q.topic} ${ok ? '✓ Correct' : '✗ Incorrect'}</div>
          <div class="q-stem">${escapeHTML(q.q)}</div>
          <div><strong>Your answer:</strong> ${chosen !== undefined ? escapeHTML(q.options[chosen]) : '(skipped)'}</div>
          <div><strong>Correct:</strong> ${escapeHTML(q.options[q.answer])}</div>
          <div class="explain"><strong>Why:</strong> ${escapeHTML(q.explain)}</div>
        </div>`;
      }).join('')}

      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn-primary" id="mockRestart">Take Another Mock</button>
        <button class="btn-ghost" id="mockBackDash">Back to Dashboard</button>
      </div>
    `;
    document.getElementById('mockRestart').addEventListener('click', renderMockIntro);
    document.getElementById('mockBackDash').addEventListener('click', () => showView('dashboard'));
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
  // Boot
  // ============================================================
  renderDashboard();

})();
