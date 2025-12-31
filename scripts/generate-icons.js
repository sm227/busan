const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const pwaIconSizes = [192, 512];
const faviconSizes = [16, 32, 48];
const inputFile = path.join(__dirname, '../public/source-icon.png');
const publicDir = path.join(__dirname, '../public');
const appDir = path.join(__dirname, '../src/app');

async function generateIcons() {
  try {
    // Generate PWA icons
    console.log('🎨 Generating PWA icons...');
    for (const size of pwaIconSizes) {
      const outputFile = path.join(publicDir, `icon-${size}x${size}.png`);

      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputFile);

      console.log(`✓ Generated ${size}x${size} icon`);
    }

    // Generate favicon sizes
    console.log('\n📱 Generating favicon images...');
    for (const size of faviconSizes) {
      const outputFile = path.join(publicDir, `favicon-${size}x${size}.png`);

      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputFile);

      console.log(`✓ Generated ${size}x${size} favicon`);
    }

    // Copy icon to app directory for Next.js auto-favicon
    console.log('\n🔗 Copying icon to app directory...');
    const appIconPath = path.join(appDir, 'icon.png');
    await sharp(inputFile)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(appIconPath);
    console.log('✓ Copied icon.png to src/app/');

    console.log('\n✨ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
