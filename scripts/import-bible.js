#!/usr/bin/env node

/**
 * Bible Import Script for Logos AI
 * Imports Bible data from JSON files into PostgreSQL database
 * 
 * Usage:
 *   node scripts/import-bible.js [version-code] [file-path]
 *   node scripts/import-bible.js ESV public/bibles/ESV_bible.json
 *   node scripts/import-bible.js NIV public/bibles/NIV_bible.json
 *   node scripts/import-bible.js IBP public/bibles/IBP_bible.json
 *   node scripts/import-bible.js --all  // Import all files
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Bible version configurations
const BIBLE_VERSIONS = {
  ESV: {
    name: 'English Standard Version',
    language: 'en',
    publisher: 'Crossway',
    year: 2001,
    file: 'ESV_bible.json'
  },
  NIV: {
    name: 'New International Version',
    language: 'en',
    publisher: 'Biblica',
    year: 2011,
    file: 'NIV_bible.json'
  },
  IBP: {
    name: 'Indian Bible Publishers Hindi Bible',
    language: 'hi',
    publisher: 'Indian Bible Publishers',
    year: 1978,
    file: 'IBP_bible.json'
  },
  // Add more versions as needed
};

class BibleImporter {
  constructor() {
    this.stats = {
      versionsProcessed: 0,
      versesImported: 0,
      errors: 0,
      startTime: Date.now()
    };
  }

  /**
   * Import a single Bible version
   */
  async importVersion(versionCode, filePath) {
    console.log(`\n🔄 Starting import for ${versionCode}...`);
    
    try {
      // Validate file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Load and parse JSON
      console.log(`📖 Reading file: ${filePath}`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const bibleData = JSON.parse(fileContent);

      // Get or create Bible version
      const versionConfig = BIBLE_VERSIONS[versionCode] || {
        name: versionCode,
        language: 'en',
        publisher: 'Unknown',
        year: new Date().getFullYear()
      };

      const version = await this.ensureBibleVersion(versionCode, versionConfig);
      console.log(`✅ Bible version ready: ${version.name} (ID: ${version.id})`);

      // Import verses
      await this.importVerses(version.id, bibleData);
      
      this.stats.versionsProcessed++;
      console.log(`✅ Successfully imported ${versionCode}`);

    } catch (error) {
      console.error(`❌ Error importing ${versionCode}:`, error.message);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * Ensure Bible version exists in database
   */
  async ensureBibleVersion(code, config) {
    return await prisma.bibleVersion.upsert({
      where: { code },
      update: {
        name: config.name,
        language: config.language,
        publisher: config.publisher,
        year: config.year,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        code,
        name: config.name,
        language: config.language,
        publisher: config.publisher,
        year: config.year,
        isActive: true
      }
    });
  }

  /**
   * Import verses in batches for optimal performance
   */
  async importVerses(versionId, bibleData) {
    const books = Object.keys(bibleData);
    const batchSize = 500; // Smaller batch size to prevent timeout
    let totalVerses = 0;
    let processedVerses = 0;

    // Count total verses for progress tracking
    for (const book of books) {
      const chapters = Object.keys(bibleData[book]);
      for (const chapter of chapters) {
        totalVerses += Object.keys(bibleData[book][chapter]).length;
      }
    }

    console.log(`📊 Total verses to import: ${totalVerses.toLocaleString()}`);

    // Prepare verse data
    const verses = [];
    
    for (const book of books) {
      const chapters = Object.keys(bibleData[book]);
      
      for (const chapterNum of chapters) {
        const chapterData = bibleData[book][chapterNum];
        const verseNumbers = Object.keys(chapterData);
        
        for (const verseNum of verseNumbers) {
          verses.push({
            versionId,
            book,
            chapter: parseInt(chapterNum),
            verse: parseInt(verseNum),
            text: chapterData[verseNum]
          });

          // Process batch when it reaches batchSize
          if (verses.length >= batchSize) {
            await this.processBatch(verses, processedVerses, totalVerses);
            processedVerses += verses.length;
            verses.length = 0; // Clear array
          }
        }
      }
    }

    // Process remaining verses
    if (verses.length > 0) {
      await this.processBatch(verses, processedVerses, totalVerses);
      processedVerses += verses.length;
    }

    this.stats.versesImported += totalVerses;
    console.log(`✅ Imported ${totalVerses.toLocaleString()} verses`);
  }

  /**
   * Process a batch of verses with transaction safety
   */
  async processBatch(verses, processed, total) {
    try {
      // Use createMany without transaction for better performance with large datasets
      await prisma.bibleVerse.createMany({
        data: verses,
        skipDuplicates: true
      });

      const progress = ((processed + verses.length) / total * 100).toFixed(1);
      console.log(`⏳ Progress: ${progress}% (${(processed + verses.length).toLocaleString()}/${total.toLocaleString()} verses)`);

    } catch (error) {
      console.error(`❌ Batch import error:`, error.message);
      throw error;
    }
  }

  /**
   * Import all Bible versions from the bibles directory
   */
  async importAll() {
    const biblesDir = path.join(__dirname, '..', 'public', 'bibles');
    
    if (!fs.existsSync(biblesDir)) {
      throw new Error(`Bibles directory not found: ${biblesDir}`);
    }

    const files = fs.readdirSync(biblesDir).filter(file => file.endsWith('.json'));
    console.log(`📁 Found ${files.length} Bible files to import`);

    for (const file of files) {
      const versionCode = file.replace('_bible.json', '').replace('.json', '').toUpperCase();
      const filePath = path.join(biblesDir, file);
      
      try {
        await this.importVersion(versionCode, filePath);
      } catch (error) {
        console.error(`⚠️ Skipping ${file} due to error:`, error.message);
      }
    }
  }

  /**
   * Display import statistics
   */
  displayStats() {
    const duration = (Date.now() - this.stats.startTime) / 1000;
    console.log('\n📈 Import Statistics:');
    console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
    console.log(`📚 Versions processed: ${this.stats.versionsProcessed}`);
    console.log(`📝 Verses imported: ${this.stats.versesImported.toLocaleString()}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`⚡ Rate: ${Math.round(this.stats.versesImported / duration).toLocaleString()} verses/second`);
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    await prisma.$disconnect();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const importer = new BibleImporter();

  try {
    console.log('🚀 Bible Import Tool for Logos AI');
    console.log('==================================');

    if (args.length === 0 || args[0] === '--help') {
      console.log('\nUsage:');
      console.log('  node scripts/import-bible.js [version-code] [file-path]');
      console.log('  node scripts/import-bible.js ESV public/bibles/ESV_bible.json');
      console.log('  node scripts/import-bible.js NIV public/bibles/NIV_bible.json');
      console.log('  node scripts/import-bible.js IBP public/bibles/IBP_bible.json');
      console.log('  node scripts/import-bible.js --all');
      console.log('\nAvailable versions:', Object.keys(BIBLE_VERSIONS).join(', '));
      return;
    }

    if (args[0] === '--all') {
      await importer.importAll();
    } else if (args.length >= 2) {
      const versionCode = args[0].toUpperCase();
      const filePath = args[1];
      await importer.importVersion(versionCode, filePath);
    } else {
      throw new Error('Invalid arguments. Use --help for usage information.');
    }

    importer.displayStats();
    console.log('\n🎉 Import completed successfully!');

  } catch (error) {
    console.error('\n💥 Import failed:', error.message);
    process.exit(1);
  } finally {
    await importer.cleanup();
  }
}

// Handle uncaught errors
process.on('uncaughtException', async (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  await prisma.$disconnect();
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  await prisma.$disconnect();
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { BibleImporter };
