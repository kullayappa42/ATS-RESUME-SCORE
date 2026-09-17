import { Router, Request, Response } from 'express';
import multer from 'multer';
import { getCareerProfile, listCareerProfiles } from '../services/ats/careerProfiles';
import { extractText } from '../services/ats/resumeParser';
import { analyzeResume } from '../services/ats/scorer';
import prisma from '../config/db';
import { improvementPlan, matchJobDescription } from '../services/ats/jdMatch';
import { sanitizeExcerpt } from '../services/ats/signals';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      /\.pdf$/i.test(file.originalname) ||
      /\.docx$/i.test(file.originalname);
    if (ok) cb(null, true);
    else cb(new Error('Unsupported file type. Please upload a PDF or DOCX file.'));
  },
});

router.get('/careers', (_req: Request, res: Response) => {
  res.json({
    careers: listCareerProfiles().map((c) => ({
      id: c.id, title: c.title, icon: c.icon, tagline: c.tagline, skills: c.displaySkills,
    })),
    weights: { skills: 30, experience: 20, structure: 15, keywords: 15, education: 10, formatting: 10 },
  });
});

// POST /api/ats/analyze (multipart: resume file + fields)
router.post('/analyze', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const fullName = String(body.fullName || '');
    const experienceLevel = String(body.experienceLevel || '');
    const careerId = String(body.careerId || '');
    const jobDescription = String(body.jobDescription || '');
    const consentStore = String(body.consentStore || '');
    if (!fullName.trim()) { res.status(400).json({ error: 'Full name is required.' }); return; }
    const levels = ['Fresher', '0-1 Years', '1-3 Years', '3+ Years'];
    if (!levels.includes(experienceLevel)) { res.status(400).json({ error: 'Please select a valid experience level.' }); return; }
    const profile = getCareerProfile(careerId);
    if (!profile) { res.status(400).json({ error: 'Please select a target career path.' }); return; }
    if (!req.file) { res.status(400).json({ error: 'No file uploaded. Please upload a PDF or DOCX resume.' }); return; }
    let rawText = '';
    try {
      rawText = await extractText(req.file.buffer, req.file.mimetype, req.file.originalname);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Resume parse failed';
      res.status(422).json({ error: msg }); return;
    }
    const clean = sanitizeExcerpt(rawText, 20000);
    if (!clean || clean.trim().length < 50) {
      res.status(422).json({ error: "We couldn't extract readable text from this resume. Please upload a text-based PDF or DOCX file." }); return;
    }
    const analysis = analyzeResume(clean, profile);
    const jd = matchJobDescription(clean, jobDescription, profile.keywords);
    const plan = improvementPlan(clean, analysis.missingSkills, profile.title);
    let recordId: string | null = null;
    try {
      const rec = await prisma.atsAnalysis.create({
        data: {
          fullName: fullName.trim(),
          experienceLevel, careerId: profile.id, careerTitle: profile.title,
          fileName: req.file.originalname, fileSize: req.file.size, mimeType: req.file.mimetype,
          totalScore: analysis.total, status: analysis.status,
          categories: JSON.stringify(analysis.categories),
          matchedSkills: JSON.stringify(analysis.matchedSkills),
          missingSkills: JSON.stringify(analysis.missingSkills),
          keywordsFound: JSON.stringify(analysis.keywordsFound),
          keywordsMissing: JSON.stringify(analysis.keywordsMissing),
          sections: JSON.stringify(analysis.sections),
          suggestions: JSON.stringify(analysis.suggestions),
          jdMatchScore: jd.matchScore,
          resumeExcerpt: consentStore === 'true' ? clean.slice(0, 4000) : null,
        },
      });
      recordId = rec.id;
    } catch (dbErr) {
      console.warn('[ATS] persist skipped:', (dbErr as Error)?.message);
    }
    res.json({
      id: recordId,
      candidate: { fullName, experienceLevel },
      career: { id: profile.id, title: profile.title, icon: profile.icon },
      file: { name: req.file.originalname, size: req.file.size },
      total: analysis.total, status: analysis.status, categories: analysis.categories,
      matchedSkills: analysis.matchedSkills, missingSkills: analysis.missingSkills,
      keywordsFound: analysis.keywordsFound, keywordsMissing: analysis.keywordsMissing,
      sections: analysis.sections, suggestions: analysis.suggestions,
      formattingIssues: analysis.formattingIssues, charCount: analysis.charCount,
      disclaimer: analysis.disclaimer,
      jdMatch: jobDescription.trim() ? jd : null,
      improvementPlan: plan,
    });
  } catch (err: unknown) {
    const mErr = err as { code?: string };
    if (mErr && mErr.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'File is too large. Maximum size is 5 MB.' }); return;
    }
    if (err instanceof Error && /unsupported file type/i.test(err.message)) {
      res.status(400).json({ error: err.message }); return;
    }
    console.error('[ATS] analyze failed:', err);
    res.status(500).json({ error: 'Analysis failed. Please try again with a text-based PDF or DOCX file.' });
  }
});

router.get('/history', async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.atsAnalysis.findMany({
      orderBy: { createdAt: 'desc' }, take: 20,
      select: { id: true, fullName: true, careerTitle: true, totalScore: true, status: true, fileName: true, createdAt: true },
    });
    res.json({ history: rows });
  } catch {
    res.status(500).json({ error: 'Could not load history.' });
  }
});

export default router;
