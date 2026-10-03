import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');

async function processImages() {
  console.log('[Image Pipeline] Starting asset optimization in public/ directory...');
  const files = fs.readdirSync(publicDir);
  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

    const inputPath = path.join(publicDir, file);
    const baseName = path.basename(file, ext);
    const stats = fs.statSync(inputPath);
    totalOriginalBytes += stats.size;

    // Generate WebP
    const webpOutputPath = path.join(publicDir, `${baseName}.webp`);
    try {
      await sharp(inputPath)
        .webp({ quality: 85, effort: 6 })
        .toFile(webpOutputPath);

      const webpStats = fs.statSync(webpOutputPath);
      totalOptimizedBytes += webpStats.size;
      const reduction = (((stats.size - webpStats.size) / stats.size) * 100).toFixed(1);
      console.log(`[WebP] Converted ${file} (${(stats.size / 1024).toFixed(1)} KB) -> ${baseName}.webp (${(webpStats.size / 1024).toFixed(1)} KB) [${reduction}% smaller]`);
    } catch (err) {
      console.error(`[Error] Failed to optimize ${file} to WebP:`, err.message);
    }
  }

  const netSavings = (((totalOriginalBytes - totalOptimizedBytes) / totalOriginalBytes) * 100).toFixed(1);
  console.log(`[Image Pipeline] Optimization finished! Total net size reduction: ${netSavings}%\n`);
}

processImages().catch((err) => {
  console.error('[Image Pipeline] Fatal error:', err);
  process.exit(1);
});
