#!/usr/bin/env node

/**
 * Script d'Analyse de Refactorisation - ClubManager V3
 *
 * Analyse toutes les pages du projet pour identifier :
 * - Taille et complexité
 * - Composants imbriqués
 * - Opportunités de refactorisation
 * - Architecture recommandée
 *
 * Usage:
 *   node analyze-pages.js
 *   node analyze-pages.js --json (output JSON)
 *   node analyze-pages.js --detail (analyse détaillée)
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  frontendDir: path.join(__dirname, '../../frontend/src/features'),
  outputDir: path.join(__dirname, '..'),
  thresholds: {
    small: 300,      // < 300 lignes = petite page (OK)
    medium: 500,     // 300-500 lignes = moyenne (à surveiller)
    large: 1000,     // 500-1000 lignes = grande (refactoriser)
    critical: 1000,  // > 1000 lignes = critique (urgent)
  },
  patterns: {
    component: /(?:function|const)\s+([A-Z][a-zA-Z0-9]*)\s*[=\(]/g,
    modal: /(?:Modal|Dialog|Drawer|Popup)/gi,
    useState: /useState(?:<[^>]+>)?\s*\(/g,
    useEffect: /useEffect\s*\(/g,
    handler: /(?:handle|on)[A-Z][a-zA-Z0-9]*\s*=/g,
    format: /format(?:Date|Currency|Time|Number|Phone|Email)/gi,
    validation: /(?:validate|isValid|check)[A-Z][a-zA-Z0-9]*/gi,
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

function getAllPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllPageFiles(filePath, fileList);
    } else if (file.endsWith('Page.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function countLines(content) {
  return content.split('\n').length;
}

function extractComponents(content) {
  const components = [];
  const lines = content.split('\n');
  let currentLine = 0;

  for (const line of lines) {
    currentLine++;

    // Fonction component
    const funcMatch = line.match(/^\s*(?:export\s+)?function\s+([A-Z][a-zA-Z0-9]*)/);
    if (funcMatch) {
      components.push({
        name: funcMatch[1],
        line: currentLine,
        type: 'function'
      });
      continue;
    }

    // Const component
    const constMatch = line.match(/^\s*(?:export\s+)?const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*(?:\(|React\.memo|forwardRef)/);
    if (constMatch) {
      components.push({
        name: constMatch[1],
        line: currentLine,
        type: 'const'
      });
    }
  }

  return components;
}

function detectModals(content) {
  const modalNames = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.match(/function\s+([A-Z][a-zA-Z0-9]*Modal)/)) {
      const match = line.match(/function\s+([A-Z][a-zA-Z0-9]*Modal)/);
      modalNames.push({
        name: match[1],
        line: index + 1
      });
    } else if (line.match(/const\s+([A-Z][a-zA-Z0-9]*Modal)\s*=/)) {
      const match = line.match(/const\s+([A-Z][a-zA-Z0-9]*Modal)\s*=/);
      modalNames.push({
        name: match[1],
        line: index + 1
      });
    }
  });

  return modalNames;
}

