const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT_DIR = process.cwd();
const DIST_ROOT = path.join(ROOT_DIR, 'docs');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const CONTENT_ROOT = path.join(ROOT_DIR, 'content');
const ARTIFACTS_DIR = path.join(ROOT_DIR, 'dist');

const STATIC_PAGES = ['fuentes.html', 'por-que-esta-web.html', 'certificado.html'];
const SHARED_ASSETS = [
  'css/styles.css',
  'css/tailwind.css',
  'js/page-helpers.js',
  'js/progress.js',
  'js/quiz.js',
  'js/reto.js',
  'js/vendor/canvas-confetti.min.js',
  'js/sw-register.js',
  'manifest.json',
  'favicon.svg',
  'robots.txt',
  'img/preview.png'
];

const DEFAULT_STRINGS = {
  brandName: 'finanzas adolescentes',
  missionCounter: 'misión {{index}} de {{total}} · {{duration}}',
  tocToggleLabel: 'en esta misión verás',
  navDebugButtonLabel: '🗑️ clear',
  navDebugButtonTitle: 'clear localStorage for debugging',
  navDebugConfirm: '¿Estás seguro de que quieres limpiar todos los datos guardados? Esto reseteará tu progreso.',
  navDebugSuccess: '✅ localStorage limpiado. La página se recargará.',
  certificateBadgeLabel: 'certificado desbloqueado'
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function emptyDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function loadJson(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  const contents = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(contents);
}

function loadLocaleStrings(localeCode) {
  const localeStringsPath = path.join(DATA_DIR, localeCode, 'ui.json');
  return Object.assign({}, DEFAULT_STRINGS, loadJson(localeStringsPath, {}));
}

function loadFooterHtml(contentDir) {
  const footerPath = path.join(contentDir, 'partials', 'footer.html');
  if (!fs.existsSync(footerPath)) {
    return '';
  }
  return fs.readFileSync(footerPath, 'utf-8');
}

function copyFileSync(source, target) {
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
}

function copyDirSync(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  entries.forEach((entry) => {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(sourcePath, targetPath);
    } else {
      copyFileSync(sourcePath, targetPath);
    }
  });
}

function writeFileSync(targetPath, contents) {
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, contents, 'utf-8');
}

function getString(strings, key, fallback) {
  return strings[key] || fallback;
}

function formatMissionCounter(strings, mission, missionCount) {
  const template = getString(strings, 'missionCounter', DEFAULT_STRINGS.missionCounter);
  return template
    .replace('{{index}}', mission.id)
    .replace('{{total}}', missionCount)
    .replace('{{duration}}', mission.duration || '');
}

function resolveCanonical(baseUrl, fallback, relativePath) {
  if (baseUrl) {
    const sanitized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${sanitized}/${relativePath}`;
  }
  return fallback || relativePath;
}

function applyLangAttribute(html, lang) {
  if (!lang) {
    return html;
  }
  if (/<html[^>]*lang=/i.test(html)) {
    return html.replace(/(<html[^>]*lang=")([^"]*)(")/i, `$1${lang}$3`);
  }
  return html.replace(/<html/i, `<html lang="${lang}"`);
}

function applyCanonical(html, canonicalUrl) {
  if (!canonicalUrl) {
    return html;
  }
  if (/<link\s+rel="canonical"/i.test(html)) {
    return html.replace(/<link\s+rel="canonical"[^>]*href="[^"]*"[^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  }
  return html;
}

function processStaticHtml(html, lang, canonicalUrl) {
  let output = applyLangAttribute(html, lang);
  output = applyCanonical(output, canonicalUrl);
  return output;
}

function buildLocale(localeConfig, defaultLocaleCode) {
  const code = localeConfig.code;
  const outputDir = localeConfig.outputDir || code;
  const contentDir = path.join(CONTENT_ROOT, code);
  const dataDir = path.join(DATA_DIR, code);
  const distDir = path.join(DIST_ROOT, outputDir);

  if (!fs.existsSync(contentDir)) {
    console.warn(`Skipping locale ${code}: missing content directory at ${contentDir}`);
    return;
  }

  const missions = loadJson(path.join(dataDir, 'missions.json'), []);
  if (!missions.length) {
    console.warn(`Locale ${code} has no missions defined. Skipping.`);
    return;
  }

  const strings = loadLocaleStrings(code);
  const footerHtml = loadFooterHtml(contentDir);
  emptyDir(distDir);

  const context = {
    locale: localeConfig,
    defaultLocaleCode,
    missions,
    missionCount: missions.length,
    strings,
    footerHtml,
    contentDir,
    dataDir,
    distDir
  };

  buildIndexPage(context);
  buildStaticPages(context);
  missions.forEach((mission) => buildMissionPage(context, mission));
  copySharedAssets(context);
  copyLocaleData(context);
  buildServiceWorker(context);
  generateSitemap(context);
  createLocaleZip(context);
}

function buildIndexPage(context) {
  const sourcePath = path.join(context.contentDir, 'index.html');
  if (!fs.existsSync(sourcePath)) {
    console.warn(`Missing index.html for locale ${context.locale.code} at ${sourcePath}`);
    return;
  }
  const contents = fs.readFileSync(sourcePath, 'utf-8');
  const canonical = resolveCanonical(context.locale.baseUrl, null, 'index.html');
  const processed = processStaticHtml(contents, context.locale.code, canonical);
  writeFileSync(path.join(context.distDir, 'index.html'), processed);
}

function buildStaticPages(context) {
  STATIC_PAGES.forEach((page) => {
    const sourcePath = path.join(context.contentDir, page);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Skipping static page ${page} for locale ${context.locale.code}`);
      return;
    }
    const contents = fs.readFileSync(sourcePath, 'utf-8');
    const canonical = resolveCanonical(context.locale.baseUrl, null, page);
    const processed = processStaticHtml(contents, context.locale.code, canonical);
    writeFileSync(path.join(context.distDir, page), processed);
  });
}

