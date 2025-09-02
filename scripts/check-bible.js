const { PrismaClient } = require('@prisma/client');

async function checkBibles() {
  const prisma = new PrismaClient();
  try {
    const versions = await prisma.bibleVersion.findMany({
      include: {
        _count: {
          select: { verses: true }
        }
      }
    });
    
    console.log('📚 Bible Versions in Database:');
    versions.forEach(v => {
      console.log(`✅ ${v.name} (${v.code}): ${v._count.verses.toLocaleString()} verses [${v.language}]`);
    });
    
    const totalVerses = await prisma.bibleVerse.count();
    console.log(`\n📊 Total verses: ${totalVerses.toLocaleString()}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBibles();
