/* ATS Resume Score Analyzer — static in-browser core.
   Ported 1:1 from backend/src/services/ats/ (careerProfiles, textUtils,
   signals, scorer, scorerRest, jdMatch). No backend needed. */
var ATSCore = (function () {
'use strict';

/* ---------------- careerProfiles ---------------- */
var CAREER_PROFILES = {
  'python-fullstack': {
    id: 'python-fullstack',
    title: 'Python Full Stack',
    icon: '🐍',
    tagline: 'Backend + frontend with Python, Django/Flask and REST APIs',
    displaySkills: ['Python', 'HTML', 'CSS', 'JavaScript', 'SQL', 'Django / Flask', 'REST API', 'Git / GitHub'],
    skills: ['Python', 'OOP', 'Data Structures', 'HTML', 'CSS', 'JavaScript', 'SQL', 'MySQL', 'Django', 'Flask', 'REST API', 'Git', 'GitHub', 'React'],
    keywords: ['Python', 'Django', 'Flask', 'REST API', 'HTML', 'CSS', 'JavaScript', 'SQL', 'MySQL', 'PostgreSQL', 'Git', 'GitHub', 'OOP', 'API', 'Docker', 'AWS', 'Testing', 'Agile'],
    recommendedSkills: ['Django', 'Flask', 'REST API', 'React', 'Docker', 'AWS', 'PostgreSQL', 'Testing'],
    synonyms: {}
  },
  'java-fullstack': {
    id: 'java-fullstack',
    title: 'Java Full Stack',
    icon: '☕',
    tagline: 'Enterprise apps with Java, Spring Boot and modern frontend',
    displaySkills: ['Java', 'HTML', 'CSS', 'JavaScript', 'SQL', 'Spring Boot', 'REST API', 'Git / GitHub'],
    skills: ['Java', 'OOP', 'Data Structures', 'HTML', 'CSS', 'JavaScript', 'SQL', 'MySQL', 'Spring Boot', 'Spring', 'REST API', 'Git', 'GitHub', 'React'],
    keywords: ['Java', 'Spring Boot', 'Spring', 'REST API', 'HTML', 'CSS', 'JavaScript', 'SQL', 'MySQL', 'Git', 'GitHub', 'OOP', 'API', 'Maven', 'Docker', 'AWS', 'Microservices', 'Testing'],
    recommendedSkills: ['Spring Boot', 'Microservices', 'React', 'Docker', 'AWS', 'Maven', 'Testing'],
    synonyms: {}
  },
  'data-science': {
    id: 'data-science',
    title: 'Data Science',
    icon: '📊',
    tagline: 'Analytics, ML models and dashboards from real data',
    displaySkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Matplotlib', 'Machine Learning', 'Statistics', 'Power BI / Tableau'],
    skills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Matplotlib', 'Machine Learning', 'Statistics', 'Power BI', 'Tableau', 'Scikit-learn', 'Data Visualization', 'Excel'],
    keywords: ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Statistics', 'Data Analysis', 'Visualization', 'Power BI', 'Tableau', 'Scikit-learn', 'TensorFlow', 'Excel', 'Matplotlib', 'Seaborn', 'Model'],
    recommendedSkills: ['Scikit-learn', 'TensorFlow', 'Seaborn', 'Power BI', 'Tableau', 'Statistics', 'SQL'],
    synonyms: {}
  },
  'web-developer': {
    id: 'web-developer',
    title: 'Web Application Developer',
    icon: '🌐',
    tagline: 'Responsive apps with React, Node.js and REST APIs',
    displaySkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'REST API', 'Git / GitHub'],
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'REST API', 'Git', 'GitHub', 'TypeScript', 'Express', 'MongoDB'],
    keywords: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'SQL', 'MongoDB', 'REST API', 'Git', 'GitHub', 'TypeScript', 'API', 'Responsive', 'Testing', 'AWS'],
    recommendedSkills: ['TypeScript', 'Express', 'MongoDB', 'Testing', 'Responsive Design', 'AWS'],
    synonyms: {}
  }
};

