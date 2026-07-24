import sharp from 'sharp';
const svg = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#e2e8f0"/>
  <circle cx="200" cy="150" r="80" fill="#94a3b8"/>
  <ellipse cx="200" cy="350" rx="120" ry="100" fill="#94a3b8"/>
</svg>`;
sharp(Buffer.from(svg)).resize(400, 400).jpeg({ quality: 85 }).toFile('src/assets/man.jpg').then(() => console.log('OK'));
