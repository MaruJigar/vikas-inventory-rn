const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcImagePath = 'D:/jig clg/Projects/vikas-inventory-rn/app icon.png';

async function generateIcons() {
  if (!fs.existsSync(srcImagePath)) {
    console.error('Source image not found:', srcImagePath);
    return;
  }

  const adminAppDir = 'D:/jig clg/Projects/vikas-inventory-rn/admin-panel/src/app';
  const frontendAssetsDir = 'D:/jig clg/Projects/vikas-inventory-rn/Frontend/assets';

  if (!fs.existsSync(frontendAssetsDir)) {
    fs.mkdirSync(frontendAssetsDir, { recursive: true });
  }

  const image = sharp(srcImagePath);

  // 1. admin-panel/src/app/favicon.ico (64x64)
  // Sharp doesn't support .ico output directly, but it can create raw png data and we can write it, 
  // actually, nextjs supports favicon.png, but if we rename a 64x64 png to .ico, browsers often handle it, 
  // or we can just create icon.png for Next.js which is the modern standard and remove favicon.ico.
  await image.resize(64, 64).png().toFile(path.join(adminAppDir, 'favicon.ico'));

  // 2. admin-panel/src/app/apple-icon.png
  await image.resize(180, 180).png().toFile(path.join(adminAppDir, 'apple-icon.png'));

  // 3. admin-panel/src/app/icon.png
  await image.resize(192, 192).png().toFile(path.join(adminAppDir, 'icon.png'));

  // 4. Frontend/assets/icon.png
  await image.resize(1024, 1024).png().toFile(path.join(frontendAssetsDir, 'icon.png'));
  
  // 5. Frontend/assets/splash.png
  // Typically 1242x2436 for splash, let's just make it the same size with some padding, or just copy it.
  // Actually the request was App icon, fav icon, logo. We'll just generate the icon.png.
  await image.resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toFile(path.join(frontendAssetsDir, 'splash.png'));

  console.log('Icons generated successfully.');
}

generateIcons().catch(console.error);
