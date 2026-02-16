const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const frameworkDir = path.join(projectRoot, '.open-next/assets/_framework');
const headersFile = path.join(projectRoot, '.open-next/assets/_headers');

// 25MB in bytes
const SIZE_LIMIT = 25 * 1024 * 1024;

if (!fs.existsSync(frameworkDir)) {
  console.log('Framework directory not found, skipping optimization.');
  process.exit(0);
}

const files = fs.readdirSync(frameworkDir);
const filesToHeader = [];

console.log('Scanning for WASM files to optimize...');

files.forEach(file => {
  if (file.endsWith('.wasm')) {
    const filePath = path.join(frameworkDir, file);
    const stats = fs.statSync(filePath);
    let isBrotli = false;

    // Check if file is already Brotli compressed (Magic: 0xCB 0xFF 0xFF 0x3F)
    // Actually, Brotli doesn't have a fixed single magic header like Gzip, 
    // but we can infer from the fact we replaced it, or check the first byte range if we want to be strict.
    // However, simplest way here is: if we see a corresponding .br file AND the .wasm file size matches the .br file size, it's likely replaced.
    // OR we can just trust our logic: if it's > 25MB, we MUST compress. If it's small, we check if it looks like we touched it.

    // Better approach: Read first 4 bytes to see if it matches the WASM magic cookie.
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(4);
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    const isWasmMagic = buffer[0] === 0x00 && buffer[1] === 0x61 && buffer[2] === 0x73 && buffer[3] === 0x6d;

    // If it is NOT valid WASM magic, and it is small, it might be Brotli.
    // Let's assume if it's NOT wasm magic, it's compressed.
    if (!isWasmMagic) {
      console.log(`File ${file} does not have WASM magic header. Assuming it is already compressed/optimized.`);
      isBrotli = true;
    }

    if (stats.size > SIZE_LIMIT) {
      const brFile = filePath + '.br';
      if (fs.existsSync(brFile)) {
        console.log(`Optimizing ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB) -> replacing with Brotli version`);

        // Read the brotli file
        const brContent = fs.readFileSync(brFile);

        // Overwrite the original wasm file with brotli content
        fs.writeFileSync(filePath, brContent);

        isBrotli = true;
      } else {
        console.warn(`Warning: Large file ${file} found but no .br version available.`);
      }
    }

    if (isBrotli) {
      filesToHeader.push(file);
    }
  }
});

console.log('Updating _headers file...');
let headersContent = '';
if (fs.existsSync(headersFile)) {
  headersContent = fs.readFileSync(headersFile, 'utf8');
}

// Ensure there's a newline at the end
if (headersContent && !headersContent.endsWith('\n')) {
  headersContent += '\n';
}

if (filesToHeader.length > 0) {
  filesToHeader.forEach(file => {
    // Path relative to static root
    const headerPath = `/_framework/${file}`;
    // Check if already exists to avoid duplicates (simple check)
    if (!headersContent.includes(headerPath)) {
      headersContent += `${headerPath}\n  Content-Encoding: br\n  Content-Type: application/wasm\n`;
    }
  });
  console.log(`Added headers for ${filesToHeader.length} optimized files.`);
} else {
  console.log('No files needed header updates.');
}

fs.writeFileSync(headersFile, headersContent);
