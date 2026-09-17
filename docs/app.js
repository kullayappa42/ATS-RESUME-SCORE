/* ATS static wizard: details -> career -> upload -> analyze -> results.
   PDF parsed via pdf.js, DOCX via mammoth, scoring via ats-core.js. */
(function () {
'use strict';
var LEVELS = ['Fresher', '0-1 Years', '1-3 Years', '3+ Years'];
var STAGE_LABELS = ['Details', 'Career', 'Resume', 'Analysis', 'Results'];
var state = { stage: 1, fullName: '', level: '', careerId: '', file: null, fileText: '', jd: '', result: null, jdMatch: null };

function el(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function showError(msg) {
  el('error').innerHTML = msg
    ? '<div class="err">Warning: ' + esc(msg) + '</div>' : '';
}
function setStage(n) {
  state.stage = n;
  [1, 2, 3, 4, 5].forEach(function (i) { el('stage' + i).style.display = i === n ? '' : 'none'; });
  renderSteps();
}
function statusColor(s) { return s === 'GOOD' ? '#10b981' : s === 'MEDIUM' ? '#f59e0b' : '#ef4444'; }
function renderSteps() {
  var html = '';
  STAGE_LABELS.forEach(function (label, i) {
    var n = i + 1;
    var cls = n === state.stage ? 'active' : n < state.stage ? 'done' : '';
    html += '<span class="step-pill ' + cls + '">' + (n < state.stage ? '✓' : n) + '. ' + esc(label) + '</span>';
    if (i < STAGE_LABELS.length - 1) html += '<span style="color:#475569">↓</span>';
  });
  el('steps').innerHTML = html;
}
function renderStage1() {
  var btns = LEVELS.map(function (l) {
    var sel = state.level === l;
    return '<button type="button" data-level="' + esc(l) + '" style="padding:.75rem;border-radius:.6rem;cursor:pointer;font-weight:600;font-size:.88rem;font-family:inherit;background:' +
      (sel ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'rgba(255,255,255,.04)') + ';border:' +
      (sel ? '1px solid #3b82f6' : '1px solid var(--border)') + ';color:' + (sel ? '#fff' : '#cbd5e1') + '">' + esc(l) + '</button>';
  }).join('');
  el('stage1').innerHTML =
    '<div class="glass"><h2>Tell Us About Yourself</h2>' +
    '<p style="color:#94a3b8;font-size:.9rem;margin:.25rem 0 1.5rem">Stage 1 of 5.</p>' +
    '<label style="display:block;margin-bottom:.5rem;font-size:.875rem;color:#94a3b8">Full Name *</label>' +
    '<input class="input-field" id="f-name" placeholder="e.g. Priya Sharma" value="' + esc(state.fullName) + '">' +
    '<div style="margin:1.25rem 0 .5rem;font-size:.875rem;color:#94a3b8">Experience Level *</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">' + btns + '</div>' +
    '<div class="row"><span></span><button class="btn-primary" id="to2">Continue</button></div></div>';
  var nameInput = el('f-name');
  nameInput.addEventListener('input', function () { state.fullName = nameInput.value; });
  Array.prototype.forEach.call(el('stage1').querySelectorAll('[data-level]'), function (b) {
    b.addEventListener('click', function () { state.level = b.getAttribute('data-level'); showError(null); renderStage1(); });
  });
  el('to2').addEventListener('click', function () {
    if (!state.fullName.trim()) { showError('Full name is required.'); return; }
    if (LEVELS.indexOf(state.level) === -1) { showError('Please select your experience level.'); return; }
    showError(null); renderStage2(); setStage(2);
  });
}
function renderStage2() {
  var careers = ATSCore.listCareerProfiles();
  var cards = careers.map(function (c) {
    var sel = state.careerId === c.id;
    var skills = c.displaySkills.map(function (s) {
      return '<span class="badge" style="background:rgba(255,255,255,.06);color:#cbd5e1;margin-right:.3rem;margin-bottom:.3rem">' + esc(s) + '</span>';
    }).join('');
    return '<button type="button" class="career-card' + (sel ? ' sel' : '') + '" data-career="' + esc(c.id) + '">' +
      '<div style="font-size:1.8rem">' + esc(c.icon) + '</div>' +
      '<div style="font-weight:700;margin:.4rem 0">' + esc(c.title) + '</div>' +
      '<div style="font-size:.78rem;color:#94a3b8;margin-bottom:.6rem">' + esc(c.tagline) + '</div>' +
      '<div>' + skills + '</div>' +
      (sel ? '<div style="color:#3b82f6;font-weight:700;margin-top:.5rem">Selected</div>' : '') + '</button>';
  }).join('');
  el('stage2').innerHTML =
    '<div class="glass"><h2>Choose Your Target Career</h2>' +
    '<p style="color:#94a3b8;font-size:.9rem;margin:.25rem 0 1.5rem">Stage 2 of 5 - scoring is tailored to this path.</p>' +
    '<div class="grid2">' + cards + '</div>' +
    '<div class="row"><button class="btn-secondary" id="back1">Back</button>' +
    '<button class="btn-primary" id="to3">Continue to Resume Upload</button></div></div>';
  Array.prototype.forEach.call(el('stage2').querySelectorAll('[data-career]'), function (b) {
    b.addEventListener('click', function () { state.careerId = b.getAttribute('data-career'); showError(null); renderStage2(); });
  });
  el('back1').addEventListener('click', function () { showError(null); renderStage1(); setStage(1); });
  el('to3').addEventListener('click', function () {
    if (!state.careerId) { showError('Please select one career path to continue.'); return; }
    showError(null); renderStage3(); setStage(3);
  });
}
function formatBytes(bytes) {
  if (!bytes) return '0 B';
  var units = ['B', 'KB', 'MB'], v = bytes, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i += 1; }
  return v.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}
function renderStage3() {
  var fileBox = state.file
    ? '<div class="okbox">📑 <strong>' + esc(state.file.name) + '</strong><div style="font-size:.78rem;color:#94a3b8">' + formatBytes(state.file.size) + ' - ready</div></div>'
    : '';
  el('stage3').innerHTML =
    '<div class="glass"><h2>Upload Your Resume</h2>' +
    '<p style="color:#94a3b8;font-size:.9rem;margin:.25rem 0 1.25rem">PDF or DOCX, up to 5 MB. Parsed in memory, right in your browser.</p>' +
    '<label class="drop" id="drop">📄<div style="font-weight:700;font-size:1.1rem;margin:.4rem 0">Upload Your Resume</div>' +
    '<div style="color:#94a3b8;font-size:.9rem;margin-bottom:1rem">Drag &amp; drop here<br>OR</div>' +
    '<span class="btn-primary">[ Choose File ]</span>' +
    '<div style="color:#64748b;font-size:.8rem;margin-top:1rem">PDF / DOCX supported</div>' +
    '<input type="file" id="f-file" accept=".pdf,.docx" hidden></label>' + fileBox +
    '</div>' +
    '<div class="glass"><h3>Paste Job Description <span style="color:#64748b;font-weight:400;font-size:.8rem">(optional)</span></h3>' +
    '<textarea class="input-field" id="f-jd" rows="5" placeholder="Paste the job posting here..." style="margin-top:.75rem">' + esc(state.jd) + '</textarea>' +
    '<p style="font-size:.78rem;color:#64748b;margin-top:.5rem">Tip: no file handy? Use “Try sample resume” to see a full analysis instantly.</p></div>' +
    '<div class="row"><button class="btn-secondary" id="back2">Back</button>' +
    '<span><button class="btn-secondary" id="sample" style="margin-right:.5rem">Try sample resume</button>' +
    '<button class="btn-primary" id="analyze">Analyze Resume</button></span></div>';
  var drop = el('drop'), input = el('f-file'), jdInput = el('f-jd');
  jdInput.addEventListener('input', function () { state.jd = jdInput.value; });
  drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', function () { drop.classList.remove('over'); });
  drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('over'); pickFile(e.dataTransfer.files && e.dataTransfer.files[0]); });
  input.addEventListener('change', function () { pickFile(input.files && input.files[0]); input.value = ''; });
  el('back2').addEventListener('click', function () { showError(null); renderStage2(); setStage(2); });
  el('sample').addEventListener('click', function () { useSample(); });
  el('analyze').addEventListener('click', function () { runAnalysis(); });
}
function pickFile(f) {
  if (!f) return;
  var okType = /\.pdf$/i.test(f.name) || /\.docx$/i.test(f.name);
  if (!okType) { showError('Unsupported file type. Please upload a PDF or DOCX file.'); return; }
  if (f.size > 5 * 1024 * 1024) { showError('File is too large. Maximum size is 5 MB.'); return; }
  state.file = f; state.fileText = '';
  showError(null); renderStage3();
}
var SAMPLE_RESUME = [
  'John Doe - Python Full Stack Developer (Fresher)',
  'Email: john.doe@example.com | Phone: +91 98765 43210 | GitHub: github.com/johndoe',
  'Location: Hyderabad, India',
  '',
  'PROFESSIONAL SUMMARY',
  'Motivated fresher targeting Python Full Stack roles with hands-on academic projects',
  'using Python, Django, REST APIs, HTML, CSS, JavaScript, SQL and Git.',
  '',
  'TECHNICAL SKILLS',
  'Languages: Python, JavaScript, SQL, HTML, CSS',
  'Frameworks: Django, Flask, React (basics)',
  'Databases: MySQL, PostgreSQL, SQLite',
  'Tools: Git, GitHub, REST API, Docker (basics), Postman, VS Code',
  'Concepts: OOP, Data Structures, Agile, Testing',
  '',
  'EDUCATION',
  'B.Tech, Computer Science and Engineering - JNTU Hyderabad (2022 - 2026), CGPA: 8.5/10',
  '',
  'PROJECTS',
  '1. Employee Management System | Python, Django, MySQL, HTML, CSS, JavaScript',
  '- Developed an employee management system using Python and MySQL to manage',
  '  employee records and reduce manual data handling.',
  '- Built REST API endpoints for CRUD operations; improved record retrieval time by 30%.',
  '- Deployed a demo build and documented setup on GitHub.',
  '2. Portfolio Website | HTML, CSS, JavaScript, React',
  '- Created a responsive portfolio website with React components.',
  '- Implemented contact form and project gallery; used Git and GitHub for version control.',
  '',
  'EXPERIENCE',
  'Web Development Intern - ABC Tech Solutions (Jun 2024 - Aug 2024)',
  '- Worked on internal dashboard pages using HTML, CSS and JavaScript.',
  '- Contributed bug fixes and wrote basic API integration code.',
  '- Achieved a 15% reduction in page load time by optimising images.',
  '',
  'CERTIFICATIONS',
  '- Python for Everybody - Coursera (2024)',
  '- Web Development Bootcamp - Udemy (2023)',
  '',
  'KEYWORDS',
  'Python Django Flask REST API HTML CSS JavaScript SQL MySQL PostgreSQL Git GitHub',
  'OOP API Docker AWS Testing Agile'
].join('\n');
function useSample() {
  state.file = { name: 'sample-resume.txt', size: SAMPLE_RESUME.length };
  state.fileText = SAMPLE_RESUME;
  showError(null);
  runAnalysis();
}
function extractPdfText(file) {
  return file.arrayBuffer().then(function (buf) {
    if (!window.pdfjsLib) throw new Error('PDF library failed to load. Check your connection and reload.');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    return window.pdfjsLib.getDocument({ data: buf }).promise.then(function (pdf) {
      var pages = [];
      for (var i = 1; i <= pdf.numPages; i++) pages.push(i);
      return pages.reduce(function (p, n) {
        return p.then(function (texts) {
          return pdf.getPage(n).then(function (page) {
            return page.getTextContent().then(function (content) {
              var s = content.items.map(function (it) { return it.str; }).join(' ');
              return texts + '\n' + s;
            });
          });
        });
      }, Promise.resolve('')).then(function (t) { return t.trim(); });
    });
  });
}
function extractDocxText(file) {
  return file.arrayBuffer().then(function (buf) {
    if (!window.mammoth) throw new Error('DOCX library failed to load. Check your connection and reload.');
    return window.mammoth.extractRawText({ arrayBuffer: buf }).then(function (r) { return (r.value || '').trim(); });
  });
}
function runAnalysis() {
  if (!state.file) { showError('No file uploaded. Please upload a PDF or DOCX resume.'); return; }
  var profile = ATSCore.getCareerProfile(state.careerId);
  if (!profile) { showError('Please go back and select a target career path.'); return; }
  showError(null);
  el('stage4').innerHTML = '<div class="glass" style="text-align:center;padding:2.5rem">' +
    '<div style="font-size:2rem">⏳</div><h3>Analyzing your resume...</h3>' +
    '<div style="color:#94a3b8;font-size:.9rem;margin-top:1rem">Extracting text → sections → skills → keywords → score</div></div>';
  setStage(4);
  var getText = state.fileText
    ? Promise.resolve(state.fileText)
    : (/\.pdf$/i.test(state.file.name) ? extractPdfText(state.file) : extractDocxText(state.file));
  getText.then(function (text) {
    var clean = String(text || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, 20000);
    if (!clean || clean.trim().length < 50) throw new Error("We couldn't extract readable text from this resume. Try the sample resume, or a text-based PDF/DOCX (not a scanned image).");
    var analysis = ATSCore.analyzeResume(clean, profile);
    var jd = ATSCore.matchJobDescription(clean, state.jd || '', profile.keywords);
    state.result = {
      candidate: { fullName: state.fullName, experienceLevel: state.level },
      career: { id: profile.id, title: profile.title, icon: profile.icon },
      file: { name: state.file.name, size: state.file.size },
      total: analysis.total, status: analysis.status, categories: analysis.categories,
      matchedSkills: analysis.matchedSkills, missingSkills: analysis.missingSkills,
      keywordsFound: analysis.keywordsFound, keywordsMissing: analysis.keywordsMissing,
      sections: analysis.sections, suggestions: analysis.suggestions,
      disclaimer: analysis.disclaimer,
      jdMatch: (state.jd || '').trim() ? jd : null
    };
    renderStage5(); setStage(5);
  }).catch(function (e) {
    renderStage3(); setStage(3);
    showError(e && e.message ? e.message : 'Analysis failed. Please try again.');
  });
}
function renderStage5() {
  var r = state.result;
  var color = statusColor(r.status);
  var icon = r.status === 'GOOD' ? '🟢 GOOD' : r.status === 'MEDIUM' ? '🟠 MEDIUM' : '🔴 LOW';
  var rr = 64, circ = 2 * Math.PI * rr, off = circ - (r.total / 100) * circ;
  var cats = Object.keys(r.categories).map(function (key) {
    var c = r.categories[key];
    var pct = c.max ? Math.round((c.score / c.max) * 100) : 0;
    return '<div style="margin-bottom:.9rem"><div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.3rem">' +
      '<span style="font-weight:600">' + esc(c.label) + '</span><span style="color:#94a3b8">' + c.score + '/' + c.max + '</span></div>' +
      '<div class="bar"><div style="width:' + pct + '%;background:' + color + '"></div></div>' +
      '<div style="font-size:.75rem;color:#64748b;margin-top:.2rem">' + esc(c.detail) + '</div></div>';
  }).join('');
  var matched = r.matchedSkills.map(function (s) { return '<span class="badge badge-ok" style="margin:0 .3rem .3rem 0">✓ ' + esc(s) + '</span>'; }).join('') || '<span style="color:#94a3b8;font-size:.85rem">None detected yet.</span>';
  var missing = r.missingSkills.map(function (s) { return '<span class="badge badge-warn" style="margin:0 .3rem .3rem 0">⚠ ' + esc(s) + '</span>'; }).join('');
  var sections = r.sections.map(function (s) {
    return '<div style="display:flex;gap:.5rem;font-size:.9rem;color:' + (s.found ? '#e2e8f0' : '#94a3b8') + '">' +
      '<span style="color:' + (s.found ? '#10b981' : '#ef4444') + ';font-weight:700">' + (s.found ? '✓' : '✗') + '</span>' + esc(s.label) + '</div>';
  }).join('');
  var suggs = r.suggestions.map(function (s) {
    return '<div class="sugg"><div style="font-weight:700;font-size:.9rem">' + esc(s.title) + '</div>' +
      '<div style="font-size:.85rem;color:#cbd5e1;line-height:1.6">' + esc(s.body) + '</div></div>';
  }).join('');
  var jd = r.jdMatch
    ? '<div class="glass"><h3>Resume vs Job Description Match: ' + r.jdMatch.matchScore + '%</h3>' +
      '<p style="font-size:.8rem;color:#94a3b8">' + esc(r.jdMatch.note) + '</p>' +
      '<p style="font-size:.85rem;margin-top:.5rem"><strong>Matching:</strong> ' + esc(r.jdMatch.matchingKeywords.join(', ')) + '</p>' +
      '<p style="font-size:.85rem"><strong>Missing:</strong> ' + esc(r.jdMatch.missingKeywords.join(', ')) + '</p></div>'
    : '';
  el('stage5').innerHTML =
    '<div class="glass" style="text-align:center;padding:2rem">' +
    '<div style="font-size:.75rem;letter-spacing:.2em;color:#94a3b8;font-weight:700;margin-bottom:1rem">ATS RESUME SCORE</div>' +
    '<div style="position:relative;width:190px;height:190px;margin:0 auto">' +
    '<svg width="190" height="190" viewBox="0 0 190 190"><circle cx="95" cy="95" r="' + rr + '" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="14"/>' +
    '<circle cx="95" cy="95" r="' + rr + '" fill="none" stroke="' + color + '" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 95 95)"/></svg>' +
    '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.25rem">' +
    '<div style="font-size:.7rem;letter-spacing:.15em;color:#94a3b8;font-weight:700">ATS SCORE</div>' +
    '<div style="font-size:2.2rem;font-weight:800">' + r.total + '<span style="font-size:1rem;color:#94a3b8"> / 100</span></div>' +
    '<div class="badge" style="background:' + color + '22;color:' + color + ';border:1px solid ' + color + '">' + icon + '</div></div></div>' +
    '<p style="color:#94a3b8;font-size:.8rem;margin-top:1rem">' + esc(r.disclaimer) + '</p>' +
    '<p style="color:#64748b;font-size:.8rem">' + esc(r.candidate.fullName) + ' • ' + esc(r.career.icon) + ' ' + esc(r.career.title) + ' • ' + esc(r.file.name) + '</p></div>' +
    '<div class="glass"><h3 style="margin-bottom:1rem">Category Breakdown</h3>' + cats + '</div>' +
    '<div class="grid2"><div class="glass"><h4 style="color:#6ee7b7;margin-bottom:.6rem">✓ Matched Skills</h4><div>' + matched + '</div>' +
    '<h4 style="color:#fcd34d;margin:1rem 0 .6rem">⚠ Missing / Recommended</h4><div>' + missing + '</div></div>' +
    '<div class="glass"><h4 style="margin-bottom:.6rem">Resume Section Analysis</h4>' + sections +
    '<h4 style="margin:1rem 0 .5rem">Keywords Found</h4><p style="font-size:.82rem;color:#cbd5e1">' + esc(r.keywordsFound.join(', ')) + '</p>' +
    '<h4 style="margin:.75rem 0 .5rem">Keywords to Consider</h4><p style="font-size:.82rem;color:#cbd5e1">' + esc(r.keywordsMissing.join(', ')) + '</p></div></div>' +
    '<div class="glass"><h3 style="margin-bottom:.75rem">Improvement Suggestions</h3>' + suggs + '</div>' + jd +
    '<div class="row" style="justify-content:center"><button class="btn-primary" id="print">⬇ Download ATS Report</button>' +
    '<button class="btn-secondary" id="restart">Analyze Another Resume</button></div>';
  el('print').addEventListener('click', function () { downloadReport(r); });
  el('restart').addEventListener('click', function () {
    state.result = null; state.file = null; state.fileText = ''; state.jd = '';
    showError(null); renderStage1(); setStage(1);
  });
}
function downloadReport(r) {
  var rows = Object.keys(r.categories).map(function (k) {
    var c = r.categories[k];
    return '<tr><td>' + esc(c.label) + '</td><td>' + c.score + ' / ' + c.max + '</td><td>' + esc(c.detail) + '</td></tr>';
  }).join('');
  var li = function (items) { return items.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join(''); };
  var html = '<!doctype html><html><head><meta charset="utf-8"><title>ATS Resume Analysis Report</title>' +
    '<style>body{font-family:Arial,sans-serif;color:#111;padding:32px;max-width:800px;margin:auto}' +
    'h1{font-size:24px}h2{font-size:16px;margin-top:24px;border-bottom:1px solid #ddd;padding-bottom:4px}' +
    'table{width:100%;border-collapse:collapse;font-size:13px}td,th{border:1px solid #ddd;padding:6px 8px;text-align:left}' +
    'ul{font-size:13px}</style></head><body>' +
    '<h1>ATS Resume Analysis Report</h1>' +
    '<p><strong>Candidate:</strong> ' + esc(r.candidate.fullName) + '<br>' +
    '<strong>Experience:</strong> ' + esc(r.candidate.experienceLevel) + '<br>' +
    '<strong>Selected Career:</strong> ' + esc(r.career.icon) + ' ' + esc(r.career.title) + '<br>' +
    '<strong>Resume File:</strong> ' + esc(r.file.name) + '</p>' +
    '<h2>Overall ATS Score: ' + r.total + ' / 100 — ' + r.status + '</h2>' +
    '<table><tr><th>Category</th><th>Score</th><th>Detail</th></tr>' + rows + '</table>' +
    '<h2>Matched Skills</h2><ul>' + li(r.matchedSkills) + '</ul>' +
    '<h2>Missing / Recommended Skills</h2><ul>' + li(r.missingSkills) + '</ul>' +
    '<h2>Improvement Suggestions</h2><ul>' + r.suggestions.map(function (s) { return '<li><strong>' + esc(s.title) + ':</strong> ' + esc(s.body) + '</li>'; }).join('') + '</ul>' +
    '<p style="font-size:11px;color:#555;margin-top:24px">' + esc(r.disclaimer) + '</p></body></html>';
  var w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(function () { w.print(); }, 400);
}
renderStage1();
setStage(1);
})();