var GLOBAL_SYNONYMS = {
  'JavaScript': ['js', 'javascript'],
  'TypeScript': ['ts', 'typescript'],
  'PostgreSQL': ['postgres', 'postgresql'],
  'MySQL': ['mysql'],
  'Node.js': ['node', 'node js', 'nodejs', 'node.js'],
  'REST API': ['rest', 'rest api', 'restful', 'restful api'],
  'GitHub': ['github'],
  'Scikit-learn': ['scikit learn', 'scikit-learn', 'sklearn'],
  'Power BI': ['power bi', 'powerbi'],
  'Spring Boot': ['spring boot', 'springboot'],
  'Machine Learning': ['machine learning', 'ml'],
  'Data Structures': ['data structures', 'dsa'],
  'OOP': ['oop', 'object oriented programming', 'object-oriented programming']
};

function listCareerProfiles() {
  return Object.keys(CAREER_PROFILES).map(function (k) { return CAREER_PROFILES[k]; });
}
function getCareerProfile(id) { return CAREER_PROFILES[id]; }

/* ---------------- textUtils ---------------- */
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function phraseRegex(phrase) {
  var tokens = String(phrase).trim().split(/\s+/).map(escapeRegExp);
  var pattern = tokens.join('[\\s._/\\-]*');
  return new RegExp('(?<![\\p{L}\\p{N}+#])' + pattern + '(?![\\p{L}\\p{N}+#])', 'iu');
}
function containsPhrase(rawLower, phrase) {
  try { return phraseRegex(phrase).test(rawLower); }
  catch (e) { return rawLower.indexOf(String(phrase).toLowerCase()) !== -1; }
}
var SECTION_PATTERNS = [
  { key: 'contact', label: 'Contact Information', patterns: [/[\w.+-]+@[\w-]+\.[\w.]+/, /(\+?\d[\d\s-]{7,}\d)/] },
  { key: 'summary', label: 'Professional Summary', patterns: [/\b(summary|objective|profile|about me|career objective)\b/i] },
  { key: 'education', label: 'Education', patterns: [/\b(education|academic|university|college|b\.?tech|bachelor|master|m\.?tech|bca|mca|degree|cgpa|gpa)\b/i] },
  { key: 'skills', label: 'Technical Skills', patterns: [/\b(skills|technical skills|tech stack|technologies|core competencies)\b/i] },
  { key: 'projects', label: 'Projects', patterns: [/\b(projects?|personal projects?|academic projects?)\b/i] },
  { key: 'experience', label: 'Experience', patterns: [/\b(experience|work experience|employment|internship|internships|work history)\b/i] },
  { key: 'certifications', label: 'Certifications', patterns: [/\b(certifications?|certified|certificate|coursera|udemy|credentials)\b/i] }
];
function analyzeSections(rawText) {
  return SECTION_PATTERNS.map(function (s) {
    return { key: s.key, label: s.label, found: s.patterns.some(function (re) { return re.test(rawText); }) };
  });
}