function generateNav(context, currentMissionId = null) {
  const links = context.missions.map((mission) => {
    const href = mission.file;
    const classes = ['hover:text-purple-600'];
    if (currentMissionId && mission.id === currentMissionId) {
      classes.push('text-purple-700', 'font-bold', 'underline');
    }
    return `        <a href="${href}" class="${classes.join(' ')}">${mission.navLabel}</a>`;
  });

  const buttonLabel = getString(context.strings, 'navDebugButtonLabel', DEFAULT_STRINGS.navDebugButtonLabel);
  const buttonTitle = getString(context.strings, 'navDebugButtonTitle', DEFAULT_STRINGS.navDebugButtonTitle);

  return `      <div class="hidden md:flex space-x-6 text-sm font-medium items-center">
${links.join('\n')}
        <button onclick="clearLocalStorage()" class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition" title="${buttonTitle}">
          ${buttonLabel}
        </button>
      </div>`;
}

function buildMissionPage(context, mission) {
  const missionDataPath = path.join(context.dataDir, 'missions', `mission-${mission.id}.json`);
  if (fs.existsSync(missionDataPath)) {
    const missionData = loadJson(missionDataPath, {});
    const html = generateMissionPage(context, mission, missionData);
    writeFileSync(path.join(context.distDir, mission.file), html);
    return;
  }

  const fallbackPath = path.join(context.contentDir, mission.file);
  if (!fs.existsSync(fallbackPath)) {
    console.warn(`Missing mission file for ${mission.file} in locale ${context.locale.code}`);
    return;
  }

  let contents = fs.readFileSync(fallbackPath, 'utf-8');
  contents = contents.replace(/<div class="hidden md:flex[\s\S]*?<\/div>\s*<\/nav>/, `${generateNav(context, mission.id)}\n    </nav>`);
  writeFileSync(path.join(context.distDir, mission.file), contents);
}

function generateMissionPage(context, mission, missionData) {
  const nav = generateNav(context, mission.id);
  const toc = (missionData.toc || [])
    .map(item => `        <li>${item.icon} <a href="#${item.id}" class="hover:underline">${item.label}</a></li>`)
    .join('\n');
  const sections = (missionData.sections || []).map(renderSection).join('\n\n');
  const quiz = renderQuiz(missionData.quiz);
  const reto = renderReto(missionData.reto);
  const introBlocks = (missionData.introBlocks || []).join('\n\n');
  const footer = context.footerHtml;
  const inlineScripts = (missionData.inlineScripts || [])
    .map((script) => `  <script>\n${script}\n  </script>`)
    .join('\n');
  const missionCounter = formatMissionCounter(context.strings, mission, context.missionCount);
  const tocToggleLabel = getString(context.strings, 'tocToggleLabel', DEFAULT_STRINGS.tocToggleLabel);
  const badgeLabel = getString(context.strings, 'certificateBadgeLabel', DEFAULT_STRINGS.certificateBadgeLabel);
  const confirmMessage = getString(context.strings, 'navDebugConfirm', DEFAULT_STRINGS.navDebugConfirm);
  const successMessage = getString(context.strings, 'navDebugSuccess', DEFAULT_STRINGS.navDebugSuccess);
  const lang = context.locale.code || 'es';
  const canonical = resolveCanonical(context.locale.baseUrl, missionData.meta?.canonical, mission.file);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${missionData.meta?.title || mission.title}</title>
  <meta name="description" content="${missionData.meta?.description || ''}" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="manifest" href="manifest.json" />
  <link rel="canonical" href="${canonical}" />
  <link rel="stylesheet" href="css/tailwind.css">
  <link rel="stylesheet" href="css/styles.css">
  <script src="js/sw-register.js" defer></script>
</head>
<body class="bg-purple-50 text-gray-800" data-mission-id="mision-${mission.id}">

  <!-- HEADER -->
  <header class="bg-white shadow sticky top-0 z-50">
    <nav class="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
      <a href="index.html" class="font-bold text-purple-700">${getString(context.strings, 'brandName', DEFAULT_STRINGS.brandName)}</a>
${nav}
    </nav>
  </header>

  <!-- HERO -->
  <section class="bg-gradient-to-r from-purple-600 to-teal-500 text-white py-16 text-center">
    <div class="max-w-3xl mx-auto">
      <div class="text-6xl mb-4">${missionData.hero?.emoji || ''}</div>
      <h1 class="text-4xl font-bold mb-2">${missionData.hero?.title || mission.title}</h1>
      <p class="text-lg">${missionData.hero?.subtitle || ''}</p>
      <div class="mt-12 text-sm flex flex-col items-center space-y-2">
        <div class="mt-4">
          <p class="font-medium mb-4">${missionCounter}</p>
          <div id="mission-pins" class="flex flex-wrap justify-center gap-2"></div>
        </div>
      </div>
    </div>
  </section>

${introBlocks ? `${introBlocks}\n\n` : ''}  <!-- TOC -->
  <div class="max-w-2xl mx-auto my-8 px-4">
    <button data-toc-button 
            class="w-full bg-purple-100 text-purple-700 font-semibold px-4 py-3 rounded-lg shadow hover:bg-purple-200 transition flex justify-between items-center">
      ${tocToggleLabel}
      <span id="toc-icon">▼</span>
    </button>

    <div id="toc-content" class="hidden bg-white border border-purple-200 rounded-lg mt-2 p-4">
      <ul class="space-y-2 text-purple-700">
${toc}
      </ul>
    </div>
  </div>

${sections}

${quiz}

  ${reto}

${renderTakeaway(context, mission, missionData, badgeLabel)}

  ${footer}

  <script>
    function clearLocalStorage() {
      if (confirm('${confirmMessage}')) {
        localStorage.clear();
        alert('${successMessage}');
        location.reload();
      }
    }
  </script>
${inlineScripts ? `${inlineScripts}\n` : ''}  <script src="js/vendor/canvas-confetti.min.js" defer></script>
  <script src="js/page-helpers.js" defer></script>
  <script src="js/progress.js" defer></script>
  <script src="js/quiz.js" defer></script>
  <script src="js/reto.js" defer></script>
</body>
</html>`;
}

function renderTakeaway(context, mission, missionData, badgeLabel) {
  if (mission.id === 6) {
    const note = missionData.takeaway?.note || '';
    return `  <section id="takeaway" class="bg-gradient-to-r from-purple-600 to-teal-500 text-white py-20 transition-all duration-500 opacity-50 pointer-events-none">
    <div class="max-w-4xl mx-auto px-6">
      <div id="certificate-card" class="relative overflow-hidden rounded-[42px] p-12 sm:p-16 text-white shadow-[0_30px_80px_rgba(59,7,100,0.35)]">
        <div class="absolute inset-0 bg-gradient-to-br from-yellow-300 via-pink-500 to-purple-700 opacity-90"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_55%)]"></div>
        <div class="relative flex flex-col gap-7">
          <div class="uppercase text-xs tracking-[0.5em] text-white/80">${badgeLabel}</div>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight drop-shadow-[0_15px_30px_rgba(124,58,237,0.45)]">${missionData.takeaway?.title || ''}</h2>
          <p class="text-lg sm:text-xl text-white/95 max-w-2xl">${missionData.takeaway?.subtitle || ''}</p>
          ${note ? `<p class="text-base sm:text-lg text-white/85 max-w-2xl">${note}</p>` : ''}
          <div class="flex flex-wrap items-center gap-6">
            <a id="certificate-primary" href="${missionData.takeaway?.cta?.href || '#'}" class="group inline-flex items-center gap-4 rounded-full bg-white text-purple-800 px-9 py-4 text-lg font-extrabold uppercase tracking-[0.2em] shadow-[0_18px_45px_rgba(124,58,237,0.35)] transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-white/60">
              <span class="text-2xl">🎓</span>
              <span class="group-hover:tracking-[0.28em] transition-all duration-200">${missionData.takeaway?.cta?.label || ''}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>`;
  }

  return `  <section id="takeaway" class="bg-gradient-to-r from-purple-600 to-teal-500 text-white py-16 text-center opacity-50 pointer-events-none transition-all duration-500">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-3xl font-bold mb-6">${missionData.takeaway?.title || ''}</h2>
      <p class="text-xl mb-8">${missionData.takeaway?.subtitle || ''}</p>
      <a href="${missionData.takeaway?.cta?.href || '#'}" class="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 inline-flex items-center gap-2">
        ${missionData.takeaway?.cta?.label || ''}
      </a>
    </div>
  </section>`;
}

function renderSection(section) {
  if (section.type === 'raw') {
    return section.html;
  }

  const wrapperClass = section.wrapperClass || 'max-w-6xl mx-auto px-6 py-12';
  const headingTag = section.headingTag || 'h2';
  const headingClass = section.headingClass || 'text-3xl font-bold mb-6 text-center';
  const leadClass = section.leadClass || 'text-center text-gray-600 mb-12';
  const leadHtml = section.lead
    ? `    <p class="${leadClass}">\n      ${section.lead}\n    </p>\n`
    : '';
  const cardsHtml = (section.cards || [])
    .map(renderCard)
    .join('\n');
  const cardsBlock = cardsHtml ? `${cardsHtml}\n` : '';
  const extraHtml = section.extraHtml ? `\n${section.extraHtml}\n` : '';

  return `  <section id="${section.id}" class="${wrapperClass}">
    <${headingTag} class="${headingClass}">${section.title}</${headingTag}>