function detectHooks(content) {
  const hooks = {
    useState: (content.match(CONFIG.patterns.useState) || []).length,
    useEffect: (content.match(CONFIG.patterns.useEffect) || []).length,
    custom: []
  };

  // Détecter custom hooks
  const customHookPattern = /use[A-Z][a-zA-Z0-9]*\s*\(/g;
  const matches = content.match(customHookPattern) || [];
  matches.forEach(match => {
    const hookName = match.replace(/\s*\(/, '');
    if (!['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext'].includes(hookName)) {
      if (!hooks.custom.includes(hookName)) {
        hooks.custom.push(hookName);
      }
    }
  });

  return hooks;
}

function detectDuplication(content) {
  const duplication = {
    formatters: (content.match(CONFIG.patterns.format) || []).length,
    validators: (content.match(CONFIG.patterns.validation) || []).length,
    handlers: (content.match(CONFIG.patterns.handler) || []).length,
  };

  return duplication;
}

function calculateComplexity(analysis) {
  let score = 0;

  // Taille
  if (analysis.lines > CONFIG.thresholds.critical) score += 50;
  else if (analysis.lines > CONFIG.thresholds.large) score += 30;
  else if (analysis.lines > CONFIG.thresholds.medium) score += 10;

  // Composants imbriqués
  score += Math.min(analysis.components.length * 5, 30);

  // Modals
  score += Math.min(analysis.modals.length * 10, 30);

  // State complexity
  score += Math.min(analysis.hooks.useState * 2, 20);

  // Duplication
  if (analysis.duplication.formatters > 3) score += 10;
  if (analysis.duplication.validators > 3) score += 10;

  return Math.min(score, 100);
}

function getRefactoringPriority(complexity, lines) {
  if (lines > CONFIG.thresholds.critical || complexity > 70) return 'CRITIQUE';
  if (lines > CONFIG.thresholds.large || complexity > 50) return 'HAUTE';
  if (lines > CONFIG.thresholds.medium || complexity > 30) return 'MOYENNE';
  return 'BASSE';
}

function suggestArchitecture(analysis) {
  const suggestions = [];

  // Tabs détectés
  if (analysis.components.filter(c => c.name.includes('Tab')).length > 2) {
    suggestions.push({
      type: 'tabs',
      description: 'Extraire les tabs dans components/tabs/',
      components: analysis.components.filter(c => c.name.includes('Tab')).map(c => c.name),
      estimatedGain: Math.floor(analysis.lines * 0.7)
    });
  }

  // Modals détectés
  if (analysis.modals.length > 0) {
    suggestions.push({
      type: 'modals',
      description: 'Extraire les modals dans components/modals/',
      components: analysis.modals.map(m => m.name),
      estimatedGain: analysis.modals.length * 150
    });
  }

  // Sections potentielles (grands blocs)
  if (analysis.lines > 500 && analysis.components.length > 3) {
    suggestions.push({
      type: 'sections',
      description: 'Diviser en sections dans components/sections/',
      components: ['À identifier manuellement'],
      estimatedGain: Math.floor(analysis.lines * 0.4)
    });
  }

  // Logique métier
  if (analysis.duplication.formatters > 2 || analysis.duplication.validators > 2) {
    suggestions.push({
      type: 'utils',
      description: 'Extraire utilitaires dans utils/',
      components: ['formatters', 'validators', 'helpers'],
      estimatedGain: 50
    });
  }

  // Hooks personnalisés
  if (analysis.hooks.useState > 5 || analysis.hooks.useEffect > 3) {
    suggestions.push({
      type: 'hooks',
      description: 'Extraire logique dans hooks personnalisés',
      components: ['useFilters', 'useForm', 'useLogic'],
      estimatedGain: Math.floor(analysis.lines * 0.2)
    });
  }

  return suggestions;
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYSE
// ═══════════════════════════════════════════════════════════════════════════

function analyzePage(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(CONFIG.frontendDir, filePath);
  const fileName = path.basename(filePath);

  const analysis = {
    file: fileName,
    path: relativePath,
    lines: countLines(content),
    components: extractComponents(content),
    modals: detectModals(content),
    hooks: detectHooks(content),
    duplication: detectDuplication(content),
  };

  analysis.complexity = calculateComplexity(analysis);
  analysis.priority = getRefactoringPriority(analysis.complexity, analysis.lines);
  analysis.suggestions = suggestArchitecture(analysis);

  // Estimation après refactorisation
  const totalGain = analysis.suggestions.reduce((sum, s) => sum + s.estimatedGain, 0);
  analysis.estimatedLinesAfter = Math.max(100, analysis.lines - totalGain);
  analysis.estimatedGain = Math.floor(((analysis.lines - analysis.estimatedLinesAfter) / analysis.lines) * 100);

  return analysis;
}

function analyzeAllPages() {
  console.log('🔍 Analyse des pages en cours...\n');

  const pageFiles = getAllPageFiles(CONFIG.frontendDir);
  const results = pageFiles.map(analyzePage);

  // Trier par priorité puis par taille
  results.sort((a, b) => {
    const priorityOrder = { 'CRITIQUE': 0, 'HAUTE': 1, 'MOYENNE': 2, 'BASSE': 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.lines - a.lines;
  });

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// GÉNÉRATION RAPPORT
// ═══════════════════════════════════════════════════════════════════════════

function generateMarkdownReport(results) {
  const now = new Date().toISOString().split('T')[0];

  let report = `# 📊 RAPPORT D'ANALYSE DE REFACTORISATION\n`;
  report += `## ClubManager V3 - Pages Frontend\n\n`;
  report += `**Date :** ${now}\n`;
  report += `**Pages analysées :** ${results.length}\n\n`;

  // ─── Résumé Exécutif ───
  report += `---\n\n## 🎯 RÉSUMÉ EXÉCUTIF\n\n`;

  const stats = {
    total: results.length,
    critique: results.filter(r => r.priority === 'CRITIQUE').length,
    haute: results.filter(r => r.priority === 'HAUTE').length,
    moyenne: results.filter(r => r.priority === 'MOYENNE').length,
    basse: results.filter(r => r.priority === 'BASSE').length,
    totalLines: results.reduce((sum, r) => sum + r.lines, 0),
    avgLines: Math.floor(results.reduce((sum, r) => sum + r.lines, 0) / results.length),
    maxLines: Math.max(...results.map(r => r.lines)),
    totalComponents: results.reduce((sum, r) => sum + r.components.length, 0),
    totalModals: results.reduce((sum, r) => sum + r.modals.length, 0),
  };

  report += `### Statistiques Globales\n\n`;
  report += `| Métrique | Valeur |\n`;
  report += `|----------|--------|\n`;
  report += `| **Pages totales** | ${stats.total} |\n`;
  report += `| **Lignes totales** | ${stats.totalLines.toLocaleString()} |\n`;
  report += `| **Moyenne/page** | ${stats.avgLines} lignes |\n`;
  report += `| **Plus grosse page** | ${stats.maxLines} lignes |\n`;
  report += `| **Composants imbriqués** | ${stats.totalComponents} |\n`;
  report += `| **Modals inline** | ${stats.totalModals} |\n\n`;

  report += `### Répartition par Priorité\n\n`;
  report += `| Priorité | Nombre | Pourcentage |\n`;
  report += `|----------|--------|-------------|\n`;
  report += `| 🔴 **CRITIQUE** | ${stats.critique} | ${Math.round(stats.critique/stats.total*100)}% |\n`;
  report += `| 🟡 **HAUTE** | ${stats.haute} | ${Math.round(stats.haute/stats.total*100)}% |\n`;
  report += `| 🟠 **MOYENNE** | ${stats.moyenne} | ${Math.round(stats.moyenne/stats.total*100)}% |\n`;
  report += `| 🟢 **BASSE** | ${stats.basse} | ${Math.round(stats.basse/stats.total*100)}% |\n\n`;

  // ─── Pages Critiques ───
  const criticalPages = results.filter(r => r.priority === 'CRITIQUE' || r.priority === 'HAUTE');

  if (criticalPages.length > 0) {
    report += `---\n\n## 🔴 PAGES PRIORITAIRES (${criticalPages.length})\n\n`;

    criticalPages.forEach((page, index) => {
      const icon = page.priority === 'CRITIQUE' ? '🔴' : '🟡';

      report += `### ${index + 1}. ${icon} ${page.file}\n\n`;
      report += `**Priorité :** ${page.priority} | **Complexité :** ${page.complexity}/100\n\n`;
      report += `| Métrique | Avant | Après | Gain |\n`;
      report += `|----------|-------|-------|------|\n`;
      report += `| Lignes | ${page.lines} | ~${page.estimatedLinesAfter} | -${page.estimatedGain}% |\n`;
      report += `| Composants imbriqués | ${page.components.length} | 0 | -100% |\n`;
      report += `| Modals inline | ${page.modals.length} | 0 | -100% |\n\n`;

      if (page.suggestions.length > 0) {
        report += `**Actions Recommandées :**\n\n`;
        page.suggestions.forEach(sug => {
          report += `- **${sug.type}** : ${sug.description}\n`;
          report += `  - Composants : ${sug.components.join(', ')}\n`;
          report += `  - Gain estimé : -${sug.estimatedGain} lignes\n`;
        });
        report += `\n`;
      }

      if (page.components.length > 0) {
        report += `**Composants détectés (${page.components.length}) :**\n`;
        page.components.slice(0, 10).forEach(comp => {
          report += `- \`${comp.name}\` (ligne ${comp.line})\n`;
        });
        if (page.components.length > 10) {
          report += `- ... et ${page.components.length - 10} autres\n`;
        }
        report += `\n`;
      }

      if (page.modals.length > 0) {
        report += `**Modals inline (${page.modals.length}) :**\n`;
        page.modals.forEach(modal => {
          report += `- \`${modal.name}\` (ligne ${modal.line})\n`;
        });
        report += `\n`;
      }

      report += `---\n\n`;
    });
  }

  // ─── Tableau Complet ───
  report += `## 📋 TABLEAU RÉCAPITULATIF COMPLET\n\n`;
  report += `| # | Page | Lignes | Priorité | Composants | Modals | Gain Estimé |\n`;
  report += `|---|------|--------|----------|------------|--------|-------------|\n`;

  results.forEach((page, index) => {
    const icon = {
      'CRITIQUE': '🔴',
      'HAUTE': '🟡',
      'MOYENNE': '🟠',
      'BASSE': '🟢'
    }[page.priority];

    report += `| ${index + 1} | ${page.file.replace('Page.tsx', '')} | ${page.lines} | ${icon} ${page.priority} | ${page.components.length} | ${page.modals.length} | -${page.estimatedGain}% |\n`;
  });

  report += `\n`;

  // ─── Plan d'Action ───
  report += `---\n\n## 🚀 PLAN D'ACTION RECOMMANDÉ\n\n`;

  const totalEstimatedGain = results.reduce((sum, r) => sum + (r.lines - r.estimatedLinesAfter), 0);
  const avgGain = Math.floor((totalEstimatedGain / stats.totalLines) * 100);

  report += `### Gains Attendus Globaux\n\n`;
  report += `- **Lignes avant :** ${stats.totalLines.toLocaleString()}\n`;
  report += `- **Lignes après :** ~${(stats.totalLines - totalEstimatedGain).toLocaleString()}\n`;
  report += `- **Réduction totale :** -${totalEstimatedGain.toLocaleString()} lignes (-${avgGain}%)\n`;
  report += `- **Composants à créer :** ~${Math.floor(stats.totalComponents * 0.8)}\n\n`;

  report += `### Phase 1 : Pages Critiques (Semaine 1)\n\n`;
  criticalPages.slice(0, 4).forEach(page => {
    report += `- [ ] **${page.file}** (${page.lines} → ${page.estimatedLinesAfter}L)\n`;
    page.suggestions.forEach(sug => {
      report += `  - [ ] ${sug.description}\n`;
    });
  });
  report += `\n`;

  const mediumPages = results.filter(r => r.priority === 'MOYENNE');
  if (mediumPages.length > 0) {
    report += `### Phase 2 : Pages Moyennes (Semaine 2)\n\n`;
    mediumPages.slice(0, 5).forEach(page => {
      report += `- [ ] **${page.file}** (${page.lines} → ${page.estimatedLinesAfter}L)\n`;
    });
    report += `\n`;
  }

  const lowPages = results.filter(r => r.priority === 'BASSE');
  if (lowPages.length > 0) {
    report += `### Phase 3 : Pages Petites - Vérification (Semaine 2-3)\n\n`;
    report += `- [ ] Vérifier conformité architecture (${lowPages.length} pages)\n`;
    report += `- [ ] Créer utils/ si duplication détectée\n`;
    report += `- [ ] S'assurer < 300 lignes\n\n`;
  }

  // ─── Patterns Détectés ───
  report += `---\n\n## 🔍 PATTERNS DÉTECTÉS\n\n`;

  const pagesWithTabs = results.filter(r => r.suggestions.some(s => s.type === 'tabs'));
  const pagesWithModals = results.filter(r => r.modals.length > 0);
  const pagesWithDuplication = results.filter(r => r.duplication.formatters > 2 || r.duplication.validators > 2);

  report += `### Tabs Pattern (${pagesWithTabs.length} pages)\n`;
  if (pagesWithTabs.length > 0) {
    pagesWithTabs.forEach(p => report += `- ${p.file}\n`);
    report += `\n**Action :** Créer \`components/tabs/\`\n\n`;
  } else {
    report += `Aucun pattern tabs détecté.\n\n`;
  }

  report += `### Modals Inline (${pagesWithModals.length} pages, ${stats.totalModals} modals)\n`;
  if (pagesWithModals.length > 0) {
    pagesWithModals.forEach(p => report += `- ${p.file} (${p.modals.length} modals)\n`);
    report += `\n**Action :** Créer \`components/modals/\`\n\n`;
  } else {
    report += `Aucun modal inline détecté.\n\n`;
  }

  report += `### Duplication Code (${pagesWithDuplication.length} pages)\n`;
  if (pagesWithDuplication.length > 0) {
    pagesWithDuplication.forEach(p => report += `- ${p.file} (${p.duplication.formatters} formatters, ${p.duplication.validators} validators)\n`);
    report += `\n**Action :** Créer \`utils/formatters.ts\` et \`utils/validators.ts\`\n\n`;
  } else {
    report += `Pas de duplication significative détectée.\n\n`;
  }

  // ─── Footer ───
  report += `---\n\n`;
  report += `**Rapport généré le ${now}**\n`;
  report += `**Script :** \`analyze-pages.js\`\n\n`;
  report += `**Note :** Les estimations sont basées sur l'analyse statique du code. `;
  report += `Les gains réels peuvent varier selon l'implémentation.\n`;

  return report;
}

function generateJSONReport(results) {
  return JSON.stringify({
    meta: {
      date: new Date().toISOString(),
      totalPages: results.length,
      version: '1.0'
    },
    summary: {
      totalLines: results.reduce((sum, r) => sum + r.lines, 0),
      avgLines: Math.floor(results.reduce((sum, r) => sum + r.lines, 0) / results.length),
      maxLines: Math.max(...results.map(r => r.lines)),
      priorities: {
        critique: results.filter(r => r.priority === 'CRITIQUE').length,
        haute: results.filter(r => r.priority === 'HAUTE').length,
        moyenne: results.filter(r => r.priority === 'MOYENNE').length,
        basse: results.filter(r => r.priority === 'BASSE').length,
      }
    },
    pages: results
  }, null, 2);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const detailOutput = args.includes('--detail');

  // Vérifier que le répertoire frontend existe
  if (!fs.existsSync(CONFIG.frontendDir)) {
    console.error('❌ Erreur: Répertoire frontend introuvable:', CONFIG.frontendDir);
    console.error('   Assurez-vous d\'exécuter ce script depuis le bon répertoire.');
    process.exit(1);
  }

  // Analyser
  const results = analyzeAllPages();

  // Afficher résumé console
  if (!jsonOutput) {
    console.log('✅ Analyse terminée!\n');
    console.log(`📊 Pages analysées: ${results.length}`);
    console.log(`📏 Lignes totales: ${results.reduce((sum, r) => sum + r.lines, 0).toLocaleString()}`);
    console.log(`🔴 Pages critiques: ${results.filter(r => r.priority === 'CRITIQUE').length}`);
    console.log(`🟡 Pages haute priorité: ${results.filter(r => r.priority === 'HAUTE').length}\n`);
  }

  // Générer rapport
  if (jsonOutput) {
    const jsonReport = generateJSONReport(results);
    const jsonPath = path.join(CONFIG.outputDir, 'REFACTORING_ANALYSIS.json');
    fs.writeFileSync(jsonPath, jsonReport);
    console.log(`📄 Rapport JSON généré: ${jsonPath}`);
  } else {
    const mdReport = generateMarkdownReport(results);
    const mdPath = path.join(CONFIG.outputDir, 'REFACTORING_ANALYSIS.md');
    fs.writeFileSync(mdPath, mdReport);
    console.log(`📄 Rapport Markdown généré: ${mdPath}`);
  }

  // Afficher top 5 si non-JSON
  if (!jsonOutput) {
    console.log('\n🔝 TOP 5 PAGES À REFACTORISER:\n');
    results.slice(0, 5).forEach((page, index) => {
      const icon = {
        'CRITIQUE': '🔴',
        'HAUTE': '🟡',
        'MOYENNE': '🟠',
        'BASSE': '🟢'
      }[page.priority];
      console.log(`${index + 1}. ${icon} ${page.file} (${page.lines} lignes)`);
      console.log(`   → Après refactorisation: ~${page.estimatedLinesAfter} lignes (-${page.estimatedGain}%)`);
      if (page.suggestions.length > 0) {
        console.log(`   → Actions: ${page.suggestions.map(s => s.type).join(', ')}`);
      }
      console.log('');
    });
  }

  console.log('✨ Terminé!\n');
}

// Exécuter
main();