/* ---------------- signals ---------------- */
var PROJECT_SIGNALS = ['project', 'developed', 'built', 'created', 'implemented', 'designed', 'deployed', 'github.com', 'live demo', 'demo', 'internship', 'intern', 'experience', 'worked', 'contributed', 'led', 'managed', 'achieved'];
function experienceSignals(rawLower) {
  var hits = PROJECT_SIGNALS.filter(function (sig) {
    try { return phraseRegex(sig).test(rawLower); }
    catch (e) { return rawLower.indexOf(sig) !== -1; }
  });
  var hasMetrics = /%|\b\d+\s*(%|\+|x|users|records|requests|ms|times|faster|reduced|improved|increased)/i.test(rawLower);
  var projectCount = (rawLower.match(/\bproject\b/gi) || []).length;
  return { hits: hits, hasMetrics: hasMetrics, projectCount: projectCount };
}
var DEGREE_PATTERNS = [/\bb\.?\s?tech\b/i, /\bm\.?\s?tech\b/i, /\bbachelor/i, /\bmaster\b/i, /\bmba\b/i, /\bbca\b/i, /\bmca\b/i, /\bb\.?\s?sc\b/i, /\bm\.?\s?sc\b/i, /\bph\.?d\b/i, /\bdiploma\b/i, /\bdegree\b/i, /\buniversity\b/i, /\bcollege\b/i, /\bcgpa\b/i, /\bgpa\b/i];
function educationSignals(rawText) {
  var hits = 0;
  for (var i = 0; i < DEGREE_PATTERNS.length; i++) if (DEGREE_PATTERNS[i].test(rawText)) hits += 1;
  var hasDegree = /b\.?\s?tech|m\.?\s?tech|bachelor|master|mba|bca|mca|degree|university|college/i.test(rawText);
  var hasScore = /cgpa|gpa|\d(\.\d+)?\s*\/\s*10|\b\d{2,3}\s*%/.test(rawText);
  return { hits: hits, hasDegree: hasDegree, hasScore: hasScore };
}
function formattingSignals(rawText) {
  var text = rawText || '';
  var lines = text.split(/\r?\n/);
  var charCount = text.length;
  var lineCount = lines.filter(function (l) { return l.trim().length > 0; }).length;
  var headingHits = lines.filter(function (l) {
    var t = l.trim();
    return /^[A-Z][A-Z\s&/]{3,40}$/.test(t) || /^(summary|skills|education|projects?|experience|certifications?|contact)\b/i.test(t);
  }).length;
  var bulletCount = (text.match(/[•\-*▪►]/g) || []).length;
  var tableLikeLines = lines.filter(function (l) { return (l.match(/\|/g) || []).length >= 2; }).length;
  var unusual = (text.match(/[�□■◆●★☆♠♣♥♦⬛⬜🔹🔸📌📍✅❌]/g) || []).length;
  var issues = [];
  if (charCount < 500) issues.push('Resume text is very short — it may be missing key sections or failed to extract.');
  if (lineCount < 15) issues.push('Few distinct lines detected — use clear line breaks and standard section headings.');
  if (headingHits < 2) issues.push('Add clear standard headings (Summary, Skills, Education, Projects, Experience).');
  if (tableLikeLines > 6) issues.push('Avoid heavy tables — many ATS parsers misread table layouts.');
  if (unusual > 10) issues.push('Avoid graphics, icons and unusual symbols — prefer plain text bullets.');
  if (bulletCount === 0) issues.push('Use simple bullet points for achievements and responsibilities.');
  return { charCount: charCount, lineCount: lineCount, hasHeadings: headingHits >= 2, bulletCount: bulletCount, tableLikeLines: tableLikeLines, issues: issues };
}

