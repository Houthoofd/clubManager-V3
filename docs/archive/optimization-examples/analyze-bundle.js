#!/usr/bin/env node

/**
 * Bundle Analysis Script for ClubManager V3
 *
 * Analyzes the built bundles and provides optimization suggestions
 *
 * Usage:
 *   node analyze-bundle.js
 *
 * Prerequisites:
 *   - Build the project first: npm run build
 *   - Install dependencies: npm install
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

// Configuration
const CONFIG = {
  distDir: path.join(__dirname, '../../frontend/dist'),
  assetsDir: path.join(__dirname, '../../frontend/dist/assets'),
  packageJson: path.join(__dirname, '../../frontend/package.json'),
  thresholds: {
    js: 300 * 1024,      // 300 KB for JS files
    css: 50 * 1024,      // 50 KB for CSS files
    total: 800 * 1024,   // 800 KB total
  },
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatPercentage(value) {
  return `${(value * 100).toFixed(1)}%`;
}

async function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const buffer = fs.readFileSync(filePath);

  const gzipped = await gzip(buffer);
  const brotlied = await brotli(buffer);

  return {
    raw: stats.size,
    gzip: gzipped.length,
    brotli: brotlied.length,
  };
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

async function analyzeBundles() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('  📊 ClubManager V3 - Bundle Analysis', colors.bold + colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);

  // Check if dist directory exists
  if (!fs.existsSync(CONFIG.distDir)) {
    log('❌ Error: dist directory not found!', colors.red);
    log('   Please run "npm run build" first.\n', colors.yellow);
    process.exit(1);
  }

  // Get all files
  const allFiles = getAllFiles(CONFIG.distDir);

  const jsFiles = allFiles.filter(f => f.endsWith('.js'));
  const cssFiles = allFiles.filter(f => f.endsWith('.css'));
  const imageFiles = allFiles.filter(f => /\.(png|jpe?g|gif|svg|webp|avif)$/i.test(f));
  const fontFiles = allFiles.filter(f => /\.(woff2?|ttf|eot)$/i.test(f));

  log('📦 Bundle Summary:', colors.bold);
  log(`   JavaScript files: ${jsFiles.length}`);
  log(`   CSS files: ${cssFiles.length}`);
  log(`   Images: ${imageFiles.length}`);
  log(`   Fonts: ${fontFiles.length}\n`);

  // Analyze JS files
  log('🟨 JavaScript Files:', colors.bold + colors.yellow);
  log('─'.repeat(60), colors.yellow);

  let totalJsRaw = 0;
  let totalJsGzip = 0;
  let totalJsBrotli = 0;
  const jsAnalysis = [];

  for (const file of jsFiles) {
    const sizes = await getFileSize(file);
    const filename = path.basename(file);

    totalJsRaw += sizes.raw;
    totalJsGzip += sizes.gzip;
    totalJsBrotli += sizes.brotli;

    jsAnalysis.push({
      name: filename,
      ...sizes,
    });
  }

  // Sort by size
  jsAnalysis.sort((a, b) => b.gzip - a.gzip);

  // Display top 10 largest files
  jsAnalysis.slice(0, 10).forEach((file, index) => {
    const status = file.gzip > CONFIG.thresholds.js ? '🔴' : '🟢';
    log(`   ${index + 1}. ${status} ${file.name}`);
    log(`      Raw: ${formatBytes(file.raw)} | Gzip: ${formatBytes(file.gzip)} | Brotli: ${formatBytes(file.brotli)}`);
  });

  log(`\n   Total JS: ${formatBytes(totalJsGzip)} (gzip) | ${formatBytes(totalJsBrotli)} (brotli)`, colors.bold);

  if (totalJsGzip > CONFIG.thresholds.js) {
    log(`   ⚠️  WARNING: Exceeds threshold of ${formatBytes(CONFIG.thresholds.js)}`, colors.yellow);
  } else {
    log(`   ✅ Within threshold`, colors.green);
  }

  // Analyze CSS files
  log('\n🟦 CSS Files:', colors.bold + colors.blue);
  log('─'.repeat(60), colors.blue);

  let totalCssRaw = 0;
  let totalCssGzip = 0;
  let totalCssBrotli = 0;

  for (const file of cssFiles) {
    const sizes = await getFileSize(file);
    const filename = path.basename(file);

    totalCssRaw += sizes.raw;
    totalCssGzip += sizes.gzip;
    totalCssBrotli += sizes.brotli;

    const status = sizes.gzip > CONFIG.thresholds.css ? '🔴' : '🟢';
    log(`   ${status} ${filename}`);
    log(`      Raw: ${formatBytes(sizes.raw)} | Gzip: ${formatBytes(sizes.gzip)} | Brotli: ${formatBytes(sizes.brotli)}`);
  }

  log(`\n   Total CSS: ${formatBytes(totalCssGzip)} (gzip) | ${formatBytes(totalCssBrotli)} (brotli)`, colors.bold);

  if (totalCssGzip > CONFIG.thresholds.css) {
    log(`   ⚠️  WARNING: Exceeds threshold of ${formatBytes(CONFIG.thresholds.css)}`, colors.yellow);
  } else {
    log(`   ✅ Within threshold`, colors.green);
  }

  // Total bundle size
  const totalSize = totalJsGzip + totalCssGzip;

  log('\n📊 Total Bundle Size:', colors.bold + colors.magenta);
  log('─'.repeat(60), colors.magenta);
  log(`   Raw: ${formatBytes(totalJsRaw + totalCssRaw)}`);
  log(`   Gzip: ${formatBytes(totalSize)}`, colors.bold);
  log(`   Brotli: ${formatBytes(totalJsBrotli + totalCssBrotli)}`, colors.bold);

  if (totalSize > CONFIG.thresholds.total) {
    log(`\n   🔴 CRITICAL: Exceeds threshold of ${formatBytes(CONFIG.thresholds.total)}`, colors.red);
    log(`   Reduction needed: ${formatBytes(totalSize - CONFIG.thresholds.total)}`, colors.red);
  } else {
    log(`\n   ✅ Within threshold of ${formatBytes(CONFIG.thresholds.total)}`, colors.green);
  }

  // Compression ratio
  const compressionRatio = (1 - totalSize / (totalJsRaw + totalCssRaw));
  log(`\n   Compression ratio: ${formatPercentage(compressionRatio)}`, colors.cyan);

  // Analyze dependencies
  if (fs.existsSync(CONFIG.packageJson)) {
    log('\n📦 Heavy Dependencies Analysis:', colors.bold + colors.cyan);
    log('─'.repeat(60), colors.cyan);

    const packageJson = JSON.parse(fs.readFileSync(CONFIG.packageJson, 'utf8'));
    const deps = packageJson.dependencies || {};

    const heavyDeps = [
      { name: '@patternfly/react-charts', size: '~450 KB', alternative: 'recharts (~150 KB)' },
      { name: '@patternfly/react-code-editor', size: '~200 KB', alternative: 'react-simple-code-editor (~10 KB)' },
      { name: '@patternfly/react-core', size: '~350 KB', alternative: 'Custom components with TailwindCSS' },
      { name: '@patternfly/react-icons', size: '~180 KB', alternative: '@heroicons/react (already installed)' },
      { name: '@patternfly/react-table', size: '~120 KB', alternative: '@tanstack/react-table (~50 KB)' },
    ];

    heavyDeps.forEach(dep => {
      if (deps[dep.name]) {
        log(`   🔴 ${dep.name}`, colors.red);
        log(`      Size: ${dep.size}`);
        log(`      Alternative: ${dep.alternative}`, colors.green);
      }
    });

    // Check if already using lighter alternatives
    const goodDeps = [
      { name: '@heroicons/react', description: 'Lightweight icon library' },
      { name: '@tanstack/react-query', description: 'Excellent data fetching' },
      { name: 'zustand', description: 'Minimal state management' },
    ];

    log('\n   ✅ Good Dependencies:', colors.green);
    goodDeps.forEach(dep => {
      if (deps[dep.name]) {
        log(`      • ${dep.name} - ${dep.description}`);
      }
    });
  }

  // Optimization suggestions
  log('\n💡 Optimization Suggestions:', colors.bold + colors.yellow);
  log('─'.repeat(60), colors.yellow);

  const suggestions = [
    {
      priority: 'HIGH',
      title: 'Remove PatternFly Dependencies',
      impact: '-1.2 MB',
      effort: '2-3 hours',
      description: 'Replace PatternFly with Heroicons and custom components',
    },
    {
      priority: 'HIGH',
      title: 'Implement Lazy Loading',
      impact: '-200 KB initial',
      effort: '1-2 hours',
      description: 'Lazy load route components with React.lazy()',
    },
    {
      priority: 'MEDIUM',
      title: 'Code Splitting Optimization',
      impact: '-100 KB',
      effort: '2 hours',
      description: 'Improve manual chunks configuration in vite.config.ts',
    },
    {
      priority: 'MEDIUM',
      title: 'Tree Shaking Optimization',
      impact: '-50 KB',
      effort: '1 hour',
      description: 'Use named imports instead of namespace imports',
    },
    {
      priority: 'LOW',
      title: 'Image Optimization',
      impact: 'Varies',
      effort: '2-3 hours',
      description: 'Convert images to WebP/AVIF and implement lazy loading',
    },
  ];

  suggestions.forEach((suggestion, index) => {
    const priorityColor = suggestion.priority === 'HIGH' ? colors.red :
                          suggestion.priority === 'MEDIUM' ? colors.yellow :
                          colors.green;

    log(`\n   ${index + 1}. [${suggestion.priority}] ${suggestion.title}`, priorityColor + colors.bold);
    log(`      Impact: ${suggestion.impact} | Effort: ${suggestion.effort}`);
    log(`      → ${suggestion.description}`, colors.reset);
  });

  // Next steps
  log('\n🚀 Next Steps:', colors.bold + colors.green);
  log('─'.repeat(60), colors.green);
  log('   1. Review the FRONTEND_OPTIMIZATION_GUIDE.md');
  log('   2. Start with HIGH priority optimizations');
  log('   3. Measure improvements after each change');
  log('   4. Run this script again to track progress');
  log('   5. Setup Lighthouse CI for continuous monitoring\n');

  // Generate JSON report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: allFiles.length,
      jsFiles: jsFiles.length,
      cssFiles: cssFiles.length,
    },
    sizes: {
      js: {
        raw: totalJsRaw,
        gzip: totalJsGzip,
        brotli: totalJsBrotli,
      },
      css: {
        raw: totalCssRaw,
        gzip: totalCssGzip,
        brotli: totalCssBrotli,
      },
      total: {
        raw: totalJsRaw + totalCssRaw,
        gzip: totalSize,
        brotli: totalJsBrotli + totalCssBrotli,
      },
    },
    thresholds: CONFIG.thresholds,
    status: {
      js: totalJsGzip <= CONFIG.thresholds.js ? 'PASS' : 'FAIL',
      css: totalCssGzip <= CONFIG.thresholds.css ? 'PASS' : 'FAIL',
      total: totalSize <= CONFIG.thresholds.total ? 'PASS' : 'FAIL',
    },
    largestFiles: jsAnalysis.slice(0, 10),
  };

  const reportPath = path.join(CONFIG.distDir, 'bundle-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`📄 Detailed report saved to: ${reportPath}\n`, colors.cyan);
}

// Run analysis
analyzeBundles().catch((error) => {
  log('\n❌ Analysis failed:', colors.red);
  console.error(error);
  process.exit(1);
});
