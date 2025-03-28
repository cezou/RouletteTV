const puppeteer = require('puppeteer');
const { spawn, execSync } = require('child_process');
require('dotenv').config();


/** @brief Dimensions de la fenêtre de streaming */
const WIDTH = 1920;
const HEIGHT = 1080;


/** @brief Lancement de la page et de la diffusion */
(async () => {
  try {
    execSync('bash ./create_screen.sh', { stdio: 'inherit' });
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: '/snap/bin/chromium',
      ignoreDefaultArgs: ['--enable-automation'],
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--window-size=${WIDTH},${HEIGHT}`,
        '--start-fullscreen',
        '--autoplay-policy=no-user-gesture-required',
        '--disable-infobars'
      ]
    });
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    await page.addStyleTag({
      content: `
        html, body {
          cursor: none !important;
        }
        * {
          user-select: none !important;
        }
      `
    });
    await page.goto('https://roulette-tv.vercel.app/history.html', { waitUntil: 'networkidle2' });
    console.log("Page chargée");
    await page.mouse.click(WIDTH-1, HEIGHT-1);
    await page.evaluate(() => {
      document.body.style.zoom = '1.2';
    });
    await page.mouse.move(WIDTH, HEIGHT);
    startFFmpegStream();
  } catch (err) {
    console.error("Erreur au lancement :", err);
  }
})();


/** @brief Démarre le stream FFMPEG vers YouTube */
function startFFmpegStream() {
  if (!process.env.STREAM_KEY) {
    console.error("Erreur: STREAM_KEY manquante dans le fichier .env");
    return;
  }
  const ffmpeg = spawn('ffmpeg', [
    '-f', 'pulse', '-i', 'virt_output.monitor',
    '-f', 'x11grab', '-s', `${WIDTH}x${HEIGHT}`, '-r', '24', '-i', ':99.0',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-tune', 'zerolatency',
    '-b:v', '4000k',
    '-maxrate', '4000k',
    '-bufsize', '7000k',
    '-g', '24',
    '-crf', '23',
    '-fflags', 'nobuffer',
    '-flush_packets', '1',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '48000',
    '-ac', '2',
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/${process.env.STREAM_KEY}`
  ]);
  ffmpeg.stdout.on('data', data => console.log(`stdout: ${data}`));
  ffmpeg.stderr.on('data', data => console.error(`stderr: ${data}`));
  console.log('Streaming en cours...');
}
