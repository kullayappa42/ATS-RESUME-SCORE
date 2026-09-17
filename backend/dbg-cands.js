require('dotenv').config();
console.log('DATABASE_URL=' + process.env.DATABASE_URL);
console.log('CWD=' + process.cwd());
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function main() {
  const cands = await prisma.candidate.findMany({ orderBy: { createdAt: 'desc' }, take: 30 });
  console.log('CANDIDATES: ' + cands.length);
  for (const c of cands) {
    console.log(c.createdAt.toISOString() + ' | ' + c.name + ' <' + c.email + '> id=' + c.id + ' access=' + c.access_granted);
  }
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