/* ---------------- scorer (skills/keywords/sections) ---------------- */
function aliasesFor(skill) {
  var out = {};
  out[skill] = true;
  var g = GLOBAL_SYNONYMS[skill];
  if (g) g.forEach(function (a) { out[a] = true; });
  var low = String(skill).toLowerCase();
  if (low === 'rest api') { out.rest = true; out.restful = true; out['restful api'] = true; }
  if (low === 'node.js') { out.node = true; out.nodejs = true; }
  if (low === 'javascript') out.js = true;
  if (low === 'scikit-learn') out.sklearn = true;
  if (low === 'power bi') out.powerbi = true;
  if (low === 'spring boot') out.springboot = true;
  return Object.keys(out);
}
function skillPresent(rawLower, skill) {
  return aliasesFor(skill).some(function (a) { return containsPhrase(rawLower, a); });
}
function buildSuggestions(profile, missingSkills, sections, exp, fmt, keywordsMissing) {
  var out = [];
  var missing = sections.filter(function (s) { return !s.found; });
  var topMissing = missingSkills.slice(0, 3);
  if (topMissing.length) {
    out.push({ title: 'Improve Skills Section', body: 'Add relevant technologies such as ' + topMissing.join(', ') + ' if you have genuinely used them in coursework, projects or internships. Only list skills you can demonstrate - never invent proficiency.' });
  }
  if (!exp.hasMetrics) {
    out.push({ title: 'Improve Projects', body: 'Add measurable results to your project descriptions. Only describe work you actually did.' });
  }
  missing.slice(0, 3).forEach(function (m) {
    if (m.key === 'summary') out.push({ title: 'Add a Professional Summary', body: 'Add a 2-3 line summary targeting ' + profile.title + ' with your strongest genuine skills.' });
    else if (m.key === 'experience') out.push({ title: 'Add Experience / Internships', body: 'List internships, freelance work or significant coursework with bullet points.' });
    else if (m.key === 'certifications') out.push({ title: 'Add Certifications', body: 'List only certifications you have actually earned, with issuer and year.' });
    else out.push({ title: 'Add: ' + m.label, body: 'Your resume appears to be missing a ' + m.label + ' section. Add one with a standard heading.' });
  });
  if (fmt.issues.length) {
    out.push({ title: 'Fix ATS Formatting', body: fmt.issues[0] + ' Use single-column layout, standard fonts, plain bullets.' });
  }
  if (keywordsMissing.length) {
    out.push({ title: 'Add Role Keywords Naturally', body: 'Consider weaving in role keywords where truthful: ' + keywordsMissing.slice(0, 4).join(', ') + '.' });
  }
  return out.slice(0, 7);
}
function findSection(sections, key) {
  for (var i = 0; i < sections.length; i++) if (sections[i].key === key) return sections[i];
  return {};
}
function analyzeResume(rawText, profile) {
  var rawLower = (rawText || '').toLowerCase();
  var matchedSkills = [], missingSkills = [];
  profile.skills.forEach(function (s) {
    if (skillPresent(rawLower, s)) matchedSkills.push(s); else missingSkills.push(s);
  });
  var skillsScore = Math.round((profile.skills.length ? matchedSkills.length / profile.skills.length : 0) * 30);
  var seen = {}, keywordsFound = [], keywordsMissing = [];
  profile.keywords.forEach(function (k) {
    var key = k.toLowerCase();
    if (seen[key]) return;
    seen[key] = true;
    if (skillPresent(rawLower, k)) keywordsFound.push(k); else keywordsMissing.push(k);
  });
  var keywordsScore = Math.round((profile.keywords.length ? keywordsFound.length / profile.keywords.length : 0) * 15);
  var sections = analyzeSections(rawText);
  var foundCount = sections.filter(function (s) { return s.found; }).length;
  var structureScore = Math.round((sections.length ? foundCount / sections.length : 0) * 15);
  var exp = experienceSignals(rawLower);
  var hasProjects = !!findSection(sections, 'projects').found;
  var hasExperience = !!findSection(sections, 'experience').found;
  var expScore = 0, expNotes = [];
  if (hasProjects) { expScore += 8; expNotes.push('projects section present'); }
  if (hasExperience) { expScore += 6; expNotes.push('experience/internship section present'); }
  if (exp.hits.length >= 4) { expScore += 3; expNotes.push('strong action verbs'); }
  else if (exp.hits.length >= 2) { expScore += 2; expNotes.push('some project language'); }
  if (exp.hasMetrics) { expScore += 3; expNotes.push('quantified results'); }
  expScore = Math.min(20, expScore);
  var edu = educationSignals(rawText);
  var hasEduSection = !!findSection(sections, 'education').found;
  var eduScore = 0;
  if (hasEduSection) eduScore += 4;
  if (edu.hasDegree) eduScore += 4;
  if (edu.hasScore) eduScore += 2;
  eduScore = Math.min(10, eduScore);
  var fmt = formattingSignals(rawText);
  var fmtScore = 10;
  fmt.issues.forEach(function (issue) {
    if (issue.indexOf('Resume text is very short') === 0) fmtScore -= 4; else fmtScore -= 2;
  });
  fmtScore = Math.max(0, Math.min(10, fmtScore));
  var categories = {
    skills: { score: skillsScore, max: 30, label: 'Skills Match', detail: matchedSkills.length + '/' + profile.skills.length + ' role skills found' },
    experience: { score: expScore, max: 20, label: 'Experience & Projects', detail: expNotes.join(', ') || 'add projects/internships with measurable outcomes' },
    structure: { score: structureScore, max: 15, label: 'Resume Structure', detail: foundCount + '/' + sections.length + ' standard sections found' },
    keywords: { score: keywordsScore, max: 15, label: 'Keywords', detail: keywordsFound.length + '/' + profile.keywords.length + ' role keywords found' },
    education: { score: eduScore, max: 10, label: 'Education', detail: hasEduSection ? 'education section with degree info' : 'add an education section with degree and scores' },
    formatting: { score: fmtScore, max: 10, label: 'ATS Formatting', detail: fmt.issues.length ? fmt.issues[0] : 'clean, parseable formatting' }
  };
  var total = skillsScore + expScore + structureScore + keywordsScore + eduScore + fmtScore;
  var status = total >= 75 ? 'GOOD' : total >= 50 ? 'MEDIUM' : 'LOW';
  return {
    total: total, status: status, categories: categories,
    matchedSkills: matchedSkills, missingSkills: missingSkills,
    keywordsFound: keywordsFound, keywordsMissing: keywordsMissing.slice(0, 8),
    sections: sections,
    suggestions: buildSuggestions(profile, missingSkills, sections, exp, fmt, keywordsMissing),
    formattingIssues: fmt.issues,
    charCount: rawText.length,
    disclaimer: 'ATS Score is an estimate based on scoring criteria.'
  };
}

