const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'docs');
const DATA_DIR = path.join(ROOT_DIR, 'data');

const missions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'missions.json'), 'utf-8'));
const STATIC_PAGES = ['fuentes.html', 'por-que-esta-web.html'];
const FOOTER_HTML = `  <footer class="bg-purple-900 text-white py-10">
    <div class="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
      <div class="text-center">
        <h4 class="font-bold mb-3">sobre este curso</h4>
        <p class="text-sm text-gray-300">lo hemos hecho personas como tú para que entiendas todo sobre tu dinero sin aburrirte</p>
      </div>
      <div class="text-center">
        <h4 class="font-bold mb-3">enlaces</h4>
        <div class="space-y-2">
          <div><a href="por-que-esta-web.html" class="text-gray-300 hover:text-white transition text-sm">por qué hacemos esto</a></div>
          <div><a href="fuentes.html" class="text-gray-300 hover:text-white transition text-sm">fuentes y referencias</a></div>
        </div>
      </div>
      <div class="text-center">
        <h4 class="font-bold mb-3">síguenos</h4>
        <div class="flex gap-4 justify-center">
          <a href="#" aria-label="Síguenos en Instagram"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg" class="w-6 h-6 invert" alt="Instagram" loading="lazy"></a>
          <a href="#" aria-label="Síguenos en TikTok"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg" class="w-6 h-6 invert" alt="TikTok" loading="lazy"></a>
        </div>
      </div>
    </div>
    <div class="text-center mt-8 text-sm text-gray-400">
      <p>&copy; 2025 finanzas personales para adolescentes · “el dinero no se aprende solo, se entrena 💪”</p>
    </div>
  </footer>`;

function renderFooter() {
  return FOOTER_HTML;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFileSync(targetPath, contents) {
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, contents, 'utf-8');
}

function copyFileSync(source, target) {
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
}

function generateNav(currentMissionId = null) {
  const links = missions.map((mission) => {
    const href = mission.file;
    const classes = ['hover:text-purple-600'];

    if (currentMissionId && mission.id === currentMissionId) {
      classes.push('text-purple-700', 'font-bold', 'underline');
    }

    return `        <a href="${href}" class="${classes.join(' ')}">${mission.navLabel}</a>`;
  });

  const extraLinks = [
    '        <a href="por-que-esta-web.html" class="hover:text-purple-600">por qué hacemos esto</a>',
    '        <a href="fuentes.html" class="hover:text-purple-600">fuentes y referencias</a>'
  ];

  const allLinks = links.concat(extraLinks).join('\n');

  return `      <div class="hidden md:flex space-x-6 text-sm font-medium items-center">
${allLinks}
        <button onclick="clearLocalStorage()" class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition" title="clear localStorage for debugging">
          🗑️ clear
        </button>
      </div>`;
}

function cleanDist() {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  ensureDir(DIST_DIR);
}

