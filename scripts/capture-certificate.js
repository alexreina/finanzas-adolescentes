#!/usr/bin/env node
const path = require('path');
const fs = require('fs/promises');
const { pathToFileURL } = require('url');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

const DEFAULTS = {
  outputDir: path.resolve(process.cwd(), 'exports'),
  fileName: 'certificado.png',
  viewportWidth: 1080,
  viewportHeight: 1350,
  scale: 2,
  generateMp4: false,
  mp4FileName: 'certificado.mp4',
  mp4Duration: 5,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { ...DEFAULTS };

  for (let i = 0; i < args.length; i += 1) {
    const flag = args[i];
    const value = args[i + 1];
    switch (flag) {
      case '--out-dir':
        if (value && !value.startsWith('--')) {
          options.outputDir = path.resolve(process.cwd(), value);
          i += 1;
        }
        break;
      case '--file':
        if (value && !value.startsWith('--')) {
          options.fileName = value.endsWith('.png') ? value : `${value}.png`;
          i += 1;
        }
        break;
      case '--width':
        if (value && !value.startsWith('--')) {
          options.viewportWidth = Number(value) || DEFAULTS.viewportWidth;
          i += 1;
        }
        break;
      case '--height':
        if (value && !value.startsWith('--')) {
          options.viewportHeight = Number(value) || DEFAULTS.viewportHeight;
          i += 1;
        }
        break;
      case '--scale':
        if (value && !value.startsWith('--')) {
          options.scale = Number(value) || DEFAULTS.scale;
          i += 1;
        }
        break;
      case '--mp4':
        options.generateMp4 = true;
        if (value && !value.startsWith('--')) {
          options.mp4FileName = value.endsWith('.mp4') ? value : `${value}.mp4`;
          i += 1;
        }
        break;
      case '--mp4-duration':
        if (value && !value.startsWith('--')) {
          options.mp4Duration = Number(value) || DEFAULTS.mp4Duration;
          i += 1;
        }
        break;
      default:
        if (flag.startsWith('--')) {
          console.warn(`Unknown flag: ${flag}`);
        }
    }
  }

  return options;
}

async function run() {
  const options = parseArgs();
  const htmlPath = path.resolve(__dirname, '../docs/certificado.html');
  const fileUrl = pathToFileURL(htmlPath);

  await fs.mkdir(options.outputDir, { recursive: true });
  const outputPath = path.join(options.outputDir, options.fileName);
  const mp4Path = path.join(options.outputDir, options.mp4FileName);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setViewport({
    width: options.viewportWidth,
    height: options.viewportHeight,
    deviceScaleFactor: options.scale,
  });

  await page.goto(fileUrl.href, { waitUntil: 'networkidle0' });
  const poster = await page.$('.certificate-poster');

  if (!poster) {
    throw new Error('No se encontró el elemento .certificate-poster en la página.');
  }

  await poster.screenshot({ path: outputPath, omitBackground: false });
  await browser.close();

  console.log(`Certificado guardado en ${outputPath}`);

  if (options.generateMp4) {
    try {
      await createMp4(outputPath, mp4Path, options.mp4Duration);
      console.log(`Clip MP4 guardado en ${mp4Path}`);
    } catch (mp4Error) {
      console.warn(mp4Error.message);
      console.warn('Sáltate la opción --mp4 o instala ffmpeg para generar el video.');
    }
  }
}

async function createMp4(imagePath, mp4Path, durationSeconds) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-loop', '1',
      '-i', imagePath,
      '-c:v', 'libx264',
      '-t', String(durationSeconds),
      '-pix_fmt', 'yuv420p',
      mp4Path,
    ];

    const ffmpeg = spawn('ffmpeg', args, { stdio: 'ignore' });
    ffmpeg.on('error', (err) => {
      reject(new Error(`No se pudo ejecutar ffmpeg: ${err.message}`));
    });
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg finalizó con código ${code}`));
      }
    });
  });
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
