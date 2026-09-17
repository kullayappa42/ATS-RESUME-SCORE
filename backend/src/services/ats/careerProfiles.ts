// ─────────────────────────────────────────────────────────────
// ATS Resume Score Analyzer — Career profiles
// Each profile is modular: add a new key to support a new path.
// ─────────────────────────────────────────────────────────────

export interface CareerProfile {
  id: string;
  title: string;
  icon: string;
  tagline: string;
  displaySkills: string[]; // shown on the selectable card
  skills: string[];        // canonical skills used for Skills Match (30 pts)
  keywords: string[];      // keywords used for Keyword analysis (15 pts)
  recommendedSkills: string[]; // extra skills suggested as "to consider"
  synonyms: Record<string, string[]>; // canonical -> alias spellings
}

export const CAREER_PROFILES: Record<string, CareerProfile> = {
  'python-fullstack': {
    id: 'python-fullstack',
    title: 'Python Full Stack',
    icon: '🐍',
    tagline: 'Backend + frontend with Python, Django/Flask and REST APIs',
    displaySkills: ['Python', 'HTML', 'CSS', 'JavaScript', 'SQL', 'Django / Flask', 'REST API', 'Git / GitHub'],
    skills: [
      'Python', 'OOP', 'Data Structures', 'HTML', 'CSS', 'JavaScript',
      'SQL', 'MySQL', 'Django', 'Flask', 'REST API', 'Git', 'GitHub', 'React',
    ],
    keywords: [
      'Python', 'Django', 'Flask', 'REST API', 'HTML', 'CSS', 'JavaScript',
      'SQL', 'MySQL', 'PostgreSQL', 'Git', 'GitHub', 'OOP', 'API',
      'Docker', 'AWS', 'Testing', 'Agile',
    ],
    recommendedSkills: ['Django', 'Flask', 'REST API', 'React', 'Docker', 'AWS', 'PostgreSQL', 'Testing'],
    synonyms: {},
  },
  'java-fullstack': {
    id: 'java-fullstack',
    title: 'Java Full Stack',
    icon: '☕',
    tagline: 'Enterprise apps with Java, Spring Boot and modern frontend',
    displaySkills: ['Java', 'HTML', 'CSS', 'JavaScript', 'SQL', 'Spring Boot', 'REST API', 'Git / GitHub'],
    skills: [
      'Java', 'OOP', 'Data Structures', 'HTML', 'CSS', 'JavaScript',
      'SQL', 'MySQL', 'Spring Boot', 'Spring', 'REST API', 'Git', 'GitHub', 'React',
    ],
    keywords: [
      'Java', 'Spring Boot', 'Spring', 'REST API', 'HTML', 'CSS', 'JavaScript',
      'SQL', 'MySQL', 'Git', 'GitHub', 'OOP', 'API', 'Maven',
      'Docker', 'AWS', 'Microservices', 'Testing',
    ],
    recommendedSkills: ['Spring Boot', 'Microservices', 'React', 'Docker', 'AWS', 'Maven', 'Testing'],
    synonyms: {},
  },
  'data-science': {
    id: 'data-science',
    title: 'Data Science',
    icon: '📊',
    tagline: 'Analytics, ML models and dashboards from real data',
    displaySkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Matplotlib', 'Machine Learning', 'Statistics', 'Power BI / Tableau'],
    skills: [
      'Python', 'SQL', 'Pandas', 'NumPy', 'Matplotlib', 'Machine Learning',
      'Statistics', 'Power BI', 'Tableau', 'Scikit-learn', 'Data Visualization', 'Excel',
    ],
    keywords: [
      'Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Statistics',
      'Data Analysis', 'Visualization', 'Power BI', 'Tableau', 'Scikit-learn',
      'TensorFlow', 'Excel', 'Matplotlib', 'Seaborn', 'Model',
    ],
    recommendedSkills: ['Scikit-learn', 'TensorFlow', 'Seaborn', 'Power BI', 'Tableau', 'Statistics', 'SQL'],
    synonyms: {},
  },
  'web-developer': {
    id: 'web-developer',
    title: 'Web Application Developer',
    icon: '🌐',
    tagline: 'Responsive apps with React, Node.js and REST APIs',
    displaySkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'REST API', 'Git / GitHub'],
    skills: [
      'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL',
      'REST API', 'Git', 'GitHub', 'TypeScript', 'Express', 'MongoDB',
    ],
    keywords: [
      'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'SQL',
      'MongoDB', 'REST API', 'Git', 'GitHub', 'TypeScript', 'API',
      'Responsive', 'Testing', 'AWS',
    ],
    recommendedSkills: ['TypeScript', 'Express', 'MongoDB', 'Testing', 'Responsive Design', 'AWS'],
    synonyms: {},
  },
};

// ── Global skill aliases: canonical -> accepted alternate spellings ──
// Normalization is case-insensitive; matching uses word-boundary regex.
export const GLOBAL_SYNONYMS: Record<string, string[]> = {
  JavaScript: ['js', 'javascript'],
  TypeScript: ['ts', 'typescript'],
  PostgreSQL: ['postgres', 'postgresql'],
  MySQL: ['mysql'],
  'Node.js': ['node', 'node js', 'nodejs', 'node.js'],
  'REST API': ['rest', 'rest api', 'restful', 'restful api'],
  GitHub: ['github'],
  'Scikit-learn': ['scikit learn', 'scikit-learn', 'sklearn'],
  'Power BI': ['power bi', 'powerbi'],
  'Spring Boot': ['spring boot', 'springboot'],
  'Machine Learning': ['machine learning', 'ml'],
  'Data Structures': ['data structures', 'dsa'],
  OOP: ['oop', 'object oriented programming', 'object-oriented programming'],
};

export function listCareerProfiles(): CareerProfile[] {
  return Object.values(CAREER_PROFILES);
}

export function getCareerProfile(id: string): CareerProfile | undefined {
  return CAREER_PROFILES[id];
}