function copyStaticAssets() {
  const assets = [
    'css/styles.css',
    'css/tailwind.css',
    'js/page-helpers.js',
    'js/progress.js',
    'js/quiz.js',
    'js/reto.js',
    'js/vendor/canvas-confetti.min.js',
    'js/sw-register.js',
    'data/missions.json',
    'manifest.json',
    'favicon.svg',
    'robots.txt',
    'img/preview.png'
  ];

  assets.forEach((asset) => {
    const sourcePath = path.join(ROOT_DIR, asset);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Skipping missing asset: ${asset}`);
      return;
    }
    const targetPath = path.join(DIST_DIR, asset);
    copyFileSync(sourcePath, targetPath);
  });
}

function buildMissionPage(mission) {
  const missionDataPath = path.join(DATA_DIR, 'missions', `mission-${mission.id}.json`);

  if (fs.existsSync(missionDataPath)) {
    const missionData = JSON.parse(fs.readFileSync(missionDataPath, 'utf-8'));
    const html = generateMissionPage(mission, missionData);
    writeFileSync(path.join(DIST_DIR, mission.file), html);
    return;
  }

  const sourcePath = path.join(ROOT_DIR, mission.file);
  let contents = fs.readFileSync(sourcePath, 'utf-8');
  contents = contents.replace(/<div class="hidden md:flex[\s\S]*?<\/div>\s*<\/nav>/, `${generateNav(mission.id)}\n    </nav>`);
  writeFileSync(path.join(DIST_DIR, mission.file), contents);
}

function generateMissionPage(mission, missionData) {
  const nav = generateNav(mission.id);
  const toc = missionData.toc.map(item => `        <li>${item.icon} <a href="#${item.id}" class="hover:underline">${item.label}</a></li>`).join('\n');
  const sections = missionData.sections.map(renderSection).join('\n\n');
  const quiz = renderQuiz(missionData.quiz);
  const reto = renderReto(missionData.reto);
  const introBlocks = (missionData.introBlocks || []).join('\n\n');
  const footer = renderFooter();
  const inlineScripts = (missionData.inlineScripts || [])
    .map((script) => `  <script>\n${script}\n  </script>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${missionData.meta.title}</title>
  <meta name="description" content="${missionData.meta.description}" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="manifest" href="manifest.json" />
  <link rel="canonical" href="${missionData.meta.canonical}" />
  <link rel="stylesheet" href="css/tailwind.css">
  <link rel="stylesheet" href="css/styles.css">
  <script src="js/sw-register.js" defer></script>
</head>
<body class="bg-purple-50 text-gray-800" data-mission-id="mision-${mission.id}">

  <!-- HEADER -->
  <header class="bg-white shadow sticky top-0 z-50">
    <nav class="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
      <a href="index.html" class="font-bold text-purple-700">finanzas adolescentes</a>
${nav}
    </nav>
  </header>

  <!-- HERO -->
  <section class="bg-gradient-to-r from-purple-600 to-teal-500 text-white py-16 text-center">
    <div class="max-w-3xl mx-auto">
      <div class="text-6xl mb-4">${missionData.hero.emoji}</div>
      <h1 class="text-4xl font-bold mb-2">${missionData.hero.title}</h1>
      <p class="text-lg">${missionData.hero.subtitle}</p>
      <div class="mt-12 text-sm flex flex-col items-center space-y-2">
        <div class="mt-4">
          <p class="font-medium mb-4">misión ${mission.id} de 6 · ${mission.duration}</p>
          <div id="mission-pins" class="flex flex-wrap justify-center gap-2"></div>
        </div>
      </div>
    </div>
  </section>

${introBlocks ? `${introBlocks}\n\n` : ''}  <!-- TOC DESPLEGABLE -->
  <div class="max-w-2xl mx-auto my-8 px-4">
    <button data-toc-button 
            class="w-full bg-purple-100 text-purple-700 font-semibold px-4 py-3 rounded-lg shadow hover:bg-purple-200 transition flex justify-between items-center">
      en esta misión verás
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

  <!-- Final CTA -->
  <section id="takeaway" class="bg-gradient-to-r from-purple-600 to-teal-500 text-white py-16 text-center opacity-50 pointer-events-none transition-all duration-500">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-3xl font-bold mb-6">${missionData.takeaway.title}</h2>
      <p class="text-xl mb-8">${missionData.takeaway.subtitle}</p>
      <a href="${missionData.takeaway.cta.href}" class="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 inline-flex items-center gap-2">
        ${missionData.takeaway.cta.label}
      </a>
    </div>
  </section>

  ${footer}

  <script>
    function clearLocalStorage() {
      if (confirm('¿Estás seguro de que quieres limpiar todos los datos guardados? Esto reseteará tu progreso.')) {
        localStorage.clear();
        alert('✅ localStorage limpiado. La página se recargará.');
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
  const cardsBlock = cardsHtml ? `${cardsHtml}
` : '';
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
      <p id="${hintId}" class="${hintClass}">${reto.hint}</p>
    </div>
  </section>`;
}

function buildIndexPage() {
  const sourcePath = path.join(ROOT_DIR, 'index.html');
  let contents = fs.readFileSync(sourcePath, 'utf-8');
  writeFileSync(path.join(DIST_DIR, 'index.html'), contents);
}

function buildStaticPages() {
  STATIC_PAGES.forEach((page) => {
    const sourcePath = path.join(ROOT_DIR, page);
    if (!fs.existsSync(sourcePath)) {
      return;
    }
    const contents = fs.readFileSync(sourcePath, 'utf-8');
    writeFileSync(path.join(DIST_DIR, page), contents);
  });
}

function generateSitemap() {
  const baseUrl = 'https://alex.github.io/finanzas-adolescentes';
  const pages = ['index.html', ...missions.map(mission => mission.file), ...STATIC_PAGES];
  const urls = pages.map(page => `  <url>\n    <loc>${baseUrl}/${page}</loc>\n  </url>`).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
}

function build() {
  cleanDist();
  buildIndexPage();
  buildStaticPages();
  missions.forEach(buildMissionPage);
  copyStaticAssets();
  buildServiceWorker();
  generateSitemap();
}

function buildServiceWorker() {
  const swTemplatePath = path.join(ROOT_DIR, 'sw.js');
  if (!fs.existsSync(swTemplatePath)) {
    console.warn('No service worker template found at sw.js');
    return;
  }

  const htmlFiles = ['index.html', ...missions.map(mission => mission.file), ...STATIC_PAGES];
  const assetFiles = [
    'css/styles.css',
    'css/tailwind.css',
    'js/page-helpers.js',
    'js/progress.js',
    'js/quiz.js',
    'js/reto.js',
    'js/vendor/canvas-confetti.min.js',
    'js/sw-register.js',
    'data/missions.json',
    'manifest.json',
    'favicon.svg',
    'img/preview.png'
  ];

  const precacheList = JSON.stringify(['./', ...htmlFiles.map(f => `./${f}`), ...assetFiles.map(f => `./${f}`)], null, 2);
  const template = fs.readFileSync(swTemplatePath, 'utf-8');
  const output = template.replace('__PRECACHE_MANIFEST__', precacheList);
  writeFileSync(path.join(DIST_DIR, 'sw.js'), output);
}

build();