/* ---------------- jdMatch ---------------- */
var STOPWORDS = { and: 1, the: 1, for: 1, with: 1, you: 1, your: 1, our: 1, are: 1, will: 1, have: 1, has: 1, from: 1, that: 1, this: 1, role: 1, job: 1, work: 1, team: 1, ability: 1, strong: 1, plus: 1, etc: 1, including: 1, ideal: 1, looking: 1, seeking: 1, must: 1, should: 1 };
function jdKeywords(jd) {
  var words = (jd || '').toLowerCase().replace(/[^a-z0-9+#./\s-]/g, ' ').split(/\s+/);
  var freq = {};
  words.forEach(function (w) {
    var t = w.trim();
    if (t.length < 3 || STOPWORDS[t] || /^\d+$/.test(t)) return;
    freq[t] = (freq[t] || 0) + 1;
  });
  return Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 30);
}
function matchJobDescription(resumeText, jdText, roleKeywords) {
  var resumeLower = (resumeText || '').toLowerCase();
  var jdTerms = jdKeywords(jdText);
  var pool = [];
  (roleKeywords || []).concat(jdTerms).forEach(function (t) { if (pool.indexOf(t) === -1) pool.push(t); });
  pool = pool.slice(0, 30);
  var matching = [], missing = [];
  pool.forEach(function (term) {
    if (containsPhrase(resumeLower, term)) matching.push(term); else missing.push(term);
  });
  var matchScore = pool.length ? Math.round((matching.length / pool.length) * 100) : 0;
  return { matchScore: matchScore, matchingKeywords: matching.slice(0, 20), missingKeywords: missing.slice(0, 20), note: 'Job-description match is informational and separate from the base ATS score.' };
}

return {
  listCareerProfiles: listCareerProfiles,
  getCareerProfile: getCareerProfile,
  analyzeResume: analyzeResume,
  matchJobDescription: matchJobDescription
};
})();
if (typeof window !== 'undefined') window.ATSCore = ATSCore;






