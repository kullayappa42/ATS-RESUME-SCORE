const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.inviteToken.count();
  console.log('TOTAL TOKENS: ' + total);
  const wanted = [
    '4a1b1c508786fba333e6a77b209fe04970e809ffc90f8411b44ee415aef891f7',
    '26c74db301fd76cd6b8666e8e98792eddf7dc75500b6b78d67a7f1f47248c5bf',
    '2fb887cfc96a79697b5ca2c25a834f690942cc4099c78444c087b8d93e68f4ad',
    '0e3e9c7c468d413e2b0141813deedc543624a8b302e25a45dc641896f510e13e'
  ];
  for (const t of wanted) {
    const r = await prisma.inviteToken.findUnique({ where: { token: t }, include: { candidate: true } });
    console.log(t.slice(0,8) + '... found=' + !!r + (r ? ' cand=' + r.candidate?.name + ' status=' + r.status + ' exp=' + r.expires_at : ''));
  }
  // list ALL tokens newest first (no take limit relevant)
  const all = await prisma.inviteToken.findMany({ include: { candidate: true }, orderBy: { createdAt: 'desc' } });
  console.log('--- ALL (newest first) ---');
  for (const x of all) {
    console.log(x.createdAt.toISOString() + ' | ' + x.candidate?.name + ' <' + x.candidate?.email + '> | ' + x.status + ' | exp=' + x.expires_at.toISOString() + ' | LINK=http://localhost:3000/interview/' + x.token + '/terms');
  }
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
