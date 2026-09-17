const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tokens = await prisma.inviteToken.findMany({
    include: { candidate: true },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  console.log('COUNT:' + tokens.length);
  for (const x of tokens) {
    console.log('---');
    console.log('CANDIDATE:' + x.candidate?.name + ' <' + x.candidate?.email + '> id=' + x.candidate_id);
    console.log('TOKEN:' + x.token);
    console.log('STATUS:' + x.status + ' EXPIRES:' + x.expires_at + ' CREATED:' + x.createdAt);
    console.log('LINK:http://localhost:3000/interview/' + x.token + '/terms');
  }
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