${leadHtml}${cardsBlock}${extraHtml}  </section>`;
}

function renderCard(card) {
  if (card.type === 'grid') {
    const items = card.items.map(renderCard).join('\n');
    return `    <div class="${card.wrapperClass}">
${items}
    </div>`;
  }

  if (card.type === 'bar') {
    return card.html;
  }

  if (card.type === 'html') {
    return card.html;
  }

  return `      <div class="${card.class}">
        <div class="text-4xl mb-3">${card.emoji}</div>
        <h4 class="text-xl font-bold mb-2">${card.title}</h4>
        <p class="text-gray-600 mb-2">${card.body}</p>
        ${card.highlight ? `<p class="text-purple-600 font-semibold">${card.highlight}</p>` : ''}
      </div>`;
}

function renderQuiz(quiz) {
  if (!quiz) return '';

  const questions = quiz.questions.map((question) => {
    const answersWrapperClass = question.answersWrapperClass || 'flex justify-center gap-4 flex-wrap';
    const answerClass = question.answerClass || 'quiz-btn bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition';
    const answers = question.answers.map((answer) => {
      const attrs = [`class=\"${answerClass}\"`, `data-correct=\"${answer.correct}\"`];
      return `          <button ${attrs.join(' ')}>${answer.label}</button>`;
    }).join('\n');

    const questionClass = question.class || 'bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition';

    return `      <div class="${questionClass}">
        <h4 class="text-xl font-bold mb-4">${question.prompt}</h4>
        <div class="${answersWrapperClass}">
${answers}
        </div>
      </div>`;
  }).join('\n\n');

  const wrapperClass = quiz.wrapperClass || 'max-w-4xl mx-auto px-6 py-12 text-center';
  const headingClass = quiz.headingClass || 'text-2xl font-bold mb-2';
  const leadClass = quiz.leadClass || 'text-gray-600 mb-10';

  return `  <section id="quiz" class="${wrapperClass}">
    <h2 class="${headingClass}">${quiz.title}</h2>
    <p class="${leadClass}">${quiz.lead}</p>
    <div class="space-y-10">
${questions}
    </div>
  </section>`;
}

