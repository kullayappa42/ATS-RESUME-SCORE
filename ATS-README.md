# PyProctor AI + ATS Resume Score Analyzer

Two apps in one monorepo. PyProctor AI (existing interview platform) lives at `/`.
The new ATS Resume Score Analyzer wizard lives at `/ats`.

## ATS feature layout


## Install and run

```powershell
cd backend; npm install
npx prisma generate
npx prisma db push
npm run dev
```

```powershell
cd frontend; npm install
npm run dev
```

Open http://localhost:3000/ats. Backend: http://127.0.0.1:5000.
Env: `DATABASE_URL="file:./dev.db"`, `PORT=5000`, plus existing JWT/SMTP vars.
Postgres prod: switch datasource provider to `postgresql` and set its URL.

## Scoring (0-100, no randomness)

Skills 30, Experience 20, Structure 15, Keywords 15, Education 10, Formatting 10.
Word-boundary regex with aliases (JS, Node, sklearn, REST/RESTful). Status:
75+ GOOD green, 50-74 MEDIUM orange, else LOW red, always with text + disclaimer.
Sample resume scores: Python 100 GOOD, Java 90 GOOD, Data Science 62 MEDIUM,
Web 86 GOOD. JD match is separate. Uploads stay in memory (5 MB, PDF/DOCX);
excerpts stored only with consent; report HTML escaped.

Backend: `backend/src/services/ats/` (careerProfiles, textUtils, signals,
scorer, scorerRest, resumeParser, jdMatch), route `backend/src/routes/ats.routes.ts`,
model `AtsAnalysis` in `backend/prisma/schema.prisma`, sample resume in
`backend/src/services/ats/__tests__/sample-resume.txt`.
Frontend: `frontend/src/app/ats/` (page, types, atsApi, StageProgress,
stages, ResultsDashboard). Home page links to `/ats`.