function renderReto(reto) {
  if (!reto) return '';

  const containerClass = reto.containerClass || 'bg-white rounded-3xl shadow-xl p-12 border border-purple-200';
  const steps = (reto.steps || [])
    .map(step => `        <p class="flex items-start gap-3"><span class="text-purple-600 font-bold">${step.icon}</span><span>${step.text}</span></p>`)
    .join('\n');
  const buttonId = reto.buttonId || 'reto-button';
  const buttonClass = reto.buttonClass || 'bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition';
  const hintId = reto.hintId || 'reto-hint';
  const hintClass = reto.hintClass || 'mt-4 text-sm text-gray-600 italic';
  const closingClass = reto.closingClass || 'mt-6 text-base text-purple-800 font-semibold';
  const hintHtml = reto.hint ? `      <p id="${hintId}" class="${hintClass}">${reto.hint}</p>\n` : '';
  const closingHtml = reto.closing ? `      <p class="${closingClass}">${reto.closing}</p>\n` : '';

  return `  <section id="reto" class="${reto.wrapperClass || 'max-w-4xl mx-auto px-6 py-12 text-center'}">
    <div class="${containerClass}">
      <div class="text-5xl mb-6">${reto.emoji}</div>
      <h2 class="text-3xl font-bold mb-4">${reto.title}</h2>
      <p class="text-gray-600 mb-8">${reto.lead}</p>
      <div class="text-left space-y-4 mb-8">
${steps}
      </div>
      <button id="${buttonId}" class="${buttonClass}">
        ${reto.cta}
      </button>
${hintHtml}${closingHtml}    </div>
  </section>`;
}

function copySharedAssets(context) {
  SHARED_ASSETS.forEach((asset) => {
    const sourcePath = path.join(ROOT_DIR, asset);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Skipping missing asset: ${asset}`);
      return;
    }
    const targetPath = path.join(context.distDir, asset);
    copyFileSync(sourcePath, targetPath);
  });
}

function copyLocaleData(context) {
  const targetDataDir = path.join(context.distDir, 'data');
  ensureDir(targetDataDir);

  const missionsJsonSource = path.join(context.dataDir, 'missions.json');
  if (fs.existsSync(missionsJsonSource)) {
    copyFileSync(missionsJsonSource, path.join(targetDataDir, 'missions.json'));
  }

  const missionsDirSource = path.join(context.dataDir, 'missions');
  copyDirSync(missionsDirSource, path.join(targetDataDir, 'missions'));
}

function buildServiceWorker(context) {
  const swTemplatePath = path.join(ROOT_DIR, 'sw.js');
  if (!fs.existsSync(swTemplatePath)) {
    console.warn('No service worker template found at sw.js');
    return;
  }

  const htmlFiles = ['index.html', ...context.missions.map((mission) => mission.file), ...STATIC_PAGES];
  const assetFiles = [...SHARED_ASSETS, 'data/missions.json'];
  const precacheList = JSON.stringify(['./', ...htmlFiles.map((f) => `./${f}`), ...assetFiles.map((f) => `./${f}`)], null, 2);
  const template = fs.readFileSync(swTemplatePath, 'utf-8');
  const output = template.replace('__PRECACHE_MANIFEST__', precacheList);
  writeFileSync(path.join(context.distDir, 'sw.js'), output);
}

function generateSitemap(context) {
  const baseUrl = context.locale.baseUrl || '';
  const pages = ['index.html', ...context.missions.map((mission) => mission.file), ...STATIC_PAGES];
  const urls = pages.map((page) => {
    const loc = resolveCanonical(baseUrl, null, page);
    return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
  }).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  writeFileSync(path.join(context.distDir, 'sitemap.xml'), sitemap);
}

function createLocaleZip(context) {
  ensureDir(ARTIFACTS_DIR);
  const zipName = `site-${context.locale.code}.zip`;
  const zipPath = path.join(ARTIFACTS_DIR, zipName);

  const result = spawnSync('zip', ['-r', zipPath, '.'], { cwd: context.distDir, stdio: 'inherit' });
  if (result.error) {
    console.warn(`Failed to create zip for ${context.locale.code}:`, result.error.message);
  }
}

function build() {
  const localesConfig = loadJson(path.join(DATA_DIR, 'locales.json'), { locales: [] });
  const locales = localesConfig.locales || [];
  if (!locales.length) {
    console.error('No locales configured. Aborting build.');
    process.exit(1);
  }

  const defaultLocaleCode = localesConfig.defaultLocale || locales[0].code;

  emptyDir(DIST_ROOT);
  emptyDir(ARTIFACTS_DIR);

  locales.forEach((locale) => {
    console.log(`Building locale ${locale.code}...`);
    buildLocale(locale, defaultLocaleCode);
  });

  console.log('Build completed.');
}

build();
